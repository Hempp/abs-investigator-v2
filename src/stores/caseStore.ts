import { create } from 'zustand';
import { persist, devtools } from 'zustand/middleware';
import {
  Case,
  CaseStatus,
  CaseDocument,
  CaseTimelineEvent,
  CaseReminder,
  CaseFilters,
  CaseSort,
  DebtTypeId,
  DebtInfo,
  Trust,
  Trade,
} from '@/types';

interface CaseState {
  cases: Case[];
  selectedCaseId: string | null;
  filters: CaseFilters;
  sort: CaseSort;
  isLoading: boolean;
}

interface CaseActions {
  // Case CRUD
  createCase: (data: {
    debtType: DebtTypeId;
    debtInfo: DebtInfo;
    trust: Trust | null;
    tradingData: Trade[];
    letter: string | null;
  }) => string;
  updateCase: (id: string, updates: Partial<Case>) => void;
  deleteCase: (id: string) => void;
  duplicateCase: (id: string) => string;

  // Case selection
  selectCase: (id: string | null) => void;
  getCase: (id: string) => Case | undefined;

  // Status management
  updateStatus: (id: string, status: CaseStatus) => void;

  // Documents
  addDocument: (caseId: string, document: Omit<CaseDocument, 'id'>) => void;
  removeDocument: (caseId: string, documentId: string) => void;

  // Timeline
  addTimelineEvent: (caseId: string, event: Omit<CaseTimelineEvent, 'id'>) => void;

  // Reminders
  addReminder: (caseId: string, reminder: Omit<CaseReminder, 'id'>) => void;
  toggleReminder: (caseId: string, reminderId: string) => void;
  removeReminder: (caseId: string, reminderId: string) => void;

  // Notes
  updateNotes: (id: string, notes: string) => void;

  // Tags
  addTag: (id: string, tag: string) => void;
  removeTag: (id: string, tag: string) => void;

  // Filtering and sorting
  setFilters: (filters: Partial<CaseFilters>) => void;
  clearFilters: () => void;
  setSort: (sort: CaseSort) => void;

  // Bulk actions
  deleteMultipleCases: (ids: string[]) => void;
  exportCases: (ids?: string[]) => Case[];

  // Search
  searchCases: (query: string) => Case[];
}

// Generate unique ID
const generateId = () => Math.random().toString(36).substring(2, 11);

// Get current timestamp
const now = () => new Date().toISOString();

const initialState: CaseState = {
  cases: [],
  selectedCaseId: null,
  filters: {},
  sort: { field: 'updatedAt', order: 'desc' },
  isLoading: false,
};

