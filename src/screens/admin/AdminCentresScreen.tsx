import { useState } from 'react';
import { MapPin, Phone, Clock, Users, Settings, Building2, X } from 'lucide-react';
import { DashboardLayout, getAdminNav } from '@/components/layouts/DashboardLayout';
import { Card, CardBody } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input, Select } from '@/components/ui/Input';
import { CentreStatusBadge, Badge } from '@/components/ui/Badge';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { Modal } from '@/components/ui/Modal';
import { useApp } from '@/store/AppContext';
import type { CentreStatus } from '@/types';

export function AdminCentresScreen() {
  const { centres, operators, updateCentre } = useApp();
  const [editCentre, setEditCentre] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<{ status: CentreStatus; operatingHours: string; manager: string; phone: string }>({
    status: 'open',
    operatingHours: '',
    manager: '',
    phone: '',
  });

  const centre = centres.find((c) => c.id === editCentre);
  const centreOperator = centre ? operators.find((o) => o.centreId === centre.id) : null;

  const openEdit = (id: string) => {
    const c = centres.find((c) => c.id === id);
    if (c) {
      setEditForm({
        status: c.status,
        operatingHours: c.operatingHours,
        manager: c.manager,
        phone: c.phone,
      });
      setEditCentre(id);
    }
  };

  const handleSave = () => {
    if (editCentre) {
      updateCentre(editCentre, editForm);
      setEditCentre(null);
    }
  };

  return (
    <DashboardLayout navItems={getAdminNav()} title="Centre Management" subtitle="Manage procurement centres">
      <div className="grid lg:grid-cols-2 gap-4">
        {centres.map((c) => {
          const totalCap = c.todaysSlots.reduce((s, sl) => s + sl.totalCapacity, 0);
          const totalBooked = c.todaysSlots.reduce((s, sl) => s + sl.booked, 0);
          const op = operators.find((o) => o.centreId === c.id);

          return (
            <Card key={c.id}>
              <CardBody className="p-5">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-bold text-neutral-800">{c.name}</h3>
                    <p className="text-sm text-neutral-500 flex items-center gap-1 mt-0.5">
                      <MapPin size={14} /> {c.village}, {c.district}, {c.state}
                    </p>
                  </div>
                  <CentreStatusBadge status={c.status} />
                </div>

                <div className="grid grid-cols-2 gap-3 text-sm mb-4">
                  <div className="flex items-center gap-2 text-neutral-500">
                    <Clock size={14} /> {c.operatingHours}
                  </div>
                  <div className="flex items-center gap-2 text-neutral-500">
                    <Users size={14} /> Queue: {c.currentQueue}
                  </div>
                  <div className="flex items-center gap-2 text-neutral-500">
                    <Phone size={14} /> {c.phone}
                  </div>
                  <div className="flex items-center gap-2 text-neutral-500">
                    <Building2 size={14} /> {op?.name ?? c.manager}
                  </div>
                </div>

                <div className="mb-4">
                  <ProgressBar
                    value={c.totalProcessedToday}
                    max={totalCap}
                    label="Processed today"
                    showCount
                  />
                </div>

                <div className="flex flex-wrap gap-1.5 mb-4">
                  {c.acceptingCrops.map((crop) => (
                    <Badge key={crop} color="green" size="sm">{crop}</Badge>
                  ))}
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-neutral-100">
                  <div className="text-sm">
                    <span className="text-neutral-500">Slots: </span>
                    <span className="font-semibold text-neutral-700">{totalBooked}/{totalCap}</span>
                  </div>
                  <Button size="sm" variant="outline" onClick={() => openEdit(c.id)}>
                    <Settings size={14} /> Edit
                  </Button>
                </div>
              </CardBody>
            </Card>
          );
        })}
      </div>

      <Modal
        open={!!editCentre}
        onClose={() => setEditCentre(null)}
        title={centre?.name ?? 'Edit Centre'}
        footer={
          <>
            <Button variant="outline" onClick={() => setEditCentre(null)}>Cancel</Button>
            <Button onClick={handleSave}>Save Changes</Button>
          </>
        }
      >
        <div className="space-y-4">
          <Select
            label="Centre Status"
            value={editForm.status}
            onChange={(e) => setEditForm((f) => ({ ...f, status: e.target.value as CentreStatus }))}
          >
            <option value="open">Open</option>
            <option value="closed">Closed</option>
            <option value="maintenance">Maintenance</option>
          </Select>
          <Input
            label="Operating Hours"
            value={editForm.operatingHours}
            onChange={(e) => setEditForm((f) => ({ ...f, operatingHours: e.target.value }))}
            placeholder="e.g. 08:00 – 18:00"
          />
          <Input
            label="Manager Name"
            value={editForm.manager}
            onChange={(e) => setEditForm((f) => ({ ...f, manager: e.target.value }))}
          />
          <Input
            label="Contact Phone"
            value={editForm.phone}
            onChange={(e) => setEditForm((f) => ({ ...f, phone: e.target.value }))}
          />
          {centreOperator && (
            <div className="bg-blue-50 rounded-xl p-3 text-sm text-blue-700">
              <p className="font-semibold">Assigned Operator: {centreOperator.name}</p>
              <p className="text-blue-600 mt-0.5">{centreOperator.phone}</p>
            </div>
          )}
        </div>
      </Modal>
    </DashboardLayout>
  );
}
