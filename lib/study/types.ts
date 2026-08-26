export type AnswerKey = "A" | "B" | "C" | "D" | "E" | "F";
export type ImportSourceType = "text" | "json" | "html";
export type PracticeMode = "mock" | "flash";
export type ParseIssueSeverity = "warning" | "error";

export interface Subject {
  id: string;
  name: string;
  createdAt: number;
}

export interface Chapter {
  id: string;
  subjectId: string;
  name: string;
  createdAt: number;
}

export interface Question {
  id: string;
  subjectId: string;
  chapterId: string;
  serial: number;
  prompt: string;
  options: Record<string, string>;
  correctOption: AnswerKey;
  explanation: string;
  createdAt: number;
}

export interface QuestionDraft {
  serial: number;
  prompt: string;
  options: Partial<Record<AnswerKey, string>>;
  correctOption?: AnswerKey;
  explanation?: string;
}

export interface ParseIssue {
  questionNumber?: number;
  message: string;
  severity: ParseIssueSeverity;
}

export interface ParseResult {
  sourceType: ImportSourceType;
  drafts: QuestionDraft[];
  issues: ParseIssue[];
}

export interface Attempt {
  id: string;
  questionId: string;
  selectedOption?: AnswerKey;
  correct: boolean;
  mode: PracticeMode;
  answeredAt: number;
}

export interface TestConfiguration {
  subjectId?: string;
  chapterId?: string;
  questionCount: number;
  durationSeconds?: number;
}

export interface TestResult {
  id: string;
  mode: PracticeMode;
  questionIds: string[];
  answers: Record<string, AnswerKey | undefined>;
  correctCount: number;
  wrongCount: number;
  skippedCount: number;
  startedAt: number;
  completedAt: number;
  timeUsedSeconds: number;
  configuration: TestConfiguration;
}

export interface ActiveExam {
  id: string;
  questionIds: string[];
  answers: Record<string, AnswerKey | undefined>;
  currentIndex: number;
  remainingSeconds?: number;
  startedAt: number;
  savedAt: number;
  configuration: TestConfiguration;
}

export interface StudyData {
  version: 1;
  subjects: Subject[];
  chapters: Chapter[];
  questions: Question[];
  attempts: Attempt[];
  testHistory: TestResult[];
  activeExam?: ActiveExam;
  seededContent?: string[];
}

export const EMPTY_STUDY_DATA: StudyData = {
  version: 1,
  subjects: [],
  chapters: [],
  questions: [],
  attempts: [],
  testHistory: [],
  seededContent: [],
};

export const ANSWER_KEYS: AnswerKey[] = ["A", "B", "C", "D", "E", "F"];
export const REQUIRED_ANSWER_KEYS: AnswerKey[] = ["A", "B", "C", "D"];
