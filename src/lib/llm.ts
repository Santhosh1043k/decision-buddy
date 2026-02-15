// OpenAI LLM Integration for Decision Coach

import OpenAI from 'openai';
import type { DetectedEmotion, Option, Priority } from '@/types/decision';
import {
  hasOpenAIKey,
  getRateLimitStatus,
  incrementRateLimit,
  cacheLLMResult,
  getCachedLLMResult,
  generateCacheKey,
} from '@/lib/llm-config';

// Initialize OpenAI client (only if API key is present)
const openai = hasOpenAIKey()
  ? new OpenAI({
      apiKey: import.meta.env.VITE_OPENAI_API_KEY,
      dangerouslyAllowBrowser: true,
    })
  : null;

/**
 * LLM Emotion Analysis Result
 */
export interface LLMEmotionAnalysis {
  emotions: Array<{
    type: DetectedEmotion['type'];
    label: string;
    intensity: number;
  }>;
  dominantEmotion: {
    type: DetectedEmotion['type'];
    label: string;
    intensity: number;
  } | null;
  insight: string;
}

/**
 * Smart Priority Suggestion Result
 */
export interface SmartPrioritySuggestion {
  suggestedPriorities: Array<{
    id: string;
    label: string;
    description: string;
    value: number;
  }>;
  rationale: string;
}

/**
 * Devil's Advocate Question
 */
export interface DevilsAdvocateQuestion {
  question: string;
  category: 'assumptions' | 'risks' | 'alternatives' | 'long-term';
  icon: string;
}

/**
 * Analyze emotions using LLM
 */
export async function analyzeEmotionsWithLLM(
  decision: string,
  option: Option
): Promise<LLMEmotionAnalysis> {
  const cacheKey = generateCacheKey('emotion', { decision, optionName: option.name, text: option.emotionalText });
  const cached = getCachedLLMResult<LLMEmotionAnalysis>(cacheKey);
  if (cached) return cached;

  // Fallback to keyword-based detection if no API key
  if (!openai) {
    throw new Error('No OpenAI API key available');
  }

  const { canMakeCall } = getRateLimitStatus();
  if (!canMakeCall) {
    throw new Error('Rate limit exceeded');
  }

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: `You are an emotional analysis assistant. Analyze the emotional content in the text provided.

Available emotion types: fear, excitement, guilt, relief, uncertainty

Return a JSON object with this structure:
{
  "emotions": [
    {"type": "fear", "label": "Fear", "intensity": 0.7}
  ],
  "dominantEmotion": {"type": "excitement", "label": "Excitement", "intensity": 0.8},
  "insight": "A brief 1-2 sentence insight about the emotional state"
}

Intensity should be between 0 and 1. Only include emotions with intensity > 0.2.`,
        },
        {
          role: 'user',
          content: `Decision: "${decision}"\n\nOption: "${option.name}"\n\nThoughts/Feelings: "${option.emotionalText}"`,
        },
      ],
      temperature: 0.3,
      response_format: { type: 'json_object' },
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      throw new Error('No response from LLM');
    }

    const result = JSON.parse(content) as LLMEmotionAnalysis;
    incrementRateLimit();
    cacheLLMResult(cacheKey, result);
    return result;
  } catch (error) {
    console.error('LLM emotion analysis failed:', error);
    throw error;
  }
}

/**
 * Generate smart priority suggestions using LLM
 */
export async function generateSmartPriorities(
  decisionText: string
): Promise<SmartPrioritySuggestion> {
  const cacheKey = generateCacheKey('priorities', { decision: decisionText });
  const cached = getCachedLLMResult<SmartPrioritySuggestion>(cacheKey);
  if (cached) return cached;

  // Fallback if no API key
  if (!openai) {
    throw new Error('No OpenAI API key available');
  }

  const { canMakeCall } = getRateLimitStatus();
  if (!canMakeCall) {
    throw new Error('Rate limit exceeded');
  }

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: `You are a decision analysis assistant. Suggest 5 relevant priorities for the decision.

Return a JSON object with this structure:
{
  "suggestedPriorities": [
    {
      "id": "financial-impact",
      "label": "Financial Impact",
      "description": "Short explanation",
      "value": 4
    }
  ],
  "rationale": "Brief explanation of why these priorities are relevant"
}

The id should be kebab-case and unique. The value should be a default importance rating between 1-5.`,
        },
        {
          role: 'user',
          content: `Decision: "${decisionText}"`,
        },
      ],
      temperature: 0.7,
      response_format: { type: 'json_object' },
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      throw new Error('No response from LLM');
    }

    const result = JSON.parse(content) as SmartPrioritySuggestion;
    incrementRateLimit();
    cacheLLMResult(cacheKey, result);
    return result;
  } catch (error) {
    console.error('LLM priority generation failed:', error);
    throw error;
  }
}

/**
 * Generate devil's advocate questions using LLM
 */
export async function generateDevilsAdvocateQuestions(
  decision: string,
  options: Option[],
  winner: Option
): Promise<DevilsAdvocateQuestion[]> {
  const optionNames = options.map(o => o.name).join(', ');
  const cacheKey = generateCacheKey('devils-advocate', { decision, options: optionNames, winner: winner.name });
  const cached = getCachedLLMResult<DevilsAdvocateQuestion[]>(cacheKey);
  if (cached) return cached;

  // Fallback if no API key
  if (!openai) {
    throw new Error('No OpenAI API key available');
  }

  const { canMakeCall } = getRateLimitStatus();
  if (!canMakeCall) {
    throw new Error('Rate limit exceeded');
  }

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: `You are a critical thinking assistant. Generate 3-4 challenging questions to test the decision.

Categories:
- assumptions: Challenge the assumptions being made
- risks: Highlight potential downsides or risks
- alternatives: Suggest alternatives not considered
- long-term: Consider long-term consequences

Return a JSON array with this structure:
[
  {
    "question": "What if...",
    "category": "assumptions",
    "icon": "lightbulb"
  }
]

Icons should be simple, lowercase names of relevant icons.`,
        },
        {
          role: 'user',
          content: `Decision: "${decision}"\n\nOptions: ${optionNames}\n\nLeaning towards: "${winner.name}"`,
        },
      ],
      temperature: 0.8,
      response_format: { type: 'json_object' },
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      throw new Error('No response from LLM');
    }

    const result = JSON.parse(content) as { questions: DevilsAdvocateQuestion[] };
    incrementRateLimit();
    cacheLLMResult(cacheKey, result.questions);
    return result.questions;
  } catch (error) {
    console.error('LLM devil\'s advocate generation failed:', error);
    throw error;
  }
}
