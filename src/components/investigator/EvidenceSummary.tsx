'use client';

import { motion } from 'framer-motion';
import {
  FileCheck,
  Building2,
  BarChart3,
  FileText,
  Calendar,
  DollarSign,
  Shield,
  AlertTriangle,
  CheckCircle2,
  Download,
  Printer,
  Save,
} from 'lucide-react';
import { DebtTypeId, DebtInfo, Trust, Trade, TradingStats } from '@/types';
import { DEBT_TYPES } from '@/lib';
import { formatCurrency, formatDate, formatPercentage } from '@/lib/utils';
import { cn } from '@/lib/utils';
import { Card, Badge, Button, Progress } from '@/components/ui';

interface EvidenceSummaryProps {
  debtType: DebtTypeId;
  debtInfo: DebtInfo;
  trust: Trust | null;
  tradingData: Trade[];
  tradingStats: TradingStats | null;
  letter: string | null;
  onSaveCase?: () => void;
  onExportAll?: () => void;
  onPrint?: () => void;
}

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
};

export function EvidenceSummary({
  debtType,
  debtInfo,
  trust,
  tradingData,
  tradingStats,
  letter,
  onSaveCase,
  onExportAll,
  onPrint,
}: EvidenceSummaryProps) {
  const debtTypeConfig = DEBT_TYPES[debtType];

  // Calculate evidence strength
  const getEvidenceStrength = () => {
    let strength = 0;
    if (trust) strength += 30;
    if (trust?.matchScore && trust.matchScore >= 0.7) strength += 20;
    if (tradingData.length > 0) strength += 25;
    if (tradingData.length > 10) strength += 10;
    if (letter) strength += 15;
    return Math.min(strength, 100);
  };

  const evidenceStrength = getEvidenceStrength();

  const getStrengthLabel = (strength: number) => {
    if (strength >= 80) return { label: 'Strong Evidence', color: 'text-green-500', badge: 'success' };
    if (strength >= 50) return { label: 'Moderate Evidence', color: 'text-yellow-500', badge: 'warning' };
    return { label: 'Limited Evidence', color: 'text-orange-500', badge: 'secondary' };
  };

  const strengthInfo = getStrengthLabel(evidenceStrength);

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="space-y-6"
    >
      {/* Header */}
      <motion.div variants={item}>
        <Card className="p-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div
                className="p-3 rounded-xl"
                style={{ backgroundColor: `rgb(var(--${debtType}) / 0.1)` }}
              >
                <FileCheck
                  className="h-8 w-8"
                  style={{ color: `rgb(var(--${debtType}))` }}
                />
              </div>
              <div>
                <h2 className="text-2xl font-bold">Evidence Summary</h2>
                <p className="text-muted-foreground">
                  Investigation complete for {debtTypeConfig.name}
                </p>
              </div>
            </div>

            {/* Evidence Strength */}
            <div className="text-center md:text-right">
              <Badge variant={strengthInfo.badge as any} className="mb-2">
                {strengthInfo.label}
              </Badge>
              <div className="flex items-center gap-2">
                <Progress value={evidenceStrength} className="w-32 h-2" />
                <span className={cn('font-bold', strengthInfo.color)}>
                  {evidenceStrength}%
                </span>
              </div>
            </div>
          </div>
        </Card>
      </motion.div>

      {/* Evidence Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Debt Information */}
        <motion.div variants={item}>
          <Card className="p-5 h-full">
            <div className="flex items-center gap-2 mb-4">
              <debtTypeConfig.icon className="h-5 w-5 text-primary" />
              <h3 className="font-semibold">Debt Information</h3>
            </div>
            <div className="space-y-3 text-sm">
              {debtInfo.borrowerName && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Borrower</span>
                  <span className="font-medium">{debtInfo.borrowerName}</span>
                </div>
              )}
              {debtInfo.accountNumber && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Account #</span>
                  <span className="font-mono">{debtInfo.accountNumber}</span>
                </div>
              )}
              {debtInfo.originalAmount && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Original Amount</span>
                  <span className="font-medium">{formatCurrency(debtInfo.originalAmount)}</span>
                </div>
              )}
              {debtInfo.currentBalance && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Current Balance</span>
                  <span className="font-medium">{formatCurrency(debtInfo.currentBalance)}</span>
                </div>
              )}
              {debtInfo.currentServicer && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Current Servicer</span>
                  <span className="font-medium">{debtInfo.currentServicer}</span>
                </div>
              )}
            </div>
          </Card>
        </motion.div>

        {/* Trust Information */}
        <motion.div variants={item}>
          <Card className={cn('p-5 h-full', !trust && 'opacity-60')}>
            <div className="flex items-center gap-2 mb-4">
              <Building2 className="h-5 w-5 text-primary" />
              <h3 className="font-semibold">Securitization Trust</h3>
              {trust ? (
                <Badge variant="success" className="ml-auto">Found</Badge>
              ) : (
                <Badge variant="secondary" className="ml-auto">Not Found</Badge>
              )}
            </div>
            {trust ? (
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Trust Name</span>
                  <span className="font-medium text-right">{trust.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Trustee</span>
                  <span className="font-medium">{trust.trustee}</span>
                </div>
                {trust.dealSize && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Deal Size</span>
                    <span className="font-medium">{formatCurrency(trust.dealSize)}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Match Score</span>
                  <span className="font-medium">{formatPercentage(trust.matchScore * 100)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">CUSIPs</span>
                  <span className="font-mono text-xs">{trust.cusips.length} tranches</span>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center h-32 text-muted-foreground">
                <AlertTriangle className="h-5 w-5 mr-2" />
                No matching trust found
              </div>
            )}
          </Card>
        </motion.div>

        {/* Trading Data */}
        <motion.div variants={item}>
          <Card className={cn('p-5 h-full', tradingData.length === 0 && 'opacity-60')}>
            <div className="flex items-center gap-2 mb-4">
              <BarChart3 className="h-5 w-5 text-primary" />
              <h3 className="font-semibold">FINRA TRACE Data</h3>
              {tradingData.length > 0 ? (
                <Badge variant="success" className="ml-auto">{tradingData.length} Trades</Badge>
              ) : (
                <Badge variant="secondary" className="ml-auto">No Data</Badge>
              )}
            </div>
            {tradingStats ? (
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Total Volume</span>
                  <span className="font-medium">{formatCurrency(tradingStats.totalVolume)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Average Price</span>
                  <span className="font-medium">{formatCurrency(tradingStats.averagePrice)}</span>
                </div>
                {tradingStats.averageYield !== undefined && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Average Yield</span>
                    <span className="font-medium">{formatPercentage(tradingStats.averageYield)}</span>
                  </div>
                )}
                {tradingStats.dateRange && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Date Range</span>
                    <span className="font-medium text-xs">
                      {tradingStats.dateRange.start} - {tradingStats.dateRange.end}
                    </span>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center justify-center h-32 text-muted-foreground">
                <AlertTriangle className="h-5 w-5 mr-2" />
                No trading data available
              </div>
            )}
          </Card>
        </motion.div>

        {/* Letter Generated */}
        <motion.div variants={item}>
          <Card className={cn('p-5 h-full', !letter && 'opacity-60')}>
            <div className="flex items-center gap-2 mb-4">
              <FileText className="h-5 w-5 text-primary" />
              <h3 className="font-semibold">
                {debtType === 'mortgage' ? 'QWR Letter' : 'Debt Validation Letter'}
              </h3>
              {letter ? (
                <Badge variant="success" className="ml-auto">Generated</Badge>
              ) : (
                <Badge variant="secondary" className="ml-auto">Not Generated</Badge>
              )}
            </div>
            {letter ? (
              <div className="space-y-3">
                <div className="flex items-center text-sm text-green-600 dark:text-green-400">
                  <CheckCircle2 className="h-4 w-4 mr-2" />
                  Letter ready for delivery
                </div>
                <div className="text-xs text-muted-foreground">
                  {letter.length.toLocaleString()} characters •
                  Ready for certified mail
                </div>
                <div className="bg-muted/50 p-3 rounded text-xs font-mono line-clamp-4">
                  {letter.substring(0, 200)}...
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center h-32 text-muted-foreground">
                <AlertTriangle className="h-5 w-5 mr-2" />
                Letter not yet generated
              </div>
            )}
          </Card>
        </motion.div>
      </div>

      {/* Action Buttons */}
      <motion.div variants={item}>
        <Card className="p-4">
          <div className="flex flex-wrap gap-3 justify-center md:justify-end">
            {onSaveCase && (
              <Button onClick={onSaveCase} variant={debtType}>
                <Save className="mr-2 h-4 w-4" />
                Save as Case
              </Button>
            )}
            {onExportAll && (
              <Button onClick={onExportAll} variant="outline">
                <Download className="mr-2 h-4 w-4" />
                Export All Evidence
              </Button>
            )}
            {onPrint && (
              <Button onClick={onPrint} variant="outline">
                <Printer className="mr-2 h-4 w-4" />
                Print Summary
              </Button>
            )}
          </div>
        </Card>
      </motion.div>

      {/* Disclaimer */}
      <motion.div variants={item}>
        <Card className="p-4 bg-muted/50 border-muted">
          <div className="flex gap-3">
            <Shield className="h-5 w-5 text-muted-foreground flex-shrink-0 mt-0.5" />
            <div className="text-xs text-muted-foreground">
              <p className="font-medium mb-1">Legal Disclaimer</p>
              <p>
                This investigation tool is for informational purposes only and does not constitute
                legal advice. The presence of trading data for securities potentially linked to your
                debt does not guarantee that your specific loan was securitized. Consult with a
                qualified attorney before taking any legal action.
              </p>
            </div>
          </div>
        </Card>
      </motion.div>
    </motion.div>
  );
}