export const useCaseStore = create<CaseState & CaseActions>()(
  devtools(
    persist(
      (set, get) => ({
        ...initialState,

        // Case CRUD
        createCase: (data) => {
          const id = generateId();
          const timestamp = now();

          const newCase: Case = {
            id,
            createdAt: timestamp,
            updatedAt: timestamp,
            status: data.letter ? 'letter_generated' : 'draft',
            debtType: data.debtType,
            debtInfo: data.debtInfo,
            trust: data.trust,
            tradingDataCount: data.tradingData.length,
            tradingDataSample: data.tradingData.slice(0, 5),
            generatedLetter: data.letter,
            documents: [],
            timeline: [
              {
                id: generateId(),
                date: timestamp,
                type: 'created',
                title: 'Case created',
                description: `Investigation started for ${data.debtType} debt`,
              },
            ],
            reminders: [],
            notes: '',
            tags: [],
          };

          set(
            (state) => ({ cases: [newCase, ...state.cases] }),
            false,
            'createCase'
          );

          return id;
        },

        updateCase: (id, updates) => {
          set(
            (state) => ({
              cases: state.cases.map((c) =>
                c.id === id ? { ...c, ...updates, updatedAt: now() } : c
              ),
            }),
            false,
            'updateCase'
          );
        },

        deleteCase: (id) => {
          set(
            (state) => ({
              cases: state.cases.filter((c) => c.id !== id),
              selectedCaseId: state.selectedCaseId === id ? null : state.selectedCaseId,
            }),
            false,
            'deleteCase'
          );
        },

        duplicateCase: (id) => {
          const originalCase = get().cases.find((c) => c.id === id);
          if (!originalCase) return '';

          const newId = generateId();
          const timestamp = now();

          const duplicatedCase: Case = {
            ...originalCase,
            id: newId,
            createdAt: timestamp,
            updatedAt: timestamp,
            status: 'draft',
            timeline: [
              {
                id: generateId(),
                date: timestamp,
                type: 'created',
                title: 'Case duplicated',
                description: `Duplicated from case ${id}`,
              },
            ],
            reminders: [],
          };

          set(
            (state) => ({ cases: [duplicatedCase, ...state.cases] }),
            false,
            'duplicateCase'
          );

          return newId;
        },

        // Case selection
        selectCase: (id) => {
          set({ selectedCaseId: id }, false, 'selectCase');
        },

        getCase: (id) => {
          return get().cases.find((c) => c.id === id);
        },

        // Status management
        updateStatus: (id, status) => {
          set(
            (state) => ({
              cases: state.cases.map((c) => {
                if (c.id !== id) return c;

                const newTimeline: CaseTimelineEvent = {
                  id: generateId(),
                  date: now(),
                  type: 'status_change',
                  title: 'Status updated',
                  description: `Changed to ${status.replace(/_/g, ' ')}`,
                  status,
                };

                return {
                  ...c,
                  status,
                  updatedAt: now(),
                  timeline: [...c.timeline, newTimeline],
                };
              }),
            }),
            false,
            'updateStatus'
          );
        },

        // Documents
        addDocument: (caseId, document) => {
          const newDocument: CaseDocument = {
            ...document,
            id: generateId(),
          };

          set(
            (state) => ({
              cases: state.cases.map((c) =>
                c.id === caseId
                  ? {
                      ...c,
                      documents: [...c.documents, newDocument],
                      updatedAt: now(),
                    }
                  : c
              ),
            }),
            false,
            'addDocument'
          );
        },

        removeDocument: (caseId, documentId) => {
          set(
            (state) => ({
              cases: state.cases.map((c) =>
                c.id === caseId
                  ? {
                      ...c,
                      documents: c.documents.filter((d) => d.id !== documentId),
                      updatedAt: now(),
                    }
                  : c
              ),
            }),
            false,
            'removeDocument'
          );
        },

        // Timeline
        addTimelineEvent: (caseId, event) => {
          const newEvent: CaseTimelineEvent = {
            ...event,
            id: generateId(),
          };

          set(
            (state) => ({
              cases: state.cases.map((c) =>
                c.id === caseId
                  ? {
                      ...c,
                      timeline: [...c.timeline, newEvent],
                      updatedAt: now(),
                    }
                  : c
              ),
            }),
            false,
            'addTimelineEvent'
          );
        },

        // Reminders
        addReminder: (caseId, reminder) => {
          const newReminder: CaseReminder = {
            ...reminder,
            id: generateId(),
          };

          set(
            (state) => ({
              cases: state.cases.map((c) =>
                c.id === caseId
                  ? {
                      ...c,
                      reminders: [...c.reminders, newReminder],
                      updatedAt: now(),
                    }
                  : c
              ),
            }),
            false,
            'addReminder'
          );
        },

        toggleReminder: (caseId, reminderId) => {
          set(
            (state) => ({
              cases: state.cases.map((c) =>
                c.id === caseId
                  ? {
                      ...c,
                      reminders: c.reminders.map((r) =>
                        r.id === reminderId ? { ...r, completed: !r.completed } : r
                      ),
                      updatedAt: now(),
                    }
                  : c
              ),
            }),
            false,
            'toggleReminder'
          );
        },

        removeReminder: (caseId, reminderId) => {
          set(
            (state) => ({
              cases: state.cases.map((c) =>
                c.id === caseId
                  ? {
                      ...c,
                      reminders: c.reminders.filter((r) => r.id !== reminderId),
                      updatedAt: now(),
                    }
                  : c
              ),
            }),
            false,
            'removeReminder'
          );
        },

        // Notes
        updateNotes: (id, notes) => {
          set(
            (state) => ({
              cases: state.cases.map((c) =>
                c.id === id ? { ...c, notes, updatedAt: now() } : c
              ),
            }),
            false,
            'updateNotes'
          );
        },

        // Tags
        addTag: (id, tag) => {
          set(
            (state) => ({
              cases: state.cases.map((c) =>
                c.id === id && !c.tags.includes(tag)
                  ? { ...c, tags: [...c.tags, tag], updatedAt: now() }
                  : c
              ),
            }),
            false,
            'addTag'
          );
        },

        removeTag: (id, tag) => {
          set(
            (state) => ({
              cases: state.cases.map((c) =>
                c.id === id
                  ? { ...c, tags: c.tags.filter((t) => t !== tag), updatedAt: now() }
                  : c
              ),
            }),
            false,
            'removeTag'
          );
        },

        // Filtering and sorting
        setFilters: (filters) => {
          set(
            (state) => ({ filters: { ...state.filters, ...filters } }),
            false,
            'setFilters'
          );
        },

        clearFilters: () => {
          set({ filters: {} }, false, 'clearFilters');
        },

        setSort: (sort) => {
          set({ sort }, false, 'setSort');
        },

        // Bulk actions
        deleteMultipleCases: (ids) => {
          set(
            (state) => ({
              cases: state.cases.filter((c) => !ids.includes(c.id)),
              selectedCaseId: ids.includes(state.selectedCaseId || '') ? null : state.selectedCaseId,
            }),
            false,
            'deleteMultipleCases'
          );
        },

        exportCases: (ids) => {
          const { cases } = get();
          if (ids) {
            return cases.filter((c) => ids.includes(c.id));
          }
          return cases;
        },

        // Search
        searchCases: (query) => {
          const { cases } = get();
          const lowerQuery = query.toLowerCase();

          return cases.filter((c) => {
            const borrowerName = c.debtInfo.borrowerName?.toLowerCase() || '';
            const accountNumber = c.debtInfo.accountNumber?.toLowerCase() || '';
            const trustName = c.trust?.name.toLowerCase() || '';
            const notes = c.notes.toLowerCase();
            const tags = c.tags.join(' ').toLowerCase();

            return (
              borrowerName.includes(lowerQuery) ||
              accountNumber.includes(lowerQuery) ||
              trustName.includes(lowerQuery) ||
              notes.includes(lowerQuery) ||
              tags.includes(lowerQuery)
            );
          });
        },
      }),
      {
        name: 'abs-cases-storage',
      }
    ),
    { name: 'CaseStore' }
  )
);

