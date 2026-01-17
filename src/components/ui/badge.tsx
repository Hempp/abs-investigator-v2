'use client';

import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const badgeVariants = cva(
  'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
  {
    variants: {
      variant: {
        default:
          'border-transparent bg-primary text-primary-foreground shadow',
        secondary:
          'border-transparent bg-secondary text-secondary-foreground',
        destructive:
          'border-transparent bg-destructive text-destructive-foreground shadow',
        outline: 'text-foreground',
        success:
          'border-transparent bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
        warning:
          'border-transparent bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
        info:
          'border-transparent bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
        // Debt type variants
        mortgage:
          'debt-badge-mortgage',
        auto:
          'debt-badge-auto',
        utility:
          'debt-badge-utility',
        creditCard:
          'debt-badge-creditCard',
        studentLoan:
          'debt-badge-studentLoan',
        personalLoan:
          'debt-badge-personalLoan',
        medical:
          'debt-badge-medical',
        telecom:
          'debt-badge-telecom',
        // Status variants
        draft:
          'border-transparent bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300',
        pending:
          'border-transparent bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-300',
        active:
          'border-transparent bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-300',
        completed:
          'border-transparent bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
        escalated:
          'border-transparent bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
      },
      size: {
        default: 'px-2.5 py-0.5 text-xs',
        sm: 'px-2 py-0.5 text-[10px]',
        lg: 'px-3 py-1 text-sm',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, size, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant, size }), className)} {...props} />
  );
}

export { Badge, badgeVariants };
