import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Check, Plus } from 'lucide-react';
import { generateSmartPriorities } from '@/lib/slm';
import type { Priority } from '@/types/decision';
import { useToast } from '@/hooks/use-toast';

interface SmartPrioritySuggestionsProps {
  decisionText: string;
  onSelectPriorities: (priorities: Priority[]) => void;
  existingPriorities: Priority[];
}

const SmartPrioritySuggestions = ({
  decisionText,
  onSelectPriorities,
  existingPriorities,
}: SmartPrioritySuggestionsProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [suggestions, setSuggestions] = useState<Priority[] | null>(null);
  const [rationale, setRationale] = useState<string>('');
  const { toast } = useToast();

  const loadSuggestions = useCallback(() => {
    if (!decisionText.trim()) return;

    const result = generateSmartPriorities(decisionText);
    setSuggestions(result.suggestedPriorities);
    setRationale(result.rationale);
  }, [decisionText]);

  const handleToggle = () => {
    if (!isOpen && decisionText.trim()) {
      loadSuggestions();
    }
    setIsOpen(!isOpen);
  };

  const handleSelectSuggestion = (priority: Priority) => {
    const exists = existingPriorities.some(p => p.id === priority.id);
    if (exists) {
      toast({
        title: 'Already added',
        description: `"${priority.label}" is already in your priorities.`,
        variant: 'destructive',
      });
      return;
    }

    onSelectPriorities([priority, ...existingPriorities]);
    toast({
      title: 'Priority added',
      description: `"${priority.label}" has been added to your priorities.`,
    });
  };

  const handleSelectAll = () => {
    if (!suggestions) return;

    const newPriorities = suggestions.filter(
      suggestion => !existingPriorities.some(p => p.id === suggestion.id)
    );

    if (newPriorities.length === 0) {
      toast({
        title: 'All already added',
        description: 'All suggested priorities are already in your list.',
        variant: 'destructive',
      });
      return;
    }

    onSelectPriorities([...newPriorities, ...existingPriorities]);
    toast({
      title: 'Priorities added',
      description: `${newPriorities.length} smart priorities have been added.`,
    });
    setIsOpen(false);
  };

  const availableSuggestions = suggestions?.filter(
    suggestion => !existingPriorities.some(p => p.id === suggestion.id)
  ) || [];

  return (
    <div className="w-full">
      <motion.button
        type="button"
        onClick={handleToggle}
        initial={{ opacity: 0, y: -5 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-950/20 dark:to-blue-950/20 border border-purple-200 dark:border-purple-800 rounded-lg hover:border-purple-300 dark:hover:border-purple-700 transition-all group"
      >
        <Sparkles className="w-4 h-4 text-purple-600 dark:text-purple-400" />
        <span className="text-sm font-medium text-purple-700 dark:text-purple-300">
          {isOpen ? 'Hide Smart Suggestions' : 'Generate Smart Priorities'}
        </span>
        <span className="text-xs text-muted-foreground">
          (AI-powered)
        </span>
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
            <div className="mt-3 p-4 bg-purple-50/50 dark:bg-purple-950/10 border border-purple-200 dark:border-purple-800 rounded-lg">
              {suggestions && suggestions.length > 0 ? (
                <div className="space-y-4">
                  <div className="flex items-start gap-2">
                    <Sparkles className="w-4 h-4 text-purple-600 flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-muted-foreground leading-relaxed">{rationale}</p>
                  </div>

                  <div className="space-y-2">
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Suggested Priorities
                    </p>
                    {suggestions.map((priority) => {
                      const exists = existingPriorities.some(p => p.id === priority.id);
                      return (
                        <div
                          key={priority.id}
                          className={`flex items-center gap-2 p-3 bg-background rounded-lg border ${exists ? 'opacity-50 cursor-not-allowed' : 'border-border hover:border-purple-300 dark:hover:border-purple-700 cursor-pointer'} transition-colors group`}
                          onClick={() => !exists && handleSelectSuggestion(priority)}
                        >
                          {exists ? (
                            <Check className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                          ) : (
                            <Plus className="w-4 h-4 text-purple-600 flex-shrink-0" />
                          )}
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-foreground truncate">
                              {priority.label}
                            </p>
                            <p className="text-xs text-muted-foreground truncate">
                              {priority.description}
                            </p>
                          </div>
                          <span className="text-xs text-muted-foreground px-2 py-1 bg-muted rounded">
                            {priority.value}/5
                          </span>
                        </div>
                      );
                    })}
                  </div>

                  {availableSuggestions.length > 0 && (
                    <div className="flex gap-2 pt-2">
                      <button
                        onClick={handleSelectAll}
                        className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-purple-600 hover:bg-purple-700 text-white text-sm font-medium rounded-lg transition-colors"
                      >
                        <Check className="w-4 h-4" />
                        Add All ({availableSuggestions.length})
                      </button>
                      <button
                        onClick={() => setIsOpen(false)}
                        className="flex-1 px-3 py-2 bg-secondary hover:bg-muted text-foreground text-sm font-medium rounded-lg transition-colors"
                      >
                        Close
                      </button>
                    </div>
                  )}

                  {availableSuggestions.length === 0 && (
                    <button
                      onClick={() => setIsOpen(false)}
                      className="w-full px-3 py-2 bg-secondary hover:bg-muted text-foreground text-sm font-medium rounded-lg transition-colors"
                    >
                      Close
                    </button>
                  )}
                </div>
              ) : null}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SmartPrioritySuggestions;
