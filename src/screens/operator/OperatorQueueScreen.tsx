import { Users, Clock, ArrowRight, Phone, MapPin, Ticket, CheckCircle2 } from 'lucide-react';
import { DashboardLayout, getOperatorNav } from '@/components/layouts/DashboardLayout';
import { Card, CardBody } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { StatusBadge, Badge } from '@/components/ui/Badge';
import { EmptyState } from '@/components/ui/States';
import { useApp } from '@/store/AppContext';
import { useRouter } from '@/store/Router';

export function OperatorQueueScreen() {
  const { currentOperatorId, operators, centres, bookings, advanceBookingStatus } = useApp();
  const { navigate } = useRouter();
  const operator = operators.find((o) => o.id === currentOperatorId);
  const centre = centres.find((c) => c.id === operator?.centreId);

  if (!centre) return null;

  const today = new Date().toISOString().split('T')[0];
  const queueBookings = bookings
    .filter((b) => b.centreId === centre.id && b.date === today && ['booked', 'in_queue', 'called'].includes(b.status))
    .sort((a, b) => (a.queuePosition ?? 999) - (b.queuePosition ?? 999));

  const waiting = queueBookings.filter((b) => b.status === 'in_queue' || b.status === 'booked');
  const called = queueBookings.filter((b) => b.status === 'called');

  const handleCallNext = () => {
    const next = waiting[0];
    if (next) {
      if (next.status === 'booked') {
        advanceBookingStatus(next.id, 'Farmer arrived and added to queue');
        // Then call
        setTimeout(() => advanceBookingStatus(next.id, 'Token called for processing'), 300);
      } else {
        advanceBookingStatus(next.id, 'Token called for processing. Please proceed to weighing platform.');
      }
    }
  };

  return (
    <DashboardLayout navItems={getOperatorNav()} title="Queue Management" subtitle={centre.name}>
      {/* Queue summary */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <Card>
          <CardBody className="p-4 text-center">
            <p className="text-3xl font-bold text-amber-600">{waiting.length}</p>
            <p className="text-sm text-neutral-500">Waiting</p>
          </CardBody>
        </Card>
        <Card>
          <CardBody className="p-4 text-center">
            <p className="text-3xl font-bold text-purple-600">{called.length}</p>
            <p className="text-sm text-neutral-500">Called</p>
          </CardBody>
        </Card>
        <Card>
          <CardBody className="p-4 text-center">
            <p className="text-3xl font-bold text-primary-600">{centre.totalProcessedToday}</p>
            <p className="text-sm text-neutral-500">Processed</p>
          </CardBody>
        </Card>
      </div>

      {/* Call next button */}
      {waiting.length > 0 && (
        <Card className="mb-6 overflow-hidden">
          <div className="bg-gradient-to-r from-primary-600 to-primary-700 p-5 text-white flex items-center justify-between">
            <div>
              <h3 className="font-bold text-lg">Next in Queue</h3>
              <p className="text-white/80 text-sm mt-0.5">
                {waiting[0].tokenNumber} · {waiting[0].farmerName} · {waiting[0].crop} ({waiting[0].quantityQuintals} q)
              </p>
            </div>
            <Button
              variant="secondary"
              size="lg"
              onClick={handleCallNext}
              className="bg-white text-primary-700 hover:bg-primary-50"
            >
              Call Token <ArrowRight size={18} />
            </Button>
          </div>
        </Card>
      )}

      {/* Called farmers */}
      {called.length > 0 && (
        <div className="mb-6">
          <h3 className="font-bold text-neutral-800 mb-3">Currently Called</h3>
          <div className="space-y-3">
            {called.map((b) => (
              <Card key={b.id} className="border-purple-200">
                <CardBody className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-purple-100 flex items-center justify-center text-purple-700 font-bold">
                      <Ticket size={22} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-purple-700">{b.tokenNumber}</span>
                        <StatusBadge status={b.status} />
                      </div>
                      <p className="font-semibold text-neutral-800 mt-0.5">{b.farmerName}</p>
                      <p className="text-sm text-neutral-500">{b.crop} · {b.quantityQuintals} quintals · {b.slotTime}</p>
                    </div>
                  </div>
                  <Button onClick={() => navigate('operator-process', { bookingId: b.id })}>
                    Start Processing <ArrowRight size={16} />
                  </Button>
                </CardBody>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Waiting queue */}
      <h3 className="font-bold text-neutral-800 mb-3">Waiting Queue</h3>
      {waiting.length === 0 ? (
        <Card>
          <EmptyState
            icon={<CheckCircle2 size={28} />}
            title="Queue is Empty"
            message="All farmers have been called. New bookings will appear here."
          />
        </Card>
      ) : (
        <div className="space-y-3">
          {waiting.map((b, idx) => (
            <Card key={b.id} hover onClick={() => navigate('operator-process', { bookingId: b.id })}>
              <CardBody className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center text-amber-700 font-bold text-sm">
                    #{b.queuePosition ?? idx + 1}
                  </div>
                  <div>
                    <span className="font-bold text-primary-600 text-sm">{b.tokenNumber}</span>
                    <p className="font-semibold text-neutral-800">{b.farmerName}</p>
                    <p className="text-sm text-neutral-500">{b.crop} · {b.quantityQuintals} q · {b.slotTime}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <StatusBadge status={b.status} />
                  <ArrowRight size={18} className="text-neutral-300" />
                </div>
              </CardBody>
            </Card>
          ))}
        </div>
      )}
    </DashboardLayout>
  );
}
