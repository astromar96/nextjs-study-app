import { useState, useMemo } from 'react';
import type { Section, Question } from '../types';

export interface SearchResult extends Question {
  sectionTitle: string;
}

export function useSearch(sections: Section[]) {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);

  const results = useMemo(() => {
    if (!query.trim()) return [];
    const lower = query.toLowerCase();
    return sections.flatMap((section) =>
      section.questions
        .filter(
          (q) =>
            q.question.toLowerCase().includes(lower) ||
            q.answerMarkdown.toLowerCase().includes(lower)
        )
        .map((q) => ({ ...q, sectionTitle: section.title }))
    );
  }, [query, sections]);

  return { query, setQuery, results, isOpen, setIsOpen };
}
