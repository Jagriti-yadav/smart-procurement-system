import type { ReactNode } from 'react';
import { cn } from '@/utils/cn';
import type { BookingStatus, PaymentStatus, CentreStatus, SlotStatus, QualityGrade } from '@/types';

type BadgeColor = 'green' | 'blue' | 'amber' | 'red' | 'gray' | 'teal' | 'purple';

interface BadgeProps {
  children: ReactNode;
  color?: BadgeColor;
  size?: 'sm' | 'md';
  dot?: boolean;
  className?: string;
}

const colorMap: Record<BadgeColor, string> = {
  green: 'bg-primary-50 text-primary-700 border-primary-200',
  blue: 'bg-blue-50 text-blue-700 border-blue-200',
  amber: 'bg-amber-50 text-amber-700 border-amber-200',
  red: 'bg-red-50 text-red-700 border-red-200',
  gray: 'bg-neutral-100 text-neutral-600 border-neutral-200',
  teal: 'bg-teal-50 text-teal-700 border-teal-200',
  purple: 'bg-purple-50 text-purple-700 border-purple-200',
};

const dotColorMap: Record<BadgeColor, string> = {
  green: 'bg-primary-500',
  blue: 'bg-blue-500',
  amber: 'bg-amber-500',
  red: 'bg-red-500',
  gray: 'bg-neutral-400',
  teal: 'bg-teal-500',
  purple: 'bg-purple-500',
};

export function Badge({ children, color = 'gray', size = 'sm', dot, className }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 font-semibold rounded-full border',
        size === 'sm' ? 'text-xs px-2.5 py-1' : 'text-sm px-3 py-1.5',
        colorMap[color],
        className
      )}
    >
      {dot && <span className={cn('w-1.5 h-1.5 rounded-full', dotColorMap[color])} />}
      {children}
    </span>
  );
}

const bookingStatusColors: Record<BookingStatus, BadgeColor> = {
  booked: 'blue',
  in_queue: 'amber',
  called: 'purple',
  weighing: 'teal',
  quality_check: 'teal',
  procured: 'green',
  payment_processing: 'amber',
  paid: 'green',
  cancelled: 'red',
};

const bookingStatusLabels: Record<BookingStatus, string> = {
  booked: 'Booked',
  in_queue: 'In Queue',
  called: 'Token Called',
  weighing: 'Weighing',
  quality_check: 'Quality Check',
  procured: 'Procured',
  payment_processing: 'Payment Processing',
  paid: 'Paid',
  cancelled: 'Cancelled',
};

export function StatusBadge({ status, size }: { status: BookingStatus; size?: 'sm' | 'md' }) {
  return (
    <Badge color={bookingStatusColors[status]} size={size} dot>
      {bookingStatusLabels[status]}
    </Badge>
  );
}

const paymentColors: Record<PaymentStatus, BadgeColor> = {
  pending: 'gray',
  processing: 'amber',
  paid: 'green',
  failed: 'red',
};

const paymentLabels: Record<PaymentStatus, string> = {
  pending: 'Pending',
  processing: 'Processing',
  paid: 'Paid',
  failed: 'Failed',
};

export function PaymentBadge({ status }: { status: PaymentStatus }) {
  return (
    <Badge color={paymentColors[status]} dot>
      {paymentLabels[status]}
    </Badge>
  );
}

const centreColors: Record<CentreStatus, BadgeColor> = {
  open: 'green',
  closed: 'gray',
  maintenance: 'amber',
};

const centreLabels: Record<CentreStatus, string> = {
  open: 'Open',
  closed: 'Closed',
  maintenance: 'Maintenance',
};

export function CentreStatusBadge({ status }: { status: CentreStatus }) {
  return (
    <Badge color={centreColors[status]} dot>
      {centreLabels[status]}
    </Badge>
  );
}

const slotColors: Record<SlotStatus, BadgeColor> = {
  available: 'green',
  filling: 'amber',
  full: 'red',
  closed: 'gray',
};

const slotLabels: Record<SlotStatus, string> = {
  available: 'Available',
  filling: 'Filling Fast',
  full: 'Full',
  closed: 'Closed',
};

export function SlotBadge({ status }: { status: SlotStatus }) {
  return <Badge color={slotColors[status]}>{slotLabels[status]}</Badge>;
}

const gradeColors: Record<QualityGrade, BadgeColor> = {
  A: 'green',
  B: 'blue',
  C: 'amber',
  Rejected: 'red',
};

export function GradeBadge({ grade }: { grade: QualityGrade }) {
  return <Badge color={gradeColors[grade]}>Grade {grade}</Badge>;
}
