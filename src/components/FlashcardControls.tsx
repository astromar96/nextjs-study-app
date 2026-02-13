interface FlashcardControlsProps {
  currentIndex: number;
  total: number;
  onPrev: () => void;
  onNext: () => void;
}

export function FlashcardControls({ currentIndex, total, onPrev, onNext }: FlashcardControlsProps) {
  return (
    <div className="flex items-center justify-between">
      <button
        onClick={onPrev}
        disabled={currentIndex === 0}
        className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium rounded-lg transition-colors disabled:opacity-30 disabled:cursor-not-allowed text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Prev
      </button>

      <div className="flex items-center gap-1.5">
        {Array.from({ length: total }, (_, i) => (
          <div
            key={i}
            className={`w-2 h-2 rounded-full transition-colors ${
              i === currentIndex
                ? 'bg-indigo-500 dark:bg-indigo-400'
                : 'bg-gray-200 dark:bg-gray-700'
            }`}
          />
        ))}
      </div>

      <button
        onClick={onNext}
        disabled={currentIndex === total - 1}
        className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium rounded-lg transition-colors disabled:opacity-30 disabled:cursor-not-allowed text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
      >
        Next
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </button>
    </div>
  );
}
