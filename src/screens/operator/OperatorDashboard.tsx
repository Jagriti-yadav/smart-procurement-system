import { Users, TrendingUp, Banknote, Clock, Wheat, ArrowRight, Ticket } from 'lucide-react';
import { DashboardLayout, getOperatorNav } from '@/components/layouts/DashboardLayout';
import { Card, CardBody } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { StatusBadge, Badge } from '@/components/ui/Badge';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { Tabs } from '@/components/ui/Tabs';
import { Table } from '@/components/ui/Table';
import { useApp } from '@/store/AppContext';
import { useRouter } from '@/store/Router';
import { useState } from 'react';
import type { Booking } from '@/types';

export function OperatorDashboard() {
  const { currentOperatorId, operators, centres, bookings } = useApp();
  const { navigate } = useRouter();
  const [tab, setTab] = useState('queue');
  const operator = operators.find((o) => o.id === currentOperatorId);
  const centre = centres.find((c) => c.id === operator?.centreId);

  if (!centre) return null;

  const centreBookings = bookings.filter((b) => b.centreId === centre.id && b.date === new Date().toISOString().split('T')[0]);
  const inQueue = centreBookings.filter((b) => ['in_queue', 'called'].includes(b.status));
  const processing = centreBookings.filter((b) => ['weighing', 'quality_check', 'procured', 'payment_processing'].includes(b.status));
  const completed = centreBookings.filter((b) => b.status === 'paid');
  const totalPayment = centreBookings.filter((b) => b.status === 'paid').reduce((s, b) => s + (b.totalAmount ?? 0), 0);
  const totalQty = centreBookings.filter((b) => b.weighedQuantity).reduce((s, b) => s + (b.weighedQuantity ?? 0), 0);

  const stats = [
    { icon: <Users size={20} />, label: 'In Queue', value: String(centre.currentQueue), color: 'bg-amber-50 text-amber-600' },
    { icon: <TrendingUp size={20} />, label: 'Processed', value: String(centre.totalProcessedToday), color: 'bg-blue-50 text-blue-600' },
    { icon: <Wheat size={20} />, label: 'Total Qty', value: `${totalQty.toFixed(1)} q`, color: 'bg-primary-50 text-primary-600' },
    { icon: <Banknote size={20} />, label: 'Payment Today', value: `₹${(totalPayment / 100000).toFixed(1)}L`, color: 'bg-primary-50 text-primary-600' },
  ];

  return (
    <DashboardLayout navItems={getOperatorNav()} title="Operator Dashboard" subtitle={centre.name}>
      {/* Stats grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {stats.map((stat) => (
          <Card key={stat.label}>
            <div className="p-4">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-2 ${stat.color}`}>
                {stat.icon}
              </div>
              <p className="text-2xl font-bold text-neutral-800">{stat.value}</p>
              <p className="text-sm text-neutral-500">{stat.label}</p>
            </div>
          </Card>
        ))}
      </div>

      {/* Slot summary */}
      <Card className="mb-6">
        <CardBody className="p-5">
          <h3 className="font-bold text-neutral-800 mb-4">Today's Slot Summary</h3>
          <div className="space-y-3">
            {centre.todaysSlots.map((slot) => (
              <div key={slot.id} className="flex items-center gap-4">
                <div className="w-32 flex-shrink-0">
                  <span className="font-semibold text-neutral-700 text-sm flex items-center gap-1">
                    <Clock size={14} className="text-neutral-400" />
                    {slot.time}
                  </span>
                </div>
                <div className="flex-1">
                  <ProgressBar value={slot.booked} max={slot.totalCapacity} showCount color={slot.booked >= slot.totalCapacity ? 'red' : slot.booked > slot.totalCapacity / 2 ? 'amber' : 'primary'} />
                </div>
                <div className="w-24 flex-shrink-0 text-right">
                  <Badge color={slot.status === 'full' ? 'red' : slot.status === 'available' ? 'green' : 'amber'}>
                    {slot.status}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardBody>
      </Card>

      {/* Quick actions */}
      <div className="grid sm:grid-cols-2 gap-4 mb-6">
        <Card hover onClick={() => navigate('operator-queue')}>
          <CardBody className="p-5 flex items-center justify-between">
            <div>
              <h3 className="font-bold text-neutral-800">Manage Queue</h3>
              <p className="text-sm text-neutral-500 mt-0.5">Call tokens and manage waiting farmers</p>
              <p className="text-sm text-amber-600 font-semibold mt-2">{inQueue.length} waiting</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600">
              <Users size={24} />
            </div>
          </CardBody>
        </Card>
        <Card hover onClick={() => navigate('operator-process')}>
          <CardBody className="p-5 flex items-center justify-between">
            <div>
              <h3 className="font-bold text-neutral-800">Process Procurement</h3>
              <p className="text-sm text-neutral-500 mt-0.5">Weigh, grade and process payments</p>
              <p className="text-sm text-primary-600 font-semibold mt-2">{processing.length} in progress</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-primary-50 flex items-center justify-center text-primary-600">
              <Ticket size={24} />
            </div>
          </CardBody>
        </Card>
      </div>

      {/* Bookings table */}
      <Card>
        <div className="p-5 pb-0">
          <Tabs
            tabs={[
              { key: 'queue', label: 'In Queue', count: inQueue.length },
              { key: 'processing', label: 'Processing', count: processing.length },
              { key: 'completed', label: 'Completed', count: completed.length },
            ]}
            activeKey={tab}
            onChange={setTab}
          />
        </div>
        <Table<Booking>
          columns={[
            {
              key: 'token',
              label: 'Token',
              render: (b) => <span className="font-bold text-primary-600">{b.tokenNumber}</span>,
            },
            { key: 'farmerName', label: 'Farmer' },
            { key: 'crop', label: 'Crop' },
            { key: 'quantityQuintals', label: 'Qty (q)', align: 'right' },
            {
              key: 'slotTime',
              label: 'Slot',
            },
            {
              key: 'status',
              label: 'Status',
              render: (b) => <StatusBadge status={b.status} />,
            },
          ]}
          data={tab === 'queue' ? inQueue : tab === 'processing' ? processing : completed}
          rowKey={(b) => b.id}
          onRowClick={(b) => navigate('operator-process', { bookingId: b.id })}
          emptyMessage="No bookings in this category"
        />
      </Card>
    </DashboardLayout>
  );
}
