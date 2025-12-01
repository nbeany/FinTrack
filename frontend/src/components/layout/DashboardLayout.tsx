import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  ArrowLeftRight,
  TrendingUp,
  Wallet,
  User,
  LogOut,
  Menu,
  X,
  ChevronRight,
  Shield,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/ThemeToggle';

interface NavItem {
  label: string;
  href: string;
  icon: React.ElementType;
}

const getNavItems = (isAdmin: boolean): NavItem[] => {
  const items: NavItem[] = [
    { label: 'Dashboard', href: '/', icon: LayoutDashboard },
    { label: 'Transactions', href: '/transactions', icon: ArrowLeftRight },
    { label: 'Investments', href: '/investments', icon: TrendingUp },
    { label: 'Budgets', href: '/budgets', icon: Wallet },
    { label: 'Profile', href: '/profile', icon: User },
  ];
  
  if (isAdmin) {
    items.push({ label: 'Admin', href: '/admin', icon: Shield });
  }
  
  return items;
};

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout, isAdmin } = useAuth();

  const handleLogout = async () => {
    await logout();
    navigate('/auth');
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile Header */}
      <header className="lg:hidden fixed top-0 left-0 right-0 z-50 h-16 border-b border-border bg-background/95 backdrop-blur-lg">
        <div className="flex items-center justify-between h-full px-4">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center shadow-glow">
              <Wallet className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="font-bold text-lg">FinTrack</span>
          </Link>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </header>

      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 lg:hidden"
              onClick={() => setSidebarOpen(false)}
            />
            <motion.aside
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed left-0 top-0 bottom-0 w-[280px] bg-sidebar border-r border-sidebar-border z-50 lg:hidden"
            >
              <SidebarContent
                user={user}
                onLogout={handleLogout}
                onClose={() => setSidebarOpen(false)}
                currentPath={location.pathname}
                isAdmin={isAdmin}
              />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Desktop Sidebar */}
      <aside className="hidden lg:fixed lg:left-0 lg:top-0 lg:bottom-0 lg:flex lg:w-[280px] border-r border-sidebar-border bg-sidebar">
        <SidebarContent
          user={user}
          onLogout={handleLogout}
          currentPath={location.pathname}
          isAdmin={isAdmin}
        />
      </aside>

      {/* Main Content */}
      <main className="lg:ml-[280px] pt-16 lg:pt-0 min-h-screen">
        <div className="p-4 lg:p-8">{children}</div>
      </main>
    </div>
  );
}

interface SidebarContentProps {
  user: { name?: string; email?: string } | null;
  onLogout: () => void;
  onClose?: () => void;
  currentPath: string;
  isAdmin: boolean;
}

function SidebarContent({ user, onLogout, onClose, currentPath, isAdmin }: SidebarContentProps) {
  const navItems = getNavItems(isAdmin);
  
  return (
    <div className="flex flex-col h-full w-full">
      {/* Logo */}
      <div className="flex items-center justify-between h-16 px-6 border-b border-sidebar-border">
        <Link to="/" className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center shadow-glow">
            <Wallet className="w-6 h-6 text-primary-foreground" />
          </div>
          <span className="font-bold text-xl">FinTrack</span>
        </Link>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          {onClose && (
            <Button variant="ghost" size="icon" onClick={onClose} className="lg:hidden">
              <X className="w-5 h-5" />
            </Button>
          )}
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1">
        {navItems.map((item) => {
          const isActive = currentPath === item.href;
          return (
            <Link
              key={item.href}
              to={item.href}
              onClick={onClose}
              className={cn(
                'flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 group',
                isActive
                  ? 'bg-primary/10 text-primary'
                  : 'text-sidebar-foreground hover:bg-sidebar-accent'
              )}
            >
              <item.icon
                className={cn(
                  'w-5 h-5 transition-colors',
                  isActive ? 'text-primary' : 'text-muted-foreground group-hover:text-foreground'
                )}
              />
              <span className="flex-1 font-medium">{item.label}</span>
              {isActive && (
                <ChevronRight className="w-4 h-4 text-primary" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* User Section */}
      <div className="p-4 border-t border-sidebar-border">
        {user && (
          <div className="flex items-center gap-3 px-4 py-3 rounded-lg bg-sidebar-accent mb-3">
            <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
              <span className="text-sm font-semibold text-primary">
                {(user.name || user.email || 'U').charAt(0).toUpperCase()}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-sm truncate">{user.name || 'User'}</p>
              <p className="text-xs text-muted-foreground truncate">{user.email || ''}</p>
            </div>
          </div>
        )}
        <Button
          variant="ghost"
          className="w-full justify-start gap-3 text-muted-foreground hover:text-destructive"
          onClick={onLogout}
        >
          <LogOut className="w-5 h-5" />
          Sign Out
        </Button>
      </div>
    </div>
  );
}
