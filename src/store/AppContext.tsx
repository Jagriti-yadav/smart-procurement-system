import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from 'react';
import type {
  ProcurementCentre,
  Farmer,
  Booking,
  NotificationItem,
  Operator,
  Admin,
  UserRole,
  BookingStatus,
  ToastMessage,
  CropType,
  CropType as CT,
  SlotSummary,
  SlotStatus,
  StatusEvent,
} from '../types';
import {
  seedCentres,
  seedFarmers,
  seedBookings,
  seedNotifications,
  seedOperators,
  seedAdmin,
} from '../data/seed';

const STORAGE_KEY = 'kisansetu_app_state_v1';

interface AppState {
  farmers: Farmer[];
  centres: ProcurementCentre[];
  bookings: Booking[];
  notifications: NotificationItem[];
  operators: Operator[];
  admin: Admin;
  currentRole: UserRole | null;
  currentFarmerId: string | null;
  currentOperatorId: string | null;
  isAdmin: boolean;
}

interface AppContextValue extends AppState {
  login: (role: UserRole, phone: string) => boolean;
  logout: () => void;
  registerFarmer: (data: Omit<Farmer, 'id' | 'registeredAt'>) => Farmer;
  bookSlot: (booking: {
    farmerId: string;
    centreId: string;
    slotId: string;
    crop: CropType;
    quantityQuintals: number;
  }) => Booking;
  getBooking: (id: string) => Booking | undefined;
  getFarmerBookings: (farmerId: string) => Booking[];
  getFarmerNotifications: (farmerId: string) => NotificationItem[];
  markNotificationRead: (id: string) => void;
  advanceBookingStatus: (bookingId: string, operatorNote?: string) => void;
  setQualityAndWeight: (
    bookingId: string,
    grade: 'A' | 'B' | 'C' | 'Rejected',
    moisture: number,
    weighedQty: number,
    ratePerQuintal: number
  ) => void;
  processPayment: (bookingId: string) => void;
  cancelBooking: (bookingId: string) => void;
  updateCentre: (centreId: string, updates: Partial<ProcurementCentre>) => void;
  toasts: ToastMessage[];
  showToast: (type: ToastMessage['type'], title: string, message?: string) => void;
  dismissToast: (id: string) => void;
}

const AppContext = createContext<AppContextValue | null>(null);

function loadState(): AppState | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as AppState;
  } catch {
    return null;
  }
}

function saveState(state: AppState) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // ignore
  }
}

const initialState: AppState = {
  farmers: seedFarmers,
  centres: seedCentres,
  bookings: seedBookings,
  notifications: seedNotifications,
  operators: seedOperators,
  admin: seedAdmin,
  currentRole: null,
  currentFarmerId: null,
  currentOperatorId: null,
  isAdmin: false,
};

let tokenCounter = 6;

const bookingStatusFlow: BookingStatus[] = [
  'booked',
  'in_queue',
  'called',
  'weighing',
  'quality_check',
  'procured',
  'payment_processing',
  'paid',
];

