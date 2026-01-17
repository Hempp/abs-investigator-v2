'use client';

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  Filter,
  SortAsc,
  SortDesc,
  Grid3X3,
  List,
  Plus,
  FolderOpen,
  X,
} from 'lucide-react';
import { Case, CaseStatus, DebtTypeId } from '@/types';
import { DEBT_TYPES } from '@/lib';
import { useCaseStore, useFilteredCases, useUIStore } from '@/stores';
import { cn } from '@/lib/utils';
import { Input, Button, Badge, Card, Select } from '@/components/ui';
import { CaseCard } from './CaseCard';

interface CaseListProps {
  onViewCase: (id: string) => void;
  onNewCase?: () => void;
}

const statusOptions: { value: CaseStatus; label: string }[] = [
  { value: 'draft', label: 'Draft' },
  { value: 'letter_generated', label: 'Letter Generated' },
  { value: 'letter_sent', label: 'Letter Sent' },
  { value: 'response_received', label: 'Response Received' },
  { value: 'escalated', label: 'Escalated' },
  { value: 'resolved', label: 'Resolved' },
  { value: 'closed', label: 'Closed' },
];

export function CaseList({ onViewCase, onNewCase }: CaseListProps) {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  const filteredCases = useFilteredCases();
  const { filters, setFilters, clearFilters, sort, setSort, duplicateCase, deleteCase } = useCaseStore();
  const { showToast } = useUIStore();

  // Apply local search filter
  const displayedCases = useMemo(() => {
    if (!searchQuery) return filteredCases;
    const query = searchQuery.toLowerCase();
    return filteredCases.filter(
      (c) =>
        c.debtInfo.borrowerName?.toLowerCase().includes(query) ||
        c.id.toLowerCase().includes(query) ||
        c.trust?.name.toLowerCase().includes(query) ||
        c.notes.toLowerCase().includes(query)
    );
  }, [filteredCases, searchQuery]);

  const handleDuplicate = (id: string) => {
    const newId = duplicateCase(id);
    if (newId) {
      showToast({ type: 'success', title: 'Case duplicated', description: `New case #${newId.slice(0, 8)} created` });
    }
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this case?')) {
      deleteCase(id);
      showToast({ type: 'success', title: 'Case deleted' });
    }
  };

  const activeFilterCount = [
    filters.status?.length,
    filters.debtType?.length,
    filters.tags?.length,
    filters.dateRange,
  ].filter(Boolean).length;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold">My Cases</h2>
          <p className="text-muted-foreground">
            {displayedCases.length} case{displayedCases.length !== 1 ? 's' : ''}
          </p>
        </div>

        {onNewCase && (
          <Button onClick={onNewCase}>
            <Plus className="mr-2 h-4 w-4" />
            New Investigation
          </Button>
        )}
      </div>

      {/* Search and Controls */}
      <Card className="p-4">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search cases..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>

          {/* Controls */}
          <div className="flex items-center gap-2">
            {/* Filter Toggle */}
            <Button
              variant={showFilters ? 'default' : 'outline'}
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
            >
              <Filter className="mr-1 h-4 w-4" />
              Filters
              {activeFilterCount > 0 && (
                <Badge variant="secondary" className="ml-1">
                  {activeFilterCount}
                </Badge>
              )}
            </Button>

            {/* Sort */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSort({ ...sort, order: sort.order === 'asc' ? 'desc' : 'asc' })}
            >
              {sort.order === 'asc' ? (
                <SortAsc className="h-4 w-4" />
              ) : (
                <SortDesc className="h-4 w-4" />
              )}
            </Button>

            {/* View Mode */}
            <div className="flex border rounded-md">
              <Button
                variant={viewMode === 'grid' ? 'default' : 'ghost'}
                size="sm"
                className="rounded-r-none"
                onClick={() => setViewMode('grid')}
              >
                <Grid3X3 className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === 'list' ? 'default' : 'ghost'}
                size="sm"
                className="rounded-l-none"
                onClick={() => setViewMode('list')}
              >
                <List className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Expandable Filters */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <div className="pt-4 mt-4 border-t">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Status Filter */}
                  <div>
                    <label className="text-sm font-medium mb-1.5 block">Status</label>
                    <Select
                      value={filters.status?.[0] || ''}
                      onValueChange={(val) =>
                        setFilters({ status: val ? [val as CaseStatus] : undefined })
                      }
                    >
                      <option value="">All Statuses</option>
                      {statusOptions.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </Select>
                  </div>

                  {/* Debt Type Filter */}
                  <div>
                    <label className="text-sm font-medium mb-1.5 block">Debt Type</label>
                    <Select
                      value={filters.debtType?.[0] || ''}
                      onValueChange={(val) =>
                        setFilters({ debtType: val ? [val as DebtTypeId] : undefined })
                      }
                    >
                      <option value="">All Types</option>
                      {Object.entries(DEBT_TYPES).map(([id, config]) => (
                        <option key={id} value={id}>
                          {config.name}
                        </option>
                      ))}
                    </Select>
                  </div>

                  {/* Sort Field */}
                  <div>
                    <label className="text-sm font-medium mb-1.5 block">Sort By</label>
                    <Select
                      value={sort.field}
                      onValueChange={(val) =>
                        setSort({ ...sort, field: val as 'createdAt' | 'updatedAt' | 'status' })
                      }
                    >
                      <option value="createdAt">Date Created</option>
                      <option value="updatedAt">Last Updated</option>
                      <option value="status">Status</option>
                    </Select>
                  </div>
                </div>

                {activeFilterCount > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="mt-4"
                    onClick={clearFilters}
                  >
                    <X className="mr-1 h-4 w-4" />
                    Clear Filters
                  </Button>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </Card>

      {/* Cases Grid/List */}
      {displayedCases.length === 0 ? (
        <Card className="p-12">
          <div className="flex flex-col items-center justify-center text-center">
            <FolderOpen className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold">No Cases Found</h3>
            <p className="text-sm text-muted-foreground mt-1 max-w-md">
              {searchQuery || activeFilterCount > 0
                ? 'Try adjusting your search or filters.'
                : 'Start a new investigation to create your first case.'}
            </p>
            {onNewCase && (
              <Button onClick={onNewCase} className="mt-4">
                <Plus className="mr-2 h-4 w-4" />
                New Investigation
              </Button>
            )}
          </div>
        </Card>
      ) : (
        <motion.div
          className={cn(
            viewMode === 'grid'
              ? 'grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4'
              : 'space-y-3'
          )}
          layout
        >
          <AnimatePresence mode="popLayout">
            {displayedCases.map((caseData) => (
              <CaseCard
                key={caseData.id}
                caseData={caseData}
                onView={onViewCase}
                onDuplicate={handleDuplicate}
                onDelete={handleDelete}
              />
            ))}
          </AnimatePresence>
        </motion.div>
      )}
    </div>
  );
}
