import { motion } from 'framer-motion';
import type { Option, Priority } from '@/types/decision';

interface OptionsRatingStepProps {
  options: Option[];
  priorities: Priority[];
  currentPriorityIndex: number;
  onOptionsChange: (options: Option[]) => void;
  onNext: () => void;
  onBack: () => void;
}

const OptionsRatingStep = ({
  options,
  priorities,
  currentPriorityIndex,
  onOptionsChange,
  onNext,
  onBack,
}: OptionsRatingStepProps) => {
  const currentPriority = priorities[currentPriorityIndex];

  const updateOptionScore = (optionId: string, score: number) => {
    onOptionsChange(
      options.map((o) =>
        o.id === optionId
          ? { ...o, scores: { ...o.scores, [currentPriority.id]: score } }
          : o
      )
    );
  };

  const allRated = options.every(
    (o) => o.scores[currentPriority.id] !== undefined
  );

  return (
    <motion.div
      key={currentPriority.id}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.4 }}
      className="flex flex-col items-center justify-center min-h-[70vh] px-6 py-8"
    >
      <div className="w-full max-w-md">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="text-center mb-10"
        >
          <p className="text-sm text-primary font-medium mb-2">
            {currentPriorityIndex + 1} of {priorities.length}
          </p>
          <h2 className="font-serif text-3xl md:text-4xl font-medium text-foreground mb-3">
            {currentPriority.label}
          </h2>
          <p className="text-muted-foreground">
            Rate each option for {currentPriority.description.toLowerCase()}
          </p>
        </motion.div>

        <div className="space-y-4 mb-10">
          {options.map((option, index) => (
            <motion.div
              key={option.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 + index * 0.08 }}
              className="card-calm"
            >
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-medium text-foreground">{option.name}</h3>
                <span className="text-xl font-serif text-primary font-medium">
                  {option.scores[currentPriority.id] ?? '–'}
                </span>
              </div>

              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((score) => (
                  <button
                    key={score}
                    onClick={() => updateOptionScore(option.id, score)}
                    className={`flex-1 h-12 rounded-lg font-medium transition-all duration-200 ${
                      option.scores[currentPriority.id] === score
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted hover:bg-primary/20 text-muted-foreground'
                    }`}
                  >
                    {score}
                  </button>
                ))}
              </div>
              <div className="flex justify-between mt-2">
                <span className="text-xs text-muted-foreground">Poor</span>
                <span className="text-xs text-muted-foreground">Excellent</span>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="flex gap-4">
          <button onClick={onBack} className="btn-secondary flex-1">
            Back
          </button>
          <button
            onClick={onNext}
            disabled={!allRated}
            className="btn-primary flex-1 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
          >
            {currentPriorityIndex === priorities.length - 1 ? 'See Results' : 'Next'}
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default OptionsRatingStep;
