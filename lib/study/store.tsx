import { createContext, useCallback, useContext, useEffect, useMemo, useState, type PropsWithChildren } from "react";

import { isCompleteDraft } from "./parser";
import { loadStudyData, persistStudyData } from "./database";
import { EMPTY_STUDY_DATA, type ActiveExam, type AnswerKey, type Chapter, type Question, type QuestionDraft, type StudyData, type Subject, type TestConfiguration, type TestResult } from "./types";

const createId = (prefix: string) => `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
const normalized = (value: string) => value.trim().toLocaleLowerCase();

type ImportSummary = { added: number; skipped: number; subjectId: string; chapterId: string };

interface StudyContextValue {
  data: StudyData;
  isReady: boolean;
  storageError?: string;
  addSubject: (name: string) => string | undefined;
  addChapter: (subjectId: string, name: string) => string | undefined;
  importQuestions: (subjectName: string, chapterName: string, drafts: QuestionDraft[]) => ImportSummary | undefined;
  deleteQuestion: (id: string) => void;
  deleteSubject: (id: string) => void;
  deleteChapter: (id: string) => void;
  startMockExam: (configuration: TestConfiguration) => ActiveExam | undefined;
  updateActiveExam: (currentIndex: number, answers: Record<string, AnswerKey | undefined>, remainingSeconds?: number) => void;
  submitActiveExam: (remainingSeconds?: number) => TestResult | undefined;
  discardActiveExam: () => void;
  recordFlashAttempt: (questionId: string, selectedOption: AnswerKey) => boolean;
  getSubject: (id: string) => Subject | undefined;
  getChapter: (id: string) => Chapter | undefined;
  getQuestions: (filters?: { subjectId?: string; chapterId?: string }) => Question[];
}

const StudyContext = createContext<StudyContextValue | undefined>(undefined);

export function StudyProvider({ children }: PropsWithChildren) {
  const [data, setData] = useState<StudyData>(EMPTY_STUDY_DATA);
  const [isReady, setIsReady] = useState(false);
  const [storageError, setStorageError] = useState<string>();

  useEffect(() => {
    loadStudyData().then((saved) => setData(saved)).catch(() => setStorageError("Your saved study data could not be opened.")).finally(() => setIsReady(true));
  }, []);

  const updateData = useCallback((updater: (current: StudyData) => StudyData) => {
    setData((current) => {
      const next = updater(current);
      persistStudyData(next).catch(() => setStorageError("Your latest change could not be saved. Please try again."));
      return next;
    });
  }, []);

  const addSubject = useCallback((name: string) => {
    const cleaned = name.trim();
    if (!cleaned) return undefined;
    let createdId: string | undefined;
    updateData((current) => {
      const existing = current.subjects.find((subject) => normalized(subject.name) === normalized(cleaned));
      if (existing) { createdId = existing.id; return current; }
      createdId = createId("subject");
      return { ...current, subjects: [...current.subjects, { id: createdId, name: cleaned, createdAt: Date.now() }] };
    });
    return createdId;
  }, [updateData]);

  const addChapter = useCallback((subjectId: string, name: string) => {
    const cleaned = name.trim();
    if (!cleaned) return undefined;
    let createdId: string | undefined;
    updateData((current) => {
      const existing = current.chapters.find((chapter) => chapter.subjectId === subjectId && normalized(chapter.name) === normalized(cleaned));
      if (existing) { createdId = existing.id; return current; }
      createdId = createId("chapter");
      return { ...current, chapters: [...current.chapters, { id: createdId, subjectId, name: cleaned, createdAt: Date.now() }] };
    });
    return createdId;
  }, [updateData]);

  const importQuestions = useCallback((subjectName: string, chapterName: string, drafts: QuestionDraft[]) => {
    const subjectLabel = subjectName.trim();
    const chapterLabel = chapterName.trim();
    const completeDrafts = drafts.filter(isCompleteDraft);
    if (!subjectLabel || !chapterLabel || !completeDrafts.length) return undefined;
    let summary: ImportSummary | undefined;
    updateData((current) => {
      const now = Date.now();
      const existingSubject = current.subjects.find((subject) => normalized(subject.name) === normalized(subjectLabel));
      const subjectId = existingSubject?.id ?? createId("subject");
      const existingChapter = current.chapters.find((chapter) => chapter.subjectId === subjectId && normalized(chapter.name) === normalized(chapterLabel));
      const chapterId = existingChapter?.id ?? createId("chapter");
      const newQuestions: Question[] = completeDrafts.map((draft) => ({
        id: createId("question"), subjectId, chapterId, serial: draft.serial, prompt: draft.prompt,
        options: draft.options, correctOption: draft.correctOption, explanation: draft.explanation ?? "", createdAt: now,
      }));
      summary = { added: newQuestions.length, skipped: drafts.length - newQuestions.length, subjectId, chapterId };
      return {
        ...current,
        subjects: existingSubject ? current.subjects : [...current.subjects, { id: subjectId, name: subjectLabel, createdAt: now }],
        chapters: existingChapter ? current.chapters : [...current.chapters, { id: chapterId, subjectId, name: chapterLabel, createdAt: now }],
        questions: [...current.questions, ...newQuestions],
      };
    });
    return summary;
  }, [updateData]);

  const deleteQuestion = useCallback((id: string) => updateData((current) => ({ ...current, questions: current.questions.filter((question) => question.id !== id) })), [updateData]);
  const deleteChapter = useCallback((id: string) => updateData((current) => ({
    ...current,
    chapters: current.chapters.filter((chapter) => chapter.id !== id),
    questions: current.questions.filter((question) => question.chapterId !== id),
  })), [updateData]);
  const deleteSubject = useCallback((id: string) => updateData((current) => {
    const chapterIds = new Set(current.chapters.filter((chapter) => chapter.subjectId === id).map((chapter) => chapter.id));
    return { ...current, subjects: current.subjects.filter((subject) => subject.id !== id), chapters: current.chapters.filter((chapter) => chapter.subjectId !== id), questions: current.questions.filter((question) => !chapterIds.has(question.chapterId)) };
  }), [updateData]);

  const startMockExam = useCallback((configuration: TestConfiguration) => {
    let exam: ActiveExam | undefined;
    updateData((current) => {
      const available = current.questions.filter((question) => (!configuration.subjectId || question.subjectId === configuration.subjectId) && (!configuration.chapterId || question.chapterId === configuration.chapterId));
      const questionIds = [...available].sort(() => Math.random() - 0.5).slice(0, Math.min(configuration.questionCount, available.length)).map((question) => question.id);
      if (!questionIds.length) return current;
      const now = Date.now();
      exam = { id: createId("exam"), questionIds, answers: {}, currentIndex: 0, remainingSeconds: configuration.durationSeconds, startedAt: now, savedAt: now, configuration: { ...configuration, questionCount: questionIds.length } };
      return { ...current, activeExam: exam };
    });
    return exam;
  }, [updateData]);

  const updateActiveExam = useCallback((currentIndex: number, answers: Record<string, AnswerKey | undefined>, remainingSeconds?: number) => updateData((current) => {
    if (!current.activeExam) return current;
    return { ...current, activeExam: { ...current.activeExam, currentIndex, answers, remainingSeconds, savedAt: Date.now() } };
  }), [updateData]);

  const submitActiveExam = useCallback((remainingSeconds?: number) => {
    let result: TestResult | undefined;
    updateData((current) => {
      const active = current.activeExam;
      if (!active) return current;
      const questionMap = new Map(current.questions.map((question) => [question.id, question]));
      const attempts = active.questionIds.map((questionId) => {
        const question = questionMap.get(questionId);
        const selectedOption = active.answers[questionId];
        return { id: createId("attempt"), questionId, selectedOption, correct: Boolean(question && selectedOption === question.correctOption), mode: "mock" as const, answeredAt: Date.now() };
      });
      const correctCount = attempts.filter((attempt) => attempt.correct).length;
      const skippedCount = attempts.filter((attempt) => !attempt.selectedOption).length;
      const duration = active.configuration.durationSeconds;
      const timeUsedSeconds = duration ? Math.max(0, duration - (remainingSeconds ?? 0)) : Math.max(0, Math.round((Date.now() - active.startedAt) / 1000));
      result = { id: active.id, mode: "mock", questionIds: active.questionIds, answers: active.answers, correctCount, wrongCount: active.questionIds.length - correctCount - skippedCount, skippedCount, startedAt: active.startedAt, completedAt: Date.now(), timeUsedSeconds, configuration: active.configuration };
      return { ...current, attempts: [...attempts, ...current.attempts].slice(0, 5000), testHistory: [result, ...current.testHistory].slice(0, 100), activeExam: undefined };
    });
    return result;
  }, [updateData]);

  const discardActiveExam = useCallback(() => updateData((current) => current.activeExam ? { ...current, activeExam: undefined } : current), [updateData]);
  const recordFlashAttempt = useCallback((questionId: string, selectedOption: AnswerKey) => {
    let correct = false;
    updateData((current) => {
      const question = current.questions.find((item) => item.id === questionId);
      if (!question) return current;
      correct = question.correctOption === selectedOption;
      return { ...current, attempts: [{ id: createId("attempt"), questionId, selectedOption, correct, mode: "flash" as const, answeredAt: Date.now() }, ...current.attempts].slice(0, 5000) };
    });
    return correct;
  }, [updateData]);

  const value = useMemo<StudyContextValue>(() => ({
    data, isReady, storageError, addSubject, addChapter, importQuestions, deleteQuestion, deleteSubject, deleteChapter, startMockExam, updateActiveExam, submitActiveExam, discardActiveExam, recordFlashAttempt,
    getSubject: (id) => data.subjects.find((subject) => subject.id === id),
    getChapter: (id) => data.chapters.find((chapter) => chapter.id === id),
    getQuestions: (filters) => data.questions.filter((question) => (!filters?.subjectId || question.subjectId === filters.subjectId) && (!filters?.chapterId || question.chapterId === filters.chapterId)),
  }), [data, isReady, storageError, addSubject, addChapter, importQuestions, deleteQuestion, deleteSubject, deleteChapter, startMockExam, updateActiveExam, submitActiveExam, discardActiveExam, recordFlashAttempt]);

  return <StudyContext.Provider value={value}>{children}</StudyContext.Provider>;
}

export function useStudy() {
  const context = useContext(StudyContext);
  if (!context) throw new Error("useStudy must be used within StudyProvider");
  return context;
}
