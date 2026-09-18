import { Users, TrendingUp, Banknote, Building2, Wheat, Clock, MapPin } from 'lucide-react';
import { DashboardLayout, getAdminNav } from '@/components/layouts/DashboardLayout';
import { Card, CardBody } from '@/components/ui/Card';
import { CentreStatusBadge } from '@/components/ui/Badge';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { Table } from '@/components/ui/Table';
import { useApp } from '@/store/AppContext';
import { useRouter } from '@/store/Router';
import type { ProcurementCentre } from '@/types';

export function AdminDashboard() {
  const { centres, bookings, farmers, admin } = useApp();
  const { navigate } = useRouter();

  const totalProcessed = centres.reduce((s, c) => s + c.totalProcessedToday, 0);
  const totalPayment = centres.reduce((s, c) => s + c.totalPaymentToday, 0);
  const totalQueue = centres.reduce((s, c) => s + c.currentQueue, 0);
  const openCentres = centres.filter((c) => c.status === 'open').length;
  const totalBookings = bookings.length;
  const activeBookings = bookings.filter((b) => !['paid', 'cancelled'].includes(b.status)).length;
  const completedBookings = bookings.filter((b) => b.status === 'paid').length;

  const stats = [
    { icon: <Building2 size={20} />, label: 'Total Centres', value: String(centres.length), sub: `${openCentres} open now`, color: 'bg-blue-50 text-blue-600' },
    { icon: <Users size={20} />, label: 'Registered Farmers', value: String(farmers.length), sub: 'across district', color: 'bg-primary-50 text-primary-600' },
    { icon: <TrendingUp size={20} />, label: 'Processed Today', value: String(totalProcessed), sub: `${activeBookings} active`, color: 'bg-amber-50 text-amber-600' },
    { icon: <Banknote size={20} />, label: 'Payment Today', value: `₹${(totalPayment / 100000).toFixed(1)}L`, sub: `${completedBookings} paid`, color: 'bg-primary-50 text-primary-600' },
  ];

  // Crop-wise aggregation
  const cropMap = new Map<string, { qty: number; amount: number; count: number }>();
  bookings.filter((b) => b.weighedQuantity).forEach((b) => {
    const existing = cropMap.get(b.crop) ?? { qty: 0, amount: 0, count: 0 };
    cropMap.set(b.crop, {
      qty: existing.qty + (b.weighedQuantity ?? 0),
      amount: existing.amount + (b.totalAmount ?? 0),
      count: existing.count + 1,
    });
  });

  return (
    <DashboardLayout navItems={getAdminNav()} title="Admin Dashboard" subtitle={admin.region}>
      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {stats.map((stat) => (
          <Card key={stat.label}>
            <div className="p-4">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-2 ${stat.color}`}>
                {stat.icon}
              </div>
              <p className="text-2xl font-bold text-neutral-800">{stat.value}</p>
              <p className="text-sm text-neutral-500">{stat.label}</p>
              <p className="text-xs text-neutral-400 mt-0.5">{stat.sub}</p>
            </div>
          </Card>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6 mb-6">
        {/* Centre overview */}
        <Card>
          <CardBody className="p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-neutral-800">Centre Overview</h3>
              <button onClick={() => navigate('admin-centres')} className="text-sm font-semibold text-primary-600 hover:underline">
                View All
              </button>
            </div>
            <div className="space-y-4">
              {centres.map((c) => (
                <div key={c.id} className="flex items-center gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-semibold text-neutral-800 text-sm truncate">{c.name}</p>
                      <CentreStatusBadge status={c.status} />
                    </div>
                    <ProgressBar
                      value={c.totalProcessedToday}
                      max={c.todaysSlots.reduce((s, sl) => s + sl.totalCapacity, 0)}
                      showCount
                      label="Processed / Total capacity"
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardBody>
        </Card>

        {/* Crop-wise summary */}
        <Card>
          <CardBody className="p-5">
            <h3 className="font-bold text-neutral-800 mb-4">Crop-wise Procurement Today</h3>
            {cropMap.size === 0 ? (
              <p className="text-sm text-neutral-400 text-center py-8">No procurement data yet</p>
            ) : (
              <div className="space-y-3">
                {Array.from(cropMap.entries()).map(([crop, data]) => (
                  <div key={crop} className="flex items-center gap-3 p-3 bg-neutral-50 rounded-xl">
                    <div className="w-10 h-10 rounded-lg bg-primary-50 flex items-center justify-center text-primary-600">
                      <Wheat size={18} />
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-neutral-800 text-sm">{crop}</p>
                      <p className="text-xs text-neutral-500">{data.count} procurement{data.count !== 1 ? 's' : ''} · {data.qty.toFixed(1)} quintals</p>
                    </div>
                    <p className="font-bold text-primary-600">₹{data.amount.toLocaleString('en-IN')}</p>
                  </div>
                ))}
              </div>
            )}
          </CardBody>
        </Card>
      </div>

      {/* Recent bookings */}
      <Card>
        <div className="p-5 pb-0 flex items-center justify-between mb-3">
          <h3 className="font-bold text-neutral-800">Recent Bookings</h3>
          <button onClick={() => navigate('admin-reports')} className="text-sm font-semibold text-primary-600 hover:underline">
            View Reports
          </button>
        </div>
        <Table<ProcurementCentre>
          columns={[
            {
              key: 'name',
              label: 'Centre',
              render: (c) => (
                <div>
                  <p className="font-semibold text-neutral-800">{c.name}</p>
                  <p className="text-xs text-neutral-400 flex items-center gap-1">
                    <MapPin size={12} /> {c.village}
                  </p>
                </div>
              ),
            },
            { key: 'manager', label: 'Manager' },
            {
              key: 'currentQueue',
              label: 'Queue',
              align: 'center',
              render: (c) => <span className="font-semibold text-amber-600">{c.currentQueue}</span>,
            },
            {
              key: 'totalProcessedToday',
              label: 'Processed',
              align: 'center',
              render: (c) => <span className="font-semibold text-neutral-700">{c.totalProcessedToday}</span>,
            },
            {
              key: 'totalPaymentToday',
              label: 'Payment',
              align: 'right',
              render: (c) => <span className="font-semibold text-primary-600">₹{c.totalPaymentToday.toLocaleString('en-IN')}</span>,
            },
            {
              key: 'status',
              label: 'Status',
              render: (c) => <CentreStatusBadge status={c.status} />,
            },
          ]}
          data={centres}
          rowKey={(c) => c.id}
          onRowClick={(c) => navigate('admin-centres', { centreId: c.id })}
        />
      </Card>
    </DashboardLayout>
  );
}
