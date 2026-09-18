export type UserRole = 'farmer' | 'operator' | 'admin';

export type BookingStatus =
  | 'booked'
  | 'in_queue'
  | 'called'
  | 'weighing'
  | 'quality_check'
  | 'procured'
  | 'payment_processing'
  | 'paid'
  | 'cancelled';

export type CropType =
  | 'Wheat'
  | 'Rice'
  | 'Mustard'
  | 'Soybean'
  | 'Maize'
  | 'Cotton'
  | 'Groundnut'
  | 'Bajra';

export type QualityGrade = 'A' | 'B' | 'C' | 'Rejected';

export type PaymentMethod = 'DBT' | 'Cheque' | 'Cash';

export type PaymentStatus = 'pending' | 'processing' | 'paid' | 'failed';

export type SlotStatus = 'available' | 'filling' | 'full' | 'closed';

export type CentreStatus = 'open' | 'closed' | 'maintenance';

export interface ProcurementCentre {
  id: string;
  name: string;
  village: string;
  district: string;
  state: string;
  status: CentreStatus;
  capacityPerSlot: number;
  operatingHours: string;
  currentQueue: number;
  totalProcessedToday: number;
  totalPaymentToday: number;
  lat: number;
  lng: number;
  manager: string;
  phone: string;
  acceptingCrops: CropType[];
  todaysSlots: SlotSummary[];
}

export interface SlotSummary {
  id: string;
  time: string;
  totalCapacity: number;
  booked: number;
  status: SlotStatus;
}

export interface Farmer {
  id: string;
  name: string;
  phone: string;
  village: string;
  district: string;
  state: string;
  landHolding: number;
  registeredAt: string;
  bankAccount: string;
  bankName: string;
  ifsc: string;
}

export interface Booking {
  id: string;
  tokenNumber: string;
  farmerId: string;
  farmerName: string;
  farmerPhone: string;
  centreId: string;
  centreName: string;
  slotId: string;
  slotTime: string;
  date: string;
  crop: CropType;
  quantityQuintals: number;
  status: BookingStatus;
  qualityGrade?: QualityGrade;
  moisturePercent?: number;
  weighedQuantity?: number;
  ratePerQuintal?: number;
  totalAmount?: number;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  paymentRefNo?: string;
  paymentDate?: string;
  createdAt: string;
  queuePosition?: number;
  history: StatusEvent[];
}

export interface StatusEvent {
  status: BookingStatus;
  label: string;
  timestamp: string;
  note?: string;
}

export interface NotificationItem {
  id: string;
  farmerId: string;
  bookingId: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  read: boolean;
  createdAt: string;
}

export interface Operator {
  id: string;
  name: string;
  centreId: string;
  centreName: string;
  phone: string;
}

export interface Admin {
  id: string;
  name: string;
  phone: string;
  region: string;
}

export interface CropRate {
  crop: CropType;
  mspRate: number;
  marketRate: number;
  unit: string;
}

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  title: string;
  message?: string;
}
