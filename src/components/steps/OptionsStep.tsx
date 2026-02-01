import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import { Plus, X } from 'lucide-react';
import type { Option } from '@/types/decision';

interface OptionsStepProps {
  options: Option[];
  onOptionsChange: (options: Option[]) => void;
  onNext: () => void;
  onBack: () => void;
}

const OptionsStep = ({ options, onOptionsChange, onNext, onBack }: OptionsStepProps) => {
  const [newOption, setNewOption] = useState('');

  const addOption = () => {
    if (newOption.trim() && options.length < 4) {
      const option: Option = {
        id: crypto.randomUUID(),
        name: newOption.trim(),
        scores: {},
      };
      onOptionsChange([...options, option]);
      setNewOption('');
    }
  };

  const removeOption = (id: string) => {
    onOptionsChange(options.filter((o) => o.id !== id));
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addOption();
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.4 }}
      className="flex flex-col items-center justify-center min-h-[70vh] px-6"
    >
      <div className="w-full max-w-md">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="text-center mb-10"
        >
          <h2 className="font-serif text-3xl md:text-4xl font-medium text-foreground mb-3">
            Your Options
          </h2>
          <p className="text-muted-foreground">
            Add up to 4 options you're considering
          </p>
        </motion.div>

        <div className="space-y-4 mb-8">
          <AnimatePresence mode="popLayout">
            {options.map((option, index) => (
              <motion.div
                key={option.id}
                initial={{ opacity: 0, scale: 0.95, y: -10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, x: -20 }}
                transition={{ duration: 0.2 }}
                className="card-calm flex items-center justify-between gap-4"
              >
                <div className="flex items-center gap-3">
                  <span className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center text-sm font-medium">
                    {index + 1}
                  </span>
                  <span className="text-foreground font-medium">{option.name}</span>
                </div>
                <button
                  onClick={() => removeOption(option.id)}
                  className="p-2 rounded-full hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
                >
                  <X size={18} />
                </button>
              </motion.div>
            ))}
          </AnimatePresence>

          {options.length < 4 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex gap-3"
            >
              <input
                type="text"
                value={newOption}
                onChange={(e) => setNewOption(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Add an option..."
                className="input-calm flex-1"
                maxLength={50}
              />
              <button
                onClick={addOption}
                disabled={!newOption.trim()}
                className="btn-secondary px-4 disabled:opacity-50"
              >
                <Plus size={20} />
              </button>
            </motion.div>
          )}
        </div>

        <div className="flex gap-4">
          <button onClick={onBack} className="btn-secondary flex-1">
            Back
          </button>
          <button
            onClick={onNext}
            disabled={options.length < 2}
            className="btn-primary flex-1 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
          >
            Continue
          </button>
        </div>

        {options.length < 2 && (
          <p className="text-center text-sm text-muted-foreground mt-4">
            Add at least 2 options to continue
          </p>
        )}
      </div>
    </motion.div>
  );
};

export default OptionsStep;
