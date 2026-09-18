import { useEffect, useState } from 'react';
import { Clock, Users, Ticket, MapPin, Navigation, Bell, CheckCircle2 } from 'lucide-react';
import { FarmerLayout } from '@/components/layouts/FarmerLayout';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { StatusBadge } from '@/components/ui/Badge';
import { useApp, statusLabels } from '@/store/AppContext';
import { useRouter } from '@/store/Router';
import type { Booking } from '@/types';

export function QueueTrackingScreen() {
  const { params, navigate } = useRouter();
  const { getBooking, centres } = useApp();
  const booking = getBooking(params.bookingId);
  const [, setTick] = useState(0);

  // Simulate live queue updates
  useEffect(() => {
    const interval = setInterval(() => setTick((t) => t + 1), 5000);
    return () => clearInterval(interval);
  }, []);

  if (!booking) return null;

  const centre = centres.find((c) => c.id === booking.centreId);
  const queueAhead = booking.queuePosition !== undefined ? Math.max(0, booking.queuePosition - 1) : 0;
  const isCalled = ['called', 'weighing', 'quality_check', 'procured', 'payment_processing', 'paid'].includes(booking.status);

  // Current stage index
  const stages: { key: string; label: string }[] = [
    { key: 'booked', label: 'Booked' },
    { key: 'in_queue', label: 'In Queue' },
    { key: 'called', label: 'Called' },
    { key: 'weighing', label: 'Weighing' },
    { key: 'quality_check', label: 'Quality' },
    { key: 'procured', label: 'Procured' },
    { key: 'payment_processing', label: 'Payment' },
    { key: 'paid', label: 'Paid' },
  ];
  const currentIdx = stages.findIndex((s) => s.key === booking.status);

  return (
    <FarmerLayout title="Live Queue Tracking" showBack>
      {/* Token summary */}
      <Card className="mb-4">
        <div className="p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Ticket size={18} className="text-primary-600" />
              <span className="font-bold text-primary-600 text-sm">{booking.tokenNumber}</span>
            </div>
            <StatusBadge status={booking.status} />
          </div>
          <p className="font-bold text-neutral-800">{booking.crop} · {booking.quantityQuintals} quintals</p>
          <p className="text-sm text-neutral-500 flex items-center gap-1 mt-0.5">
            <MapPin size={14} /> {booking.centreName}
          </p>
          <p className="text-sm text-neutral-500 flex items-center gap-1 mt-0.5">
            <Clock size={14} /> Slot: {booking.slotTime}
          </p>
        </div>
      </Card>

      {/* Queue position card */}
      {!isCalled && booking.queuePosition !== undefined && (
        <Card className="mb-4 overflow-hidden">
          <div className="bg-gradient-to-r from-amber-500 to-amber-600 p-6 text-white text-center">
            <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center mx-auto mb-3">
              <Users size={32} />
            </div>
            <p className="text-4xl font-extrabold">{booking.queuePosition}</p>
            <p className="text-white/90 mt-1">Your queue position</p>
            <p className="text-sm text-white/70 mt-2">{queueAhead} farmer{queueAhead !== 1 ? 's' : ''} ahead of you</p>
          </div>
          <div className="p-4">
            <div className="flex items-center justify-between text-sm">
              <span className="text-neutral-500">Estimated wait time</span>
              <span className="font-semibold text-neutral-700">~{queueAhead * 12} minutes</span>
            </div>
            <div className="mt-3 bg-amber-50 rounded-xl p-3 flex items-start gap-2">
              <Bell size={16} className="text-amber-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-amber-700">
                We will notify you when your token is called. Please stay near the centre.
              </p>
            </div>
          </div>
        </Card>
      )}

      {isCalled && (
        <Card className="mb-4 overflow-hidden">
          <div className="bg-gradient-to-r from-primary-600 to-primary-700 p-6 text-white text-center">
            <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center mx-auto mb-3">
              <CheckCircle2 size={32} />
            </div>
            <p className="text-lg font-bold">Token Called!</p>
            <p className="text-white/90 text-sm mt-1">Please proceed to the processing area</p>
          </div>
        </Card>
      )}

      {/* Progress timeline */}
      <Card className="mb-4">
        <div className="p-5">
          <h3 className="font-bold text-neutral-800 mb-4">Procurement Progress</h3>
          <div className="space-y-1">
            {stages.map((stage, idx) => {
              const isComplete = idx < currentIdx;
              const isCurrent = idx === currentIdx;
              const isFuture = idx > currentIdx;
              const event = booking.history.find((h) => h.status === stage.key);

              return (
                <div key={stage.key} className="flex gap-3">
                  {/* Line and dot */}
                  <div className="flex flex-col items-center">
                    <div className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 transition-all ${
                      isComplete ? 'bg-primary-600 text-white' :
                      isCurrent ? 'bg-primary-100 border-2 border-primary-600 text-primary-600 animate-pulse-soft' :
                      'bg-neutral-100 text-neutral-400'
                    }`}>
                      {isComplete ? <CheckCircle2 size={14} /> : idx + 1}
                    </div>
                    {idx < stages.length - 1 && (
                      <div className={`w-0.5 h-8 ${isComplete ? 'bg-primary-600' : 'bg-neutral-200'}`} />
                    )}
                  </div>
                  {/* Content */}
                  <div className={`pb-6 ${idx === stages.length - 1 ? 'pb-0' : ''}`}>
                    <p className={`font-semibold text-sm ${
                      isCurrent ? 'text-primary-700' : isComplete ? 'text-neutral-700' : 'text-neutral-400'
                    }`}>
                      {stage.label}
                      {isCurrent && <span className="ml-2 text-xs text-primary-600 font-normal">(Current)</span>}
                    </p>
                    {event && (
                      <p className="text-xs text-neutral-400 mt-0.5">
                        {new Date(event.timestamp).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                        {event.note && ` · ${event.note}`}
                      </p>
                    )}
                    {isFuture && !event && (
                      <p className="text-xs text-neutral-300 mt-0.5">Pending</p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </Card>

      {/* Centre info */}
      {centre && (
        <Card className="mb-4">
          <div className="p-4">
            <h3 className="font-bold text-neutral-800 mb-2">Centre Information</h3>
            <div className="space-y-2 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-neutral-500">Current queue</span>
                <span className="font-semibold text-neutral-700">{centre.currentQueue} farmers</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-neutral-500">Processed today</span>
                <span className="font-semibold text-neutral-700">{centre.totalProcessedToday}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-neutral-500">Manager</span>
                <span className="font-semibold text-neutral-700">{centre.manager}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-neutral-500">Contact</span>
                <span className="font-semibold text-primary-600">{centre.phone}</span>
              </div>
            </div>
          </div>
        </Card>
      )}

      <Button fullWidth size="lg" onClick={() => navigate('procurement-detail', { bookingId: booking.id })}>
        View Full Details
      </Button>
    </FarmerLayout>
  );
}
