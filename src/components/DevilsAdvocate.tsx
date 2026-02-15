import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, Lightbulb, AlertTriangle, GitBranch, Clock, ChevronDown, ChevronUp } from 'lucide-react';
import { generateDevilsAdvocateQuestions } from '@/lib/slm';
import type { DevilsAdvocateQuestion } from '@/lib/slm';
import type { Option } from '@/types/decision';

interface DevilsAdvocateProps {
  decision: string;
  options: Option[];
  winner: Option;
}

const DevilsAdvocate = ({ decision, options, winner }: DevilsAdvocateProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [questions, setQuestions] = useState<DevilsAdvocateQuestion[] | null>(null);

  const loadQuestions = useCallback(() => {
    const result = generateDevilsAdvocateQuestions(decision, options, winner);
    setQuestions(result);
  }, [decision, options, winner]);

  const handleToggle = () => {
    if (!isOpen) {
      loadQuestions();
    }
    setIsOpen(!isOpen);
  };

  const getCategoryIcon = (category: DevilsAdvocateQuestion['category']) => {
    switch (category) {
      case 'assumptions':
        return Lightbulb;
      case 'risks':
        return AlertTriangle;
      case 'alternatives':
        return GitBranch;
      case 'long-term':
        return Clock;
    }
  };

  const getCategoryColor = (category: DevilsAdvocateQuestion['category']) => {
    switch (category) {
      case 'assumptions':
        return 'text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/20';
      case 'risks':
        return 'text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/20';
      case 'alternatives':
        return 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/20';
      case 'long-term':
        return 'text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-950/20';
    }
  };

  const getCategoryLabel = (category: DevilsAdvocateQuestion['category']) => {
    switch (category) {
      case 'assumptions':
        return 'Assumptions';
      case 'risks':
        return 'Risks';
      case 'alternatives':
        return 'Alternatives';
      case 'long-term':
        return 'Long-term';
    }
  };

  return (
    <div className="w-full">
      <motion.button
        type="button"
        onClick={handleToggle}
        initial={{ opacity: 0, y: -5 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-950/20 dark:to-slate-900/20 border border-slate-200 dark:border-slate-800 rounded-lg hover:border-slate-300 dark:hover:border-slate-700 transition-all group"
      >
        <Shield className="w-4 h-4 text-slate-600 dark:text-slate-400" />
        <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
          {isOpen ? 'Hide Critical Questions' : 'Challenge Your Decision'}
        </span>
        {isOpen ? (
          <ChevronUp className="w-4 h-4 text-slate-500" />
        ) : (
          <ChevronDown className="w-4 h-4 text-slate-500" />
        )}
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div className="mt-3 p-4 bg-slate-50/50 dark:bg-slate-950/10 border border-slate-200 dark:border-slate-800 rounded-lg">
              <p className="text-sm text-muted-foreground mb-4">
                These questions are designed to challenge your thinking and ensure you've considered all angles before making your final decision.
              </p>

              {questions && questions.length > 0 ? (
                <div className="space-y-3">
                  {questions.map((question, index) => {
                    const Icon = getCategoryIcon(question.category);
                    const colorClass = getCategoryColor(question.category);

                    return (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className={`p-3 rounded-lg border ${colorClass} border-opacity-30`}
                      >
                        <div className="flex items-start gap-3">
                          <Icon className={`w-5 h-5 flex-shrink-0 mt-0.5 ${colorClass.split(' ')[0]}`} />
                          <div className="flex-1">
                            <p className="text-sm font-medium text-foreground mb-1">
                              {question.question}
                            </p>
                            <span className="text-xs font-semibold uppercase tracking-wider opacity-70">
                              {getCategoryLabel(question.category)}
                            </span>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              ) : null}

              <div className="mt-4 pt-3 border-t border-slate-200 dark:border-slate-800">
                <button
                  onClick={() => setIsOpen(false)}
                  className="w-full px-3 py-2 bg-secondary hover:bg-muted text-foreground text-sm font-medium rounded-lg transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default DevilsAdvocate;
