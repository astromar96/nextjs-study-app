import type { Question } from '../types';
import { AnswerRenderer } from './AnswerRenderer';
import { FlashcardControls } from './FlashcardControls';

interface FlashcardViewProps {
  question: Question;
  questionIndex: number;
  totalInSection: number;
  isReviewed: boolean;
  onToggleReviewed: () => void;
  onPrev: () => void;
  onNext: () => void;
  sectionTitle: string;
}

export function FlashcardView({
  question,
  questionIndex,
  totalInSection,
  isReviewed,
  onToggleReviewed,
  onPrev,
  onNext,
  sectionTitle,
}: FlashcardViewProps) {
  return (
    <div className="max-w-3xl mx-auto w-full">
      {/* Section badge */}
      <div className="mb-4 flex items-center gap-2">
        <span className="text-xs font-medium text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/30 px-2.5 py-1 rounded-full">
          {sectionTitle}
        </span>
        <span className="text-xs text-gray-400 dark:text-gray-500">
          Question {questionIndex + 1} of {totalInSection}
        </span>
      </div>

      {/* Card */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
        {/* Question */}
        <div className="p-6">
          <h2 className="text-lg font-semibold leading-snug text-gray-900 dark:text-white">
            {question.question}
          </h2>
        </div>

        {/* Answer */}
        <div className="border-t border-gray-100 dark:border-gray-700">
          <div className="p-6">
            <AnswerRenderer markdown={question.answerMarkdown} />
          </div>

          {/* Mark reviewed */}
          <div className="px-6 pb-4">
            <button
              onClick={onToggleReviewed}
              className={`flex items-center gap-2 text-sm font-medium px-4 py-2 rounded-lg transition-colors ${
                isReviewed
                  ? 'bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 border border-green-200 dark:border-green-800'
                  : 'bg-gray-50 dark:bg-gray-700 text-gray-500 dark:text-gray-400 border border-gray-200 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-600'
              }`}
            >
              {isReviewed ? (
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              ) : (
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4" />
                </svg>
              )}
              {isReviewed ? 'Reviewed' : 'Mark as Reviewed'}
            </button>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="mt-4">
        <FlashcardControls
          currentIndex={questionIndex}
          total={totalInSection}
          onPrev={onPrev}
          onNext={onNext}
        />
      </div>

      {/* Keyboard hints */}
      <div className="mt-4 flex justify-center gap-4 text-[11px] text-gray-400 dark:text-gray-600">
        <span>← → Navigate</span>
        <span>⌘K Search</span>
      </div>
    </div>
  );
}
