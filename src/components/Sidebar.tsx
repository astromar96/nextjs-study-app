import type { Section } from '../types';
import { ProgressBar } from './ProgressBar';

interface SidebarProps {
  sections: Section[];
  activeSectionIndex: number;
  onSelectSection: (index: number) => void;
  getSectionProgress: (sectionId: number) => { reviewed: number; total: number };
  onReset: () => void;
  onClose?: () => void;
}

export function Sidebar({
  sections,
  activeSectionIndex,
  onSelectSection,
  getSectionProgress,
  onReset,
  onClose,
}: SidebarProps) {
  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <h2 className="font-bold text-sm text-gray-500 dark:text-gray-400 uppercase tracking-wider">
          Sections
        </h2>
      </div>

      <nav className="flex-1 overflow-y-auto p-2 space-y-0.5">
        {sections.map((section, index) => {
          const { reviewed, total } = getSectionProgress(section.id);
          const isActive = index === activeSectionIndex;

          return (
            <button
              key={section.id}
              onClick={() => {
                onSelectSection(index);
                onClose?.();
              }}
              className={`w-full text-left px-3 py-2.5 rounded-lg text-sm transition-colors ${
                isActive
                  ? 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300'
                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
              }`}
            >
              <div className="flex items-start gap-2.5">
                <span
                  className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-semibold mt-0.5 ${
                    reviewed === total && total > 0
                      ? 'bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-400'
                      : isActive
                        ? 'bg-indigo-100 dark:bg-indigo-800 text-indigo-700 dark:text-indigo-300'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400'
                  }`}
                >
                  {reviewed === total && total > 0 ? '✓' : section.id}
                </span>
                <div className="flex-1 min-w-0">
                  <span className="block leading-snug">{section.title}</span>
                  <div className="flex items-center gap-2 mt-1.5">
                    <ProgressBar current={reviewed} total={total} className="flex-1" />
                    <span className="text-xs text-gray-400 dark:text-gray-500 flex-shrink-0">
                      {reviewed}/{total}
                    </span>
                  </div>
                </div>
              </div>
            </button>
          );
        })}
      </nav>

      <div className="p-3 border-t border-gray-200 dark:border-gray-700">
        <button
          onClick={onReset}
          className="w-full text-xs text-gray-400 dark:text-gray-500 hover:text-red-500 dark:hover:text-red-400 transition-colors py-1.5"
        >
          Reset Progress
        </button>
      </div>
    </div>
  );
}
