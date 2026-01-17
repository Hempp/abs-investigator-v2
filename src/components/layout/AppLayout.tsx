'use client';

import { useEffect, ReactNode } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useUIStore, useSidebarOpen } from '@/stores';
import { cn } from '@/lib/utils';
import { Header } from './Header';
import { Sidebar } from './Sidebar';
import { Toaster } from './Toaster';

type View = 'investigation' | 'cases' | 'case-detail' | 'entity-lookup';

interface AppLayoutProps {
  children: ReactNode;
  currentView: View;
  onViewChange: (view: View) => void;
}

export function AppLayout({ children, currentView, onViewChange }: AppLayoutProps) {
  const sidebarOpen = useSidebarOpen();
  const { theme, setResolvedTheme } = useUIStore();

  // Handle system theme changes
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

    const handleChange = (e: MediaQueryListEvent | MediaQueryList) => {
      if (theme === 'system') {
        const newTheme = e.matches ? 'dark' : 'light';
        document.documentElement.classList.remove('light', 'dark');
        document.documentElement.classList.add(newTheme);
        setResolvedTheme(newTheme);
      }
    };

    handleChange(mediaQuery);
    mediaQuery.addEventListener('change', handleChange);

    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [theme, setResolvedTheme]);

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <div className="flex">
        <Sidebar currentView={currentView} onViewChange={onViewChange} />

        <main
          className={cn(
            'flex-1 p-4 md:p-6 lg:p-8 min-h-[calc(100vh-3.5rem)]',
            'transition-all duration-200'
          )}
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={currentView}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>

      <Toaster />
    </div>
  );
}
