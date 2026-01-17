'use client';

import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';

const toastVariants = cva(
  'group pointer-events-auto relative flex w-full items-center justify-between space-x-4 overflow-hidden rounded-lg border p-4 pr-8 shadow-lg transition-all',
  {
    variants: {
      variant: {
        default: 'border bg-background text-foreground',
        success: 'border-green-200 bg-green-50 text-green-900 dark:border-green-800 dark:bg-green-950 dark:text-green-100',
        destructive: 'border-red-200 bg-red-50 text-red-900 dark:border-red-800 dark:bg-red-950 dark:text-red-100',
        warning: 'border-amber-200 bg-amber-50 text-amber-900 dark:border-amber-800 dark:bg-amber-950 dark:text-amber-100',
        info: 'border-blue-200 bg-blue-50 text-blue-900 dark:border-blue-800 dark:bg-blue-950 dark:text-blue-100',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

const iconMap = {
  default: null,
  success: CheckCircle,
  destructive: AlertCircle,
  warning: AlertTriangle,
  info: Info,
};

export interface ToastProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof toastVariants> {
  title?: string;
  description?: string;
  onClose?: () => void;
}

const Toast = React.forwardRef<HTMLDivElement, ToastProps>(
  ({ className, variant = 'default', title, description, onClose, children, ...props }, ref) => {
    const Icon = iconMap[variant || 'default'];

    return (
      <div
        ref={ref}
        className={cn(toastVariants({ variant }), className)}
        {...props}
      >
        <div className="flex items-start gap-3">
          {Icon && <Icon className="h-5 w-5 shrink-0 mt-0.5" />}
          <div className="flex-1 space-y-1">
            {title && <div className="font-medium">{title}</div>}
            {description && <div className="text-sm opacity-90">{description}</div>}
            {children}
          </div>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="absolute right-2 top-2 rounded-md p-1 opacity-0 transition-opacity hover:opacity-100 group-hover:opacity-70 focus:opacity-100"
          >
            <X className="h-4 w-4" />
            <span className="sr-only">Close</span>
          </button>
        )}
      </div>
    );
  }
);
Toast.displayName = 'Toast';

// Toast container for stacking toasts
interface ToastContainerProps {
  children: React.ReactNode;
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' | 'top-center' | 'bottom-center';
}

const ToastContainer = ({ children, position = 'bottom-right' }: ToastContainerProps) => {
  const positionClasses = {
    'top-right': 'top-4 right-4',
    'top-left': 'top-4 left-4',
    'bottom-right': 'bottom-4 right-4',
    'bottom-left': 'bottom-4 left-4',
    'top-center': 'top-4 left-1/2 -translate-x-1/2',
    'bottom-center': 'bottom-4 left-1/2 -translate-x-1/2',
  };

  return (
    <div
      className={cn(
        'fixed z-[100] flex max-h-screen w-full flex-col-reverse gap-2 p-4 sm:max-w-[420px]',
        positionClasses[position]
      )}
    >
      {children}
    </div>
  );
};

export { Toast, ToastContainer, toastVariants };
