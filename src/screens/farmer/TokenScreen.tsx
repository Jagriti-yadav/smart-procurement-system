import { Ticket, CheckCircle2, Clock, MapPin, Wheat, Calendar, ArrowRight, Download, Share2 } from 'lucide-react';
import { FarmerLayout } from '@/components/layouts/FarmerLayout';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { StatusBadge } from '@/components/ui/Badge';
import { useApp } from '@/store/AppContext';
import { useRouter } from '@/store/Router';

export function TokenScreen() {
  const { params, navigate } = useRouter();
  const { getBooking } = useApp();
  const booking = getBooking(params.bookingId);

  if (!booking) return null;

  return (
    <FarmerLayout showBack>
      {/* Success header */}
      <div className="text-center mb-5 animate-scale-in">
        <div className="w-16 h-16 rounded-full bg-primary-50 flex items-center justify-center mx-auto mb-3">
          <CheckCircle2 size={32} className="text-primary-600" />
        </div>
        <h1 className="text-xl font-bold text-neutral-800">Slot Booked Successfully!</h1>
        <p className="text-neutral-500 mt-1">Your digital token has been generated</p>
      </div>

      {/* Token card */}
      <Card className="mb-4 overflow-hidden animate-slide-up">
        {/* Token header */}
        <div className="bg-gradient-to-r from-primary-600 to-primary-700 p-5 text-white text-center relative">
          <div className="absolute top-3 left-3">
            <Ticket size={20} className="text-white/60" />
          </div>
          <p className="text-sm text-white/80">Your Token Number</p>
          <p className="text-3xl font-extrabold tracking-wider mt-1">{booking.tokenNumber}</p>
          <div className="flex items-center justify-center gap-2 mt-2">
            <StatusBadge status={booking.status} />
          </div>
        </div>

        {/* Token details */}
        <div className="p-5 space-y-3">
          <DetailRow icon={<Wheat size={16} />} label="Crop" value={`${booking.crop} · ${booking.quantityQuintals} quintals`} />
          <DetailRow icon={<MapPin size={16} />} label="Procurement Centre" value={booking.centreName} />
          <DetailRow icon={<Calendar size={16} />} label="Date" value={new Date(booking.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })} />
          <DetailRow icon={<Clock size={16} />} label="Time Slot" value={booking.slotTime} />
          {booking.queuePosition !== undefined && (
            <div className="bg-amber-50 rounded-xl p-3 flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center text-amber-700 font-bold">
                #{booking.queuePosition}
              </div>
              <div>
                <p className="font-semibold text-amber-800">Your Queue Position</p>
                <p className="text-sm text-amber-600">Please arrive 15 minutes before your slot</p>
              </div>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="px-5 pb-5 flex gap-3">
          <Button variant="outline" size="md" fullWidth onClick={() => {}}>
            <Download size={18} /> Save
          </Button>
          <Button variant="outline" size="md" fullWidth onClick={() => {}}>
            <Share2 size={18} /> Share
          </Button>
        </div>
      </Card>

      {/* Next steps */}
      <Card className="mb-4">
        <div className="p-5">
          <h3 className="font-bold text-neutral-800 mb-3">What happens next?</h3>
          <div className="space-y-3">
            {[
              { label: 'Arrive at centre', desc: 'Reach the centre before your slot time' },
              { label: 'Join the queue', desc: 'Your token will be added to the live queue' },
              { label: 'Get called', desc: 'You will be notified when your token is called' },
              { label: 'Weighing & quality check', desc: 'Your crop will be weighed and graded' },
              { label: 'Payment via DBT', desc: 'Amount credited directly to your bank account' },
            ].map((step, i) => (
              <div key={step.label} className="flex gap-3">
                <div className="flex-shrink-0 w-7 h-7 rounded-full bg-primary-50 text-primary-600 flex items-center justify-center text-sm font-bold">
                  {i + 1}
                </div>
                <div>
                  <p className="font-semibold text-neutral-700 text-sm">{step.label}</p>
                  <p className="text-sm text-neutral-500">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </Card>

      <Button fullWidth size="lg" onClick={() => navigate('queue-tracking', { bookingId: booking.id })}>
        Track Live Queue
        <ArrowRight size={18} />
      </Button>
    </FarmerLayout>
  );
}

function DetailRow({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-center gap-3">
      <div className="w-8 h-8 rounded-lg bg-neutral-100 flex items-center justify-center text-neutral-500">
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs text-neutral-400">{label}</p>
        <p className="font-semibold text-neutral-800 text-sm truncate">{value}</p>
      </div>
    </div>
  );
}
