import { useEffect, useRef, useState } from 'react';
import { useAuth } from './useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Option, Priority } from '@/types/decision';

interface DraftData {
  decision: string;
  options: Option[];
  priorities: Priority[];
  currentStep: number;
}

interface UseDraftAutosaveOptions {
  decision: string;
  options: Option[];
  priorities: Priority[];
  currentStep: number;
  enabled?: boolean;
}

export const useDraftAutosave = ({
  decision,
  options,
  priorities,
  currentStep,
  enabled = true,
}: UseDraftAutosaveOptions) => {
  const { user } = useAuth();
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const previousDataRef = useRef<string>('');

  const saveDraft = async (draftData: DraftData) => {
    if (!user || !enabled) return;

    // Don't save if nothing has changed
    const currentDataString = JSON.stringify(draftData);
    if (currentDataString === previousDataRef.current) {
      return;
    }

    // Don't save if decision is empty (initial state)
    if (!draftData.decision.trim() && draftData.options.length === 0) {
      return;
    }

    setIsSaving(true);

    try {
      const { error } = await supabase
        .from('decision_drafts')
        .upsert({
          user_id: user.id,
          draft_data: draftData,
          updated_at: new Date().toISOString(),
        }, {
          onConflict: 'user_id',
        });

      if (error) {
        console.error('Error saving draft:', error);
      } else {
        setLastSaved(new Date());
        previousDataRef.current = currentDataString;
      }
    } catch (error) {
      console.error('Error saving draft:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const clearDraft = async () => {
    if (!user) return;

    try {
      await supabase
        .from('decision_drafts')
        .delete()
        .eq('user_id', user.id);
      
      setLastSaved(null);
      previousDataRef.current = '';
    } catch (error) {
      console.error('Error clearing draft:', error);
    }
  };

  // Debounced save effect
  useEffect(() => {
    if (!user || !enabled) return;

    // Clear existing timeout
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    // Set new timeout for debounced save (5 seconds)
    saveTimeoutRef.current = setTimeout(() => {
      saveDraft({
        decision,
        options,
        priorities,
        currentStep,
      });
    }, 5000);

    // Cleanup
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, [decision, options, priorities, currentStep, user, enabled]);

  return {
    isSaving,
    lastSaved,
    clearDraft,
    saveDraft: () => saveDraft({ decision, options, priorities, currentStep }),
  };
};
