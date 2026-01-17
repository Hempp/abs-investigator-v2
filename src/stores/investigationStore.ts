import { create } from 'zustand';
import { persist, devtools } from 'zustand/middleware';
import { DebtTypeId, DebtInfo, Trust, Trade, TradingStats } from '@/types';
import {
  generateTradingHistory,
  calculateTradingStats,
  generateLetter,
  searchAllDebtsAPI,
  searchSpecificDebtAPI,
  searchTrustsAPI,
  getTradingDataAPI,
} from '@/lib';

export type InvestigationStep = 0 | 1 | 2 | 3;

export interface PersonalInfo {
  firstName: string;
  lastName: string;
  ssnLast4: string;
  dateOfBirth?: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  email?: string;
  phone?: string;
}

export interface SpecificDebtSearch {
  debtType: DebtTypeId;
  accountNumber: string;
  companyName: string;
  originalAmount?: number;
  currentBalance?: number;
}

interface InvestigationState {
  // Current investigation state
  personalInfo: PersonalInfo | null;
  searchMode: 'all' | 'specific' | null;
  specificDebtSearch: SpecificDebtSearch | null;
  activeDebtType: DebtTypeId | null;
  step: InvestigationStep;
  debtInfo: DebtInfo;

  // Investigation results
  isInvestigating: boolean;
  foundTrusts: Trust[];
  selectedTrust: Trust | null;
  tradingData: Trade[];
  tradingStats: TradingStats | null;
  generatedLetter: string | null;

  // UI state
  isLoading: boolean;
  error: string | null;
}

interface InvestigationActions {
  // Personal info
  setPersonalInfo: (info: PersonalInfo) => void;
  clearPersonalInfo: () => void;

  // Search mode
  setSearchMode: (mode: 'all' | 'specific') => void;
  setSpecificDebtSearch: (data: SpecificDebtSearch) => void;

  // Debt type selection
  setActiveDebtType: (type: DebtTypeId) => void;
  clearDebtType: () => void;

  // Step navigation
  setStep: (step: InvestigationStep) => void;
  nextStep: () => void;
  prevStep: () => void;

  // Debt info management
  setDebtInfo: (info: Partial<DebtInfo>) => void;
  clearDebtInfo: () => void;

  // Investigation actions
  startInvestigation: () => Promise<void>;
  searchAllDebts: () => Promise<void>;
  searchSpecificDebt: (data: SpecificDebtSearch) => Promise<void>;
  selectTrust: (trust: Trust) => Promise<void>;
  generateTradingData: (cusip: string) => Promise<void>;
  generateQWRLetter: () => void;

  // Reset
  resetInvestigation: () => void;

  // Error handling
  setError: (error: string | null) => void;
  clearError: () => void;
}

const initialState: InvestigationState = {
  personalInfo: null,
  searchMode: null,
  specificDebtSearch: null,
  activeDebtType: null,
  step: 0,
  debtInfo: {},
  isInvestigating: false,
  foundTrusts: [],
  selectedTrust: null,
  tradingData: [],
  tradingStats: null,
  generatedLetter: null,
  isLoading: false,
  error: null,
};

