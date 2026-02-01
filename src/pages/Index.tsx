import { useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import StepIndicator from '@/components/StepIndicator';
import WelcomeStep from '@/components/steps/WelcomeStep';
import OptionsStep from '@/components/steps/OptionsStep';
import PrioritiesStep from '@/components/steps/PrioritiesStep';
import OptionsRatingStep from '@/components/steps/OptionsRatingStep';
import ResultsStep from '@/components/steps/ResultsStep';
import { DEFAULT_PRIORITIES, type Option, type Priority } from '@/types/decision';

type Step = 'welcome' | 'options' | 'priorities' | 'rating' | 'results';

const Index = () => {
  const [step, setStep] = useState<Step>('welcome');
  const [decision, setDecision] = useState('');
  const [options, setOptions] = useState<Option[]>([]);
  const [priorities, setPriorities] = useState<Priority[]>(DEFAULT_PRIORITIES);
  const [currentPriorityIndex, setCurrentPriorityIndex] = useState(0);

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

  const handleReset = () => {
    setStep('welcome');
    setDecision('');
    setOptions([]);
    setPriorities(DEFAULT_PRIORITIES);
    setCurrentPriorityIndex(0);
  };

  const handleRatingNext = () => {
    if (currentPriorityIndex < priorities.length - 1) {
      setCurrentPriorityIndex(currentPriorityIndex + 1);
    } else {
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

  return (
    <div className="min-h-screen bg-background">
      <div className="container max-w-lg mx-auto py-8">
        {step !== 'welcome' && step !== 'results' && (
          <div className="mb-8">
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
  );
};

export default Index;
