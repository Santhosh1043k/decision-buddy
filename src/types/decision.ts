export interface Priority {
  id: string;
  label: string;
  description: string;
  value: number;
}

export interface Option {
  id: string;
  name: string;
  emotionalText: string;
  scores: Record<string, number>;
}

export interface DetectedEmotion {
  type: 'fear' | 'excitement' | 'guilt' | 'relief' | 'uncertainty';
  label: string;
  intensity: number; // 0-1
}

export interface EmotionalAnalysis {
  optionId: string;
  optionName: string;
  emotions: DetectedEmotion[];
  dominantEmotion: DetectedEmotion | null;
}

export interface CognitivePattern {
  id: string;
  label: string;
  description: string;
  detected: boolean;
}

export interface DecisionState {
  decision: string;
  options: Option[];
  priorities: Priority[];
}

export const DEFAULT_PRIORITIES: Priority[] = [
  { id: 'money', label: 'Money', description: 'Financial impact', value: 3 },
  { id: 'happiness', label: 'Happiness', description: 'Joy and fulfillment', value: 3 },
  { id: 'growth', label: 'Growth', description: 'Personal development', value: 3 },
  { id: 'stability', label: 'Stability', description: 'Security and predictability', value: 3 },
  { id: 'risk', label: 'Risk Tolerance', description: 'Openness to uncertainty', value: 3 },
];
