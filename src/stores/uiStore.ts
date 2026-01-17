import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type Theme = 'light' | 'dark' | 'system';
type View = 'investigation' | 'cases' | 'case-detail';

interface ToastMessage {
  id: string;
  type: 'default' | 'success' | 'destructive' | 'warning' | 'info';
  title: string;
  description?: string;
  duration?: number;
}

interface UIState {
  // Theme
  theme: Theme;
  resolvedTheme: 'light' | 'dark';

  // Navigation
  currentView: View;
  sidebarOpen: boolean;
  mobileMenuOpen: boolean;

  // Toasts
  toasts: ToastMessage[];

  // Modals
  activeModal: string | null;
  modalData: Record<string, unknown>;

  // Loading states
  globalLoading: boolean;
  loadingMessage: string | null;
}

interface UIActions {
  // Theme
  setTheme: (theme: Theme) => void;
  setResolvedTheme: (theme: 'light' | 'dark') => void;

  // Navigation
  setView: (view: View) => void;
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
  toggleMobileMenu: () => void;
  setMobileMenuOpen: (open: boolean) => void;

  // Toasts
  showToast: (toast: Omit<ToastMessage, 'id'>) => void;
  dismissToast: (id: string) => void;
  clearToasts: () => void;

  // Modals
  openModal: (modalId: string, data?: Record<string, unknown>) => void;
  closeModal: () => void;

  // Loading
  setGlobalLoading: (loading: boolean, message?: string) => void;
}

// Generate unique ID
const generateId = () => Math.random().toString(36).substring(2, 11);

const initialState: UIState = {
  theme: 'system',
  resolvedTheme: 'light',
  currentView: 'investigation',
  sidebarOpen: true,
  mobileMenuOpen: false,
  toasts: [],
  activeModal: null,
  modalData: {},
  globalLoading: false,
  loadingMessage: null,
};

export const useUIStore = create<UIState & UIActions>()(
  persist(
    (set, get) => ({
      ...initialState,

      // Theme
      setTheme: (theme) => {
        set({ theme });

        // Apply theme class to document
        if (typeof window !== 'undefined') {
          const root = window.document.documentElement;
          root.classList.remove('light', 'dark');

          if (theme === 'system') {
            const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches
              ? 'dark'
              : 'light';
            root.classList.add(systemTheme);
            set({ resolvedTheme: systemTheme });
          } else {
            root.classList.add(theme);
            set({ resolvedTheme: theme });
          }
        }
      },

      setResolvedTheme: (theme) => {
        set({ resolvedTheme: theme });
      },

      // Navigation
      setView: (view) => {
        set({ currentView: view });
      },

      toggleSidebar: () => {
        set((state) => ({ sidebarOpen: !state.sidebarOpen }));
      },

      setSidebarOpen: (open) => {
        set({ sidebarOpen: open });
      },

      toggleMobileMenu: () => {
        set((state) => ({ mobileMenuOpen: !state.mobileMenuOpen }));
      },

      setMobileMenuOpen: (open) => {
        set({ mobileMenuOpen: open });
      },

      // Toasts
      showToast: (toast) => {
        const id = generateId();
        const newToast: ToastMessage = { ...toast, id };

        set((state) => ({ toasts: [...state.toasts, newToast] }));

        // Auto dismiss after duration
        const duration = toast.duration ?? 5000;
        if (duration > 0) {
          setTimeout(() => {
            get().dismissToast(id);
          }, duration);
        }
      },

      dismissToast: (id) => {
        set((state) => ({
          toasts: state.toasts.filter((t) => t.id !== id),
        }));
      },

      clearToasts: () => {
        set({ toasts: [] });
      },

      // Modals
      openModal: (modalId, data = {}) => {
        set({ activeModal: modalId, modalData: data });
      },

      closeModal: () => {
        set({ activeModal: null, modalData: {} });
      },

      // Loading
      setGlobalLoading: (loading, message) => {
        set({ globalLoading: loading, loadingMessage: message || null });
      },
    }),
    {
      name: 'abs-ui-storage',
      partialize: (state) => ({
        theme: state.theme,
        sidebarOpen: state.sidebarOpen,
      }),
    }
  )
);

// Selector hooks
export const useTheme = () => useUIStore((s) => s.theme);
export const useResolvedTheme = () => useUIStore((s) => s.resolvedTheme);
export const useCurrentView = () => useUIStore((s) => s.currentView);
export const useSidebarOpen = () => useUIStore((s) => s.sidebarOpen);
export const useToasts = () => useUIStore((s) => s.toasts);
export const useActiveModal = () => useUIStore((s) => s.activeModal);
export const useModalData = () => useUIStore((s) => s.modalData);
export const useGlobalLoading = () => useUIStore((s) => s.globalLoading);

// Convenience hook for toast actions
export const useToast = () => {
  const showToast = useUIStore((s) => s.showToast);

  return {
    toast: showToast,
    success: (title: string, description?: string) =>
      showToast({ type: 'success', title, description }),
    error: (title: string, description?: string) =>
      showToast({ type: 'destructive', title, description }),
    warning: (title: string, description?: string) =>
      showToast({ type: 'warning', title, description }),
    info: (title: string, description?: string) =>
      showToast({ type: 'info', title, description }),
  };
};
