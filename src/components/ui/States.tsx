import type { ReactNode } from 'react';
import { Loader2, Inbox, AlertCircle, CheckCircle2 } from 'lucide-react';

export function LoadingState({ message = 'Loading...' }: { message?: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4">
      <Loader2 size={32} className="text-primary-600 animate-spin" />
      <p className="mt-3 text-neutral-500 font-medium">{message}</p>
    </div>
  );
}

export function EmptyState({
  icon,
  title,
  message,
  action,
}: {
  icon?: ReactNode;
  title: string;
  message?: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <div className="w-16 h-16 rounded-full bg-neutral-100 flex items-center justify-center text-neutral-400">
        {icon ?? <Inbox size={28} />}
      </div>
      <h3 className="mt-4 text-lg font-bold text-neutral-700">{title}</h3>
      {message && <p className="mt-1 text-neutral-500 max-w-sm">{message}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

export function ErrorState({
  title = 'Something went wrong',
  message,
  onRetry,
}: {
  title?: string;
  message?: string;
  onRetry?: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center text-red-500">
        <AlertCircle size={28} />
      </div>
      <h3 className="mt-4 text-lg font-bold text-neutral-700">{title}</h3>
      {message && <p className="mt-1 text-neutral-500 max-w-sm">{message}</p>}
      {onRetry && (
        <button
          onClick={onRetry}
          className="mt-4 btn-base bg-primary-600 text-white hover:bg-primary-700 px-4 py-2.5"
        >
          Try Again
        </button>
      )}
    </div>
  );
}

export function SuccessState({
  title,
  message,
  action,
}: {
  title: string;
  message?: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center animate-scale-in">
      <div className="w-16 h-16 rounded-full bg-primary-50 flex items-center justify-center">
        <CheckCircle2 size={32} className="text-primary-600" />
      </div>
      <h3 className="mt-4 text-xl font-bold text-neutral-800">{title}</h3>
      {message && <p className="mt-1 text-neutral-500 max-w-md">{message}</p>}
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}
