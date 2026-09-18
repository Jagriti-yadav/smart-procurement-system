import type { ReactNode } from 'react';
import { Sprout, Bell, ArrowLeft, LogOut, Home, Ticket, Truck, Wallet } from 'lucide-react';
import { useRouter, type Screen } from '@/store/Router';
import { useApp } from '@/store/AppContext';
import { cn } from '@/utils/cn';

interface NavItem {
  screen: Screen;
  label: string;
  icon: ReactNode;
}

const farmerNav: NavItem[] = [
  { screen: 'farmer-dashboard', label: 'Home', icon: <Home size={22} /> },
  { screen: 'farmer-notifications', label: 'Alerts', icon: <Bell size={22} /> },
];

export function FarmerLayout({ children, title, showBack }: { children: ReactNode; title?: string; showBack?: boolean }) {
  const { screen, navigate, goBack, canGoBack } = useRouter();
  const { currentFarmerId, farmers, logout, getFarmerNotifications } = useApp();
  const farmer = farmers.find((f) => f.id === currentFarmerId);
  const unreadCount = farmer ? getFarmerNotifications(farmer.id).filter((n) => !n.read).length : 0;

  const handleLogout = () => {
    logout();
    navigate('landing');
  };

  return (
    <div className="min-h-screen bg-neutral-50 flex flex-col">
      {/* Mobile header */}
      <header className="sticky top-0 z-30 bg-white border-b border-neutral-100 shadow-sm">
        <div className="flex items-center justify-between px-4 h-14">
          <div className="flex items-center gap-2">
            {showBack && canGoBack ? (
              <button onClick={goBack} className="p-2 -ml-2 text-neutral-600 hover:text-neutral-900">
                <ArrowLeft size={22} />
              </button>
            ) : (
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-primary-600 flex items-center justify-center">
                  <Sprout size={18} className="text-white" />
                </div>
                <span className="font-bold text-neutral-800 text-lg">KisanSetu</span>
              </div>
            )}
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => navigate('farmer-notifications')}
              className="relative p-2 text-neutral-600 hover:text-neutral-900"
            >
              <Bell size={22} />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                  {unreadCount}
                </span>
              )}
            </button>
            {farmer && (
              <button onClick={handleLogout} className="p-2 text-neutral-400 hover:text-red-600">
                <LogOut size={20} />
              </button>
            )}
          </div>
        </div>
        {title && (
          <div className="px-4 pb-3">
            <h1 className="text-xl font-bold text-neutral-800">{title}</h1>
          </div>
        )}
      </header>

      {/* Content */}
      <main className="flex-1 pb-20 max-w-md w-full mx-auto px-4 py-4">
        {children}
      </main>

      {/* Bottom nav */}
      {farmer && (
        <nav className="fixed bottom-0 left-0 right-0 z-30 bg-white border-t border-neutral-100 shadow-lg">
          <div className="max-w-md mx-auto flex">
            {farmerNav.map((item) => {
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
                  <div className="relative">
                    {item.icon}
                    {item.screen === 'farmer-notifications' && unreadCount > 0 && (
                      <span className="absolute -top-1 -right-1.5 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                        {unreadCount}
                      </span>
                    )}
                  </div>
                  <span className="text-xs font-medium">{item.label}</span>
                </button>
              );
            })}
          </div>
        </nav>
      )}
    </div>
  );
}
