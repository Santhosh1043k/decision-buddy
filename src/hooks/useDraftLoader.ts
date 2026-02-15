import { useState } from 'react';
import { DecisionDraft } from '@/types/decision';

// Draft loader is a no-op until a decision_drafts table is created
export const useDraftLoader = () => {
  const [draft] = useState<DecisionDraft | null>(null);
  const [loading] = useState(false);
  const [error] = useState<Error | null>(null);

  return { draft, loading, error, clearDraft: () => {} };
};
