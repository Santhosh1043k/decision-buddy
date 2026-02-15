import { useState } from 'react';

interface UseDraftAutosaveOptions {
  decision: string;
  options: unknown[];
  priorities: unknown[];
  currentStep: number;
  confidenceScore?: number;
  reflectionNotes?: string;
  enabled?: boolean;
}

// Draft autosave is a no-op until a decision_drafts table is created
export const useDraftAutosave = (_opts: UseDraftAutosaveOptions) => {
  const [isSaving] = useState(false);
  const [lastSaved] = useState<Date | null>(null);

  return {
    isSaving,
    lastSaved,
    clearDraft: async () => {},
    saveDraft: () => {},
  };
};
