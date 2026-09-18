import { Bell, CheckCircle2, Info, AlertTriangle, XCircle } from 'lucide-react';
import { FarmerLayout } from '@/components/layouts/FarmerLayout';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { EmptyState } from '@/components/ui/States';
import { useApp } from '@/store/AppContext';
import { useRouter } from '@/store/Router';
import { cn } from '@/utils/cn';

export function FarmerNotificationsScreen() {
  const { currentFarmerId, getFarmerNotifications, markNotificationRead } = useApp();
  const { navigate } = useRouter();
  const notifications = currentFarmerId ? getFarmerNotifications(currentFarmerId) : [];
  const unread = notifications.filter((n) => !n.read);

  const iconMap = {
    success: <CheckCircle2 size={20} className="text-primary-600" />,
    info: <Info size={20} className="text-blue-600" />,
    warning: <AlertTriangle size={20} className="text-amber-600" />,
    error: <XCircle size={20} className="text-red-600" />,
  };

  const bgMap = {
    success: 'bg-primary-50',
    info: 'bg-blue-50',
    warning: 'bg-amber-50',
    error: 'bg-red-50',
  };

  return (
    <FarmerLayout title="Notifications">
      {unread.length > 0 && (
        <div className="mb-4 flex items-center justify-between">
          <span className="text-sm text-neutral-500">{unread.length} unread notification{unread.length !== 1 ? 's' : ''}</span>
          <button
            onClick={() => unread.forEach((n) => markNotificationRead(n.id))}
            className="text-sm font-semibold text-primary-600 hover:underline"
          >
            Mark all as read
          </button>
        </div>
      )}

      {notifications.length === 0 ? (
        <Card>
          <EmptyState
            icon={<Bell size={28} />}
            title="No Notifications"
            message="You will see updates about your bookings and payments here"
          />
        </Card>
      ) : (
        <div className="space-y-3">
          {notifications.map((notif) => (
            <Card
              key={notif.id}
              hover
              onClick={() => {
                if (!notif.read) markNotificationRead(notif.id);
                if (notif.bookingId) navigate('procurement-detail', { bookingId: notif.bookingId });
              }}
              className={cn(!notif.read && 'border-primary-200')}
            >
              <div className="p-4 flex items-start gap-3">
                <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0', bgMap[notif.type])}>
                  {iconMap[notif.type]}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="font-bold text-neutral-800 text-sm">{notif.title}</p>
                    {!notif.read && <span className="w-2 h-2 rounded-full bg-primary-500 flex-shrink-0" />}
                  </div>
                  <p className="text-sm text-neutral-500">{notif.message}</p>
                  <p className="text-xs text-neutral-400 mt-2">
                    {timeAgo(notif.createdAt)}
                  </p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </FarmerLayout>
  );
}

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins} min ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs} hr ago`;
  const days = Math.floor(hrs / 24);
  return `${days} day ago`;
}
