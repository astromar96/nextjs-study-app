import { useState, useCallback } from 'react';
import { sections, totalQuestions } from './data/questions';
import { useTheme } from './hooks/useTheme';
import { useProgress } from './hooks/useProgress';
import { useSearch } from './hooks/useSearch';
import { useKeyboardNav } from './hooks/useKeyboardNav';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { FlashcardView } from './components/FlashcardView';
import { SearchModal } from './components/SearchModal';

function App() {
  const { isDark, toggle: toggleTheme } = useTheme();
  const {
    progress,
    toggleReviewed,
    isReviewed,
    getSectionProgress,
    setLastVisited,
    resetProgress,
    totalReviewed,
  } = useProgress();

  const [sectionIndex, setSectionIndex] = useState(progress.lastVisitedSection);
  const [questionIndex, setQuestionIndex] = useState(progress.lastVisitedQuestion);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const { query, setQuery, results, isOpen: searchOpen, setIsOpen: setSearchOpen } = useSearch(sections);

  const currentSection = sections[sectionIndex];
  const currentQuestion = currentSection?.questions[questionIndex];

  const handleSelectSection = useCallback(
    (index: number) => {
      setSectionIndex(index);
      setQuestionIndex(0);
      setLastVisited(index, 0);
    },
    [setLastVisited]
  );

  const handlePrev = useCallback(() => {
    if (questionIndex > 0) {
      const next = questionIndex - 1;
      setQuestionIndex(next);
      setLastVisited(sectionIndex, next);
    }
  }, [questionIndex, sectionIndex, setLastVisited]);

  const handleNext = useCallback(() => {
    if (currentSection && questionIndex < currentSection.questions.length - 1) {
      const next = questionIndex + 1;
      setQuestionIndex(next);
      setLastVisited(sectionIndex, next);
    }
  }, [questionIndex, currentSection, sectionIndex, setLastVisited]);

  const handleSearchSelect = useCallback(
    (sectionId: number, questionId: string) => {
      const secIdx = sections.findIndex((s) => s.id === sectionId);
      if (secIdx === -1) return;
      const qIdx = sections[secIdx].questions.findIndex((q) => q.id === questionId);
      if (qIdx === -1) return;
      setSectionIndex(secIdx);
      setQuestionIndex(qIdx);
      setLastVisited(secIdx, qIdx);
      setQuery('');
    },
    [setLastVisited, setQuery]
  );

  useKeyboardNav({
    onNext: handleNext,
    onPrev: handlePrev,
    onSearch: () => setSearchOpen(true),
  });

  if (!currentSection || !currentQuestion) return null;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-gray-100 transition-colors">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 z-40 h-full w-72 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700 transform transition-transform duration-200 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } lg:translate-x-0`}
      >
        <Sidebar
          sections={sections}
          activeSectionIndex={sectionIndex}
          onSelectSection={handleSelectSection}
          getSectionProgress={getSectionProgress}
          onReset={resetProgress}
          onClose={() => setSidebarOpen(false)}
        />
      </aside>

      {/* Main content */}
      <div className="lg:ml-72 min-h-screen flex flex-col">
        <Header
          isDark={isDark}
          toggleTheme={toggleTheme}
          totalReviewed={totalReviewed}
          totalQuestions={totalQuestions}
          onOpenSearch={() => setSearchOpen(true)}
          onToggleSidebar={() => setSidebarOpen((prev) => !prev)}
        />

        <main className="flex-1 p-4 md:p-8 flex items-start justify-center pt-8 md:pt-12">
          <FlashcardView
            question={currentQuestion}
            questionIndex={questionIndex}
            totalInSection={currentSection.questions.length}
            isReviewed={isReviewed(currentQuestion.id)}
            onToggleReviewed={() => toggleReviewed(currentQuestion.id)}
            onPrev={handlePrev}
            onNext={handleNext}
            sectionTitle={currentSection.title}
          />
        </main>
      </div>

      {/* Search modal */}
      <SearchModal
        isOpen={searchOpen}
        query={query}
        results={results}
        onQueryChange={setQuery}
        onClose={() => {
          setSearchOpen(false);
          setQuery('');
        }}
        onSelect={handleSearchSelect}
      />
    </div>
  );
}

export default App;
