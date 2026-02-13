export interface Question {
  id: string;
  sectionId: number;
  question: string;
  answerMarkdown: string;
}

export interface Section {
  id: number;
  title: string;
  questions: Question[];
}

export interface StudyProgress {
  reviewedQuestions: string[];
  lastVisitedSection: number;
  lastVisitedQuestion: number;
  lastUpdated: string;
}
