import { motion } from 'framer-motion';
import { useState } from 'react';
import { Clock, Trash2 } from 'lucide-react';
import TemplateSelector from '@/components/TemplateSelector';
import { DecisionTemplate, Priority } from '@/types/decision';
import { DecisionDraft } from '@/types/decision';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';

interface WelcomeStepProps {
  decision: string;
  onDecisionChange: (decision: string) => void;
  onNext: () => void;
  onTemplateSelect?: (template: DecisionTemplate) => void;
  existingDraft?: DecisionDraft | null;
  onDraftRestore?: () => void;
  onDraftDiscard?: () => void;
}

const WelcomeStep = ({ 
  decision, 
  onDecisionChange, 
  onNext,
  onTemplateSelect,
  existingDraft,
  onDraftRestore,
  onDraftDiscard,
}: WelcomeStepProps) => {
  const [localDecision, setLocalDecision] = useState(decision);
  const [showTemplates, setShowTemplates] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (localDecision.trim()) {
      onDecisionChange(localDecision.trim());
      onNext();
    }
  };

  const handleTemplateSelect = (template: DecisionTemplate) => {
    setLocalDecision(template.exampleDecision);
    if (onTemplateSelect) {
      onTemplateSelect(template);
    }
    setShowTemplates(false);
    
    // Scroll to the decision input
    setTimeout(() => {
      const textarea = document.querySelector('textarea');
      textarea?.focus();
    }, 100);
  };

  const formatRelativeTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'just now';
    if (diffMins < 60) return `${diffMins} minute${diffMins !== 1 ? 's' : ''} ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`;
    if (diffDays < 7) return `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`;
    return date.toLocaleDateString();
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.4 }}
      className="flex flex-col items-center justify-center min-h-[70vh] px-4 sm:px-6 py-8"
    >
      <div className="w-full max-w-4xl space-y-8 sm:space-y-12">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1, duration: 0.4 }}
          className="text-center"
        >
          <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl font-medium text-foreground mb-3 sm:mb-4">
            Decision Coach
          </h1>
          <p className="text-muted-foreground text-base sm:text-lg">
            Let's find clarity together
          </p>
        </motion.div>

        <div className="w-full max-w-2xl mx-auto space-y-8">
          {/* Draft Restoration Card */}
          {existingDraft && onDraftRestore && onDraftDiscard && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.3 }}
              className="bg-accent/10 border border-accent/30 rounded-xl p-4 sm:p-5"
            >
              <div className="flex items-start gap-3 sm:gap-4">
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-accent/20 flex items-center justify-center">
                  <Clock className="w-5 h-5 text-accent" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-foreground mb-1">
                    Continue where you left off?
                  </h3>
                  <p className="text-sm text-muted-foreground mb-3">
                    You have an unfinished decision saved from{' '}
                    {formatRelativeTime(existingDraft.updatedAt)}
                  </p>
                  {existingDraft.draftData.decision && (
                    <div className="bg-background/60 rounded-lg p-3 mb-3">
                      <p className="text-sm italic text-foreground line-clamp-2">
                        "{existingDraft.draftData.decision}"
                      </p>
                    </div>
                  )}
                  <div className="flex flex-col sm:flex-row gap-2">
                    <Button
                      onClick={onDraftRestore}
                      className="flex-1 bg-accent hover:bg-accent/90 text-accent-foreground"
                    >
                      <Clock className="w-4 h-4 mr-2" />
                      Resume Draft
                    </Button>
                    <Button
                      onClick={onDraftDiscard}
                      variant="outline"
                      className="flex-1 sm:flex-initial"
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Start Fresh
                    </Button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* Decision Input Form */}
          <motion.form
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: existingDraft ? 0.3 : 0.2, duration: 0.4 }}
            onSubmit={handleSubmit}
            className="space-y-6 sm:space-y-8"
          >
            <div className="space-y-3">
              <label className="block text-sm font-medium text-muted-foreground">
                What decision are you facing?
              </label>
              <textarea
                value={localDecision}
                onChange={(e) => setLocalDecision(e.target.value)}
                placeholder="e.g., Should I change careers?"
                className="input-calm min-h-[120px] resize-none text-base"
                autoFocus={!existingDraft}
              />
            </div>

            <button
              type="submit"
              disabled={!localDecision.trim()}
              className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none min-h-[48px]"
            >
              Begin
            </button>
          </motion.form>

          {/* Divider */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.3 }}
            className="flex items-center gap-4"
          >
            <Separator className="flex-1" />
            <span className="text-xs sm:text-sm text-muted-foreground uppercase tracking-wider">
              or
            </span>
            <Separator className="flex-1" />
          </motion.div>

          {/* Template Selector Toggle */}
          {!showTemplates ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.3 }}
            >
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowTemplates(true)}
                className="w-full min-h-[48px] border-dashed border-2 hover:border-primary/50 hover:bg-primary/5"
              >
                Browse Decision Templates
              </Button>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="bg-muted/30 rounded-2xl p-4 sm:p-6 border border-border"
            >
              <TemplateSelector onSelectTemplate={handleTemplateSelect} />
              <div className="mt-4 pt-4 border-t border-border">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setShowTemplates(false)}
                  className="w-full"
                >
                  Hide Templates
                </Button>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default WelcomeStep;
