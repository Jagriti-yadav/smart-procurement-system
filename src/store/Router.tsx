import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';

type Screen =
  | 'landing'
  | 'login'
  | 'register'
  // Farmer
  | 'farmer-dashboard'
  | 'centre-list'
  | 'slot-booking'
  | 'token'
  | 'queue-tracking'
  | 'procurement-detail'
  | 'payment-detail'
  | 'farmer-notifications'
  // Operator
  | 'operator-dashboard'
  | 'operator-queue'
  | 'operator-process'
  // Admin
  | 'admin-dashboard'
  | 'admin-centres'
  | 'admin-reports';

interface RouterValue {
  screen: Screen;
  params: Record<string, string>;
  navigate: (screen: Screen, params?: Record<string, string>) => void;
  goBack: () => void;
  canGoBack: boolean;
}

interface HistoryEntry {
  screen: Screen;
  params: Record<string, string>;
}

const RouterContext = createContext<RouterValue | null>(null);

export function RouterProvider({ children }: { children: ReactNode }) {
  const [history, setHistory] = useState<HistoryEntry[]>([{ screen: 'landing', params: {} }]);

  const current = history[history.length - 1];

  const navigate = useCallback((screen: Screen, params: Record<string, string> = {}) => {
    setHistory((h) => [...h, { screen, params }]);
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, []);

  const goBack = useCallback(() => {
    setHistory((h) => (h.length > 1 ? h.slice(0, -1) : h));
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, []);

  const value: RouterValue = {
    screen: current.screen,
    params: current.params,
    navigate,
    goBack,
    canGoBack: history.length > 1,
  };

  return <RouterContext.Provider value={value}>{children}</RouterContext.Provider>;
}

export function useRouter() {
  const ctx = useContext(RouterContext);
  if (!ctx) throw new Error('useRouter must be used within RouterProvider');
  return ctx;
}

export type { Screen };
