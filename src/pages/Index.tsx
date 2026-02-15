import { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import StepIndicator from '@/components/StepIndicator';
import WelcomeStep from '@/components/steps/WelcomeStep';
import OptionsStep from '@/components/steps/OptionsStep';
import ProsConsStep from '@/components/steps/ProsConsStep';
import PrioritiesStep from '@/components/steps/PrioritiesStep';
import OptionsRatingStep from '@/components/steps/OptionsRatingStep';
import ConfidenceStep from '@/components/steps/ConfidenceStep';
import ResultsStep from '@/components/steps/ResultsStep';
import { DEFAULT_PRIORITIES, type Option, type Priority, type DecisionTemplate } from '@/types/decision';
import { useDraftAutosave } from '@/hooks/useDraftAutosave';
import { useDraftLoader } from '@/hooks/useDraftLoader';
import { useAuth } from '@/hooks/useAuth';

type Step = 'welcome' | 'options' | 'prosCons' | 'priorities' | 'rating' | 'confidence' | 'results';

const Index = () => {
  const [step, setStep] = useState<Step>('welcome');
  const [decision, setDecision] = useState('');
  const [options, setOptions] = useState<Option[]>([]);
  const [priorities, setPriorities] = useState<Priority[]>(DEFAULT_PRIORITIES);
  const [currentPriorityIndex, setCurrentPriorityIndex] = useState(0);
  const [draftRestored, setDraftRestored] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<DecisionTemplate | null>(null);
  const [confidenceScore, setConfidenceScore] = useState<number | undefined>(undefined);
  const [reflectionNotes, setReflectionNotes] = useState<string | undefined>(undefined);

  const getStepIndex = (): number => {
    switch (step) {
      case 'welcome': return 0;
      case 'options': return 1;
      case 'prosCons': return 2;
      case 'priorities': return 3;
      case 'rating': return 4;
      case 'confidence': return 5;
      case 'results': return 6;
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
    setConfidenceScore(undefined);
    setReflectionNotes(undefined);
    clearDraft();
  };

  const handleRatingNext = () => {
    if (currentPriorityIndex < priorities.length - 1) {
      setCurrentPriorityIndex(currentPriorityIndex + 1);
    } else {
      // Go to confidence step before results
      setStep('confidence');
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
    
    const { decision: draftDecision, options: draftOptions, priorities: draftPriorities, currentStep, confidenceScore: draftConfidence, reflectionNotes: draftReflection } = draft.draftData;
    
    setDecision(draftDecision);
    setOptions(draftOptions || []);
    setPriorities(draftPriorities || DEFAULT_PRIORITIES);
    setConfidenceScore(draftConfidence);
    setReflectionNotes(draftReflection);
    setDraftRestored(true);
    clearLoadedDraft();
    
    // Navigate to the saved step
    switch (currentStep) {
      case 1:
        setStep('options');
        break;
      case 2:
        setStep('prosCons');
        break;
      case 3:
        setStep('priorities');
        break;
      case 4:
        setStep('rating');
        setCurrentPriorityIndex(0);
        break;
      case 5:
        setStep('confidence');
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
              <StepIndicator totalSteps={7} currentStep={getStepIndex()} />
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
                onNext={() => setStep('prosCons')}
                onBack={() => setStep('welcome')}
              />
            )}

            {step === 'prosCons' && (
              <ProsConsStep
                key="prosCons"
                options={options}
                onOptionsChange={setOptions}
                onNext={() => setStep('priorities')}
                onBack={() => setStep('options')}
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
                onBack={() => setStep('prosCons')}
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

            {step === 'confidence' && (
              <ConfidenceStep
                key="confidence"
                confidenceScore={confidenceScore}
                reflectionNotes={reflectionNotes}
                onConfidenceChange={setConfidenceScore}
                onReflectionChange={setReflectionNotes}
                onNext={() => setStep('results')}
                onBack={() => {
                  setCurrentPriorityIndex(priorities.length - 1);
                  setStep('rating');
                }}
              />
            )}

            {step === 'results' && (
              <ResultsStep
                key="results"
                decision={decision}
                options={options}
                priorities={priorities}
                confidenceScore={confidenceScore}
                reflectionNotes={reflectionNotes}
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
