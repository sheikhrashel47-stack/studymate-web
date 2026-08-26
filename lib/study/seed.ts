import { questionSignature } from "./parser";
import { MUHAMMAD_SAW_CHAPTER, MUHAMMAD_SAW_QUESTIONS, MUHAMMAD_SAW_SUBJECT } from "./prophet_muhammad_seed";
import type { StudyData } from "./types";

export const MUHAMMAD_SAW_SEED_ID = "prophet-muhammad-saw-v1";

export function mergeBuiltInStudyContent(data: StudyData): StudyData {
  if (data.seededContent?.includes(MUHAMMAD_SAW_SEED_ID)) return data;

  const now = Date.now();
  const existingSubject = data.subjects.find((subject) => subject.id === MUHAMMAD_SAW_SUBJECT.id || subject.name.trim().toLocaleLowerCase() === MUHAMMAD_SAW_SUBJECT.name.toLocaleLowerCase());
  const subjectId = existingSubject?.id ?? MUHAMMAD_SAW_SUBJECT.id;
  const subject = existingSubject ?? { ...MUHAMMAD_SAW_SUBJECT, createdAt: now };
  const existingChapter = data.chapters.find((chapter) => chapter.id === MUHAMMAD_SAW_CHAPTER.id || (chapter.subjectId === subjectId && chapter.name.trim().toLocaleLowerCase() === MUHAMMAD_SAW_CHAPTER.name.toLocaleLowerCase()));
  const chapterId = existingChapter?.id ?? MUHAMMAD_SAW_CHAPTER.id;
  const chapter = existingChapter ?? { ...MUHAMMAD_SAW_CHAPTER, subjectId, createdAt: now };
  const knownQuestions = new Set(data.questions.map((question) => questionSignature(question.prompt, question.options)));
  const newQuestions = MUHAMMAD_SAW_QUESTIONS.filter((question) => {
    const signature = questionSignature(question.prompt, question.options);
    if (knownQuestions.has(signature)) return false;
    knownQuestions.add(signature);
    return true;
  }).map((question) => ({ ...question, subjectId, chapterId }));

  return {
    ...data,
    subjects: existingSubject ? data.subjects : [...data.subjects, subject],
    chapters: existingChapter ? data.chapters : [...data.chapters, chapter],
    questions: [...data.questions, ...newQuestions],
    seededContent: [...(data.seededContent ?? []), MUHAMMAD_SAW_SEED_ID],
  };
}
