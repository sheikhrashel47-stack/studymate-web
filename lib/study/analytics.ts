import type { StudyData } from "./types";

export function calculateProgress(data: StudyData) {
  const attempted = data.attempts.length;
  const correct = data.attempts.filter((attempt) => attempt.correct).length;
  const accuracy = attempted ? Math.round((correct / attempted) * 100) : 0;
  return { totalQuestions: data.questions.length, attempted, correct, accuracy, testsCompleted: data.testHistory.filter((test) => test.mode === "mock").length };
}

export function subjectAccuracy(data: StudyData, subjectId: string) {
  const questionIds = new Set(data.questions.filter((question) => question.subjectId === subjectId).map((question) => question.id));
  const attempts = data.attempts.filter((attempt) => questionIds.has(attempt.questionId));
  if (!attempts.length) return undefined;
  return Math.round((attempts.filter((attempt) => attempt.correct).length / attempts.length) * 100);
}

export function chapterAccuracy(data: StudyData, chapterId: string) {
  const questionIds = new Set(data.questions.filter((question) => question.chapterId === chapterId).map((question) => question.id));
  const attempts = data.attempts.filter((attempt) => questionIds.has(attempt.questionId));
  if (!attempts.length) return undefined;
  return Math.round((attempts.filter((attempt) => attempt.correct).length / attempts.length) * 100);
}
