import type { ReactNode } from 'react';
import { Sprout, LogOut, LayoutDashboard, ListOrdered, Settings, BarChart3, ArrowLeft } from 'lucide-react';
import { useRouter, type Screen } from '@/store/Router';
import { useApp } from '@/store/AppContext';
import { cn } from '@/utils/cn';

interface NavItem {
  screen: Screen;
  label: string;
  icon: ReactNode;
}

interface DashboardLayoutProps {
  children: ReactNode;
  navItems: NavItem[];
  title: string;
  subtitle?: string;
  showBack?: boolean;
}

export function DashboardLayout({ children, navItems, title, subtitle, showBack }: DashboardLayoutProps) {
  const { screen, navigate, goBack, canGoBack } = useRouter();
  const { logout, currentOperatorId, operators, admin, isAdmin } = useApp();
  const operator = operators.find((o) => o.id === currentOperatorId);
  const userName = operator?.name ?? admin.name;
  const userRole = isAdmin ? 'Administrator' : 'Centre Operator';
  const userRegion = isAdmin ? admin.region : operator?.centreName;

  const handleLogout = () => {
    logout();
    navigate('landing');
  };

  return (
    <div className="min-h-screen bg-neutral-50 flex">
      {/* Sidebar */}
      <aside className="hidden lg:flex flex-col w-64 bg-white border-r border-neutral-100 fixed inset-y-0 left-0 z-30">
        <div className="flex items-center gap-2.5 px-5 h-16 border-b border-neutral-100">
          <div className="w-9 h-9 rounded-lg bg-primary-600 flex items-center justify-center">
            <Sprout size={20} className="text-white" />
          </div>
          <div>
            <span className="font-bold text-neutral-800 text-lg block leading-none">KisanSetu</span>
            <span className="text-xs text-neutral-400">Procurement System</span>
          </div>
        </div>

        <nav className="flex-1 p-3 space-y-1">
          {navItems.map((item) => {
            const isActive = screen === item.screen;
            return (
              <button
                key={item.screen}
                onClick={() => navigate(item.screen)}
                className={cn(
                  'w-full flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium text-sm transition-all',
                  isActive
                    ? 'bg-primary-50 text-primary-700'
                    : 'text-neutral-600 hover:bg-neutral-50'
                )}
              >
                {item.icon}
                {item.label}
              </button>
            );
          })}
        </nav>

        <div className="p-3 border-t border-neutral-100">
          <div className="px-3 py-2 mb-2">
            <p className="text-sm font-semibold text-neutral-700 truncate">{userName}</p>
            <p className="text-xs text-neutral-400">{userRole}</p>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium text-sm text-red-600 hover:bg-red-50 transition-colors"
          >
            <LogOut size={18} />
            Logout
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 lg:ml-64 flex flex-col min-h-screen">
        {/* Top bar */}
        <header className="sticky top-0 z-20 bg-white border-b border-neutral-100 h-16 flex items-center px-4 lg:px-8">
          {showBack && canGoBack && (
            <button onClick={goBack} className="mr-3 p-2 -ml-2 text-neutral-600 hover:text-neutral-900 lg:hidden">
              <ArrowLeft size={22} />
            </button>
          )}
          <div className="flex-1 min-w-0">
            <h1 className="text-lg font-bold text-neutral-800 truncate">{title}</h1>
            {subtitle && <p className="text-sm text-neutral-400 truncate hidden sm:block">{subtitle}</p>}
          </div>
          <div className="flex items-center gap-3">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-semibold text-neutral-700">{userName}</p>
              <p className="text-xs text-neutral-400">{userRegion}</p>
            </div>
            <div className="w-9 h-9 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-bold text-sm">
              {userName.charAt(0)}
            </div>
            <button
              onClick={handleLogout}
              className="lg:hidden p-2 text-neutral-400 hover:text-red-600 transition-colors"
              title="Logout"
            >
              <LogOut size={20} />
            </button>
          </div>
        </header>

        <main className="flex-1 p-4 lg:p-8">
          {children}
        </main>

        {/* Mobile bottom nav */}
        <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-30 bg-white border-t border-neutral-100 shadow-lg">
          <div className="flex">
            {navItems.map((item) => {
              const isActive = screen === item.screen;
              return (
                <button
                  key={item.screen}
                  onClick={() => navigate(item.screen)}
                  className={cn(
                    'flex-1 flex flex-col items-center gap-1 py-2.5 transition-colors',
                    isActive ? 'text-primary-600' : 'text-neutral-400'
                  )}
                >
                  {item.icon}
                  <span className="text-xs font-medium">{item.label}</span>
                </button>
              );
            })}
          </div>
        </nav>
        <div className="lg:hidden h-14" />
      </div>
    </div>
  );
}

export function getOperatorNav(): NavItem[] {
  return [
    { screen: 'operator-dashboard', label: 'Dashboard', icon: <LayoutDashboard size={18} /> },
    { screen: 'operator-queue', label: 'Queue', icon: <ListOrdered size={18} /> },
    { screen: 'operator-process', label: 'Process', icon: <Settings size={18} /> },
  ];
}

export function getAdminNav(): NavItem[] {
  return [
    { screen: 'admin-dashboard', label: 'Dashboard', icon: <LayoutDashboard size={18} /> },
    { screen: 'admin-centres', label: 'Centres', icon: <Settings size={18} /> },
    { screen: 'admin-reports', label: 'Reports', icon: <BarChart3 size={18} /> },
  ];
}
