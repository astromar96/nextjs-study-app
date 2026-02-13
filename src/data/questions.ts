import type { Section, Question } from '../types';
import rawMarkdown from '../../nextjs-senior-interview-questions.md?raw';

function parseMarkdown(raw: string): Section[] {
  const lines = raw.split('\n');
  const sections: Section[] = [];
  let currentSection: Section | null = null;
  let currentQuestion: Question | null = null;
  let answerLines: string[] = [];

  for (const line of lines) {
    const sectionMatch = line.match(/^## (\d+)\. (.+)$/);
    if (sectionMatch) {
      if (currentQuestion && currentSection) {
        currentQuestion.answerMarkdown = answerLines.join('\n').trim();
        currentSection.questions.push(currentQuestion);
      }
      if (currentSection) {
        sections.push(currentSection);
      }
      currentSection = {
        id: parseInt(sectionMatch[1]),
        title: sectionMatch[2],
        questions: [],
      };
      currentQuestion = null;
      answerLines = [];
      continue;
    }

    const questionMatch = line.match(/^### Q: (.+)$/);
    if (questionMatch && currentSection) {
      if (currentQuestion) {
        currentQuestion.answerMarkdown = answerLines.join('\n').trim();
        currentSection.questions.push(currentQuestion);
      }
      const qIndex = currentSection.questions.length + 1;
      currentQuestion = {
        id: `${currentSection.id}-${qIndex}`,
        sectionId: currentSection.id,
        question: questionMatch[1],
        answerMarkdown: '',
      };
      answerLines = [];
      continue;
    }

    if (line.match(/^---\s*$/) && !currentQuestion) continue;

    if (currentQuestion) {
      answerLines.push(line);
    }
  }

  if (currentQuestion && currentSection) {
    currentQuestion.answerMarkdown = answerLines.join('\n').trim();
    currentSection.questions.push(currentQuestion);
  }
  if (currentSection) sections.push(currentSection);

  return sections;
}

export const sections: Section[] = parseMarkdown(rawMarkdown);

export const allQuestions: Question[] = sections.flatMap((s) => s.questions);

export const totalQuestions = allQuestions.length;
