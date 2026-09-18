import { CheckCircle2, XCircle, Info, AlertTriangle, X } from 'lucide-react';
import { useApp } from '@/store/AppContext';
import { cn } from '@/utils/cn';

export function ToastContainer() {
  const { toasts, dismissToast } = useApp();

  const iconMap = {
    success: <CheckCircle2 size={20} className="text-primary-600" />,
    error: <XCircle size={20} className="text-red-600" />,
    info: <Info size={20} className="text-blue-600" />,
    warning: <AlertTriangle size={20} className="text-amber-600" />,
  };

  const borderMap = {
    success: 'border-l-primary-500',
    error: 'border-l-red-500',
    info: 'border-l-blue-500',
    warning: 'border-l-amber-500',
  };

  return (
    <div className="fixed bottom-4 right-4 z-[60] flex flex-col gap-2 max-w-sm w-full pointer-events-none">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={cn(
            'pointer-events-auto bg-white rounded-xl shadow-lg border border-neutral-100 border-l-4 p-4 flex items-start gap-3 animate-slide-up',
            borderMap[toast.type]
          )}
        >
          <div className="flex-shrink-0 mt-0.5">{iconMap[toast.type]}</div>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-neutral-800 text-sm">{toast.title}</p>
            {toast.message && <p className="text-sm text-neutral-500 mt-0.5">{toast.message}</p>}
          </div>
          <button
            onClick={() => dismissToast(toast.id)}
            className="flex-shrink-0 text-neutral-400 hover:text-neutral-600"
          >
            <X size={16} />
          </button>
        </div>
      ))}
    </div>
  );
}
