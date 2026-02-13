import { useState, useEffect, useCallback } from 'react';
import type { StudyProgress } from '../types';
import { sections } from '../data/questions';

const STORAGE_KEY = 'study-progress';

const defaultProgress: StudyProgress = {
  reviewedQuestions: [],
  lastVisitedSection: 0,
  lastVisitedQuestion: 0,
  lastUpdated: new Date().toISOString(),
};

function loadProgress(): StudyProgress {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) return JSON.parse(stored);
  } catch {
    // ignore parse errors
  }
  return defaultProgress;
}

export function useProgress() {
  const [progress, setProgress] = useState<StudyProgress>(loadProgress);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
  }, [progress]);

  const toggleReviewed = useCallback((questionId: string) => {
    setProgress((prev) => {
      const reviewed = prev.reviewedQuestions.includes(questionId)
        ? prev.reviewedQuestions.filter((id) => id !== questionId)
        : [...prev.reviewedQuestions, questionId];
      return { ...prev, reviewedQuestions: reviewed, lastUpdated: new Date().toISOString() };
    });
  }, []);

  const isReviewed = useCallback(
    (questionId: string) => progress.reviewedQuestions.includes(questionId),
    [progress.reviewedQuestions]
  );

  const getSectionProgress = useCallback(
    (sectionId: number) => {
      const section = sections.find((s) => s.id === sectionId);
      if (!section) return { reviewed: 0, total: 0 };
      const reviewed = section.questions.filter((q) =>
        progress.reviewedQuestions.includes(q.id)
      ).length;
      return { reviewed, total: section.questions.length };
    },
    [progress.reviewedQuestions]
  );

  const setLastVisited = useCallback((sectionIndex: number, questionIndex: number) => {
    setProgress((prev) => ({
      ...prev,
      lastVisitedSection: sectionIndex,
      lastVisitedQuestion: questionIndex,
      lastUpdated: new Date().toISOString(),
    }));
  }, []);

  const resetProgress = useCallback(() => {
    setProgress({ ...defaultProgress, lastUpdated: new Date().toISOString() });
  }, []);

  const totalReviewed = progress.reviewedQuestions.length;

  return {
    progress,
    toggleReviewed,
    isReviewed,
    getSectionProgress,
    setLastVisited,
    resetProgress,
    totalReviewed,
  };
}