const statusLabels: Record<BookingStatus, string> = {
  booked: 'Slot Booked',
  in_queue: 'In Queue',
  called: 'Token Called',
  weighing: 'Weighing',
  quality_check: 'Quality Check',
  procured: 'Procured',
  payment_processing: 'Payment Processing',
  paid: 'Payment Completed',
  cancelled: 'Cancelled',
};

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AppState>(() => {
    const saved = loadState();
    return saved ?? initialState;
  });

  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  useEffect(() => {
    saveState(state);
  }, [state]);

  const showToast = useCallback((type: ToastMessage['type'], title: string, message?: string) => {
    const id = `toast_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
    setToasts((prev) => [...prev, { id, type, title, message }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  }, []);

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const login = useCallback((role: UserRole, phone: string): boolean => {
    if (role === 'farmer') {
      const farmer = state.farmers.find((f) => f.phone === phone);
      if (farmer) {
        setState((s) => ({ ...s, currentRole: 'farmer', currentFarmerId: farmer.id }));
        showToast('success', 'Login Successful', `Welcome, ${farmer.name}`);
        return true;
      }
      showToast('error', 'Login Failed', 'No farmer found with this phone number');
      return false;
    }
    if (role === 'operator') {
      const op = state.operators.find((o) => o.phone === phone);
      if (op) {
        setState((s) => ({ ...s, currentRole: 'operator', currentOperatorId: op.id }));
        showToast('success', 'Login Successful', `Welcome, ${op.name}`);
        return true;
      }
      showToast('error', 'Login Failed', 'No operator found with this phone number');
      return false;
    }
    if (role === 'admin') {
      if (phone === state.admin.phone) {
        setState((s) => ({ ...s, currentRole: 'admin', isAdmin: true }));
        showToast('success', 'Login Successful', `Welcome, ${state.admin.name}`);
        return true;
      }
      showToast('error', 'Login Failed', 'Invalid admin credentials');
      return false;
    }
    return false;
  }, [state.farmers, state.operators, state.admin, showToast]);

  const logout = useCallback(() => {
    setState((s) => ({
      ...s,
      currentRole: null,
      currentFarmerId: null,
      currentOperatorId: null,
      isAdmin: false,
    }));
  }, []);

  const registerFarmer = useCallback((data: Omit<Farmer, 'id' | 'registeredAt'>): Farmer => {
    const id = `f${String(state.farmers.length + 1).padStart(3, '0')}`;
    const farmer: Farmer = {
      ...data,
      id,
      registeredAt: new Date().toISOString(),
    };
    setState((s) => ({ ...s, farmers: [...s.farmers, farmer] }));
    showToast('success', 'Registration Successful', `Farmer ID: ${id}`);
    return farmer;
  }, [state.farmers.length, showToast]);

  const bookSlot = useCallback((input: {
    farmerId: string;
    centreId: string;
    slotId: string;
    crop: CropType;
    quantityQuintals: number;
  }): Booking => {
    const centre = state.centres.find((c) => c.id === input.centreId);
    const farmer = state.farmers.find((f) => f.id === input.farmerId);
    const slot = centre?.todaysSlots.find((s) => s.id === input.slotId);
    const tokenNumber = `KS-2026-${String(tokenCounter++).padStart(4, '0')}`;
    const today = new Date().toISOString().split('T')[0];

    const booking: Booking = {
      id: `b${String(state.bookings.length + 1).padStart(3, '0')}`,
      tokenNumber,
      farmerId: input.farmerId,
      farmerName: farmer?.name ?? '',
      farmerPhone: farmer?.phone ?? '',
      centreId: input.centreId,
      centreName: centre?.name ?? '',
      slotId: input.slotId,
      slotTime: slot?.time ?? '',
      date: today,
      crop: input.crop,
      quantityQuintals: input.quantityQuintals,
      status: 'booked',
      paymentMethod: 'DBT',
      paymentStatus: 'pending',
      createdAt: new Date().toISOString(),
      queuePosition: (slot?.booked ?? 0) + 1,
      history: [
        {
          status: 'booked',
          label: 'Slot Booked',
          timestamp: new Date().toISOString(),
          note: `Token ${tokenNumber} generated for ${slot?.time}`,
        },
      ],
    };

    // Update slot booked count
    const updatedCentres = state.centres.map((c) => {
      if (c.id !== input.centreId) return c;
      return {
        ...c,
        todaysSlots: c.todaysSlots.map((s) => {
          if (s.id !== input.slotId) return s;
          const newBooked = s.booked + 1;
          return {
            ...s,
            booked: newBooked,
            status: newBooked >= s.totalCapacity ? 'full' as SlotStatus : 'filling' as SlotStatus,
          };
        }),
        currentQueue: c.currentQueue + 1,
      };
    });

    const notification: NotificationItem = {
      id: `n${Date.now()}`,
      farmerId: input.farmerId,
      bookingId: booking.id,
      title: 'Token Generated',
      message: `Your token ${tokenNumber} for ${centre?.name} (${slot?.time}) has been booked. Crop: ${input.crop}, Qty: ${input.quantityQuintals} quintals.`,
      type: 'success',
      read: false,
      createdAt: new Date().toISOString(),
    };

    setState((s) => ({
      ...s,
      bookings: [...s.bookings, booking],
      centres: updatedCentres,
      notifications: [notification, ...s.notifications],
    }));

    showToast('success', 'Slot Booked!', `Token ${tokenNumber} generated`);
    return booking;
  }, [state.centres, state.farmers, state.bookings, showToast]);

  const getBooking = useCallback((id: string) => state.bookings.find((b) => b.id === id), [state.bookings]);

  const getFarmerBookings = useCallback((farmerId: string) =>
    state.bookings.filter((b) => b.farmerId === farmerId).sort((a, b) =>
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    ), [state.bookings]);

  const getFarmerNotifications = useCallback((farmerId: string) =>
    state.notifications.filter((n) => n.farmerId === farmerId).sort((a, b) =>
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    ), [state.notifications]);

  const markNotificationRead = useCallback((id: string) => {
    setState((s) => ({
      ...s,
      notifications: s.notifications.map((n) => n.id === id ? { ...n, read: true } : n),
    }));
  }, []);

  const advanceBookingStatus = useCallback((bookingId: string, operatorNote?: string) => {
    setState((s) => {
      const booking = s.bookings.find((b) => b.id === bookingId);
      if (!booking) return s;
      const currentIdx = bookingStatusFlow.indexOf(booking.status);
      if (currentIdx < 0 || currentIdx >= bookingStatusFlow.length - 1) return s;
      const nextStatus = bookingStatusFlow[currentIdx + 1];
      const event: StatusEvent = {
        status: nextStatus,
        label: statusLabels[nextStatus],
        timestamp: new Date().toISOString(),
        note: operatorNote,
      };

      const updatedBookings = s.bookings.map((b) =>
        b.id === bookingId
          ? {
              ...b,
              status: nextStatus,
              queuePosition: nextStatus === 'called' ? undefined : b.queuePosition,
              paymentStatus: nextStatus === 'payment_processing' ? 'processing' as const : b.paymentStatus,
              history: [...b.history, event],
            }
          : b
      );

      // Update centre queue count when status changes
      const updatedCentres = s.centres.map((c) => {
        if (c.id !== booking.centreId) return c;
        const shouldDecrement = ['procured', 'payment_processing', 'paid'].includes(nextStatus);
        return shouldDecrement && c.currentQueue > 0
          ? { ...c, currentQueue: c.currentQueue - 1, totalProcessedToday: nextStatus === 'procured' ? c.totalProcessedToday + 1 : c.totalProcessedToday }
          : c;
      });

      // Add notification
      const notif: NotificationItem = {
        id: `n${Date.now()}`,
        farmerId: booking.farmerId,
        bookingId,
        title: statusLabels[nextStatus],
        message: operatorNote ?? `Your procurement status has been updated to: ${statusLabels[nextStatus]}`,
        type: nextStatus === 'paid' ? 'success' : nextStatus === 'called' ? 'warning' : 'info',
        read: false,
        createdAt: new Date().toISOString(),
      };

      return {
        ...s,
        bookings: updatedBookings,
        centres: updatedCentres,
        notifications: [notif, ...s.notifications],
      };
    });

    const booking = state.bookings.find((b) => b.id === bookingId);
    if (booking) {
      const currentIdx = bookingStatusFlow.indexOf(booking.status);
      const nextStatus = bookingStatusFlow[currentIdx + 1];
      if (nextStatus) showToast('info', statusLabels[nextStatus], `Token ${booking.tokenNumber} updated`);
    }
  }, [state.bookings, showToast]);

  const setQualityAndWeight = useCallback((
    bookingId: string,
    grade: 'A' | 'B' | 'C' | 'Rejected',
    moisture: number,
    weighedQty: number,
    ratePerQuintal: number
  ) => {
    setState((s) => {
      const booking = s.bookings.find((b) => b.id === bookingId);
      if (!booking) return s;
      const totalAmount = Math.round(weighedQty * ratePerQuintal);
      const event: StatusEvent = {
        status: 'quality_check',
        label: 'Quality Assessed',
        timestamp: new Date().toISOString(),
        note: `Grade ${grade} – Moisture ${moisture}% – Weight ${weighedQty} q – Rate ₹${ratePerQuintal}/q`,
      };
      return {
        ...s,
        bookings: s.bookings.map((b) =>
          b.id === bookingId
            ? {
                ...b,
                qualityGrade: grade,
                moisturePercent: moisture,
                weighedQuantity: weighedQty,
                ratePerQuintal,
                totalAmount,
                history: [...b.history, event],
              }
            : b
        ),
      };
    });
    showToast('success', 'Quality Assessed', 'Weight and quality recorded');
  }, [state.bookings, showToast]);

  const processPayment = useCallback((bookingId: string) => {
    setState((s) => {
      const booking = s.bookings.find((b) => b.id === bookingId);
      if (!booking) return s;
      const refNo = `DBT${new Date().toISOString().slice(0, 10).replace(/-/g, '')}X${Math.floor(Math.random() * 9000 + 1000)}`;
      const event: StatusEvent = {
        status: 'paid',
        label: 'Payment Completed',
        timestamp: new Date().toISOString(),
        note: `₹${booking.totalAmount?.toLocaleString('en-IN')} credited via DBT. Ref: ${refNo}`,
      };
      const notif: NotificationItem = {
        id: `n${Date.now()}`,
        farmerId: booking.farmerId,
        bookingId,
        title: 'Payment Received',
        message: `₹${booking.totalAmount?.toLocaleString('en-IN')} has been credited to your bank account via DBT. Ref: ${refNo}`,
        type: 'success',
        read: false,
        createdAt: new Date().toISOString(),
      };

      // Update centre payment total
      const updatedCentres = s.centres.map((c) =>
        c.id === booking.centreId
          ? { ...c, totalPaymentToday: c.totalPaymentToday + (booking.totalAmount ?? 0) }
          : c
      );

      return {
        ...s,
        bookings: s.bookings.map((b) =>
          b.id === bookingId
            ? {
                ...b,
                status: 'paid',
                paymentStatus: 'paid',
                paymentRefNo: refNo,
                paymentDate: new Date().toISOString(),
                history: [...b.history, event],
              }
            : b
        ),
        centres: updatedCentres,
        notifications: [notif, ...s.notifications],
      };
    });
    showToast('success', 'Payment Processed', 'DBT payment completed');
  }, [state.bookings, showToast]);

  const cancelBooking = useCallback((bookingId: string) => {
    setState((s) => {
      const booking = s.bookings.find((b) => b.id === bookingId);
      if (!booking) return s;
      const event: StatusEvent = {
        status: 'cancelled',
        label: 'Cancelled',
        timestamp: new Date().toISOString(),
        note: 'Booking cancelled by user',
      };
      // Free up the slot
      const updatedCentres = s.centres.map((c) => {
        if (c.id !== booking.centreId) return c;
        return {
          ...c,
          currentQueue: Math.max(0, c.currentQueue - 1),
          todaysSlots: c.todaysSlots.map((sl) => {
            if (sl.id !== booking.slotId) return sl;
            return {
              ...sl,
              booked: Math.max(0, sl.booked - 1),
              status: sl.booked - 1 <= 0 ? 'available' as SlotStatus : 'filling' as SlotStatus,
            };
          }),
        };
      });
      return {
        ...s,
        bookings: s.bookings.map((b) =>
          b.id === bookingId
            ? { ...b, status: 'cancelled', history: [...b.history, event] }
            : b
        ),
        centres: updatedCentres,
      };
    });
    showToast('info', 'Booking Cancelled', 'Your slot has been released');
  }, [state.bookings, showToast]);

  const updateCentre = useCallback((centreId: string, updates: Partial<ProcurementCentre>) => {
    setState((s) => ({
      ...s,
      centres: s.centres.map((c) => c.id === centreId ? { ...c, ...updates } : c),
    }));
    showToast('success', 'Centre Updated', 'Procurement centre settings saved');
  }, [showToast]);

  const value: AppContextValue = {
    ...state,
    login,
    logout,
    registerFarmer,
    bookSlot,
    getBooking,
    getFarmerBookings,
    getFarmerNotifications,
    markNotificationRead,
    advanceBookingStatus,
    setQualityAndWeight,
    processPayment,
    cancelBooking,
    updateCentre,
    toasts,
    showToast,
    dismissToast,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}

export { statusLabels, bookingStatusFlow };
export type { CT };
