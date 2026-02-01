import { motion } from 'framer-motion';

interface StepIndicatorProps {
  totalSteps: number;
  currentStep: number;
}

const StepIndicator = ({ totalSteps, currentStep }: StepIndicatorProps) => {
  return (
    <div className="flex items-center justify-center gap-2">
      {Array.from({ length: totalSteps }).map((_, index) => (
        <motion.div
          key={index}
          className={`step-indicator ${index === currentStep ? 'active' : ''}`}
          initial={false}
          animate={{
            width: index === currentStep ? 32 : 8,
            backgroundColor: index === currentStep 
              ? 'hsl(var(--primary))' 
              : index < currentStep 
                ? 'hsl(var(--primary) / 0.5)' 
                : 'hsl(var(--border))',
          }}
          transition={{ duration: 0.3 }}
        />
      ))}
    </div>
  );
};

export default StepIndicator;
