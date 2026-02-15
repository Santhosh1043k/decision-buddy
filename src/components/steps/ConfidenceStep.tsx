import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { CheckCircle2, AlertCircle, HelpCircle, Sparkles } from 'lucide-react';
import { Slider } from '@/components/ui/slider';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';

interface ConfidenceStepProps {
  confidenceScore: number | undefined;
  reflectionNotes: string | undefined;
  onConfidenceChange: (score: number) => void;
  onReflectionChange: (notes: string) => void;
  onNext: () => void;
  onBack: () => void;
}

const confidenceLevels = [
  { min: 1, max: 3, label: 'Uncertain', color: 'text-amber-600', bgColor: 'bg-amber-50', icon: AlertCircle },
  { min: 4, max: 6, label: 'Moderate', color: 'text-blue-600', bgColor: 'bg-blue-50', icon: HelpCircle },
  { min: 7, max: 8, label: 'Confident', color: 'text-green-600', bgColor: 'bg-green-50', icon: CheckCircle2 },
  { min: 9, max: 10, label: 'Very Confident', color: 'text-primary', bgColor: 'bg-primary/10', icon: Sparkles },
];

const getConfidenceLevel = (score: number) => {
  return confidenceLevels.find((level) => score >= level.min && score <= level.max) || confidenceLevels[0];
};

const getConfidenceInsight = (score: number): string => {
  if (score < 5) {
    return 'You seem uncertain. Consider reviewing your priorities or taking more time.';
  } else if (score <= 7) {
    return 'Moderate confidence. Trust your analysis but stay open to new information.';
  } else {
    return 'You feel confident in this direction. Trust your decision.';
  }
};

const ConfidenceStep = ({
  confidenceScore,
  reflectionNotes,
  onConfidenceChange,
  onReflectionChange,
  onNext,
  onBack,
}: ConfidenceStepProps) => {
  const [score, setScore] = useState<number>(confidenceScore ?? 7);
  const [notes, setNotes] = useState<string>(reflectionNotes ?? '');

  useEffect(() => {
    onConfidenceChange(score);
  }, [score, onConfidenceChange]);

  useEffect(() => {
    onReflectionChange(notes);
  }, [notes, onReflectionChange]);

  const currentLevel = getConfidenceLevel(score);
  const LevelIcon = currentLevel.icon;
  const insight = getConfidenceInsight(score);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.4 }}
      className="flex flex-col items-center justify-center min-h-[70vh] px-4 sm:px-6 py-8"
    >
      <div className="w-full max-w-md">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="text-center mb-10"
        >
          <h2 className="font-serif text-3xl md:text-4xl font-medium text-foreground mb-3">
            How Confident Are You?
          </h2>
          <p className="text-muted-foreground">
            Rate your confidence in this recommendation before viewing results
          </p>
        </motion.div>

        {/* Confidence Score Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="card-calm mb-6"
        >
          <div className="text-center mb-6">
            <motion.div
              key={currentLevel.label}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-full ${currentLevel.bgColor}`}
            >
              <LevelIcon className={`w-5 h-5 ${currentLevel.color}`} />
              <span className={`font-medium ${currentLevel.color}`}>{currentLevel.label}</span>
            </motion.div>
            <div className="mt-4">
              <span className="text-5xl font-serif font-medium text-primary">{score}</span>
              <span className="text-muted-foreground text-lg">/10</span>
            </div>
          </div>

          <div className="px-2 mb-6">
            <Slider
              value={[score]}
              onValueChange={(value) => setScore(value[0])}
              min={1}
              max={10}
              step={1}
              className="w-full"
            />
            <div className="flex justify-between mt-2 text-xs text-muted-foreground">
              <span>Uncertain</span>
              <span>Very Confident</span>
            </div>
          </div>

          {/* Confidence Insight */}
          <motion.div
            key={insight}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="bg-muted/50 rounded-xl p-4 text-center"
          >
            <p className="text-sm text-muted-foreground">{insight}</p>
          </motion.div>
        </motion.div>

        {/* Reflection Notes */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="card-calm mb-6"
        >
          <div className="mb-3">
            <label className="text-sm font-medium text-foreground flex items-center gap-2">
              <span>What reservations do you still have?</span>
              <Badge variant="outline" className="text-xs font-normal">Optional</Badge>
            </label>
            <p className="text-xs text-muted-foreground mt-1">
              Jot down any lingering doubts or questions to revisit later
            </p>
          </div>
          <Textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="e.g., I'm worried about the financial impact in the first 6 months..."
            className="min-h-[120px] resize-none"
            maxLength={500}
          />
          <div className="flex justify-end mt-2">
            <span className="text-xs text-muted-foreground">{notes.length}/500</span>
          </div>
        </motion.div>

        {/* Navigation */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="flex gap-4"
        >
          <button onClick={onBack} className="btn-secondary flex-1">
            Back
          </button>
          <button onClick={onNext} className="btn-primary flex-1">
            View Results
          </button>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default ConfidenceStep;
