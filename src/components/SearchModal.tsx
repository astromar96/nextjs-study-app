import { useEffect, useRef } from 'react';
import type { SearchResult } from '../hooks/useSearch';

interface SearchModalProps {
  isOpen: boolean;
  query: string;
  results: SearchResult[];
  onQueryChange: (query: string) => void;
  onClose: () => void;
  onSelect: (sectionId: number, questionId: string) => void;
}

export function SearchModal({
  isOpen,
  query,
  results,
  onQueryChange,
  onClose,
  onSelect,
}: SearchModalProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      // Small delay to ensure modal is rendered
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh]">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 w-full max-w-lg mx-4 overflow-hidden">
        {/* Search input */}
        <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-200 dark:border-gray-700">
          <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => onQueryChange(e.target.value)}
            placeholder="Search questions..."
            className="flex-1 bg-transparent text-sm outline-none text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500"
          />
          <kbd className="text-[10px] font-mono text-gray-400 bg-gray-100 dark:bg-gray-700 px-1.5 py-0.5 rounded">
            ESC
          </kbd>
        </div>

        {/* Results */}
        <div className="max-h-80 overflow-y-auto">
          {query.trim() === '' ? (
            <div className="p-8 text-center text-sm text-gray-400 dark:text-gray-500">
              Type to search across all questions and answers
            </div>
          ) : results.length === 0 ? (
            <div className="p-8 text-center text-sm text-gray-400 dark:text-gray-500">
              No results found for "{query}"
            </div>
          ) : (
            <div className="py-2">
              {results.map((result) => (
                <button
                  key={result.id}
                  onClick={() => {
                    onSelect(result.sectionId, result.id);
                    onClose();
                  }}
                  className="w-full text-left px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                >
                  <span className="text-[10px] font-medium text-indigo-500 dark:text-indigo-400 uppercase tracking-wider">
                    {result.sectionTitle}
                  </span>
                  <p className="text-sm font-medium text-gray-900 dark:text-gray-100 mt-0.5 leading-snug">
                    {result.question}
                  </p>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {results.length > 0 && (
          <div className="px-4 py-2 border-t border-gray-200 dark:border-gray-700 text-[11px] text-gray-400 dark:text-gray-500">
            {results.length} result{results.length !== 1 ? 's' : ''} found
          </div>
        )}
      </div>
    </div>
  );
}
