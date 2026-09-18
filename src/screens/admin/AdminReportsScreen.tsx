import { useState } from 'react';
import { Download, TrendingUp, Banknote, Wheat, Users, Clock } from 'lucide-react';
import { DashboardLayout, getAdminNav } from '@/components/layouts/DashboardLayout';
import { Card, CardBody } from '@/components/ui/Card';
import { Tabs } from '@/components/ui/Tabs';
import { Table } from '@/components/ui/Table';
import { Button } from '@/components/ui/Button';
import { StatusBadge, PaymentBadge, GradeBadge } from '@/components/ui/Badge';
import { useApp } from '@/store/AppContext';
import type { Booking, CropType } from '@/types';

export function AdminReportsScreen() {
  const { bookings, centres, farmers } = useApp();
  const [tab, setTab] = useState('procurements');
  const [cropFilter, setCropFilter] = useState<string>('all');

  const allCrops: CropType[] = ['Wheat', 'Rice', 'Mustard', 'Soybean', 'Maize', 'Cotton', 'Groundnut', 'Bajra'];

  const completedBookings = bookings.filter((b) => b.status === 'paid');
  const totalAmount = completedBookings.reduce((s, b) => s + (b.totalAmount ?? 0), 0);
  const totalQty = completedBookings.reduce((s, b) => s + (b.weighedQuantity ?? 0), 0);
  const avgAmount = completedBookings.length > 0 ? Math.round(totalAmount / completedBookings.length) : 0;

  // Crop-wise summary
  const cropSummary = allCrops.map((crop) => {
    const cropBookings = completedBookings.filter((b) => b.crop === crop);
    return {
      crop,
      count: cropBookings.length,
      qty: cropBookings.reduce((s, b) => s + (b.weighedQuantity ?? 0), 0),
      amount: cropBookings.reduce((s, b) => s + (b.totalAmount ?? 0), 0),
    };
  }).filter((c) => c.count > 0);

  // Centre-wise summary
  const centreSummary = centres.map((c) => {
    const cBookings = bookings.filter((b) => b.centreId === c.id);
    const cCompleted = cBookings.filter((b) => b.status === 'paid');
    return {
      centre: c.name,
      total: cBookings.length,
      completed: cCompleted.length,
      qty: cCompleted.reduce((s, b) => s + (b.weighedQuantity ?? 0), 0),
      amount: cCompleted.reduce((s, b) => s + (b.totalAmount ?? 0), 0),
    };
  });

  const filteredBookings = cropFilter === 'all' ? bookings : bookings.filter((b) => b.crop === cropFilter);

  const summaryStats = [
    { icon: <TrendingUp size={18} />, label: 'Total Procurements', value: String(bookings.length), color: 'bg-blue-50 text-blue-600' },
    { icon: <Banknote size={18} />, label: 'Total Amount Paid', value: `₹${totalAmount.toLocaleString('en-IN')}`, color: 'bg-primary-50 text-primary-600' },
    { icon: <Wheat size={18} />, label: 'Total Quantity', value: `${totalQty.toFixed(1)} q`, color: 'bg-amber-50 text-amber-600' },
    { icon: <Users size={18} />, label: 'Avg. per Farmer', value: `₹${avgAmount.toLocaleString('en-IN')}`, color: 'bg-primary-50 text-primary-600' },
  ];

  return (
    <DashboardLayout navItems={getAdminNav()} title="Reports & Analytics" subtitle="District-wide procurement data">
      {/* Summary */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {summaryStats.map((s) => (
          <Card key={s.label}>
            <div className="p-4">
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center mb-2 ${s.color}`}>
                {s.icon}
              </div>
              <p className="text-xl font-bold text-neutral-800">{s.value}</p>
              <p className="text-xs text-neutral-500">{s.label}</p>
            </div>
          </Card>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6 mb-6">
        {/* Crop-wise */}
        <Card>
          <CardBody className="p-5">
            <h3 className="font-bold text-neutral-800 mb-4">Crop-wise Summary</h3>
            <Table
              columns={[
                { key: 'crop', label: 'Crop', render: (r: typeof cropSummary[0]) => <span className="font-semibold text-neutral-800">{r.crop}</span> },
                { key: 'count', label: 'Count', align: 'center' },
                { key: 'qty', label: 'Qty (q)', align: 'right', render: (r: typeof cropSummary[0]) => r.qty.toFixed(1) },
                { key: 'amount', label: 'Amount', align: 'right', render: (r: typeof cropSummary[0]) => <span className="font-semibold text-primary-600">₹{r.amount.toLocaleString('en-IN')}</span> },
              ]}
              data={cropSummary}
              rowKey={(r) => r.crop}
              emptyMessage="No procurement data"
            />
          </CardBody>
        </Card>

        {/* Centre-wise */}
        <Card>
          <CardBody className="p-5">
            <h3 className="font-bold text-neutral-800 mb-4">Centre-wise Summary</h3>
            <Table
              columns={[
                { key: 'centre', label: 'Centre', render: (r: typeof centreSummary[0]) => <span className="font-semibold text-neutral-800 text-sm">{r.centre}</span> },
                { key: 'completed', label: 'Done', align: 'center' },
                { key: 'qty', label: 'Qty (q)', align: 'right', render: (r: typeof centreSummary[0]) => r.qty.toFixed(1) },
                { key: 'amount', label: 'Amount', align: 'right', render: (r: typeof centreSummary[0]) => <span className="font-semibold text-primary-600">₹{r.amount.toLocaleString('en-IN')}</span> },
              ]}
              data={centreSummary}
              rowKey={(r) => r.centre}
              emptyMessage="No data"
            />
          </CardBody>
        </Card>
      </div>

      {/* Detailed bookings */}
      <Card>
        <div className="p-5 pb-0">
          <div className="flex items-center justify-between flex-wrap gap-3 mb-3">
            <Tabs
              tabs={[
                { key: 'procurements', label: 'All Bookings', count: bookings.length },
                { key: 'completed', label: 'Completed', count: completedBookings.length },
              ]}
              activeKey={tab}
              onChange={setTab}
            />
            <div className="flex gap-2">
              <select
                value={cropFilter}
                onChange={(e) => setCropFilter(e.target.value)}
                className="text-sm px-3 py-2 rounded-xl border border-neutral-200 bg-white text-neutral-700 focus:outline-none focus:border-primary-500"
              >
                <option value="all">All Crops</option>
                {allCrops.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
              <Button variant="outline" size="sm" onClick={() => {}}>
                <Download size={16} /> Export
              </Button>
            </div>
          </div>
        </div>
        <Table<Booking>
          columns={[
            { key: 'tokenNumber', label: 'Token', render: (b) => <span className="font-bold text-primary-600 text-sm">{b.tokenNumber}</span> },
            { key: 'farmerName', label: 'Farmer' },
            { key: 'centreName', label: 'Centre', render: (b) => <span className="text-sm">{b.centreName}</span> },
            { key: 'crop', label: 'Crop' },
            { key: 'quantityQuintals', label: 'Declared', align: 'right', render: (b) => `${b.quantityQuintals} q` },
            { key: 'weighedQuantity', label: 'Weighed', align: 'right', render: (b) => b.weighedQuantity ? `${b.weighedQuantity} q` : '—' },
            {
              key: 'qualityGrade',
              label: 'Grade',
              align: 'center',
              render: (b) => b.qualityGrade ? <GradeBadge grade={b.qualityGrade} /> : '—',
            },
            {
              key: 'totalAmount',
              label: 'Amount',
              align: 'right',
              render: (b) => b.totalAmount ? <span className="font-semibold text-primary-600">₹{b.totalAmount.toLocaleString('en-IN')}</span> : '—',
            },
            {
              key: 'status',
              label: 'Status',
              render: (b) => <StatusBadge status={b.status} />,
            },
            {
              key: 'paymentStatus',
              label: 'Payment',
              render: (b) => <PaymentBadge status={b.paymentStatus} />,
            },
          ]}
          data={tab === 'completed' ? filteredBookings.filter((b) => b.status === 'paid') : filteredBookings}
          rowKey={(b) => b.id}
          emptyMessage="No bookings found"
        />
      </Card>
    </DashboardLayout>
  );
}
