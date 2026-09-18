import { Ticket, MapPin, Clock, Wheat, Scale, FlaskConical, Banknote, CheckCircle2, ArrowRight, X, History } from 'lucide-react';
import { FarmerLayout } from '@/components/layouts/FarmerLayout';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { StatusBadge, PaymentBadge, GradeBadge } from '@/components/ui/Badge';
import { ConfirmDialog } from '@/components/ui/Modal';
import { useApp, statusLabels } from '@/store/AppContext';
import { useRouter } from '@/store/Router';
import { useState } from 'react';
import type { BookingStatus } from '@/types';

export function ProcurementDetailScreen() {
  const { params, navigate } = useRouter();
  const { getBooking, cancelBooking } = useApp();
  const [cancelOpen, setCancelOpen] = useState(false);
  const booking = getBooking(params.bookingId);

  if (!booking) return null;

  const isCompleted = booking.status === 'paid';
  const isCancelled = booking.status === 'cancelled';
  const canCancel = ['booked', 'in_queue'].includes(booking.status);
  const showPayment = ['procured', 'payment_processing', 'paid'].includes(booking.status);

  return (
    <FarmerLayout title="Procurement Details" showBack>
      {/* Token header */}
      <Card className="mb-4 overflow-hidden">
        <div className="bg-gradient-to-r from-primary-600 to-primary-700 p-5 text-white">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Ticket size={20} className="text-white/80" />
              <span className="text-lg font-bold tracking-wide">{booking.tokenNumber}</span>
            </div>
            <StatusBadge status={booking.status} size="md" />
          </div>
          <p className="text-white/80 text-sm">{booking.centreName}</p>
        </div>
        <div className="p-4 space-y-3">
          <DetailRow icon={<Wheat size={16} />} label="Crop" value={`${booking.crop} · ${booking.quantityQuintals} quintals`} />
          <DetailRow icon={<MapPin size={16} />} label="Centre" value={booking.centreName} />
          <DetailRow icon={<Clock size={16} />} label="Time Slot" value={booking.slotTime} />
          {booking.queuePosition !== undefined && (
            <DetailRow icon={<Ticket size={16} />} label="Queue Position" value={`#${booking.queuePosition}`} />
          )}
        </div>
      </Card>

      {/* Quality & Weight results */}
      {booking.qualityGrade && (
        <Card className="mb-4 animate-slide-up">
          <div className="p-5">
            <h3 className="font-bold text-neutral-800 mb-4 flex items-center gap-2">
              <Scale size={18} className="text-primary-600" />
              Weighing & Quality Results
            </h3>
            <div className="grid grid-cols-2 gap-3">
              <ResultCard icon={<Scale size={16} />} label="Actual Weight" value={`${booking.weighedQuantity} q`} />
              <ResultCard icon={<FlaskConical size={16} />} label="Moisture" value={`${booking.moisturePercent}%`} />
              <ResultCard icon={<CheckCircle2 size={16} />} label="Quality Grade" value={<GradeBadge grade={booking.qualityGrade!} />} />
              <ResultCard icon={<Banknote size={16} />} label="Rate" value={`₹${booking.ratePerQuintal}/q`} />
            </div>
            {booking.totalAmount && (
              <div className="mt-4 bg-primary-50 rounded-xl p-4 text-center">
                <p className="text-sm text-primary-700">Total Procurement Value</p>
                <p className="text-2xl font-bold text-primary-700 mt-1">
                  ₹{booking.totalAmount.toLocaleString('en-IN')}
                </p>
              </div>
            )}
          </div>
        </Card>
      )}

      {/* Payment section */}
      {showPayment && (
        <Card className="mb-4 animate-slide-up">
          <div className="p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-neutral-800 flex items-center gap-2">
                <Banknote size={18} className="text-primary-600" />
                Payment Details
              </h3>
              <PaymentBadge status={booking.paymentStatus} />
            </div>
            <div className="space-y-3">
              <DetailRow icon={<Banknote size={16} />} label="Method" value={booking.paymentMethod} />
              <DetailRow icon={<Banknote size={16} />} label="Amount" value={`₹${booking.totalAmount?.toLocaleString('en-IN')}`} />
              {booking.paymentRefNo && (
                <DetailRow icon={<CheckCircle2 size={16} />} label="Reference No." value={booking.paymentRefNo} />
              )}
              {booking.paymentDate && (
                <DetailRow icon={<Clock size={16} />} label="Payment Date" value={new Date(booking.paymentDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })} />
              )}
            </div>
            {booking.paymentStatus === 'processing' && (
              <div className="mt-4 bg-amber-50 rounded-xl p-3 flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-amber-200 border-t-amber-600 rounded-full animate-spin" />
                <p className="text-sm text-amber-700">DBT payment is being processed. Usually takes 24-48 hours.</p>
              </div>
            )}
            {booking.paymentStatus === 'paid' && (
              <div className="mt-4 bg-primary-50 rounded-xl p-3 flex items-center gap-2">
                <CheckCircle2 size={16} className="text-primary-600" />
                <p className="text-sm text-primary-700">Payment credited to your bank account successfully.</p>
              </div>
            )}
          </div>
        </Card>
      )}

      {/* History */}
      <Card className="mb-4">
        <div className="p-5">
          <h3 className="font-bold text-neutral-800 mb-3 flex items-center gap-2">
            <History size={18} className="text-primary-600" />
            Status History
          </h3>
          <div className="space-y-3">
            {booking.history.map((event, idx) => (
              <div key={idx} className="flex gap-3">
                <div className="flex flex-col items-center">
                  <div className={`w-2.5 h-2.5 rounded-full ${idx === booking.history.length - 1 ? 'bg-primary-600' : 'bg-primary-300'}`} />
                  {idx < booking.history.length - 1 && <div className="w-0.5 h-6 bg-neutral-200" />}
                </div>
                <div className="pb-3">
                  <p className="font-semibold text-sm text-neutral-700">{event.label}</p>
                  <p className="text-xs text-neutral-400">
                    {new Date(event.timestamp).toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                  </p>
                  {event.note && <p className="text-xs text-neutral-500 mt-0.5">{event.note}</p>}
                </div>
              </div>
            ))}
          </div>
        </div>
      </Card>

      {/* Actions */}
      <div className="space-y-3">
        {booking.status === 'in_queue' && (
          <Button fullWidth size="lg" onClick={() => navigate('queue-tracking', { bookingId: booking.id })}>
            Track Live Queue <ArrowRight size={18} />
          </Button>
        )}
        {showPayment && (
          <Button fullWidth size="lg" variant="secondary" onClick={() => navigate('payment-detail', { bookingId: booking.id })}>
            View Payment Details <ArrowRight size={18} />
          </Button>
        )}
        {canCancel && (
          <Button fullWidth variant="danger" onClick={() => setCancelOpen(true)}>
            <X size={18} /> Cancel Booking
          </Button>
        )}
      </div>

      <ConfirmDialog
        open={cancelOpen}
        onClose={() => setCancelOpen(false)}
        onConfirm={() => {
          cancelBooking(booking.id);
          navigate('farmer-dashboard');
        }}
        title="Cancel Booking?"
        message={`Are you sure you want to cancel token ${booking.tokenNumber}? Your slot will be released for other farmers.`}
        confirmLabel="Yes, Cancel Booking"
        danger
      />
    </FarmerLayout>
  );
}

function DetailRow({ icon, label, value }: { icon: React.ReactNode; label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-center gap-3">
      <div className="w-8 h-8 rounded-lg bg-neutral-100 flex items-center justify-center text-neutral-500">
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs text-neutral-400">{label}</p>
        <p className="font-semibold text-neutral-800 text-sm">{value}</p>
      </div>
    </div>
  );
}

function ResultCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: React.ReactNode }) {
  return (
    <div className="bg-neutral-50 rounded-xl p-3">
      <div className="flex items-center gap-1.5 text-neutral-400 mb-1">
        {icon}
        <span className="text-xs">{label}</span>
      </div>
      <p className="font-bold text-neutral-800">{value}</p>
    </div>
  );
}
