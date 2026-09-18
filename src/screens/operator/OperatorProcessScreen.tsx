import { useState, useEffect } from 'react';
import { Ticket, Scale, FlaskConical, Banknote, CheckCircle2, ArrowRight, ArrowLeft, Wheat, User, Phone } from 'lucide-react';
import { DashboardLayout, getOperatorNav } from '@/components/layouts/DashboardLayout';
import { Card, CardBody } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input, Select } from '@/components/ui/Input';
import { StatusBadge, GradeBadge, Badge } from '@/components/ui/Badge';
import { EmptyState } from '@/components/ui/States';
import { useApp } from '@/store/AppContext';
import { useRouter } from '@/store/Router';
import { cropRates } from '@/data/seed';
import type { Booking, BookingStatus } from '@/types';

export function OperatorProcessScreen() {
  const { currentOperatorId, operators, centres, bookings, advanceBookingStatus, setQualityAndWeight, processPayment } = useApp();
  const { params, navigate } = useRouter();
  const operator = operators.find((o) => o.id === currentOperatorId);
  const centre = centres.find((c) => c.id === operator?.centreId);
  const [selectedBookingId, setSelectedBookingId] = useState<string | null>(params.bookingId ?? null);
  const [weight, setWeight] = useState('');
  const [moisture, setMoisture] = useState('');
  const [grade, setGrade] = useState<'A' | 'B' | 'C' | 'Rejected'>('A');

  const booking = bookings.find((b) => b.id === selectedBookingId);

  useEffect(() => {
    if (booking) {
      setWeight(booking.weighedQuantity?.toString() ?? '');
      setMoisture(booking.moisturePercent?.toString() ?? '');
      setGrade(booking.qualityGrade ?? 'A');
    }
  }, [booking?.id]);

  if (!centre) return null;

  const today = new Date().toISOString().split('T')[0];
  const activeBookings = bookings.filter(
    (b) => b.centreId === centre.id && b.date === today && !['paid', 'cancelled'].includes(b.status)
  );

  const handleRecordQuality = () => {
    if (!booking || !weight || !moisture) return;
    const rate = cropRates.find((r) => r.crop === booking.crop);
    const baseRate = rate?.mspRate ?? 0;
    // Grade A = MSP, B = 95% of MSP, C = 90% of MSP, Rejected = 0
    const rateMultiplier = grade === 'A' ? 1 : grade === 'B' ? 0.95 : grade === 'C' ? 0.90 : 0;
    const finalRate = Math.round(baseRate * rateMultiplier);
    setQualityAndWeight(booking.id, grade, parseFloat(moisture), parseFloat(weight), finalRate);
    advanceBookingStatus(booking.id, `Weight: ${weight}q, Grade ${grade}, Moisture ${moisture}%, Rate ₹${finalRate}/q`);
  };

  const handleAdvance = () => {
    if (!booking) return;
    advanceBookingStatus(booking.id);
  };

  const handlePayment = () => {
    if (!booking) return;
    advanceBookingStatus(booking.id, 'Procurement complete, initiating DBT payment');
    setTimeout(() => processPayment(booking.id), 500);
  };

  if (!booking) {
    return (
      <DashboardLayout navItems={getOperatorNav()} title="Process Procurement" subtitle={centre.name}>
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Booking list */}
          <div className="lg:col-span-1">
            <h3 className="font-bold text-neutral-800 mb-3">Active Bookings</h3>
            <div className="space-y-2">
              {activeBookings.length === 0 ? (
                <Card>
                  <EmptyState icon={<CheckCircle2 size={24} />} title="No Active Bookings" message="All procurements completed" />
                </Card>
              ) : (
                activeBookings.map((b) => (
                  <Card key={b.id} hover onClick={() => setSelectedBookingId(b.id)} className={selectedBookingId === b.id ? 'border-primary-300 bg-primary-50' : ''}>
                    <CardBody className="p-3">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-bold text-primary-600 text-sm">{b.tokenNumber}</span>
                        <StatusBadge status={b.status} />
                      </div>
                      <p className="font-semibold text-neutral-800 text-sm">{b.farmerName}</p>
                      <p className="text-xs text-neutral-500">{b.crop} · {b.quantityQuintals} q</p>
                    </CardBody>
                  </Card>
                ))
              )}
            </div>
          </div>

          <div className="lg:col-span-2">
            <Card>
              <EmptyState
                icon={<Ticket size={28} />}
                title="Select a Booking"
                message="Choose a booking from the left to start processing"
              />
            </Card>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  const rate = cropRates.find((r) => r.crop === booking.crop);
  const isWeighingStage = booking.status === 'weighing' || booking.status === 'called';
  const isQualityStage = booking.status === 'quality_check';
  const isProcured = booking.status === 'procured';
  const isPaymentStage = booking.status === 'payment_processing';

  return (
    <DashboardLayout navItems={getOperatorNav()} title="Process Procurement" subtitle={centre.name} showBack>
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Booking list */}
        <div className="lg:col-span-1">
          <h3 className="font-bold text-neutral-800 mb-3">Active Bookings</h3>
          <div className="space-y-2">
            {activeBookings.map((b) => (
              <Card key={b.id} hover onClick={() => setSelectedBookingId(b.id)} className={selectedBookingId === b.id ? 'border-primary-300 bg-primary-50' : ''}>
                <CardBody className="p-3">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-primary-600 text-sm">{b.tokenNumber}</span>
                    <StatusBadge status={b.status} />
                  </div>
                  <p className="font-semibold text-neutral-800 text-sm">{b.farmerName}</p>
                  <p className="text-xs text-neutral-500">{b.crop} · {b.quantityQuintals} q</p>
                </CardBody>
              </Card>
            ))}
          </div>
        </div>

        {/* Processing panel */}
        <div className="lg:col-span-2 space-y-4">
          {/* Farmer info */}
          <Card>
            <div className="bg-gradient-to-r from-primary-600 to-primary-700 p-5 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <Ticket size={18} className="text-white/80" />
                    <span className="font-bold text-lg">{booking.tokenNumber}</span>
                  </div>
                  <p className="text-lg font-bold">{booking.farmerName}</p>
                  <p className="text-sm text-white/80 flex items-center gap-1 mt-0.5">
                    <Phone size={14} /> {booking.farmerPhone}
                  </p>
                </div>
                <StatusBadge status={booking.status} size="md" />
              </div>
            </div>
            <CardBody className="p-5">
              <div className="grid grid-cols-3 gap-4">
                <InfoItem icon={<Wheat size={16} />} label="Crop" value={booking.crop} />
                <InfoItem icon={<Scale size={16} />} label="Declared Qty" value={`${booking.quantityQuintals} q`} />
                <InfoItem icon={<Ticket size={16} />} label="Slot" value={booking.slotTime} />
              </div>
            </CardBody>
          </Card>

          {/* Stage: Called -> Start Weighing */}
          {booking.status === 'called' && (
            <Card className="animate-slide-up">
              <CardBody className="p-5">
                <h3 className="font-bold text-neutral-800 mb-2 flex items-center gap-2">
                  <Scale size={18} className="text-primary-600" />
                  Start Weighing
                </h3>
                <p className="text-sm text-neutral-500 mb-4">The farmer has been called. Start the weighing process when ready.</p>
                <Button fullWidth size="lg" onClick={handleAdvance}>
                  Start Weighing <ArrowRight size={18} />
                </Button>
              </CardBody>
            </Card>
          )}

          {/* Stage: Weighing */}
          {isWeighingStage && (
            <Card className="animate-slide-up">
              <CardBody className="p-5 space-y-4">
                <h3 className="font-bold text-neutral-800 mb-2 flex items-center gap-2">
                  <Scale size={18} className="text-primary-600" />
                  Weighing & Quality Assessment
                </h3>
                <Input
                  label="Actual Weight (quintals)"
                  type="number"
                  step="0.01"
                  placeholder={`e.g. ${booking.quantityQuintals}`}
                  value={weight}
                  onChange={(e) => setWeight(e.target.value)}
                  hint={`Farmer declared: ${booking.quantityQuintals} quintals`}
                />
                <Input
                  label="Moisture Content (%)"
                  type="number"
                  step="0.1"
                  placeholder="e.g. 11.5"
                  value={moisture}
                  onChange={(e) => setMoisture(e.target.value)}
                  hint="Acceptable range: 8-14% for most crops"
                />
                <Select label="Quality Grade" value={grade} onChange={(e) => setGrade(e.target.value as typeof grade)}>
                  <option value="A">Grade A – Excellent (Full MSP)</option>
                  <option value="B">Grade B – Good (95% of MSP)</option>
                  <option value="C">Grade C – Fair (90% of MSP)</option>
                  <option value="Rejected">Rejected – Not acceptable</option>
                </Select>

                {weight && grade !== 'Rejected' && (
                  <div className="bg-primary-50 rounded-xl p-4">
                    {(() => {
                      const baseRate = rate?.mspRate ?? 0;
                      const mult = grade === 'A' ? 1 : grade === 'B' ? 0.95 : 0.90;
                      const finalRate = Math.round(baseRate * mult);
                      const amount = Math.round(parseFloat(weight) * finalRate);
                      return (
                        <>
                          <div className="flex justify-between text-sm text-primary-700 mb-1">
                            <span>Rate (Grade {grade})</span>
                            <span className="font-semibold">₹{finalRate}/quintal</span>
                          </div>
                          <div className="flex justify-between text-sm text-primary-700 mb-2">
                            <span>Weight</span>
                            <span className="font-semibold">{weight} quintals</span>
                          </div>
                          <div className="border-t border-primary-200 pt-2 flex justify-between">
                            <span className="font-bold text-primary-800">Total Amount</span>
                            <span className="font-bold text-primary-800 text-lg">₹{amount.toLocaleString('en-IN')}</span>
                          </div>
                        </>
                      );
                    })()}
                  </div>
                )}

                <Button
                  fullWidth
                  size="lg"
                  disabled={!weight || !moisture || parseFloat(weight) <= 0}
                  onClick={handleRecordQuality}
                >
                  Record Weight & Quality <ArrowRight size={18} />
                </Button>
              </CardBody>
            </Card>
          )}

          {/* Stage: Quality Check -> Procured */}
          {(isQualityStage || isProcured) && (
            <Card className="animate-slide-up">
              <CardBody className="p-5">
                <h3 className="font-bold text-neutral-800 mb-4 flex items-center gap-2">
                  <FlaskConical size={18} className="text-primary-600" />
                  Quality Results
                </h3>
                <div className="grid grid-cols-2 gap-3 mb-4">
                  <ResultBox label="Weight" value={`${booking.weighedQuantity} q`} />
                  <ResultBox label="Moisture" value={`${booking.moisturePercent}%`} />
                  <ResultBox label="Grade" value={<GradeBadge grade={booking.qualityGrade!} />} />
                  <ResultBox label="Rate" value={`₹${booking.ratePerQuintal}/q`} />
                </div>
                <div className="bg-primary-50 rounded-xl p-4 text-center mb-4">
                  <p className="text-sm text-primary-700">Total Procurement Amount</p>
                  <p className="text-2xl font-bold text-primary-700">₹{booking.totalAmount?.toLocaleString('en-IN')}</p>
                </div>
                {isQualityStage && (
                  <Button fullWidth size="lg" onClick={handleAdvance}>
                    Confirm Procurement <ArrowRight size={18} />
                  </Button>
                )}
                {isProcured && (
                  <Button fullWidth size="lg" onClick={handlePayment}>
                    <Banknote size={18} /> Process DBT Payment
                  </Button>
                )}
              </CardBody>
            </Card>
          )}

          {/* Stage: Payment Processing */}
          {isPaymentStage && (
            <Card className="animate-slide-up">
              <CardBody className="p-5 text-center">
                <div className="w-12 h-12 rounded-full bg-amber-50 flex items-center justify-center mx-auto mb-3">
                  <div className="w-6 h-6 border-3 border-amber-200 border-t-amber-600 rounded-full animate-spin" />
                </div>
                <h3 className="font-bold text-neutral-800">Payment Processing</h3>
                <p className="text-sm text-neutral-500 mt-1">DBT payment of ₹{booking.totalAmount?.toLocaleString('en-IN')} is being processed</p>
              </CardBody>
            </Card>
          )}

          {/* Stage: Paid */}
          {booking.status === 'paid' && (
            <Card className="animate-slide-up">
              <CardBody className="p-5 text-center">
                <div className="w-12 h-12 rounded-full bg-primary-50 flex items-center justify-center mx-auto mb-3">
                  <CheckCircle2 size={28} className="text-primary-600" />
                </div>
                <h3 className="font-bold text-neutral-800">Procurement Complete!</h3>
                <p className="text-sm text-neutral-500 mt-1">
                  Payment of ₹{booking.totalAmount?.toLocaleString('en-IN')} has been credited via DBT.
                </p>
                <p className="text-sm text-primary-600 font-semibold mt-2">Ref: {booking.paymentRefNo}</p>
                <Button variant="outline" fullWidth className="mt-4" onClick={() => setSelectedBookingId(null)}>
                  Process Next Farmer
                </Button>
              </CardBody>
            </Card>
          )}

          {/* Status timeline */}
          <Card>
            <CardBody className="p-5">
              <h3 className="font-bold text-neutral-800 mb-3 text-sm">Status History</h3>
              <div className="space-y-2">
                {booking.history.map((event, idx) => (
                  <div key={idx} className="flex gap-3 text-sm">
                    <div className="flex flex-col items-center">
                      <div className={`w-2 h-2 rounded-full ${idx === booking.history.length - 1 ? 'bg-primary-600' : 'bg-primary-300'}`} />
                      {idx < booking.history.length - 1 && <div className="w-0.5 h-4 bg-neutral-200" />}
                    </div>
                    <div>
                      <span className="font-semibold text-neutral-700">{event.label}</span>
                      {event.note && <p className="text-xs text-neutral-400">{event.note}</p>}
                    </div>
                  </div>
                ))}
              </div>
            </CardBody>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}

function InfoItem({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div>
      <div className="flex items-center gap-1 text-neutral-400 text-xs mb-1">
        {icon} {label}
      </div>
      <p className="font-bold text-neutral-800">{value}</p>
    </div>
  );
}

function ResultBox({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="bg-neutral-50 rounded-xl p-3">
      <p className="text-xs text-neutral-400 mb-1">{label}</p>
      <p className="font-bold text-neutral-800">{value}</p>
    </div>
  );
}
