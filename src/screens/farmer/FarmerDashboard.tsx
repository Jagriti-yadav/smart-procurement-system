import { Sprout, Plus, Ticket, Clock, Wallet, TrendingUp, ArrowRight, MapPin, Calendar } from 'lucide-react';
import { FarmerLayout } from '@/components/layouts/FarmerLayout';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { StatusBadge } from '@/components/ui/Badge';
import { useApp } from '@/store/AppContext';
import { useRouter } from '@/store/Router';
import { EmptyState } from '@/components/ui/States';

export function FarmerDashboard() {
  const { currentFarmerId, farmers, getFarmerBookings, centres } = useApp();
  const { navigate } = useRouter();
  const farmer = farmers.find((f) => f.id === currentFarmerId);
  const bookings = farmer ? getFarmerBookings(farmer.id) : [];
  const activeBookings = bookings.filter((b) => !['paid', 'cancelled'].includes(b.status));
  const completedBookings = bookings.filter((b) => b.status === 'paid');
  const totalEarnings = completedBookings.reduce((s, b) => s + (b.totalAmount ?? 0), 0);
  const openCentres = centres.filter((c) => c.status === 'open').length;

  if (!farmer) return null;

  return (
    <FarmerLayout>
      {/* Greeting */}
      <div className="mb-5">
        <p className="text-neutral-500 text-sm">Welcome back,</p>
        <h1 className="text-2xl font-bold text-neutral-800">{farmer.name}</h1>
        <p className="text-sm text-neutral-400 mt-0.5">{farmer.village}, {farmer.district}</p>
      </div>

      {/* Quick stats */}
      <div className="grid grid-cols-3 gap-3 mb-5">
        <MiniStat icon={<Ticket size={18} />} label="Active" value={String(activeBookings.length)} color="primary" />
        <MiniStat icon={<TrendingUp size={18} />} label="Completed" value={String(completedBookings.length)} color="blue" />
        <MiniStat icon={<Wallet size={18} />} label="Earnings" value={`₹${(totalEarnings / 1000).toFixed(0)}k`} color="green" />
      </div>

      {/* Primary CTA */}
      <Card className="mb-5 overflow-hidden">
        <div className="bg-gradient-to-r from-primary-600 to-primary-700 p-5 text-white">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
              <Plus size={22} />
            </div>
            <div>
              <h3 className="font-bold text-lg">Book a Procurement Slot</h3>
              <p className="text-sm text-white/80">{openCentres} centres open near you</p>
            </div>
          </div>
          <button
            onClick={() => navigate('centre-list')}
            className="w-full mt-3 bg-white text-primary-700 font-semibold rounded-xl py-3 hover:bg-primary-50 transition-colors flex items-center justify-center gap-2"
          >
            Find a Centre & Book Slot
            <ArrowRight size={18} />
          </button>
        </div>
      </Card>

      {/* Active bookings */}
      <div className="mb-5">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-bold text-neutral-800">Active Bookings</h2>
          {bookings.length > 0 && (
            <span className="text-sm text-neutral-400">{bookings.length} total</span>
          )}
        </div>

        {activeBookings.length === 0 ? (
          <Card>
            <EmptyState
              icon={<Ticket size={28} />}
              title="No Active Bookings"
              message="Book a slot to start your procurement journey"
              action={<Button size="sm" onClick={() => navigate('centre-list')}>Book a Slot</Button>}
            />
          </Card>
        ) : (
          <div className="space-y-3">
            {activeBookings.map((booking) => (
              <Card key={booking.id} hover onClick={() => navigate('procurement-detail', { bookingId: booking.id })}>
                <div className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-bold text-primary-600 bg-primary-50 px-2 py-0.5 rounded-md">
                          {booking.tokenNumber}
                        </span>
                        <StatusBadge status={booking.status} />
                      </div>
                      <p className="font-bold text-neutral-800">{booking.crop} · {booking.quantityQuintals} q</p>
                      <p className="text-sm text-neutral-500 mt-0.5">{booking.centreName}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-neutral-500 border-t border-neutral-100 pt-3">
                    <span className="flex items-center gap-1">
                      <Calendar size={14} />
                      {booking.slotTime}
                    </span>
                    {booking.queuePosition !== undefined && (
                      <span className="flex items-center gap-1 text-amber-600 font-semibold">
                        <Clock size={14} />
                        Queue #{booking.queuePosition}
                      </span>
                    )}
                    {booking.totalAmount && (
                      <span className="flex items-center gap-1 text-primary-600 font-semibold">
                        <Wallet size={14} />
                        ₹{booking.totalAmount.toLocaleString('en-IN')}
                      </span>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Completed bookings */}
      {completedBookings.length > 0 && (
        <div>
          <h2 className="text-lg font-bold text-neutral-800 mb-3">Completed</h2>
          <div className="space-y-3">
            {completedBookings.map((booking) => (
              <Card key={booking.id} hover onClick={() => navigate('payment-detail', { bookingId: booking.id })}>
                <div className="p-4 flex items-center justify-between">
                  <div>
                    <p className="font-bold text-neutral-800">{booking.crop} · {booking.quantityQuintals} q</p>
                    <p className="text-sm text-neutral-500">{booking.centreName}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-primary-600">₹{booking.totalAmount?.toLocaleString('en-IN')}</p>
                    <StatusBadge status={booking.status} />
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}
    </FarmerLayout>
  );
}

function MiniStat({ icon, label, value, color }: { icon: React.ReactNode; label: string; value: string; color: string }) {
  const colorMap: Record<string, string> = {
    primary: 'bg-primary-50 text-primary-600',
    blue: 'bg-blue-50 text-blue-600',
    green: 'bg-primary-50 text-primary-600',
  };
  return (
    <div className="bg-white rounded-xl p-3 shadow-card border border-neutral-100 text-center">
      <div className={`w-8 h-8 rounded-lg flex items-center justify-center mx-auto mb-1.5 ${colorMap[color]}`}>
        {icon}
      </div>
      <p className="text-lg font-bold text-neutral-800">{value}</p>
      <p className="text-xs text-neutral-400">{label}</p>
    </div>
  );
}
