'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Filter, SortAsc, SortDesc, AlertCircle, Sparkles } from 'lucide-react';
import { Trust, DebtTypeId } from '@/types';
import { DEBT_TYPES } from '@/lib';
import { cn } from '@/lib/utils';
import { Input, Button, Badge, Card } from '@/components/ui';
import { TrustCard } from './TrustCard';

interface TrustResultsProps {
  trusts: Trust[];
  debtType: DebtTypeId;
  selectedTrust: Trust | null;
  onSelectTrust: (trust: Trust) => void;
  onBack?: () => void;
}

type SortField = 'matchScore' | 'dealSize' | 'issuanceDate';
type SortOrder = 'asc' | 'desc';

export function TrustResults({
  trusts,
  debtType,
  selectedTrust,
  onSelectTrust,
  onBack,
}: TrustResultsProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [sortField, setSortField] = useState<SortField>('matchScore');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');

  const debtTypeConfig = DEBT_TYPES[debtType];

  // Filter and sort trusts
  const filteredTrusts = trusts
    .filter((trust) => {
      if (!searchQuery) return true;
      const query = searchQuery.toLowerCase();
      return (
        trust.name.toLowerCase().includes(query) ||
        trust.trustee.toLowerCase().includes(query) ||
        trust.cusips.some((c) => c.cusip.toLowerCase().includes(query))
      );
    })
    .sort((a, b) => {
      let comparison = 0;
      switch (sortField) {
        case 'matchScore':
          comparison = a.matchScore - b.matchScore;
          break;
        case 'dealSize':
          comparison = (a.dealSize ?? 0) - (b.dealSize ?? 0);
          break;
        case 'issuanceDate':
          comparison = new Date(a.issuanceDate ?? '').getTime() - new Date(b.issuanceDate ?? '').getTime();
          break;
      }
      return sortOrder === 'desc' ? -comparison : comparison;
    });

  const toggleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('desc');
    }
  };

  const SortIcon = sortOrder === 'asc' ? SortAsc : SortDesc;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div
            className="p-2 rounded-lg"
            style={{ backgroundColor: `rgb(var(--${debtType}) / 0.1)` }}
          >
            <Sparkles
              className="h-5 w-5"
              style={{ color: `rgb(var(--${debtType}))` }}
            />
          </div>
          <div>
            <h2 className="text-xl font-bold">Potential Securitization Trusts</h2>
            <p className="text-sm text-muted-foreground">
              Found {trusts.length} potential matches for your {debtTypeConfig.name.toLowerCase()}
            </p>
          </div>
        </div>

        {onBack && (
          <Button variant="outline" onClick={onBack}>
            Modify Search
          </Button>
        )}
      </div>

      {/* Search and Filters */}
      <Card className="p-4">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by trust name, trustee, or CUSIP..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>

          {/* Sort Buttons */}
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Sort by:</span>
            <div className="flex gap-1">
              <Button
                variant={sortField === 'matchScore' ? 'default' : 'outline'}
                size="sm"
                onClick={() => toggleSort('matchScore')}
              >
                Match
                {sortField === 'matchScore' && <SortIcon className="ml-1 h-3 w-3" />}
              </Button>
              <Button
                variant={sortField === 'dealSize' ? 'default' : 'outline'}
                size="sm"
                onClick={() => toggleSort('dealSize')}
              >
                Size
                {sortField === 'dealSize' && <SortIcon className="ml-1 h-3 w-3" />}
              </Button>
              <Button
                variant={sortField === 'issuanceDate' ? 'default' : 'outline'}
                size="sm"
                onClick={() => toggleSort('issuanceDate')}
              >
                Date
                {sortField === 'issuanceDate' && <SortIcon className="ml-1 h-3 w-3" />}
              </Button>
            </div>
          </div>
        </div>
      </Card>

      {/* Results */}
      {filteredTrusts.length === 0 ? (
        <Card className="p-8">
          <div className="flex flex-col items-center justify-center text-center">
            <AlertCircle className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold">No Trusts Found</h3>
            <p className="text-sm text-muted-foreground mt-1 max-w-md">
              {searchQuery
                ? 'Try adjusting your search query or clearing filters.'
                : 'No matching trusts were found for your debt information. This may indicate the debt was not securitized.'}
            </p>
            {searchQuery && (
              <Button
                variant="outline"
                size="sm"
                className="mt-4"
                onClick={() => setSearchQuery('')}
              >
                Clear Search
              </Button>
            )}
          </div>
        </Card>
      ) : (
        <div className="space-y-4">
          {/* Results Count */}
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              Showing {filteredTrusts.length} of {trusts.length} trusts
            </p>
            {selectedTrust && (
              <Badge variant="success">
                Selected: {selectedTrust.name}
              </Badge>
            )}
          </div>

          {/* Trust Cards Grid */}
          <motion.div
            className="grid grid-cols-1 lg:grid-cols-2 gap-4"
            layout
          >
            <AnimatePresence mode="popLayout">
              {filteredTrusts.map((trust, index) => (
                <TrustCard
                  key={trust.dealId}
                  trust={trust}
                  rank={index + 1}
                  isSelected={selectedTrust?.dealId === trust.dealId}
                  onSelect={onSelectTrust}
                />
              ))}
            </AnimatePresence>
          </motion.div>
        </div>
      )}

      {/* Selected Trust Action */}
      {selectedTrust && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="sticky bottom-4"
        >
          <Card className="p-4 bg-primary/5 border-primary/20 backdrop-blur-sm">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Selected Trust</p>
                <p className="font-semibold">{selectedTrust.name}</p>
                {selectedTrust.cusips.length > 0 && (
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">Primary CUSIP:</span>
                    <Badge variant="outline" className="text-xs font-mono">
                      {selectedTrust.cusips[0].cusip}
                    </Badge>
                  </div>
                )}
              </div>
              <Button variant={debtType}>
                Continue to Trading Data
              </Button>
            </div>
          </Card>
        </motion.div>
      )}
    </div>
  );
}
