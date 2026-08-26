import { questionSignature } from "./parser";
import { MUHAMMAD_BOOK_QUESTIONS } from "./muhammad_book_seed";
import { MUHAMMAD_SAW_CHAPTER, MUHAMMAD_SAW_QUESTIONS, MUHAMMAD_SAW_SUBJECT } from "./prophet_muhammad_seed";
import type { Chapter, Question, StudyData, Subject } from "./types";

export const MUHAMMAD_SAW_SEED_ID = "prophet-muhammad-saw-v1";
export const MUHAMMAD_BOOK_SEED_ID = "prophet-muhammad-book-v1";
const BOOK_CHAPTER: Chapter = { id: "muhammad-saw-book", subjectId: "islam", name: "মুহাম্মদ সাঃ (বই)", createdAt: 0 };

function mergeSeed(data: StudyData, subjectSeed: Subject, chapterSeed: Chapter, questionSeed: Question[], seedId: string): StudyData {
  if (data.seededContent?.includes(seedId)) return data;
  const now = Date.now();
  const existingSubject = data.subjects.find((subject) => subject.id === subjectSeed.id || subject.name.trim().toLocaleLowerCase() === subjectSeed.name.toLocaleLowerCase());
  const subjectId = existingSubject?.id ?? subjectSeed.id;
  const subject = existingSubject ?? { ...subjectSeed, createdAt: now };
  const existingChapter = data.chapters.find((chapter) => chapter.id === chapterSeed.id || (chapter.subjectId === subjectId && chapter.name.trim().toLocaleLowerCase() === chapterSeed.name.toLocaleLowerCase()));
  const chapterId = existingChapter?.id ?? chapterSeed.id;
  const chapter = existingChapter ?? { ...chapterSeed, subjectId, createdAt: now };
  const knownQuestions = new Set(data.questions.map((question) => questionSignature(question.prompt, question.options)));
  const newQuestions = questionSeed.filter((question) => {
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
    seededContent: [...(data.seededContent ?? []), seedId],
  };
}

export function mergeBuiltInStudyContent(data: StudyData): StudyData {
  let next = data;
  if (!next.seededContent?.includes(MUHAMMAD_SAW_SEED_ID)) next = mergeSeed(next, MUHAMMAD_SAW_SUBJECT, MUHAMMAD_SAW_CHAPTER, MUHAMMAD_SAW_QUESTIONS, MUHAMMAD_SAW_SEED_ID);
  if (!next.seededContent?.includes(MUHAMMAD_BOOK_SEED_ID)) next = mergeSeed(next, MUHAMMAD_SAW_SUBJECT, BOOK_CHAPTER, MUHAMMAD_BOOK_QUESTIONS, MUHAMMAD_BOOK_SEED_ID);
  return next;
}
