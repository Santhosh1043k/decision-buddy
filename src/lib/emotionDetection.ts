import type { DetectedEmotion, EmotionalAnalysis, Option, CognitivePattern } from '@/types/decision';

const EMOTION_KEYWORDS: Record<DetectedEmotion['type'], { label: string; keywords: string[] }> = {
  fear: {
    label: 'Fear',
    keywords: [
      'scared', 'afraid', 'worried', 'anxious', 'nervous', 'terrified', 
      'panic', 'dread', 'frightened', 'uneasy', 'tense', 'stress',
      'what if', 'might fail', 'risky', 'dangerous', 'uncertain', 'doubt'
    ]
  },
  excitement: {
    label: 'Excitement',
    keywords: [
      'excited', 'thrilled', 'eager', 'enthusiastic', 'pumped', 'energized',
      'can\'t wait', 'amazing', 'awesome', 'love', 'passionate', 'inspired',
      'hopeful', 'optimistic', 'dream', 'opportunity', 'adventure', 'new'
    ]
  },
  guilt: {
    label: 'Guilt',
    keywords: [
      'guilty', 'selfish', 'wrong', 'should', 'shouldn\'t', 'bad',
      'letting down', 'disappointing', 'responsible', 'obligation', 'owe',
      'feel terrible', 'regret', 'blame', 'fault', 'burden'
    ]
  },
  relief: {
    label: 'Relief',
    keywords: [
      'relief', 'relieved', 'free', 'freedom', 'peaceful', 'calm',
      'weight off', 'finally', 'escape', 'release', 'breathe', 'easy',
      'comfortable', 'safe', 'secure', 'settled', 'done with'
    ]
  },
  uncertainty: {
    label: 'Uncertainty',
    keywords: [
      'unsure', 'confused', 'torn', 'conflicted', 'mixed', 'ambivalent',
      'don\'t know', 'not sure', 'maybe', 'unclear', 'complicated', 'complex',
      'both', 'either way', 'depends', 'hard to say', 'undecided'
    ]
  }
};

export function detectEmotions(text: string): DetectedEmotion[] {
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
      // Intensity based on number of matches (capped at 1)
      const intensity = Math.min(matchCount / 3, 1);
      emotions.push({
        type: type as DetectedEmotion['type'],
        label,
        intensity
      });
    }
  }
  
  // Sort by intensity
  return emotions.sort((a, b) => b.intensity - a.intensity);
}

export function analyzeOptionEmotions(options: Option[]): EmotionalAnalysis[] {
  return options.map(option => {
    const emotions = detectEmotions(option.emotionalText);
    return {
      optionId: option.id,
      optionName: option.name,
      emotions,
      dominantEmotion: emotions.length > 0 ? emotions[0] : null
    };
  });
}

export function detectCognitivePatterns(
  options: Option[],
  emotionalAnalyses: EmotionalAnalysis[],
  winnerOptionId: string
): CognitivePattern[] {
  const patterns: CognitivePattern[] = [];
  
  const winnerAnalysis = emotionalAnalyses.find(a => a.optionId === winnerOptionId);
  const otherAnalyses = emotionalAnalyses.filter(a => a.optionId !== winnerOptionId);
  
  // Fear-based avoidance: High fear in non-chosen options suggests avoidance
  const fearInOthers = otherAnalyses.some(a => 
    a.emotions.some(e => e.type === 'fear' && e.intensity > 0.5)
  );
  const fearInWinner = winnerAnalysis?.emotions.some(e => e.type === 'fear' && e.intensity > 0.3);
  
  patterns.push({
    id: 'fear-avoidance',
    label: 'Fear-Based Avoidance',
    description: 'You may be steering away from options that feel scary, even if they could be valuable.',
    detected: fearInOthers && !fearInWinner
  });
  
  // Excitement without planning: High excitement but low stability priority
  const excitementInWinner = winnerAnalysis?.emotions.some(e => 
    e.type === 'excitement' && e.intensity > 0.5
  );
  
  patterns.push({
    id: 'excitement-bias',
    label: 'Excitement Without Planning',
    description: 'The thrill of this option is compelling, but consider the practical details too.',
    detected: !!excitementInWinner
  });
  
  // Overvaluing short-term comfort: Relief/comfort in winner, fear elsewhere
  const reliefInWinner = winnerAnalysis?.emotions.some(e => 
    e.type === 'relief' && e.intensity > 0.3
  );
  
  patterns.push({
    id: 'comfort-bias',
    label: 'Comfort-Seeking',
    description: 'The appeal of relief is strong—make sure it aligns with your long-term goals.',
    detected: !!reliefInWinner && fearInOthers
  });
  
  // Guilt-driven decision
  const guiltDetected = emotionalAnalyses.some(a => 
    a.emotions.some(e => e.type === 'guilt' && e.intensity > 0.3)
  );
  
  patterns.push({
    id: 'guilt-driven',
    label: 'Guilt Influence',
    description: 'Guilt is playing a role in how you view these options. Consider what you truly want.',
    detected: guiltDetected
  });
  
  return patterns;
}

export function getEmotionalInsight(
  winnerAnalysis: EmotionalAnalysis | undefined,
  patterns: CognitivePattern[]
): string {
  const insights: string[] = [];
  
  if (winnerAnalysis?.dominantEmotion) {
    const emotion = winnerAnalysis.dominantEmotion;
    
    switch (emotion.type) {
      case 'excitement':
        insights.push(`You feel genuine excitement about "${winnerAnalysis.optionName}." That enthusiasm is worth honoring.`);
        break;
      case 'relief':
        insights.push(`Choosing "${winnerAnalysis.optionName}" brings you a sense of relief and peace.`);
        break;
      case 'fear':
        insights.push(`You have some concerns about "${winnerAnalysis.optionName}," but you're facing them courageously.`);
        break;
      case 'uncertainty':
        insights.push(`You're still working through mixed feelings about "${winnerAnalysis.optionName}."That's okay—clarity often comes with time.`);
        break;
      case 'guilt':
        insights.push(`There's some guilt tied to "${winnerAnalysis.optionName}." Be gentle with yourself as you process this.`);
        break;
    }
  }
  
  const detectedPatterns = patterns.filter(p => p.detected);
  if (detectedPatterns.length > 0) {
    insights.push(detectedPatterns[0].description);
  }
  
  return insights.join(' ');
}

export function getEmotionColor(type: DetectedEmotion['type']): string {
  switch (type) {
    case 'fear': return 'hsl(var(--destructive))';
    case 'excitement': return 'hsl(30 80% 55%)';
    case 'guilt': return 'hsl(280 50% 50%)';
    case 'relief': return 'hsl(var(--primary))';
    case 'uncertainty': return 'hsl(var(--muted-foreground))';
    default: return 'hsl(var(--muted-foreground))';
  }
}
