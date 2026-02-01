import { motion } from 'framer-motion';
import { Trophy, RefreshCw } from 'lucide-react';
import type { Option, Priority } from '@/types/decision';

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

  const getRecommendationText = () => {
    const secondPlace = scoredOptions[1];
    const margin = winner.totalScore - secondPlace.totalScore;
    const percentMargin = (margin / maxPossible) * 100;

    if (percentMargin > 15) {
      return `"${winner.option.name}" stands out clearly as your best choice based on your priorities.`;
    } else if (percentMargin > 5) {
      return `"${winner.option.name}" edges ahead, though "${secondPlace.option.name}" is also a strong option.`;
    } else {
      return `It's a close call between "${winner.option.name}" and "${secondPlace.option.name}". Trust your intuition.`;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.4 }}
      className="flex flex-col items-center min-h-[70vh] px-6 py-8"
    >
      <div className="w-full max-w-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1, type: 'spring', stiffness: 200 }}
          className="text-center mb-10"
        >
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6">
            <Trophy className="w-8 h-8 text-primary" />
          </div>
          <p className="text-sm text-muted-foreground mb-2">{decision}</p>
          <h2 className="font-serif text-3xl md:text-4xl font-medium text-foreground mb-4">
            Our Recommendation
          </h2>
          <p className="text-muted-foreground leading-relaxed">
            {getRecommendationText()}
          </p>
        </motion.div>

        <div className="space-y-4 mb-10">
          {scoredOptions.map((scored, index) => (
            <motion.div
              key={scored.option.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 + index * 0.1 }}
              className={`card-calm ${index === 0 ? 'ring-2 ring-primary' : ''}`}
            >
              <div className="flex items-center justify-between mb-4">
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
                  <span className="font-medium text-foreground">
                    {scored.option.name}
                  </span>
                </div>
                <span className="text-xl font-serif text-primary font-medium">
                  {Math.round((scored.totalScore / maxPossible) * 100)}%
                </span>
              </div>

              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${(scored.totalScore / maxPossible) * 100}%` }}
                  transition={{ delay: 0.4 + index * 0.1, duration: 0.6 }}
                  className="h-full bg-primary rounded-full"
                />
              </div>

              {index === 0 && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  transition={{ delay: 0.6 }}
                  className="mt-4 pt-4 border-t border-border"
                >
                  <p className="text-sm text-muted-foreground mb-2">Score breakdown:</p>
                  <div className="space-y-2">
                    {scored.breakdown
                      .sort((a, b) => b.weighted - a.weighted)
                      .slice(0, 3)
                      .map((b) => (
                        <div
                          key={b.priority.id}
                          className="flex justify-between text-sm"
                        >
                          <span className="text-muted-foreground">
                            {b.priority.label}
                          </span>
                          <span className="text-foreground font-medium">
                            {b.weighted} pts
                          </span>
                        </div>
                      ))}
                  </div>
                </motion.div>
              )}
            </motion.div>
          ))}
        </div>

        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
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