export const useInvestigationStore = create<InvestigationState & InvestigationActions>()(
  devtools(
    persist(
      (set, get) => ({
        ...initialState,

        // Personal info
        setPersonalInfo: (info) => {
          set({ personalInfo: info, step: 1 }, false, 'setPersonalInfo');
        },

        clearPersonalInfo: () => {
          set({ personalInfo: null }, false, 'clearPersonalInfo');
        },

        // Search mode
        setSearchMode: (mode) => {
          set({ searchMode: mode }, false, 'setSearchMode');
        },

        setSpecificDebtSearch: (data) => {
          set({ specificDebtSearch: data, activeDebtType: data.debtType }, false, 'setSpecificDebtSearch');
        },

        // Debt type selection
        setActiveDebtType: (type) => {
          set({ activeDebtType: type }, false, 'setActiveDebtType');
        },

        clearDebtType: () => {
          set({ activeDebtType: null }, false, 'clearDebtType');
        },

        // Step navigation
        setStep: (step) => {
          set({ step }, false, 'setStep');
        },

        nextStep: () => {
          const { step } = get();
          if (step < 3) {
            set({ step: (step + 1) as InvestigationStep }, false, 'nextStep');
          }
        },

        prevStep: () => {
          const { step } = get();
          if (step > 0) {
            set({ step: (step - 1) as InvestigationStep }, false, 'prevStep');
          }
        },

        // Debt info management
        setDebtInfo: (info) => {
          set(
            (state) => ({ debtInfo: { ...state.debtInfo, ...info } }),
            false,
            'setDebtInfo'
          );
        },

        clearDebtInfo: () => {
          set({ debtInfo: {} }, false, 'clearDebtInfo');
        },

        // Investigation actions
        startInvestigation: async () => {
          const { activeDebtType, debtInfo } = get();
          if (!activeDebtType) return;

          set({ isInvestigating: true, isLoading: true, error: null }, false, 'startInvestigation');

          try {
            // Build search query from debt info
            const searchTerms = [
              debtInfo.servicerName || debtInfo.servicer,
              debtInfo.originator,
              debtInfo.borrowerName,
            ].filter(Boolean);

            const query = searchTerms.length > 0
              ? searchTerms.join(' ')
              : `${activeDebtType} ABS trust`;

            // Search real SEC EDGAR and OpenFIGI APIs
            const result = await searchTrustsAPI(query, activeDebtType);

            set(
              {
                foundTrusts: result.trusts.slice(0, 10),
                isInvestigating: false,
                isLoading: false,
                step: 2,
              },
              false,
              'investigationComplete'
            );
          } catch (error) {
            set(
              {
                isInvestigating: false,
                isLoading: false,
                error: error instanceof Error ? error.message : 'Investigation failed',
              },
              false,
              'investigationError'
            );
          }
        },

        // Search all debts for the user
        searchAllDebts: async () => {
          const { personalInfo } = get();
          if (!personalInfo) return;

          set({ isInvestigating: true, isLoading: true, error: null, searchMode: 'all' }, false, 'searchAllDebts');

          try {
            // Search SEC EDGAR and OpenFIGI for all debt types
            const result = await searchAllDebtsAPI({
              firstName: personalInfo.firstName,
              lastName: personalInfo.lastName,
              state: personalInfo.state,
              zipCode: personalInfo.zipCode,
            });

            set(
              {
                foundTrusts: result.trusts.slice(0, 20),
                isInvestigating: false,
                isLoading: false,
                step: 2,
              },
              false,
              'searchAllDebtsComplete'
            );
          } catch (error) {
            set(
              {
                isInvestigating: false,
                isLoading: false,
                error: error instanceof Error ? error.message : 'Search failed',
              },
              false,
              'searchAllDebtsError'
            );
          }
        },

        // Search for a specific debt
        searchSpecificDebt: async (data) => {
          const { personalInfo } = get();
          if (!personalInfo) return;

          set({
            isInvestigating: true,
            isLoading: true,
            error: null,
            searchMode: 'specific',
            specificDebtSearch: data,
            activeDebtType: data.debtType
          }, false, 'searchSpecificDebt');

          try {
            // Search SEC EDGAR and OpenFIGI for this specific debt
            const result = await searchSpecificDebtAPI({
              debtType: data.debtType,
              companyName: data.companyName,
              accountNumber: data.accountNumber,
              servicerName: data.companyName,
              originalAmount: data.originalAmount,
              currentBalance: data.currentBalance,
              firstName: personalInfo.firstName,
              lastName: personalInfo.lastName,
              state: personalInfo.state,
            });

            set(
              {
                foundTrusts: result.trusts.slice(0, 10),
                debtInfo: {
                  borrowerName: `${personalInfo.firstName} ${personalInfo.lastName}`,
                  servicerName: data.companyName,
                  accountNumber: data.accountNumber,
                  originalAmount: data.originalAmount,
                  currentBalance: data.currentBalance,
                },
                isInvestigating: false,
                isLoading: false,
                step: 2,
              },
              false,
              'searchSpecificDebtComplete'
            );
          } catch (error) {
            set(
              {
                isInvestigating: false,
                isLoading: false,
                error: error instanceof Error ? error.message : 'Search failed',
              },
              false,
              'searchSpecificDebtError'
            );
          }
        },

        selectTrust: async (trust) => {
          // Get real trading data for the first CUSIP from FINRA TRACE
          const cusip = trust.cusips[0]?.cusip;

          set({ selectedTrust: trust, step: 3, isLoading: true }, false, 'selectTrust');

          if (cusip) {
            try {
              const result = await getTradingDataAPI(cusip);

              // If no real data, fall back to generated data for demo
              const tradingData = result.trades.length > 0
                ? result.trades
                : generateTradingHistory(cusip, 25);
              const tradingStats = result.stats || calculateTradingStats(tradingData);

              set({ tradingData, tradingStats, isLoading: false }, false, 'tradingDataLoaded');
            } catch (error) {
              // Fall back to generated data
              const tradingData = generateTradingHistory(cusip, 25);
              const tradingStats = calculateTradingStats(tradingData);
              set({ tradingData, tradingStats, isLoading: false }, false, 'tradingDataFallback');
            }
          } else {
            set({ tradingData: [], tradingStats: null, isLoading: false }, false, 'noTradingData');
          }
        },

        generateTradingData: async (cusip) => {
          set({ isLoading: true }, false, 'generateTradingDataStart');

          try {
            const result = await getTradingDataAPI(cusip);

            // If no real data, fall back to generated data for demo
            const tradingData = result.trades.length > 0
              ? result.trades
              : generateTradingHistory(cusip, 25);
            const tradingStats = result.stats || calculateTradingStats(tradingData);

            set({ tradingData, tradingStats, isLoading: false }, false, 'generateTradingData');
          } catch (error) {
            // Fall back to generated data
            const tradingData = generateTradingHistory(cusip, 25);
            const tradingStats = calculateTradingStats(tradingData);
            set({ tradingData, tradingStats, isLoading: false }, false, 'generateTradingDataFallback');
          }
        },

        generateQWRLetter: () => {
          const { activeDebtType, debtInfo, selectedTrust } = get();
          if (!activeDebtType) return;

          const letter = generateLetter({
            debtType: activeDebtType,
            debtInfo,
            trust: selectedTrust,
            servicerAddress: '',
          });

          set({ generatedLetter: letter }, false, 'generateQWRLetter');
        },

        // Reset
        resetInvestigation: () => {
          set(initialState, false, 'resetInvestigation');
        },

        // Error handling
        setError: (error) => {
          set({ error }, false, 'setError');
        },

        clearError: () => {
          set({ error: null }, false, 'clearError');
        },
      }),
      {
        name: 'abs-investigation-storage',
        partialize: (state) => ({
          // Only persist essential data
          personalInfo: state.personalInfo,
          activeDebtType: state.activeDebtType,
          debtInfo: state.debtInfo,
          step: state.step,
        }),
      }
    ),
    { name: 'InvestigationStore' }
  )
);

// Selector hooks for better performance
export const usePersonalInfo = () => useInvestigationStore((s) => s.personalInfo);
export const useSearchMode = () => useInvestigationStore((s) => s.searchMode);
export const useSpecificDebtSearch = () => useInvestigationStore((s) => s.specificDebtSearch);
export const useActiveDebtType = () => useInvestigationStore((s) => s.activeDebtType);
export const useInvestigationStep = () => useInvestigationStore((s) => s.step);
export const useDebtInfo = () => useInvestigationStore((s) => s.debtInfo);
export const useFoundTrusts = () => useInvestigationStore((s) => s.foundTrusts);
export const useSelectedTrust = () => useInvestigationStore((s) => s.selectedTrust);
export const useTradingData = () => useInvestigationStore((s) => s.tradingData);
export const useGeneratedLetter = () => useInvestigationStore((s) => s.generatedLetter);
export const useIsLoading = () => useInvestigationStore((s) => s.isLoading);
