import { useState } from 'react';
import { Search, MapPin, Clock, Users, Navigation } from 'lucide-react';
import { FarmerLayout } from '@/components/layouts/FarmerLayout';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { CentreStatusBadge, Badge } from '@/components/ui/Badge';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { useApp } from '@/store/AppContext';
import { useRouter } from '@/store/Router';

export function CentreListScreen() {
  const { centres } = useApp();
  const { navigate } = useRouter();
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'all' | 'open'>('all');

  const filtered = centres.filter((c) => {
    if (filter === 'open' && c.status !== 'open') return false;
    const q = search.toLowerCase();
    return c.name.toLowerCase().includes(q) || c.village.toLowerCase().includes(q) || c.district.toLowerCase().includes(q);
  });

  return (
    <FarmerLayout title="Select Procurement Centre" showBack>
      <div className="mb-4">
        <Input
          placeholder="Search by name, village or district..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          icon={<Search size={18} />}
        />
      </div>

      <div className="flex gap-2 mb-4">
        <button
          onClick={() => setFilter('all')}
          className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
            filter === 'all' ? 'bg-primary-600 text-white' : 'bg-white text-neutral-600 border border-neutral-200'
          }`}
        >
          All Centres
        </button>
        <button
          onClick={() => setFilter('open')}
          className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
            filter === 'open' ? 'bg-primary-600 text-white' : 'bg-white text-neutral-600 border border-neutral-200'
          }`}
        >
          Open Now
        </button>
      </div>

      <div className="space-y-3">
        {filtered.map((centre) => {
          const totalSlots = centre.todaysSlots.length;
          const availableSlots = centre.todaysSlots.filter((s) => s.status === 'available' || s.status === 'filling').length;
          const isDisabled = centre.status !== 'open';

          return (
            <Card key={centre.id} className={isDisabled ? 'opacity-60' : ''}>
              <div className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-neutral-800 truncate">{centre.name}</h3>
                    <p className="text-sm text-neutral-500 flex items-center gap-1 mt-0.5">
                      <MapPin size={14} />
                      {centre.village}, {centre.district}
                    </p>
                  </div>
                  <CentreStatusBadge status={centre.status} />
                </div>

                <div className="flex items-center gap-4 text-sm text-neutral-500 mb-3">
                  <span className="flex items-center gap-1">
                    <Clock size={14} />
                    {centre.operatingHours}
                  </span>
                  <span className="flex items-center gap-1">
                    <Users size={14} />
                    Queue: {centre.currentQueue}
                  </span>
                </div>

                <div className="flex flex-wrap gap-1.5 mb-3">
                  {centre.acceptingCrops.map((crop) => (
                    <Badge key={crop} color="green" size="sm">{crop}</Badge>
                  ))}
                </div>

                <div className="mb-3">
                  <ProgressBar
                    value={centre.todaysSlots.reduce((s, sl) => s + sl.booked, 0)}
                    max={centre.todaysSlots.reduce((s, sl) => s + sl.totalCapacity, 0)}
                    label="Today's slot availability"
                    showCount
                  />
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-neutral-500">
                    {availableSlots} of {totalSlots} slots available
                  </span>
                  <Button
                    size="sm"
                    disabled={isDisabled || availableSlots === 0}
                    onClick={() => navigate('slot-booking', { centreId: centre.id })}
                  >
                    {isDisabled ? 'Unavailable' : availableSlots === 0 ? 'All Full' : 'Book Slot'}
                  </Button>
                </div>
              </div>
            </Card>
          );
        })}

        {filtered.length === 0 && (
          <Card>
            <div className="p-8 text-center text-neutral-400">
              <MapPin size={32} className="mx-auto mb-2" />
              <p>No centres found matching your search</p>
            </div>
          </Card>
        )}
      </div>
    </FarmerLayout>
  );
}
