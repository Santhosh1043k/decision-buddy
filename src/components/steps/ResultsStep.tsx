import { motion } from 'framer-motion';
import { Trophy, RefreshCw, Heart, Brain, MessageCircle } from 'lucide-react';
import type { Option, Priority } from '@/types/decision';
import {
  analyzeOptionEmotions,
  detectCognitivePatterns,
  getEmotionalInsight,
  getEmotionColor,
} from '@/lib/emotionDetection';

interface ResultsStepProps {
  decision: string;
  options: Option[];
  priorities: Priority[];
  onReset: () => void;
}

interface ScoredOption {
  option: Option;
  totalScore: number;
  breakdown: { priority: Priority; weighted: number }[];
}

const ResultsStep = ({ decision, options, priorities, onReset }: ResultsStepProps) => {
  // Calculate weighted scores
  const scoredOptions: ScoredOption[] = options.map((option) => {
    const breakdown = priorities.map((priority) => {
      const score = option.scores[priority.id] ?? 0;
      const weighted = score * priority.value;
      return { priority, weighted };
    });

    const totalScore = breakdown.reduce((sum, b) => sum + b.weighted, 0);

    return { option, totalScore, breakdown };
  });

  // Sort by total score descending
  scoredOptions.sort((a, b) => b.totalScore - a.totalScore);

  const winner = scoredOptions[0];
  const maxPossible = priorities.reduce((sum, p) => sum + p.value * 5, 0);

  // Emotional analysis
  const emotionalAnalyses = analyzeOptionEmotions(options);
  const cognitivePatterns = detectCognitivePatterns(options, emotionalAnalyses, winner.option.id);
  const winnerAnalysis = emotionalAnalyses.find((a) => a.optionId === winner.option.id);
  const emotionalInsight = getEmotionalInsight(winnerAnalysis, cognitivePatterns);
  const detectedPatterns = cognitivePatterns.filter((p) => p.detected);

  const getLogicalRecommendation = () => {
    const secondPlace = scoredOptions[1];
    const margin = winner.totalScore - secondPlace.totalScore;
    const percentMargin = (margin / maxPossible) * 100;

    if (percentMargin > 15) {
      return `Based on your priorities, "${winner.option.name}" scores notably higher across the factors you care about most.`;
    } else if (percentMargin > 5) {
      return `"${winner.option.name}" has a slight edge in your priority areas, though "${secondPlace.option.name}" comes close.`;
    } else {
      return `The logical analysis shows a near tie between "${winner.option.name}" and "${secondPlace.option.name}."`;
    }
  };

  const hasEmotionalData = options.some((o) => o.emotionalText.trim());

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.4 }}
      className="flex flex-col items-center min-h-[70vh] px-6 py-8"
    >
      <div className="w-full max-w-md">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1, type: 'spring', stiffness: 200 }}
          className="text-center mb-8"
        >
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6">
            <Trophy className="w-8 h-8 text-primary" />
          </div>
          <p className="text-sm text-muted-foreground mb-2">{decision}</p>
          <h2 className="font-serif text-3xl md:text-4xl font-medium text-foreground">
            Your Recommendation
          </h2>
        </motion.div>

        {/* Logical Analysis */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="card-calm mb-4"
        >
          <div className="flex items-center gap-2 mb-3">
            <Brain className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium text-foreground">Logical Analysis</span>
          </div>
          <p className="text-muted-foreground text-sm leading-relaxed">
            {getLogicalRecommendation()}
          </p>
        </motion.div>

        {/* Emotional Insight */}
        {hasEmotionalData && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="card-calm mb-4"
          >
            <div className="flex items-center gap-2 mb-3">
              <Heart className="w-4 h-4 text-accent" />
              <span className="text-sm font-medium text-foreground">Emotional Insight</span>
            </div>
            <p className="text-muted-foreground text-sm leading-relaxed">
              {emotionalInsight || "Your emotions are complex—and that's perfectly normal. Take your time with this decision."}
            </p>

            {/* Detected emotions for winner */}
            {winnerAnalysis && winnerAnalysis.emotions.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-3">
                {winnerAnalysis.emotions.slice(0, 3).map((emotion) => (
                  <span
                    key={emotion.type}
                    className="text-xs px-2 py-1 rounded-full"
                    style={{
                      backgroundColor: `${getEmotionColor(emotion.type)}20`,
                      color: getEmotionColor(emotion.type),
                    }}
                  >
                    {emotion.label}
                  </span>
                ))}
              </div>
            )}
          </motion.div>
        )}

        {/* Cognitive Patterns */}
        {detectedPatterns.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="card-calm mb-6 border-l-4 border-accent"
          >
            <div className="flex items-center gap-2 mb-3">
              <MessageCircle className="w-4 h-4 text-accent" />
              <span className="text-sm font-medium text-foreground">Something to Consider</span>
            </div>
            <div className="space-y-2">
              {detectedPatterns.slice(0, 2).map((pattern) => (
                <div key={pattern.id}>
                  <span className="text-xs font-medium text-accent">{pattern.label}</span>
                  <p className="text-muted-foreground text-sm">{pattern.description}</p>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Rankings */}
        <div className="space-y-3 mb-6">
          {scoredOptions.map((scored, index) => {
            const analysis = emotionalAnalyses.find((a) => a.optionId === scored.option.id);

            return (
              <motion.div
                key={scored.option.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 + index * 0.1 }}
                className={`card-calm ${index === 0 ? 'ring-2 ring-primary' : ''}`}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <span
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                        index === 0
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-muted text-muted-foreground'
                      }`}
                    >
                      {index + 1}
                    </span>
                    <span className="font-medium text-foreground">{scored.option.name}</span>
                  </div>
                  <span className="text-xl font-serif text-primary font-medium">
                    {Math.round((scored.totalScore / maxPossible) * 100)}%
                  </span>
                </div>

                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${(scored.totalScore / maxPossible) * 100}%` }}
                    transition={{ delay: 0.5 + index * 0.1, duration: 0.6 }}
                    className="h-full bg-primary rounded-full"
                  />
                </div>

                {/* Emotions for each option */}
                {analysis && analysis.emotions.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-3">
                    {analysis.emotions.slice(0, 2).map((emotion) => (
                      <span
                        key={emotion.type}
                        className="text-xs px-2 py-0.5 rounded-full"
                        style={{
                          backgroundColor: `${getEmotionColor(emotion.type)}15`,
                          color: getEmotionColor(emotion.type),
                        }}
                      >
                        {emotion.label}
                      </span>
                    ))}
                  </div>
                )}

                {index === 0 && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    transition={{ delay: 0.7 }}
                    className="mt-4 pt-4 border-t border-border"
                  >
                    <p className="text-sm text-muted-foreground mb-2">Top priority scores:</p>
                    <div className="space-y-1">
                      {scored.breakdown
                        .sort((a, b) => b.weighted - a.weighted)
                        .slice(0, 3)
                        .map((b) => (
                          <div key={b.priority.id} className="flex justify-between text-sm">
                            <span className="text-muted-foreground">{b.priority.label}</span>
                            <span className="text-foreground font-medium">{b.weighted} pts</span>
                          </div>
                        ))}
                    </div>
                  </motion.div>
                )}
              </motion.div>
            );
          })}
        </div>

        {/* Final note */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.9 }}
          className="text-center mb-8 px-4"
        >
          <p className="text-sm text-muted-foreground italic leading-relaxed">
            This analysis combines your stated priorities with emotional signals, but only you know the full picture. 
            <span className="block mt-2 text-foreground font-medium not-italic">
              The final choice is always yours. Trust yourself.
            </span>
          </p>
        </motion.div>

        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          onClick={onReset}
          className="btn-secondary w-full flex items-center justify-center gap-2"
        >
          <RefreshCw size={18} />
          Start New Decision
        </motion.button>
      </div>
    </motion.div>
  );
};

export default ResultsStep;
