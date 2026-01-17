'use client';

import { motion } from 'framer-motion';
import {
  Calendar,
  Clock,
  MoreVertical,
  Eye,
  Trash2,
  Copy,
  Archive,
  FileText,
  Building2,
} from 'lucide-react';
import { Case, CaseStatus } from '@/types';
import { DEBT_TYPES } from '@/lib';
import { formatDate, formatCurrency } from '@/lib/utils';
import { cn } from '@/lib/utils';
import { Card, Badge, Button } from '@/components/ui';

interface CaseCardProps {
  caseData: Case;
  onView: (id: string) => void;
  onDuplicate?: (id: string) => void;
  onDelete?: (id: string) => void;
  onArchive?: (id: string) => void;
  isSelected?: boolean;
}

const statusConfig: Record<CaseStatus, { label: string; variant: 'default' | 'success' | 'warning' | 'destructive' | 'secondary' }> = {
  draft: { label: 'Draft', variant: 'secondary' },
  letter_generated: { label: 'Letter Generated', variant: 'default' },
  letter_sent: { label: 'Letter Sent', variant: 'warning' },
  awaiting_response: { label: 'Awaiting Response', variant: 'warning' },
  response_received: { label: 'Response Received', variant: 'success' },
  follow_up_needed: { label: 'Follow-up Needed', variant: 'warning' },
  escalated: { label: 'Escalated', variant: 'destructive' },
  resolved: { label: 'Resolved', variant: 'success' },
  closed: { label: 'Closed', variant: 'secondary' },
};

export function CaseCard({
  caseData,
  onView,
  onDuplicate,
  onDelete,
  onArchive,
  isSelected,
}: CaseCardProps) {
  const debtTypeConfig = DEBT_TYPES[caseData.debtType];
  const status = statusConfig[caseData.status];

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      whileHover={{ y: -2 }}
      transition={{ duration: 0.2 }}
    >
      <Card
        variant="interactive"
        className={cn(
          'relative overflow-hidden cursor-pointer transition-all',
          isSelected && 'ring-2 ring-primary border-primary'
        )}
        onClick={() => onView(caseData.id)}
      >
        {/* Color Accent */}
        <div
          className="absolute top-0 left-0 w-1 h-full"
          style={{ backgroundColor: `rgb(var(--${caseData.debtType}))` }}
        />

        <div className="p-4 pl-5">
          {/* Header */}
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-2">
              <div
                className="p-1.5 rounded"
                style={{ backgroundColor: `rgb(var(--${caseData.debtType}) / 0.1)` }}
              >
                <debtTypeConfig.icon
                  className="h-4 w-4"
                  style={{ color: `rgb(var(--${caseData.debtType}))` }}
                />
              </div>
              <div>
                <h3 className="font-semibold text-sm">
                  {caseData.debtInfo.borrowerName || 'Unnamed Case'}
                </h3>
                <p className="text-xs text-muted-foreground">
                  #{caseData.id.slice(0, 8)}
                </p>
              </div>
            </div>

            <Badge variant={status.variant}>{status.label}</Badge>
          </div>

          {/* Info Grid */}
          <div className="grid grid-cols-2 gap-2 text-xs mb-3">
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <Calendar className="h-3 w-3" />
              <span>{formatDate(caseData.createdAt)}</span>
            </div>
            {caseData.trust && (
              <div className="flex items-center gap-1.5 text-muted-foreground">
                <Building2 className="h-3 w-3" />
                <span className="truncate">{caseData.trust.name.slice(0, 20)}...</span>
              </div>
            )}
            {caseData.debtInfo.currentBalance && (
              <div className="flex items-center gap-1.5 text-muted-foreground">
                <span className="font-medium">
                  {formatCurrency(caseData.debtInfo.currentBalance)}
                </span>
              </div>
            )}
            {caseData.generatedLetter && (
              <div className="flex items-center gap-1.5 text-green-600 dark:text-green-400">
                <FileText className="h-3 w-3" />
                <span>Letter Ready</span>
              </div>
            )}
          </div>

          {/* Tags */}
          {caseData.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-3">
              {caseData.tags.slice(0, 3).map((tag) => (
                <Badge key={tag} variant="outline" className="text-xs px-1.5 py-0">
                  {tag}
                </Badge>
              ))}
              {caseData.tags.length > 3 && (
                <Badge variant="secondary" className="text-xs px-1.5 py-0">
                  +{caseData.tags.length - 3}
                </Badge>
              )}
            </div>
          )}

          {/* Footer */}
          <div className="flex items-center justify-between pt-2 border-t">
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Clock className="h-3 w-3" />
              <span>Updated {formatDate(caseData.updatedAt)}</span>
            </div>

            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="sm"
                className="h-7 w-7 p-0"
                onClick={(e) => {
                  e.stopPropagation();
                  onView(caseData.id);
                }}
              >
                <Eye className="h-3.5 w-3.5" />
              </Button>
              {onDuplicate && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 w-7 p-0"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDuplicate(caseData.id);
                  }}
                >
                  <Copy className="h-3.5 w-3.5" />
                </Button>
              )}
              {onDelete && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 w-7 p-0 text-destructive hover:text-destructive"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete(caseData.id);
                  }}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              )}
            </div>
          </div>
        </div>
      </Card>
    </motion.div>
  );
}
