interface ProgressBarProps {
  current: number;
  total: number;
  className?: string;
}

export function ProgressBar({ current, total, className = '' }: ProgressBarProps) {
  const percentage = total > 0 ? (current / total) * 100 : 0;

  return (
    <div className={`w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5 ${className}`}>
      <div
        className="bg-indigo-500 dark:bg-indigo-400 h-1.5 rounded-full transition-all duration-300"
        style={{ width: `${percentage}%` }}
      />
    </div>
  );
}
