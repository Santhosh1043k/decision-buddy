import { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import StepIndicator from '@/components/StepIndicator';
import WelcomeStep from '@/components/steps/WelcomeStep';
import OptionsStep from '@/components/steps/OptionsStep';
import PrioritiesStep from '@/components/steps/PrioritiesStep';
import OptionsRatingStep from '@/components/steps/OptionsRatingStep';
import ResultsStep from '@/components/steps/ResultsStep';
import { DEFAULT_PRIORITIES, type Option, type Priority, type DecisionTemplate } from '@/types/decision';
import { useDraftAutosave } from '@/hooks/useDraftAutosave';
import { useDraftLoader } from '@/hooks/useDraftLoader';
import { useAuth } from '@/hooks/useAuth';

type Step = 'welcome' | 'options' | 'priorities' | 'rating' | 'results';

const Index = () => {
  const [step, setStep] = useState<Step>('welcome');
  const [decision, setDecision] = useState('');
  const [options, setOptions] = useState<Option[]>([]);
  const [priorities, setPriorities] = useState<Priority[]>(DEFAULT_PRIORITIES);
  const [currentPriorityIndex, setCurrentPriorityIndex] = useState(0);
  const [draftRestored, setDraftRestored] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<DecisionTemplate | null>(null);

  const getStepIndex = (): number => {
    switch (step) {
      case 'welcome': return 0;
      case 'options': return 1;
      case 'priorities': return 2;
      case 'rating': return 3;
      case 'results': return 4;
      default: return 0;
    }
  };

  const { user } = useAuth();
  const { draft, loading: draftLoading, clearDraft: clearLoadedDraft } = useDraftLoader();
  const { isSaving, lastSaved, clearDraft, saveDraft } = useDraftAutosave({
    decision,
    options,
    priorities,
    currentStep: getStepIndex(),
    enabled: user !== null && step !== 'welcome' && step !== 'results' && !draftRestored,
  });

  const handleReset = () => {
    setStep('welcome');
    setDecision('');
    setOptions([]);
    setPriorities(DEFAULT_PRIORITIES);
    setCurrentPriorityIndex(0);
    setDraftRestored(false);
    setSelectedTemplate(null);
    clearDraft();
  };

  const handleRatingNext = () => {
    if (currentPriorityIndex < priorities.length - 1) {
      setCurrentPriorityIndex(currentPriorityIndex + 1);
    } else {
      // Clear draft when reaching results
      clearDraft();
      setStep('results');
    }
  };

  const handleRatingBack = () => {
    if (currentPriorityIndex > 0) {
      setCurrentPriorityIndex(currentPriorityIndex - 1);
    } else {
      setStep('priorities');
    }
  };

  const handleTemplateSelect = (template: DecisionTemplate) => {
    setSelectedTemplate(template);
    setPriorities(template.suggestedPriorities);
  };

  const handleDraftRestore = () => {
    if (!draft) return;
    
    const { decision: draftDecision, options: draftOptions, priorities: draftPriorities, currentStep } = draft.draftData;
    
    setDecision(draftDecision);
    setOptions(draftOptions);
    setPriorities(draftPriorities);
    setDraftRestored(true);
    clearLoadedDraft();
    
    // Navigate to the saved step
    switch (currentStep) {
      case 1:
        setStep('options');
        break;
      case 2:
        setStep('priorities');
        break;
      case 3:
        setStep('rating');
        setCurrentPriorityIndex(0);
        break;
      default:
        setStep('welcome');
    }
  };

  const handleDraftDiscard = async () => {
    await clearDraft();
    clearLoadedDraft();
  };

  // Show draft indicator for authenticated users
  const showDraftIndicator = user && !draftRestored && step !== 'welcome' && step !== 'results';

  return (
    <div className="min-h-screen bg-background">
      <div className="container max-w-full mx-auto py-4 sm:py-8 px-4 sm:px-6">
        {/* Draft Save Indicator */}
        <AnimatePresence>
          {showDraftIndicator && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="fixed top-4 right-4 z-50"
            >
              <div className="bg-card border border-border rounded-lg px-3 py-2 shadow-lg flex items-center gap-2">
                {isSaving ? (
                  <>
                    <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
                    <span className="text-xs text-muted-foreground">Saving draft...</span>
                  </>
                ) : lastSaved ? (
                  <>
                    <div className="w-2 h-2 bg-primary rounded-full" />
                    <span className="text-xs text-muted-foreground">
                      Draft saved
                    </span>
                  </>
                ) : null}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="max-w-5xl mx-auto">
          {step !== 'welcome' && step !== 'results' && (
            <div className="mb-6 sm:mb-8">
              <StepIndicator totalSteps={5} currentStep={getStepIndex()} />
            </div>
          )}

          <AnimatePresence mode="wait">
            {step === 'welcome' && (
              <WelcomeStep
                key="welcome"
                decision={decision}
                onDecisionChange={setDecision}
                onNext={() => setStep('options')}
                onTemplateSelect={handleTemplateSelect}
                existingDraft={!draftLoading && !draftRestored ? draft : null}
                onDraftRestore={handleDraftRestore}
                onDraftDiscard={handleDraftDiscard}
              />
            )}

            {step === 'options' && (
              <OptionsStep
                key="options"
                options={options}
                onOptionsChange={setOptions}
                onNext={() => setStep('priorities')}
                onBack={() => setStep('welcome')}
              />
            )}

            {step === 'priorities' && (
              <PrioritiesStep
                key="priorities"
                priorities={priorities}
                onPrioritiesChange={setPriorities}
                onNext={() => {
                  setCurrentPriorityIndex(0);
                  setStep('rating');
                }}
                onBack={() => setStep('options')}
              />
            )}

            {step === 'rating' && (
              <OptionsRatingStep
                key={`rating-${currentPriorityIndex}`}
                options={options}
                priorities={priorities}
                currentPriorityIndex={currentPriorityIndex}
                onOptionsChange={setOptions}
                onNext={handleRatingNext}
                onBack={handleRatingBack}
              />
            )}

            {step === 'results' && (
              <ResultsStep
                key="results"
                decision={decision}
                options={options}
                priorities={priorities}
                onReset={handleReset}
              />
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default Index;
