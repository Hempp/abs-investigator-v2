'use client';

import { motion } from 'framer-motion';
import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { InvestigationStep } from '@/stores';

interface Step {
  id: InvestigationStep;
  title: string;
  description: string;
}

const steps: Step[] = [
  { id: 0, title: 'Your Info', description: 'Enter your details' },
  { id: 1, title: 'Search', description: 'Find securitized debts' },
  { id: 2, title: 'Results', description: 'Review matches' },
  { id: 3, title: 'Generate Letter', description: 'Create validation letter' },
];

interface ProgressStepperProps {
  currentStep: InvestigationStep;
  onStepClick?: (step: InvestigationStep) => void;
}

export function ProgressStepper({ currentStep, onStepClick }: ProgressStepperProps) {
  return (
    <div className="w-full">
      {/* Desktop Stepper */}
      <div className="hidden md:flex items-center justify-between">
        {steps.map((step, index) => {
          const isCompleted = currentStep > step.id;
          const isCurrent = currentStep === step.id;
          const isClickable = onStepClick && step.id < currentStep;

          return (
            <div key={step.id} className="flex items-center flex-1">
              {/* Step Circle */}
              <motion.button
                onClick={() => isClickable && onStepClick(step.id)}
                disabled={!isClickable}
                className={cn(
                  'relative flex items-center justify-center w-10 h-10 rounded-full border-2 transition-all duration-300',
                  isCompleted && 'bg-primary border-primary text-primary-foreground',
                  isCurrent && 'border-primary bg-primary/10 text-primary',
                  !isCompleted && !isCurrent && 'border-muted-foreground/30 text-muted-foreground',
                  isClickable && 'cursor-pointer hover:bg-primary/20'
                )}
                whileHover={isClickable ? { scale: 1.05 } : {}}
                whileTap={isClickable ? { scale: 0.95 } : {}}
              >
                {isCompleted ? (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                  >
                    <Check className="h-5 w-5" />
                  </motion.div>
                ) : (
                  <span className="text-sm font-semibold">{step.id + 1}</span>
                )}
              </motion.button>

              {/* Step Info */}
              <div className="ml-3 min-w-[120px]">
                <p
                  className={cn(
                    'text-sm font-medium',
                    isCurrent ? 'text-primary' : 'text-foreground'
                  )}
                >
                  {step.title}
                </p>
                <p className="text-xs text-muted-foreground">{step.description}</p>
              </div>

              {/* Connector Line */}
              {index < steps.length - 1 && (
                <div className="flex-1 mx-4 h-0.5 bg-muted-foreground/20 relative overflow-hidden">
                  <motion.div
                    className="absolute inset-y-0 left-0 bg-primary"
                    initial={{ width: 0 }}
                    animate={{ width: isCompleted ? '100%' : '0%' }}
                    transition={{ duration: 0.3, ease: 'easeInOut' }}
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Mobile Stepper */}
      <div className="md:hidden">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-primary">
            Step {currentStep + 1} of {steps.length}
          </span>
          <span className="text-sm text-muted-foreground">
            {steps[currentStep]?.title}
          </span>
        </div>

        {/* Progress Bar */}
        <div className="h-2 bg-muted rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-primary"
            initial={{ width: 0 }}
            animate={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
          />
        </div>

        {/* Step Dots */}
        <div className="flex justify-between mt-2">
          {steps.map((step) => (
            <motion.div
              key={step.id}
              className={cn(
                'w-2 h-2 rounded-full transition-colors',
                currentStep >= step.id ? 'bg-primary' : 'bg-muted-foreground/30'
              )}
              initial={{ scale: 0.8 }}
              animate={{ scale: currentStep === step.id ? 1.2 : 1 }}
              transition={{ duration: 0.2 }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
