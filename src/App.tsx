import { AppProvider, useApp } from '@/store/AppContext';
import { RouterProvider, useRouter } from '@/store/Router';
import { ToastContainer } from '@/components/ui/Toast';

import { LandingScreen } from '@/screens/LandingScreen';
import { LoginScreen } from '@/screens/LoginScreen';
import { RegisterScreen } from '@/screens/RegisterScreen';

import { FarmerDashboard } from '@/screens/farmer/FarmerDashboard';
import { CentreListScreen } from '@/screens/farmer/CentreListScreen';
import { SlotBookingScreen } from '@/screens/farmer/SlotBookingScreen';
import { TokenScreen } from '@/screens/farmer/TokenScreen';
import { QueueTrackingScreen } from '@/screens/farmer/QueueTrackingScreen';
import { ProcurementDetailScreen } from '@/screens/farmer/ProcurementDetailScreen';
import { PaymentDetailScreen } from '@/screens/farmer/PaymentDetailScreen';
import { FarmerNotificationsScreen } from '@/screens/farmer/FarmerNotificationsScreen';

import { OperatorDashboard } from '@/screens/operator/OperatorDashboard';
import { OperatorQueueScreen } from '@/screens/operator/OperatorQueueScreen';
import { OperatorProcessScreen } from '@/screens/operator/OperatorProcessScreen';

import { AdminDashboard } from '@/screens/admin/AdminDashboard';
import { AdminCentresScreen } from '@/screens/admin/AdminCentresScreen';
import { AdminReportsScreen } from '@/screens/admin/AdminReportsScreen';

function ScreenRouter() {
  const { screen } = useRouter();
  const { currentRole, currentFarmerId, currentOperatorId, isAdmin } = useApp();

  // Auth guard: redirect to login if not authenticated
  const isFarmerScreen = screen.startsWith('farmer-') || screen === 'centre-list' || screen === 'slot-booking' || screen === 'token' || screen === 'queue-tracking' || screen === 'procurement-detail' || screen === 'payment-detail';
  const isOperatorScreen = screen.startsWith('operator-');
  const isAdminScreen = screen.startsWith('admin-');

  if (isFarmerScreen && !currentFarmerId) return <LoginScreen />;
  if (isOperatorScreen && !currentOperatorId) return <LoginScreen />;
  if (isAdminScreen && !isAdmin) return <LoginScreen />;

  switch (screen) {
    case 'landing':
      return <LandingScreen />;
    case 'login':
      return <LoginScreen />;
    case 'register':
      return <RegisterScreen />;

    // Farmer
    case 'farmer-dashboard':
      return <FarmerDashboard />;
    case 'centre-list':
      return <CentreListScreen />;
    case 'slot-booking':
      return <SlotBookingScreen />;
    case 'token':
      return <TokenScreen />;
    case 'queue-tracking':
      return <QueueTrackingScreen />;
    case 'procurement-detail':
      return <ProcurementDetailScreen />;
    case 'payment-detail':
      return <PaymentDetailScreen />;
    case 'farmer-notifications':
      return <FarmerNotificationsScreen />;

    // Operator
    case 'operator-dashboard':
      return <OperatorDashboard />;
    case 'operator-queue':
      return <OperatorQueueScreen />;
    case 'operator-process':
      return <OperatorProcessScreen />;

    // Admin
    case 'admin-dashboard':
      return <AdminDashboard />;
    case 'admin-centres':
      return <AdminCentresScreen />;
    case 'admin-reports':
      return <AdminReportsScreen />;

    default:
      return <LandingScreen />;
  }
}

function AppContent() {
  return (
    <>
      <ScreenRouter />
      <ToastContainer />
    </>
  );
}

function App() {
  return (
    <AppProvider>
      <RouterProvider>
        <AppContent />
      </RouterProvider>
    </AppProvider>
  );
}

export default App;
