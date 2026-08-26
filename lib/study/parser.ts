import { ANSWER_KEYS, type AnswerKey, type ImportSourceType, type ParseIssue, type ParseResult, type QuestionDraft } from "./types";

const clean = (value: string) => value.replace(/\s+/g, " ").trim();

const BANGLA_DIGITS: Record<string, string> = { "০": "0", "১": "1", "২": "2", "৩": "3", "৪": "4", "৫": "5", "৬": "6", "৭": "7", "৮": "8", "৯": "9" };

function normalizeDigits(value: string) {
  return value.replace(/[০-৯]/g, (digit) => BANGLA_DIGITS[digit]);
}

function answerKeyFromLabel(value: unknown): AnswerKey | undefined {
  const label = normalizeDigits(String(value ?? "")).trim().toUpperCase();
  const banglaOptions: Record<string, AnswerKey> = { "ক": "A", "খ": "B", "গ": "C", "ঘ": "D" };
  if (banglaOptions[label]) return banglaOptions[label];
  if (/^[1-4]$/.test(label)) return ANSWER_KEYS[Number(label) - 1];
  const latin = label.match(/[A-D]/)?.[0] as AnswerKey | undefined;
  return latin && ANSWER_KEYS.includes(latin) ? latin : undefined;
}

function asAnswerKey(value: unknown): AnswerKey | undefined {
  return answerKeyFromLabel(value);
}

function draftFromObject(value: unknown, index: number): QuestionDraft | undefined {
  if (!value || typeof value !== "object") return undefined;
  const record = value as Record<string, unknown>;
  const prompt = clean(String(record.question ?? record.questionText ?? record.question_text ?? record.prompt ?? record.text ?? record["প্রশ্ন"] ?? ""));
  const rawOptions = record.options ?? record.choices ?? record["বিকল্প"];
  const options: Partial<Record<AnswerKey, string>> = {};

  if (Array.isArray(rawOptions)) {
    rawOptions.slice(0, 4).forEach((option, optionIndex) => {
      options[ANSWER_KEYS[optionIndex]] = clean(String(option));
    });
  } else if (rawOptions && typeof rawOptions === "object") {
    Object.entries(rawOptions as Record<string, unknown>).forEach(([key, option]) => {
      const answerKey = asAnswerKey(key);
      if (answerKey) options[answerKey] = clean(String(option));
    });
  } else {
    ANSWER_KEYS.forEach((key) => {
      const option = record[key] ?? record[key.toLowerCase()];
      if (option) options[key] = clean(String(option));
    });
  }

  if (!prompt) return undefined;
  return {
    serial: Number(normalizeDigits(String(record.serial ?? record.number ?? record.questionNo ?? record.question_no ?? record.id ?? index + 1))) || index + 1,
    prompt,
    options,
    correctOption: asAnswerKey(record.answer ?? record.ans ?? record.correctAnswer ?? record.correct_option ?? record["উত্তর"] ?? record["সঠিক উত্তর"]),
    explanation: clean(String(record.explanation ?? record.solution ?? record["ব্যাখ্যা"] ?? record["সমাধান"] ?? "")),
  };
}

function parseJson(content: string): ParseResult {
  try {
    const parsed = JSON.parse(content) as unknown;
    const collection = Array.isArray(parsed)
      ? parsed
      : parsed && typeof parsed === "object"
        ? ((parsed as Record<string, unknown>).questions ?? (parsed as Record<string, unknown>).items ?? (parsed as Record<string, unknown>).data ?? (parsed as Record<string, unknown>)["প্রশ্নসমূহ"] ?? [])
        : [];
    if (!Array.isArray(collection)) {
      return { sourceType: "json", drafts: [], issues: [{ message: "The JSON needs a question list." }] };
    }
    const drafts: QuestionDraft[] = [];
    const issues: ParseIssue[] = [];
    collection.forEach((item, index) => {
      const draft = draftFromObject(item, index);
      if (draft) drafts.push(draft);
      else issues.push({ questionNumber: index + 1, message: "This item does not include a readable question." });
    });
    return { sourceType: "json", drafts, issues: [...issues, ...validateDrafts(drafts)] };
  } catch {
    return { sourceType: "json", drafts: [], issues: [{ message: "This JSON could not be read. Check the format and try again." }] };
  }
}

