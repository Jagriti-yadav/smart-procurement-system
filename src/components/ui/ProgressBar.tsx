import { cn } from '@/utils/cn';

interface ProgressBarProps {
  value: number;
  max: number;
  color?: 'primary' | 'amber' | 'red';
  label?: string;
  showCount?: boolean;
}

export function ProgressBar({ value, max, color = 'primary', label, showCount }: ProgressBarProps) {
  const pct = max > 0 ? Math.min(100, (value / max) * 100) : 0;
  const colorMap = {
    primary: 'bg-primary-500',
    amber: 'bg-amber-500',
    red: 'bg-red-500',
  };
  return (
    <div className="w-full">
      {(label || showCount) && (
        <div className="flex justify-between items-center mb-1.5">
          {label && <span className="text-sm font-medium text-neutral-600">{label}</span>}
          {showCount && (
            <span className="text-sm font-semibold text-neutral-700">
              {value}/{max}
            </span>
          )}
        </div>
      )}
      <div className="h-2 bg-neutral-100 rounded-full overflow-hidden">
        <div
          className={cn('h-full rounded-full transition-all duration-500', colorMap[color])}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