// Selector hooks
export const useCases = () => useCaseStore((s) => s.cases);
export const useSelectedCase = () => {
  const cases = useCaseStore((s) => s.cases);
  const selectedId = useCaseStore((s) => s.selectedCaseId);
  return cases.find((c) => c.id === selectedId) || null;
};
export const useCaseFilters = () => useCaseStore((s) => s.filters);
export const useCaseSort = () => useCaseStore((s) => s.sort);

// Computed selectors
export const useFilteredCases = () => {
  const cases = useCaseStore((s) => s.cases);
  const filters = useCaseStore((s) => s.filters);
  const sort = useCaseStore((s) => s.sort);

  let filtered = [...cases];

  // Apply filters
  if (filters.status?.length) {
    filtered = filtered.filter((c) => filters.status!.includes(c.status));
  }
  if (filters.debtType?.length) {
    filtered = filtered.filter((c) => filters.debtType!.includes(c.debtType));
  }
  if (filters.searchQuery) {
    const query = filters.searchQuery.toLowerCase();
    filtered = filtered.filter(
      (c) =>
        c.debtInfo.borrowerName?.toLowerCase().includes(query) ||
        c.trust?.name.toLowerCase().includes(query) ||
        c.notes.toLowerCase().includes(query)
    );
  }
  if (filters.tags?.length) {
    filtered = filtered.filter((c) =>
      filters.tags!.some((tag) => c.tags.includes(tag))
    );
  }
  if (filters.dateRange) {
    const start = new Date(filters.dateRange.start);
    const end = new Date(filters.dateRange.end);
    filtered = filtered.filter((c) => {
      const date = new Date(c.createdAt);
      return date >= start && date <= end;
    });
  }

  // Apply sorting
  filtered.sort((a, b) => {
    const aValue = a[sort.field];
    const bValue = b[sort.field];

    if (sort.order === 'asc') {
      return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
    } else {
      return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
    }
  });

  return filtered;
};
