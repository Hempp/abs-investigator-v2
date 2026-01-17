'use client';

import * as React from 'react';
import * as ProgressPrimitive from '@radix-ui/react-progress';
import { cn } from '@/lib/utils';

interface ProgressProps
  extends React.ComponentPropsWithoutRef<typeof ProgressPrimitive.Root> {
  indicatorClassName?: string;
  showLabel?: boolean;
}

const Progress = React.forwardRef<
  React.ElementRef<typeof ProgressPrimitive.Root>,
  ProgressProps
>(({ className, value, indicatorClassName, showLabel = false, ...props }, ref) => (
  <div className="relative">
    <ProgressPrimitive.Root
      ref={ref}
      className={cn(
        'relative h-2 w-full overflow-hidden rounded-full bg-primary/20',
        className
      )}
      {...props}
    >
      <ProgressPrimitive.Indicator
        className={cn(
          'h-full w-full flex-1 bg-primary transition-all duration-300 ease-in-out',
          indicatorClassName
        )}
        style={{ transform: `translateX(-${100 - (value || 0)}%)` }}
      />
    </ProgressPrimitive.Root>
    {showLabel && (
      <span className="absolute -top-6 right-0 text-xs text-muted-foreground">
        {value}%
      </span>
    )}
  </div>
));
Progress.displayName = ProgressPrimitive.Root.displayName;

// Multi-step progress indicator
interface StepProgressProps {
  steps: number;
  currentStep: number;
  className?: string;
}

const StepProgress = ({ steps, currentStep, className }: StepProgressProps) => {
  return (
    <div className={cn('flex items-center gap-2', className)}>
      {Array.from({ length: steps }, (_, i) => (
        <React.Fragment key={i}>
          <div
            className={cn(
              'h-8 w-8 rounded-full flex items-center justify-center text-sm font-medium transition-all duration-300',
              i < currentStep
                ? 'bg-primary text-primary-foreground'
                : i === currentStep
                ? 'bg-primary/20 text-primary ring-2 ring-primary ring-offset-2'
                : 'bg-muted text-muted-foreground'
            )}
          >
            {i < currentStep ? (
              <svg
                className="h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            ) : (
              i + 1
            )}
          </div>
          {i < steps - 1 && (
            <div
              className={cn(
                'h-0.5 flex-1 transition-colors duration-300',
                i < currentStep ? 'bg-primary' : 'bg-muted'
              )}
            />
          )}
        </React.Fragment>
      ))}
    </div>
  );
};

export { Progress, StepProgress };
