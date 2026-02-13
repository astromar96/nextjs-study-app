import { useEffect } from 'react';

interface NavCallbacks {
  onNext: () => void;
  onPrev: () => void;
  onSearch: () => void;
}

export function useKeyboardNav({ onNext, onPrev, onSearch }: NavCallbacks) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement
      ) {
        return;
      }

      if (e.key === 'ArrowRight') {
        e.preventDefault();
        onNext();
      }
      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        onPrev();
      }
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        onSearch();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onNext, onPrev, onSearch]);
}
