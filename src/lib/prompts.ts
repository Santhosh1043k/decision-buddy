export type DecisionCategory = 'career' | 'financial' | 'relationships' | 'lifestyle' | 'health' | 'general';

export interface EmotionalPrompt {
  placeholder: string;
  helperText: string;
}

export const EMOTIONAL_PROMPTS: Record<DecisionCategory, EmotionalPrompt> = {
  career: {
    placeholder: "What excites you about this option? What worries you?",
    helperText: "Consider growth potential, work-life balance, and fulfillment",
  },
  financial: {
    placeholder: "How would this impact your financial security?",
    helperText: "Think about short-term sacrifices vs. long-term gains",
  },
  relationships: {
    placeholder: "How does this align with your values and long-term vision?",
    helperText: "Consider trust, communication, and shared goals",
  },
  lifestyle: {
    placeholder: "What would you regret more - doing this or not doing it?",
    helperText: "Think about your ideal day-to-day life and what truly matters",
  },
  health: {
    placeholder: "How would this affect your wellbeing and energy levels?",
    helperText: "Consider physical, mental, and emotional health impacts",
  },
  general: {
    placeholder: "How does this option make you feel?",
    helperText: "Describe your gut reaction, fears, and hopes",
  },
};

export function getEmotionalPrompt(category: DecisionCategory | undefined): EmotionalPrompt {
  if (!category || !EMOTIONAL_PROMPTS[category]) {
    return EMOTIONAL_PROMPTS.general;
  }
  return EMOTIONAL_PROMPTS[category];
}
