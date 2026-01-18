'use client';

import { motion } from 'framer-motion';
import { Building2, Calendar, Shield, TrendingUp, ExternalLink, ChevronRight, AlertTriangle, CheckCircle2, Database, FileCheck, Hash, MapPin } from 'lucide-react';
import { Trust } from '@/types';
import { formatCurrency, formatPercentage } from '@/lib/utils';
import { cn } from '@/lib/utils';
import { Card, Badge, Button, Progress } from '@/components/ui';

interface TrustCardProps {
  trust: Trust;
  isSelected?: boolean;
  onSelect: (trust: Trust) => void;
  rank?: number;
}

export function TrustCard({ trust, isSelected, onSelect, rank }: TrustCardProps) {
  const matchPercentage = Math.round(trust.matchScore * 100);

  const getMatchColor = (score: number) => {
    if (score >= 80) return 'text-green-500';
    if (score >= 60) return 'text-yellow-500';
    return 'text-orange-500';
  };

  const getMatchBadge = (score: number) => {
    if (score >= 80) return 'success';
    if (score >= 60) return 'warning';
    return 'secondary';
  };

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
          'relative overflow-hidden cursor-pointer transition-all duration-200',
          isSelected && 'ring-2 ring-primary border-primary'
        )}
        onClick={() => onSelect(trust)}
      >
        {/* Rank Badge */}
        {rank && (
          <div className="absolute top-0 left-0 w-8 h-8 bg-primary flex items-center justify-center">
            <span className="text-xs font-bold text-primary-foreground">#{rank}</span>
          </div>
        )}

        <div className="p-4 space-y-4">
          {/* Header */}
          <div className="flex items-start justify-between">
            <div className={cn('flex-1', rank && 'ml-6')}>
              <h3 className="font-semibold text-lg leading-tight">{trust.name}</h3>
              <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
                <Building2 className="h-3.5 w-3.5" />
                <span>{trust.trustee}</span>
              </div>
            </div>

            {/* Match Score */}
            <div className="text-right">
              <Badge variant={getMatchBadge(matchPercentage)}>
                {matchPercentage}% Match
              </Badge>
            </div>
          </div>

          {/* Match Progress */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground">Match Confidence</span>
              <span className={cn('font-medium', getMatchColor(matchPercentage))}>
                {matchPercentage}%
              </span>
            </div>
            <Progress value={matchPercentage} className="h-1.5" />
          </div>

          {/* Trust Details */}
          <div className="grid grid-cols-2 gap-3 text-sm">
            {trust.issuanceDate && (
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">Issued:</span>
                <span className="font-medium">{trust.issuanceDate}</span>
              </div>
            )}
            {trust.dealSize && (
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">Size:</span>
                <span className="font-medium">{formatCurrency(trust.dealSize)}</span>
              </div>
            )}
          </div>

          {/* Company Identification */}
          {(trust.ein || trust.cik) && (
            <div className="grid grid-cols-2 gap-3 text-sm pt-2 border-t border-dashed">
              {trust.ein && (
                <div className="flex items-center gap-2">
                  <Hash className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">EIN:</span>
                  <span className="font-mono font-medium">{trust.ein}</span>
                </div>
              )}
              {trust.cik && (
                <div className="flex items-center gap-2">
                  <Hash className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">CIK:</span>
                  <a
                    href={`https://www.sec.gov/cgi-bin/browse-edgar?action=getcompany&CIK=${trust.cik}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-mono font-medium text-primary hover:underline"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {trust.cik}
                  </a>
                </div>
              )}
              {trust.stateOfIncorporation && (
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">State:</span>
                  <span className="font-medium">{trust.stateOfIncorporation}</span>
                </div>
              )}
            </div>
          )}

          {/* CUSIPs */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm font-medium">
              <Shield className="h-4 w-4 text-primary" />
              <span>CUSIP Numbers ({trust.cusips.length})</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {trust.cusips.slice(0, 4).map((cusip, index) => (
                <Badge
                  key={cusip.cusip}
                  variant={index === 0 ? "default" : "outline"}
                  className="text-sm font-mono px-3 py-1"
                >
                  {cusip.cusip}
                  <span className="ml-1.5 text-xs opacity-75">
                    {cusip.tranche}
                  </span>
                </Badge>
              ))}
              {trust.cusips.length > 4 && (
                <Badge variant="secondary" className="text-sm">
                  +{trust.cusips.length - 4} more
                </Badge>
              )}
            </div>
          </div>

          {/* Data Verification Status */}
          {trust.verification && (
            <div className="space-y-2 pt-2 border-t border-dashed">
              <div className="flex items-center gap-2 text-sm font-medium">
                <FileCheck className="h-4 w-4 text-green-500" />
                <span>Verified Data Sources</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {trust.verification.secVerified && (
                  <Badge variant="outline" className="text-xs bg-green-500/10 text-green-600 border-green-200">
                    <CheckCircle2 className="h-3 w-3 mr-1" />
                    SEC EDGAR
                  </Badge>
                )}
                {trust.verification.figiVerified && (
                  <Badge variant="outline" className="text-xs bg-blue-500/10 text-blue-600 border-blue-200">
                    <CheckCircle2 className="h-3 w-3 mr-1" />
                    OpenFIGI
                  </Badge>
                )}
                {trust.verification.cfpbChecked && (
                  <Badge variant="outline" className="text-xs bg-purple-500/10 text-purple-600 border-purple-200">
                    <Database className="h-3 w-3 mr-1" />
                    CFPB
                  </Badge>
                )}
                {trust.verification.traceVerified && (
                  <Badge variant="outline" className="text-xs bg-orange-500/10 text-orange-600 border-orange-200">
                    <CheckCircle2 className="h-3 w-3 mr-1" />
                    FINRA TRACE
                  </Badge>
                )}
              </div>
            </div>
          )}

          {/* Servicer Risk Alert */}
          {trust.servicerComplaints && trust.servicerComplaints.riskScore > 50 && (
            <div className="p-2 rounded-md bg-amber-500/10 border border-amber-200">
              <div className="flex items-start gap-2">
                <AlertTriangle className="h-4 w-4 text-amber-500 mt-0.5 flex-shrink-0" />
                <div className="text-xs">
                  <p className="font-medium text-amber-700">Servicer Alert</p>
                  <p className="text-amber-600">
                    {trust.servicerComplaints.totalComplaints.toLocaleString()} CFPB complaints found.
                    {trust.servicerComplaints.topIssues.length > 0 && (
                      <span> Top issues: {trust.servicerComplaints.topIssues.slice(0, 2).join(', ')}</span>
                    )}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Action Footer */}
          <div className="flex items-center justify-between pt-3 border-t">
            {trust.secLink && (
              <a
                href={trust.secLink}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-primary hover:underline flex items-center gap-1"
                onClick={(e) => e.stopPropagation()}
              >
                <ExternalLink className="h-3 w-3" />
                View SEC Filing
              </a>
            )}
            <Button
              size="sm"
              variant={isSelected ? 'default' : 'outline'}
              className="ml-auto"
              onClick={(e) => {
                e.stopPropagation();
                onSelect(trust);
              }}
            >
              {isSelected ? 'Selected' : 'View Trading Data'}
              <ChevronRight className="ml-1 h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Selected Indicator */}
        {isSelected && (
          <motion.div
            className="absolute inset-x-0 bottom-0 h-1 bg-primary"
            layoutId="trust-selected"
            initial={false}
          />
        )}
      </Card>
    </motion.div>
  );
}
