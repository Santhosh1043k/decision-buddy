// Structured SLM (Small Language Model) for Decision Intelligence Agent
// A rule-based, offline decision analysis system

import type { DetectedEmotion, Option, Priority } from '@/types/decision';

/**
 * Complete Decision Intelligence Analysis Result
 * Following the 8-section output format
 */
export interface DecisionIntelligenceAnalysis {
  situationSummary: string;
  emotionalInsight: string;
  keyFactorsAndConstraints: string[];
  optionsAnalysis: Array<{
    option: string;
    pros: string[];
    cons: string[];
    likelyOutcome: string;
  }>;
  risksAndTradeoffs: string[];
  recommendedDecision: {
    option: string;
    reasoning: string;
  };
  backupPlan: {
    option: string;
    reasoning: string;
  };
  immediateNextSteps: string[];
}

/**
 * Emotion Analysis Result
 */
export interface SLMEmotionAnalysis {
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

// ============================================================================
// EMOTION DETECTION ENHANCED
// ============================================================================

const EMOTION_KEYWORDS: Record<DetectedEmotion['type'], { label: string; keywords: string[] }> = {
  fear: {
    label: 'Fear',
    keywords: [
      'scared', 'afraid', 'worried', 'anxious', 'nervous', 'terrified',
      'panic', 'dread', 'frightened', 'uneasy', 'tense', 'stress',
      'what if', 'might fail', 'risky', 'dangerous', 'uncertain', 'doubt',
      'afraid of', 'worry about', 'concerned', 'fearful', 'apprehensive'
    ]
  },
  excitement: {
    label: 'Excitement',
    keywords: [
      'excited', 'thrilled', 'eager', 'enthusiastic', 'pumped', 'energized',
      'can\'t wait', 'amazing', 'awesome', 'love', 'passionate', 'inspired',
      'hopeful', 'optimistic', 'dream', 'opportunity', 'adventure', 'new',
      'looking forward', 'can\'t wait to', 'stoked', 'thrilled'
    ]
  },
  guilt: {
    label: 'Guilt',
    keywords: [
      'guilty', 'selfish', 'wrong', 'should', 'shouldn\'t', 'bad',
      'letting down', 'disappointing', 'responsible', 'obligation', 'owe',
      'feel terrible', 'regret', 'blame', 'fault', 'burden',
      'don\'t want to hurt', 'feel bad', 'wrong of me'
    ]
  },
  relief: {
    label: 'Relief',
    keywords: [
      'relief', 'relieved', 'free', 'freedom', 'peaceful', 'calm',
      'weight off', 'finally', 'escape', 'release', 'breathe', 'easy',
      'comfortable', 'safe', 'secure', 'settled', 'done with',
      'peace of mind', 'at ease', 'comfort'
    ]
  },
  uncertainty: {
    label: 'Uncertainty',
    keywords: [
      'unsure', 'confused', 'torn', 'conflicted', 'mixed', 'ambivalent',
      'don\'t know', 'not sure', 'maybe', 'unclear', 'complicated', 'complex',
      'both', 'either way', 'depends', 'hard to say', 'undecided',
      'on the fence', 'struggling with', 'mixed feelings'
    ]
  }
};

function detectEmotions(text: string): DetectedEmotion[] {
  if (!text.trim()) return [];

  const lowerText = text.toLowerCase();
  const emotions: DetectedEmotion[] = [];

  for (const [type, { label, keywords }] of Object.entries(EMOTION_KEYWORDS)) {
    let matchCount = 0;

    for (const keyword of keywords) {
      if (lowerText.includes(keyword)) {
        matchCount++;
      }
    }

    if (matchCount > 0) {
      const intensity = Math.min(matchCount / 3, 1);
      emotions.push({
        type: type as DetectedEmotion['type'],
        label,
        intensity
      });
    }
  }

  return emotions.sort((a, b) => b.intensity - a.intensity);
}

export function analyzeEmotionsWithSLM(
  decision: string,
  option: Option
): SLMEmotionAnalysis {
  const emotions = detectEmotions(option.emotionalText);
  const dominantEmotion = emotions.length > 0 ? emotions[0] : null;

  let insight = '';
  if (dominantEmotion) {
    switch (dominantEmotion.type) {
      case 'fear':
        insight = `There are some concerns and worries about "${option.name}." Consider if these fears are realistic or if they might be holding you back.`;
        break;
      case 'excitement':
        insight = `You feel genuine excitement about "${option.name}." This positive energy is worth noting, but ensure you're also considering practical aspects.`;
        break;
      case 'guilt':
        insight = `There's some guilt tied to "${option.name}." Consider what truly matters to you versus what others expect.`;
        break;
      case 'relief':
        insight = `"${option.name}" brings a sense of relief and peace, which can be valuable for mental well-being.`;
        break;
      case 'uncertainty':
        insight = `You have mixed feelings about "${option.name}." That's normal for important decisions - clarity often comes with more information.`;
        break;
    }
  } else {
    insight = `You seem to have a clear-headed perspective on "${option.name}." Proceed with rational consideration.`;
  }

  return {
    emotions,
    dominantEmotion,
    insight
  };
}

// ============================================================================
// SMART PRIORITY SUGGESTIONS
// ============================================================================

const DECISION_PATTERNS: Record<string, {
  keywords: string[];
  priorities: Array<{ id: string; label: string; description: string; value: number }>;
  rationale: string;
}> = {
  career: {
    keywords: ['job', 'career', 'work', 'promotion', 'salary', 'raise', 'company', 'boss', 'team', 'office', 'remote', 'startup', 'freelance', 'entrepreneur'],
    priorities: [
      { id: 'salary', label: 'Compensation', description: 'Income and financial rewards', value: 4 },
      { id: 'growth', label: 'Career Growth', description: 'Learning, skills, and advancement opportunities', value: 4 },
      { id: 'work-life', label: 'Work-Life Balance', description: 'Time for personal life and wellbeing', value: 4 },
      { id: 'stability', label: 'Job Security', description: 'Stability and security of employment', value: 3 },
      { id: 'culture', label: 'Company Culture', description: 'Values, environment, and team dynamics', value: 3 }
    ],
    rationale: 'For career decisions, consider both immediate rewards and long-term growth potential.'
  },
  financial: {
    keywords: ['invest', 'money', 'save', 'spend', 'budget', 'debt', 'loan', 'mortgage', 'retirement', 'stock', 'crypto', 'buy', 'sell'],
    priorities: [
      { id: 'return', label: 'Financial Return', description: 'Potential gain or loss', value: 5 },
      { id: 'risk', label: 'Risk Level', description: 'How much you could lose', value: 4 },
      { id: 'liquidity', label: 'Liquidity', description: 'How quickly you can access your money', value: 3 },
      { id: 'time', label: 'Time Horizon', description: 'Short-term vs long-term considerations', value: 3 },
      { id: 'effort', label: 'Management Effort', description: 'Time and attention required', value: 2 }
    ],
    rationale: 'Financial decisions should balance potential returns against acceptable risk levels.'
  },
  relationship: {
    keywords: ['relationship', 'partner', 'friend', 'dating', 'marriage', 'breakup', 'family', 'parent', 'child', 'romantic', 'love'],
    priorities: [
      { id: 'happiness', label: 'Emotional Fulfillment', description: 'Joy and emotional connection', value: 5 },
      { id: 'growth', label: 'Personal Growth', description: 'How you grow together', value: 4 },
      { id: 'values', label: 'Value Alignment', description: 'Shared values and life goals', value: 4 },
      { id: 'independence', label: 'Independence', description: 'Maintaining your own identity', value: 3 },
      { id: 'stability', label: 'Stability', description: 'Predictability and security', value: 3 }
    ],
    rationale: 'Relationship decisions involve balancing emotional needs with practical compatibility.'
  },
  health: {
    keywords: ['health', 'exercise', 'diet', 'doctor', 'treatment', 'surgery', 'medication', 'fitness', 'wellness', 'mental health'],
    priorities: [
      { id: 'effectiveness', label: 'Effectiveness', description: 'How well it works', value: 5 },
      { id: 'risk', label: 'Side Effects/Risk', description: 'Potential negative impacts', value: 4 },
      { id: 'time', label: 'Time Commitment', description: 'How long it will take', value: 3 },
      { id: 'cost', label: 'Cost', description: 'Financial implications', value: 3 },
      { id: 'sustainability', label: 'Sustainability', description: 'Can you maintain this long-term', value: 3 }
    ],
    rationale: 'Health decisions should prioritize effectiveness while considering lifestyle impact and sustainability.'
  },
  location: {
    keywords: ['move', 'relocate', 'city', 'town', 'country', 'apartment', 'house', 'rent', 'neighborhood', 'area'],
    priorities: [
      { id: 'cost', label: 'Cost of Living', description: 'Housing, food, transportation expenses', value: 4 },
      { id: 'quality', label: 'Quality of Life', description: 'Safety, amenities, community', value: 4 },
      { id: 'opportunities', label: 'Career Opportunities', description: 'Job market and professional growth', value: 4 },
      { id: 'weather', label: 'Climate/Weather', description: 'Living conditions and comfort', value: 3 },
      { id: 'social', label: 'Social Network', description: 'Proximity to family and friends', value: 3 }
    ],
    rationale: 'Location decisions involve balancing costs with lifestyle benefits and opportunities.'
  }
};

const GENERAL_PRIORITIES = [
  { id: 'time', label: 'Time Investment', description: 'How much time this will require', value: 3 },
  { id: 'effort', label: 'Effort Required', description: 'Physical or mental energy needed', value: 3 },
  { id: 'cost', label: 'Financial Cost', description: 'Money required for this decision', value: 3 },
  { id: 'impact', label: 'Long-term Impact', description: 'How this affects your future', value: 4 },
  { id: 'alignment', label: 'Value Alignment', description: 'Match with your core values', value: 4 }
];

export function generateSmartPriorities(decisionText: string): SmartPrioritySuggestion {
  const lowerDecision = decisionText.toLowerCase();
  let matchedPattern = null;

  for (const [key, pattern] of Object.entries(DECISION_PATTERNS)) {
    if (pattern.keywords.some(keyword => lowerDecision.includes(keyword))) {
      matchedPattern = pattern;
      break;
    }
  }

  if (matchedPattern) {
    return {
      suggestedPriorities: matchedPattern.priorities,
      rationale: matchedPattern.rationale
    };
  }

  return {
    suggestedPriorities: GENERAL_PRIORITIES,
    rationale: 'Based on your decision, these general priorities will help you evaluate your options objectively.'
  };
}

// ============================================================================
// DEVIL'S ADVOCATE QUESTIONS
// ============================================================================

function generateDevilsAdvocateQuestions(
  decision: string,
  options: Option[],
  winner: Option
): DevilsAdvocateQuestion[] {
  const questions: DevilsAdvocateQuestion[] = [];
  const lowerDecision = decision.toLowerCase();
  const lowerWinner = winner.name.toLowerCase();

  // Assumptions questions
  questions.push({
    question: `What evidence do you have that "${winner.name}" will actually work out as planned?`,
    category: 'assumptions',
    icon: 'lightbulb'
  });

  if (lowerDecision.includes('money') || lowerDecision.includes('financial') || lowerDecision.includes('salary')) {
    questions.push({
      question: `Are you assuming the financial situation will stay the same? What if costs are higher than expected?`,
      category: 'assumptions',
      icon: 'alert-triangle'
    });
  }

  // Risk questions
  questions.push({
    question: `What's the worst-case scenario with "${winner.name}" and could you handle it?`,
    category: 'risks',
    icon: 'shield'
  });

  questions.push({
    question: `What risks are you not seeing because you're excited about "${winner.name}"?`,
    category: 'risks',
    icon: 'eye-off'
  });

  // Alternatives questions
  const otherOptions = options.filter(o => o.id !== winner.id);
  if (otherOptions.length > 0) {
    const otherNames = otherOptions.map(o => o.name).join(', ');
    questions.push({
      question: `What would need to be true for ${otherNames} to actually be better than "${winner.name}"?`,
      category: 'alternatives',
      icon: 'git-branch'
    });
  }

  questions.push({
    question: `Is there a third option you haven't considered yet that combines the best of both?`,
    category: 'alternatives',
    icon: 'plus-circle'
  });

  // Long-term questions
  questions.push({
    question: `Will you still be happy with "${winner.name}" 5 years from now?`,
    category: 'long-term',
    icon: 'clock'
  });

  questions.push({
    question: `How does choosing "${winner.name}" limit or enable future opportunities?`,
    category: 'long-term',
    icon: 'trending-up'
  });

  return questions.slice(0, 6);
}

// ============================================================================
// COMPLETE DECISION INTELLIGENCE ANALYSIS
// ============================================================================

export function generateDecisionIntelligenceAnalysis(
  decision: string,
  options: Option[],
  priorities: Priority[],
  winner: Option
): DecisionIntelligenceAnalysis {
  const optionAnalysis = options.map(option => {
    const emotions = detectEmotions(option.emotionalText);
    const dominantEmotion = emotions.length > 0 ? emotions[0] : null;

    const pros: string[] = [];
    const cons: string[] = [];

    // Extract pros and cons from emotional text
    if (option.emotionalText) {
      const lowerText = option.emotionalText.toLowerCase();

      // Positive indicators
      if (lowerText.includes('good') || lowerText.includes('great') || lowerText.includes('love') || lowerText.includes('excit')) {
        pros.push('Strong positive emotional connection');
      }
      if (lowerText.includes('opportunity') || lowerText.includes('grow') || lowerText.includes('learn')) {
        pros.push('Growth potential');
      }
      if (lowerText.includes('safe') || lowerText.includes('secure') || lowerText.includes('stable')) {
        pros.push('Provides stability and security');
      }

      // Negative indicators
      if (lowerText.includes('worr') || lowerText.includes('afraid') || lowerText.includes('risk') || lowerText.includes('scared')) {
        cons.push('Potential risks or concerns');
      }
      if (lowerText.includes('expensive') || lowerText.includes('cost') || lowerText.includes('money')) {
        cons.push('Financial implications to consider');
      }
      if (lowerText.includes('hard') || lowerText.includes('difficult') || lowerText.includes('challenge')) {
        cons.push('Requires significant effort');
      }
    }

    // Add score-based pros/cons
    const highPriorityScores = Object.entries(option.scores)
      .filter(([_, score]) => score >= 4)
      .map(([priorityId, score]) => {
        const priority = priorities.find(p => p.id === priorityId);
        return `Strong in ${priority?.label || priorityId}`;
      });

    pros.push(...highPriorityScores);

    const lowPriorityScores = Object.entries(option.scores)
      .filter(([_, score]) => score <= 2)
      .map(([priorityId, score]) => {
        const priority = priorities.find(p => p.id === priorityId);
        return `Weak in ${priority?.label || priorityId}`;
      });

    cons.push(...lowPriorityScores);

    return {
      option: option.name,
      pros: pros.length > 0 ? pros : ['Some positive aspects to consider'],
      cons: cons.length > 0 ? cons : ['Some trade-offs to be aware of'],
      likelyOutcome: generateLikelyOutcome(option, dominantEmotion)
    };
  });

  const emotionalInsight = generateEmotionalInsight(winner);

  const keyFactorsAndConstraints = generateKeyFactors(decision, priorities);

  const risksAndTradeoffs = generateRisksAndTradeoffs(decision, options, winner);

  const immediateNextSteps = generateImmediateNextSteps(decision, winner);

  return {
    situationSummary: `You're deciding: "${decision}". After evaluating your options against your priorities, "${winner.name}" has emerged as the best fit.`,
    emotionalInsight,
    keyFactorsAndConstraints,
    optionsAnalysis,
    risksAndTradeoffs,
    recommendedDecision: {
      option: winner.name,
      reasoning: `Based on your scoring across ${priorities.length} priorities and your emotional reflections, "${winner.name}" best aligns with what matters to you.`
    },
    backupPlan: {
      option: options.find(o => o.id !== winner.id)?.name || 'Other options',
      reasoning: 'Keep other options in mind as circumstances may change or new information may emerge.'
    },
    immediateNextSteps
  };
}

function generateLikelyOutcome(option: Option, dominantEmotion: DetectedEmotion | null): string {
  if (dominantEmotion) {
    switch (dominantEmotion.type) {
      case 'excitement':
        return `Likely to bring energy and enthusiasm, but ensure practical details are addressed.`;
      case 'fear':
        return `May involve some anxiety initially, but could lead to growth if fears are managed well.`;
      case 'relief':
        return `Expected to provide comfort and peace of mind, which is valuable for wellbeing.`;
      case 'guilt':
        return `May involve complex emotions - ensure the decision aligns with your true values.`;
      case 'uncertainty':
        return `Outcomes may vary based on how well you prepare and adapt as you go.`;
    }
  }

  return 'This option appears to have a reasonable chance of success based on available information.';
}

function generateEmotionalInsight(winner: Option): string {
  const emotions = detectEmotions(winner.emotionalText);
  const dominantEmotion = emotions.length > 0 ? emotions[0] : null;

  if (dominantEmotion) {
    return `Your feelings about "${winner.name}" show ${dominantEmotion.label.toLowerCase()} with ${Math.round(dominantEmotion.intensity * 100)}% intensity. ${dominantEmotion.type === 'excitement' ? 'This positive energy is encouraging, but ensure it doesn't cloud your judgment.' : dominantEmotion.type === 'fear' ? 'These concerns are valid and should be addressed before proceeding.' : 'This emotional response provides valuable insight into your true feelings.'}`;
  }

  return `You appear to have a relatively calm and rational perspective on "${winner.name}." This balanced emotional state is helpful for clear decision-making.`;
}

function generateKeyFactors(decision: string, priorities: Priority[]): string[] {
  const factors: string[] = [];

  const lowerDecision = decision.toLowerCase();

  if (lowerDecision.includes('time') || lowerDecision.includes('when') || lowerDecision.includes('deadline')) {
    factors.push('Time constraints and deadlines');
  }

  if (lowerDecision.includes('money') || lowerDecision.includes('cost') || lowerDecision.includes('budget') || lowerDecision.includes('afford')) {
    factors.push('Financial resources and budget');
  }

  if (lowerDecision.includes('family') || lowerDecision.includes('partner') || lowerDecision.includes('relationship')) {
    factors.push('Impact on relationships and family');
  }

  factors.push(`Your ${priorities.length} key priorities`);
  factors.push('Current personal circumstances');
  factors.push('Long-term goals and values');

  return factors;
}

function generateRisksAndTradeoffs(decision: string, options: Option[], winner: Option): string[] {
  const risks: string[] = [];

  const lowerDecision = decision.toLowerCase();

  risks.push(`Choosing "${winner.name}" means not pursuing ${options.filter(o => o.id !== winner.id).map(o => o.name).join(' or ')}`);

  if (lowerDecision.includes('career') || lowerDecision.includes('job') || lowerDecision.includes('work')) {
    risks.push('Career decisions have long-term impact and are not easily reversible');
    risks.push('Opportunity cost - time spent on this cannot be spent elsewhere');
  }

  if (lowerDecision.includes('money') || lowerDecision.includes('invest') || lowerDecision.includes('financial')) {
    risks.push('Financial investments carry risk of loss');
    risks.push('Market conditions may change unpredictably');
  }

  risks.push('Plans may need adjustment based on new information');
  risks.push('External factors outside your control may affect outcomes');

  return risks;
}

function generateImmediateNextSteps(decision: string, winner: Option): string[] {
  const steps: string[] = [];

  const lowerDecision = decision.toLowerCase();

  steps.push(`Create a detailed plan for implementing "${winner.name}"`);
  steps.push('Set specific goals and timeline');
  steps.push('Identify any additional resources or support needed');

  if (lowerDecision.includes('career') || lowerDecision.includes('job') || lowerDecision.includes('work')) {
    steps.push('Update your resume or portfolio if applicable');
    steps.push('Reach out to mentors or trusted advisors for feedback');
  }

  if (lowerDecision.includes('money') || lowerDecision.includes('financial') || lowerDecision.includes('invest')) {
    steps.push('Review your budget and financial situation');
    steps.push('Consult with a financial advisor if needed');
  }

  steps.push('Set a review date to evaluate progress');
  steps.push('Be prepared to adjust your approach as needed');

  return steps;
}

// ============================================================================
// EXPORT ALL FUNCTIONS FOR CONSISTENT API
// ============================================================================

export {
  generateDevilsAdvocateQuestions,
  analyzeEmotionsWithSLM as analyzeEmotionsWithLLM,
  generateSmartPriorities as generateSmartPrioritiesLLM,
};