function htmlToText(content: string) {
  return content
    .replace(/<\s*br\s*\/?>/gi, "\n")
    .replace(/<\/(p|div|li|h[1-6])\s*>/gi, "\n")
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/\r/g, "");
}

function parseText(content: string, sourceType: ImportSourceType): ParseResult {
  const source = sourceType === "html" ? htmlToText(content) : content.replace(/\r/g, "");
  const header = /(?:^|\n)[ \t]*(?:(?:q(?:uestion)?|প্রশ্ন)[ \t]*([0-9০-৯]*)|([0-9০-৯]+))[ \t]*(?:[.)।:：-][ \t]*)/gi;
  const matches = [...source.matchAll(header)];
  if (!matches.length) {
    return { sourceType, drafts: [], issues: [{ message: "No numbered questions were found. Start each question with Q1. or 1." }] };
  }

  const drafts: QuestionDraft[] = [];
  matches.forEach((match, index) => {
    const start = (match.index ?? 0) + match[0].length;
    const end = matches[index + 1]?.index ?? source.length;
    const block = source.slice(start, end).trim();
    const optionPattern = /^[ \t]*([A-Da-dকখগঘ1-4])\s*[.)।:：-][ \t]*(.*)$/gim;
    const optionMatches = [...block.matchAll(optionPattern)];
    const firstOption = optionMatches[0]?.index ?? block.length;
    const prompt = clean(block.slice(0, firstOption));
    const options: Partial<Record<AnswerKey, string>> = {};
    optionMatches.forEach((optionMatch) => {
      const key = answerKeyFromLabel(optionMatch[1]);
      if (key) options[key] = clean(optionMatch[2]);
    });
    const answerLabel = block.match(/(?:^|\n)[ \t]*(?:answer|ans|correct answer|উত্তর|সঠিক উত্তর)[ \t]*[：:.-][ \t]*([^\n]+)/i)?.[1];
    const explanation = clean(block.match(/(?:^|\n)[ \t]*(?:explanation|solution|ব্যাখ্যা|সমাধান)[ \t]*[：:.-][ \t]*([\s\S]*)$/i)?.[1] ?? "");
    const matchedAnswer = answerKeyFromLabel(answerLabel) ?? ANSWER_KEYS.find((key) => clean(options[key] ?? "").toLocaleLowerCase() === clean(answerLabel ?? "").toLocaleLowerCase());
    drafts.push({ serial: Number(normalizeDigits(match[1] || match[2] || "")) || index + 1, prompt, options, correctOption: matchedAnswer, explanation });
  });
  return { sourceType, drafts, issues: validateDrafts(drafts) };
}

function validateDrafts(drafts: QuestionDraft[]): ParseIssue[] {
  const issues: ParseIssue[] = [];
  drafts.forEach((draft) => {
    if (!draft.prompt) issues.push({ questionNumber: draft.serial, message: "Question text is missing." });
    if (ANSWER_KEYS.some((key) => !draft.options[key])) issues.push({ questionNumber: draft.serial, message: "All four options A–D are needed." });
    if (!draft.correctOption) issues.push({ questionNumber: draft.serial, message: "The correct answer is missing." });
  });
  return issues;
}

export function detectImportSource(content: string): ImportSourceType {
  const value = content.trim();
  if (value.startsWith("{") || value.startsWith("[")) return "json";
  if (/<\s*[a-z][^>]*>/i.test(value)) return "html";
  return "text";
}

export function parseQuestions(content: string): ParseResult {
  const sourceType = detectImportSource(content);
  return sourceType === "json" ? parseJson(content) : parseText(content, sourceType);
}

export function isCompleteDraft(draft: QuestionDraft): draft is QuestionDraft & { options: Record<AnswerKey, string>; correctOption: AnswerKey } {
  return Boolean(draft.prompt && draft.correctOption && ANSWER_KEYS.every((key) => Boolean(draft.options[key])));
}
