import { motion } from 'framer-motion';
import type { Priority } from '@/types/decision';

interface PrioritiesStepProps {
  priorities: Priority[];
  onPrioritiesChange: (priorities: Priority[]) => void;
  onNext: () => void;
  onBack: () => void;
}

const PrioritiesStep = ({ priorities, onPrioritiesChange, onNext, onBack }: PrioritiesStepProps) => {
  const updatePriority = (id: string, value: number) => {
    onPrioritiesChange(
      priorities.map((p) => (p.id === id ? { ...p, value } : p))
    );
  };

  return (
    <motion.div
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
          <h2 className="font-serif text-3xl md:text-4xl font-medium text-foreground mb-3">
            Your Priorities
          </h2>
          <p className="text-muted-foreground">
            How important is each factor to you?
          </p>
        </motion.div>

        <div className="space-y-6 mb-10">
          {priorities.map((priority, index) => (
            <motion.div
              key={priority.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 + index * 0.08 }}
              className="card-calm"
            >
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="font-medium text-foreground">{priority.label}</h3>
                  <p className="text-sm text-muted-foreground">{priority.description}</p>
                </div>
                <span className="text-2xl font-serif text-primary font-medium">
                  {priority.value}
                </span>
              </div>
              
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground w-8">Low</span>
                <div className="flex-1 flex gap-2">
                  {[1, 2, 3, 4, 5].map((value) => (
                    <button
                      key={value}
                      onClick={() => updatePriority(priority.id, value)}
                      className={`flex-1 h-10 rounded-lg transition-all duration-200 ${
                        value <= priority.value
                          ? 'bg-primary'
                          : 'bg-muted hover:bg-primary/20'
                      }`}
                    />
                  ))}
                </div>
                <span className="text-xs text-muted-foreground w-8 text-right">High</span>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="flex gap-4">
          <button onClick={onBack} className="btn-secondary flex-1">
            Back
          </button>
          <button onClick={onNext} className="btn-primary flex-1">
            See Results
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default PrioritiesStep;
