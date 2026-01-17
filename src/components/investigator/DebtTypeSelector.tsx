'use client';

import { motion } from 'framer-motion';
import { DebtTypeId } from '@/types';
import { DEBT_TYPES } from '@/lib';
import { cn } from '@/lib/utils';
import { Card } from '@/components/ui';

interface DebtTypeSelectorProps {
  selectedType: DebtTypeId | null;
  onSelect: (type: DebtTypeId) => void;
}

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
    },
  },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
};

export function DebtTypeSelector({ selectedType, onSelect }: DebtTypeSelectorProps) {
  const debtTypes = Object.values(DEBT_TYPES);

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold tracking-tight">Select Debt Type</h2>
        <p className="text-muted-foreground">
          Choose the type of debt you want to investigate for securitization
        </p>
      </div>

      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="grid grid-cols-2 md:grid-cols-4 gap-4"
      >
        {debtTypes.map((debtType) => {
          const Icon = debtType.icon;
          const isSelected = selectedType === debtType.id;

          return (
            <motion.div key={debtType.id} variants={item}>
              <Card
                variant="interactive"
                className={cn(
                  'relative p-4 cursor-pointer transition-all duration-200',
                  'hover:border-primary/50',
                  isSelected && 'ring-2 ring-primary border-primary'
                )}
                onClick={() => onSelect(debtType.id)}
              >
                <div className="flex flex-col items-center text-center space-y-3">
                  <div
                    className={cn(
                      'p-3 rounded-xl transition-colors',
                      `bg-${debtType.color}/10`
                    )}
                    style={{
                      backgroundColor: `rgb(var(--${debtType.id}) / 0.1)`,
                    }}
                  >
                    <Icon
                      className="h-6 w-6"
                      style={{ color: `rgb(var(--${debtType.id}))` }}
                    />
                  </div>
                  <div>
                    <h3 className="font-semibold text-sm">{debtType.name}</h3>
                    <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                      {debtType.description}
                    </p>
                  </div>
                </div>

                {isSelected && (
                  <motion.div
                    layoutId="selected-indicator"
                    className="absolute -top-1 -right-1 h-5 w-5 bg-primary rounded-full flex items-center justify-center"
                    initial={false}
                  >
                    <svg
                      className="h-3 w-3 text-primary-foreground"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={3}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  </motion.div>
                )}
              </Card>
            </motion.div>
          );
        })}
      </motion.div>
    </div>
  );
}
