import { motion } from 'framer-motion';
import { useState } from 'react';

interface WelcomeStepProps {
  decision: string;
  onDecisionChange: (decision: string) => void;
  onNext: () => void;
}

const WelcomeStep = ({ decision, onDecisionChange, onNext }: WelcomeStepProps) => {
  const [localDecision, setLocalDecision] = useState(decision);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (localDecision.trim()) {
      onDecisionChange(localDecision.trim());
      onNext();
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
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1, duration: 0.4 }}
          className="text-center mb-12"
        >
          <h1 className="font-serif text-4xl md:text-5xl font-medium text-foreground mb-4">
            Decision Coach
          </h1>
          <p className="text-muted-foreground text-lg">
            Let's find clarity together
          </p>
        </motion.div>

        <motion.form
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.4 }}
          onSubmit={handleSubmit}
          className="space-y-8"
        >
          <div className="space-y-3">
            <label className="block text-sm font-medium text-muted-foreground">
              What decision are you facing?
            </label>
            <textarea
              value={localDecision}
              onChange={(e) => setLocalDecision(e.target.value)}
              placeholder="e.g., Should I change careers?"
              className="input-calm min-h-[120px] resize-none"
              autoFocus
            />
          </div>

          <button
            type="submit"
            disabled={!localDecision.trim()}
            className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
          >
            Begin
          </button>
        </motion.form>
      </div>
    </motion.div>
  );
};

export default WelcomeStep;
