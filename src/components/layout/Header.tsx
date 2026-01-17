'use client';

import { motion } from 'framer-motion';
import { Menu, Search, Moon, Sun, Bell, User, Settings, HelpCircle } from 'lucide-react';
import { useUIStore, useTheme, useResolvedTheme } from '@/stores';
import { cn } from '@/lib/utils';
import { Button, Badge } from '@/components/ui';

export function Header() {
  const { theme, setTheme, toggleMobileMenu } = useUIStore();
  const resolvedTheme = useResolvedTheme();

  const toggleTheme = () => {
    if (theme === 'light') setTheme('dark');
    else if (theme === 'dark') setTheme('system');
    else setTheme('light');
  };

  const ThemeIcon = resolvedTheme === 'dark' ? Moon : Sun;

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-14 items-center px-4 md:px-6">
        {/* Mobile Menu Toggle */}
        <Button
          variant="ghost"
          size="sm"
          className="md:hidden mr-2"
          onClick={toggleMobileMenu}
        >
          <Menu className="h-5 w-5" />
        </Button>

        {/* Logo */}
        <div className="flex items-center gap-2 mr-6">
          <motion.div
            className="h-8 w-8 rounded-lg bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <span className="text-lg font-bold text-primary-foreground">A</span>
          </motion.div>
          <div className="hidden sm:block">
            <h1 className="text-lg font-bold">ABS Investigator</h1>
            <p className="text-xs text-muted-foreground -mt-0.5">Securitization Research</p>
          </div>
        </div>

        {/* Search (Desktop) */}
        <div className="hidden md:flex flex-1 items-center max-w-md">
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search cases, trusts, or CUSIPs..."
              className="w-full h-9 pl-9 pr-4 rounded-md border bg-muted/50 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
          </div>
        </div>

        {/* Spacer */}
        <div className="flex-1" />

        {/* Right Actions */}
        <div className="flex items-center gap-1">
          {/* Notifications */}
          <Button variant="ghost" size="sm" className="relative">
            <Bell className="h-5 w-5" />
            <span className="absolute -top-0.5 -right-0.5 h-4 w-4 rounded-full bg-destructive text-[10px] font-bold text-destructive-foreground flex items-center justify-center">
              3
            </span>
          </Button>

          {/* Theme Toggle */}
          <Button variant="ghost" size="sm" onClick={toggleTheme}>
            <ThemeIcon className="h-5 w-5" />
          </Button>

          {/* Help */}
          <Button variant="ghost" size="sm" className="hidden sm:flex">
            <HelpCircle className="h-5 w-5" />
          </Button>

          {/* Settings */}
          <Button variant="ghost" size="sm" className="hidden sm:flex">
            <Settings className="h-5 w-5" />
          </Button>

          {/* User */}
          <Button variant="ghost" size="sm" className="ml-2">
            <div className="h-7 w-7 rounded-full bg-primary/10 flex items-center justify-center">
              <User className="h-4 w-4 text-primary" />
            </div>
          </Button>
        </div>
      </div>
    </header>
  );
}
