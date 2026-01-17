'use client';

import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  FolderOpen,
  Building2,
  BarChart3,
  FileText,
  Settings,
  HelpCircle,
  ChevronLeft,
  ChevronRight,
  X,
} from 'lucide-react';
import { useUIStore, useSidebarOpen, useCases } from '@/stores';
import { cn } from '@/lib/utils';
import { Button, Badge } from '@/components/ui';

type View = 'investigation' | 'cases' | 'case-detail' | 'entity-lookup';

interface SidebarProps {
  currentView: View;
  onViewChange: (view: View) => void;
}

const navItems = [
  {
    id: 'investigation',
    label: 'New Investigation',
    icon: Search,
    description: 'Start a new securitization search',
  },
  {
    id: 'entity-lookup',
    label: 'Entity Lookup',
    icon: Building2,
    description: 'Search by LEI/GMEI for entities',
  },
  {
    id: 'cases',
    label: 'My Cases',
    icon: FolderOpen,
    description: 'View and manage saved cases',
    badge: true,
  },
];

const bottomItems = [
  { id: 'settings', label: 'Settings', icon: Settings },
  { id: 'help', label: 'Help & Support', icon: HelpCircle },
];

export function Sidebar({ currentView, onViewChange }: SidebarProps) {
  const { sidebarOpen, setSidebarOpen, mobileMenuOpen, setMobileMenuOpen } = useUIStore();
  const cases = useCases();

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Navigation */}
      <nav className="flex-1 p-3 space-y-1">
        <p className="px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
          {sidebarOpen ? 'Navigation' : ''}
        </p>
        {navItems.map((item) => {
          const isActive = currentView === item.id || (item.id === 'cases' && currentView === 'case-detail');
          return (
            <motion.button
              key={item.id}
              onClick={() => onViewChange(item.id as View)}
              className={cn(
                'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors',
                isActive
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground'
              )}
              whileHover={{ x: 2 }}
              whileTap={{ scale: 0.98 }}
            >
              <item.icon className={cn('h-5 w-5 flex-shrink-0', !sidebarOpen && 'mx-auto')} />
              {sidebarOpen && (
                <>
                  <span className="flex-1 text-left">{item.label}</span>
                  {item.badge && cases.length > 0 && (
                    <Badge
                      variant={isActive ? 'secondary' : 'default'}
                      className="text-xs"
                    >
                      {cases.length}
                    </Badge>
                  )}
                </>
              )}
            </motion.button>
          );
        })}
      </nav>

      {/* Bottom Items */}
      <div className="p-3 border-t space-y-1">
        {bottomItems.map((item) => (
          <button
            key={item.id}
            className={cn(
              'w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-muted-foreground hover:bg-muted hover:text-foreground transition-colors'
            )}
          >
            <item.icon className={cn('h-5 w-5 flex-shrink-0', !sidebarOpen && 'mx-auto')} />
            {sidebarOpen && <span>{item.label}</span>}
          </button>
        ))}
      </div>

      {/* Collapse Button */}
      <div className="p-3 border-t hidden md:block">
        <Button
          variant="ghost"
          size="sm"
          className="w-full justify-center"
          onClick={() => setSidebarOpen(!sidebarOpen)}
        >
          {sidebarOpen ? (
            <>
              <ChevronLeft className="h-4 w-4 mr-2" />
              Collapse
            </>
          ) : (
            <ChevronRight className="h-4 w-4" />
          )}
        </Button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <motion.aside
        className={cn(
          'hidden md:flex flex-col border-r bg-card h-[calc(100vh-3.5rem)] sticky top-14',
          sidebarOpen ? 'w-64' : 'w-16'
        )}
        animate={{ width: sidebarOpen ? 256 : 64 }}
        transition={{ duration: 0.2 }}
      >
        <SidebarContent />
      </motion.aside>

      {/* Mobile Sidebar */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              className="fixed inset-0 z-40 bg-black/50 md:hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileMenuOpen(false)}
            />

            {/* Sidebar */}
            <motion.aside
              className="fixed left-0 top-0 z-50 w-72 h-full bg-card border-r md:hidden"
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            >
              <div className="flex items-center justify-between p-4 border-b">
                <div className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center">
                    <span className="text-lg font-bold text-primary-foreground">A</span>
                  </div>
                  <span className="font-bold">ABS Investigator</span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>
              <div className="h-[calc(100%-4rem)]">
                <SidebarContent />
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
