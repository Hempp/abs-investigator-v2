'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { X, CheckCircle, AlertCircle, AlertTriangle, Info } from 'lucide-react';
import { useToasts, useUIStore } from '@/stores';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui';

const icons = {
  default: Info,
  success: CheckCircle,
  destructive: AlertCircle,
  warning: AlertTriangle,
  info: Info,
};

const colors = {
  default: 'border-border',
  success: 'border-green-500 bg-green-500/10',
  destructive: 'border-destructive bg-destructive/10',
  warning: 'border-yellow-500 bg-yellow-500/10',
  info: 'border-blue-500 bg-blue-500/10',
};

const iconColors = {
  default: 'text-foreground',
  success: 'text-green-500',
  destructive: 'text-destructive',
  warning: 'text-yellow-500',
  info: 'text-blue-500',
};

export function Toaster() {
  const toasts = useToasts();
  const { dismissToast } = useUIStore();

  return (
    <div className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2 max-w-sm w-full">
      <AnimatePresence mode="popLayout">
        {toasts.map((toast) => {
          const Icon = icons[toast.type];

          return (
            <motion.div
              key={toast.id}
              layout
              initial={{ opacity: 0, y: 50, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, x: 100, scale: 0.9 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className={cn(
                'relative flex items-start gap-3 p-4 rounded-lg border shadow-lg bg-card',
                colors[toast.type]
              )}
            >
              <Icon className={cn('h-5 w-5 flex-shrink-0 mt-0.5', iconColors[toast.type])} />

              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm">{toast.title}</p>
                {toast.description && (
                  <p className="text-sm text-muted-foreground mt-0.5">
                    {toast.description}
                  </p>
                )}
              </div>

              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0 flex-shrink-0"
                onClick={() => dismissToast(toast.id)}
              >
                <X className="h-4 w-4" />
              </Button>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
