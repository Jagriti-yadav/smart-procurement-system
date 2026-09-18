import { useState } from 'react';
import { Clock, Users, Calendar, Wheat, CheckCircle2 } from 'lucide-react';
import { FarmerLayout } from '@/components/layouts/FarmerLayout';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Select, Input } from '@/components/ui/Input';
import { SlotBadge, Badge } from '@/components/ui/Badge';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { ConfirmDialog } from '@/components/ui/Modal';
import { useApp } from '@/store/AppContext';
import { useRouter } from '@/store/Router';
import { cropRates } from '@/data/seed';
import type { CropType, SlotSummary } from '@/types';

export function SlotBookingScreen() {
  const { centres, bookSlot, currentFarmerId } = useApp();
  const { params, navigate } = useRouter();
  const centre = centres.find((c) => c.id === params.centreId);
  const [selectedSlot, setSelectedSlot] = useState<SlotSummary | null>(null);
  const [crop, setCrop] = useState<CropType>(centre?.acceptingCrops[0] ?? 'Wheat');
  const [quantity, setQuantity] = useState('');
  const [confirmOpen, setConfirmOpen] = useState(false);

  if (!centre) return null;

  const availableSlots = centre.todaysSlots.filter((s) => s.status === 'available' || s.status === 'filling');
  const rate = cropRates.find((r) => r.crop === crop);
  const estAmount = rate ? (parseFloat(quantity) || 0) * rate.mspRate : 0;

  const handleBook = () => {
    if (!selectedSlot || !currentFarmerId || !quantity) return;
    const booking = bookSlot({
      farmerId: currentFarmerId,
      centreId: centre.id,
      slotId: selectedSlot.id,
      crop,
      quantityQuintals: parseFloat(quantity),
    });
    navigate('token', { bookingId: booking.id });
  };

  return (
    <FarmerLayout title="Book a Slot" showBack>
      {/* Centre info */}
      <Card className="mb-4">
        <div className="p-4">
          <h2 className="font-bold text-neutral-800">{centre.name}</h2>
          <p className="text-sm text-neutral-500">{centre.village}, {centre.district}, {centre.state}</p>
          <div className="flex items-center gap-3 mt-2 text-sm text-neutral-500">
            <span className="flex items-center gap-1"><Clock size={14} /> {centre.operatingHours}</span>
            <span className="flex items-center gap-1"><Users size={14} /> Queue: {centre.currentQueue}</span>
          </div>
          <div className="flex flex-wrap gap-1.5 mt-3">
            {centre.acceptingCrops.map((c) => (
              <Badge key={c} color="green" size="sm">{c}</Badge>
            ))}
          </div>
        </div>
      </Card>

      {/* Slot selection */}
      <div className="mb-4">
        <h3 className="font-bold text-neutral-800 mb-3 flex items-center gap-2">
          <Calendar size={18} className="text-primary-600" />
          Available Time Slots — Today
        </h3>
        <div className="space-y-2.5">
          {centre.todaysSlots.map((slot) => {
            const isAvailable = slot.status === 'available' || slot.status === 'filling';
            const isSelected = selectedSlot?.id === slot.id;
            return (
              <button
                key={slot.id}
                disabled={!isAvailable}
                onClick={() => setSelectedSlot(slot)}
                className={`w-full text-left p-4 rounded-2xl border-2 transition-all ${
                  isSelected
                    ? 'border-primary-600 bg-primary-50'
                    : isAvailable
                    ? 'border-neutral-200 bg-white hover:border-primary-300'
                    : 'border-neutral-100 bg-neutral-50 opacity-60 cursor-not-allowed'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Clock size={18} className={isSelected ? 'text-primary-600' : 'text-neutral-400'} />
                    <span className="font-bold text-neutral-800">{slot.time}</span>
                  </div>
                  <SlotBadge status={slot.status} />
                </div>
                <ProgressBar value={slot.booked} max={slot.totalCapacity} showCount color={slot.status === 'full' ? 'red' : 'amber'} />
              </button>
            );
          })}
        </div>
      </div>

      {/* Crop & quantity */}
      {selectedSlot && (
        <Card className="mb-4 animate-slide-up">
          <div className="p-4 space-y-4">
            <h3 className="font-bold text-neutral-800 flex items-center gap-2">
              <Wheat size={18} className="text-primary-600" />
              Procurement Details
            </h3>

            <Select label="Select Crop" value={crop} onChange={(e) => setCrop(e.target.value as CropType)}>
              {centre.acceptingCrops.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </Select>

            <Input
              label="Quantity (in quintals)"
              type="number"
              placeholder="e.g. 12"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              hint={`MSP Rate: ₹${rate?.mspRate}/quintal · Market Rate: ₹${rate?.marketRate}/quintal`}
            />

            {quantity && parseFloat(quantity) > 0 && (
              <div className="bg-primary-50 rounded-xl p-4">
                <p className="text-sm text-primary-700 font-medium">Estimated Payment (at MSP)</p>
                <p className="text-2xl font-bold text-primary-700 mt-1">
                  ₹{estAmount.toLocaleString('en-IN')}
                </p>
                <p className="text-xs text-primary-600 mt-1">
                  Final amount may vary based on quality grading and actual weight
                </p>
              </div>
            )}

            <Button
              fullWidth
              size="lg"
              disabled={!selectedSlot || !quantity || parseFloat(quantity) <= 0}
              onClick={() => setConfirmOpen(true)}
            >
              Confirm Booking
            </Button>
          </div>
        </Card>
      )}

      <ConfirmDialog
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={handleBook}
        title="Confirm Slot Booking"
        message={`Book ${crop} (${quantity} quintals) at ${centre.name} for ${selectedSlot?.time}? A digital token will be generated immediately.`}
        confirmLabel="Book & Generate Token"
      />
    </FarmerLayout>
  );
}
