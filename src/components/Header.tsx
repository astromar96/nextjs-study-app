import { ThemeToggle } from './ThemeToggle';
import { ProgressBar } from './ProgressBar';

interface HeaderProps {
  isDark: boolean;
  toggleTheme: () => void;
  totalReviewed: number;
  totalQuestions: number;
  onOpenSearch: () => void;
  onToggleSidebar: () => void;
}

export function Header({
  isDark,
  toggleTheme,
  totalReviewed,
  totalQuestions,
  onOpenSearch,
  onToggleSidebar,
}: HeaderProps) {
  return (
    <header className="sticky top-0 z-30 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-700">
      <div className="flex items-center gap-3 px-4 py-3">
        {/* Mobile hamburger */}
        <button
          onClick={onToggleSidebar}
          className="lg:hidden p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          aria-label="Toggle sidebar"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>

        {/* Title */}
        <div className="flex items-center gap-2 min-w-0">
          <span className="text-lg">⚡</span>
          <h1 className="font-bold text-base truncate">Next.js Interview Prep</h1>
        </div>

        {/* Spacer */}
        <div className="flex-1" />

        {/* Progress */}
        <div className="hidden sm:flex items-center gap-2.5 mr-2">
          <ProgressBar current={totalReviewed} total={totalQuestions} className="w-24" />
          <span className="text-xs font-medium text-gray-500 dark:text-gray-400 whitespace-nowrap">
            {totalReviewed}/{totalQuestions}
          </span>
        </div>

        {/* Search */}
        <button
          onClick={onOpenSearch}
          className="flex items-center gap-2 px-3 py-1.5 text-sm text-gray-400 dark:text-gray-500 bg-gray-100 dark:bg-gray-800 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <span className="hidden md:inline">Search</span>
          <kbd className="hidden md:inline text-[10px] font-mono bg-gray-200 dark:bg-gray-700 px-1.5 py-0.5 rounded">
            ⌘K
          </kbd>
        </button>

        {/* Theme toggle */}
        <ThemeToggle isDark={isDark} toggle={toggleTheme} />
      </div>
    </header>
  );
}
