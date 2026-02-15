import { useEffect, useState } from 'react';
import { useAuth } from './useAuth';
import { supabase } from '@/integrations/supabase/client';
import { DecisionDraft } from '@/types/decision';

export const useDraftLoader = () => {
  const { user, loading: authLoading } = useAuth();
  const [draft, setDraft] = useState<DecisionDraft | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const loadDraft = async () => {
      if (authLoading) return;
      
      if (!user) {
        setLoading(false);
        setDraft(null);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('decision_drafts')
          .select('*')
          .eq('user_id', user.id)
          .single();

        if (error) {
          // No draft found is not an error
          if (error.code === 'PGRST116') {
            setDraft(null);
          } else {
            throw error;
          }
        } else if (data) {
          setDraft({
            id: data.id,
            userId: data.user_id,
            draftData: data.draft_data as any,
            createdAt: data.created_at,
            updatedAt: data.updated_at,
          });
        }
      } catch (err) {
        console.error('Error loading draft:', err);
        setError(err as Error);
      } finally {
        setLoading(false);
      }
    };

    loadDraft();
  }, [user, authLoading]);

  const clearDraft = () => {
    setDraft(null);
  };

  return { draft, loading, error, clearDraft };
};
