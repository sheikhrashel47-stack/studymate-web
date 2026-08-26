import { ANSWER_KEYS, type AnswerKey, type ImportSourceType, type ParseIssue, type ParseResult, type QuestionDraft } from "./types";

const clean = (value: string) => value.replace(/\s+/g, " ").trim();

function asAnswerKey(value: unknown): AnswerKey | undefined {
  const normalized = String(value ?? "").trim().toUpperCase().replace(/[^A-D]/g, "");
  return ANSWER_KEYS.includes(normalized as AnswerKey) ? (normalized as AnswerKey) : undefined;
}

function draftFromObject(value: unknown, index: number): QuestionDraft | undefined {
  if (!value || typeof value !== "object") return undefined;
  const record = value as Record<string, unknown>;
  const prompt = clean(String(record.question ?? record.prompt ?? record.text ?? ""));
  const rawOptions = record.options ?? record.choices;
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
    serial: Number(record.serial ?? record.number ?? record.id ?? index + 1) || index + 1,
    prompt,
    options,
    correctOption: asAnswerKey(record.answer ?? record.correctAnswer ?? record.correct_option),
    explanation: clean(String(record.explanation ?? record.solution ?? "")),
  };
}

function parseJson(content: string): ParseResult {
  try {
    const parsed = JSON.parse(content) as unknown;
    const collection = Array.isArray(parsed)
      ? parsed
      : parsed && typeof parsed === "object"
        ? ((parsed as Record<string, unknown>).questions ?? (parsed as Record<string, unknown>).items ?? [])
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
  const header = /(?:^|\n)\s*(?:q(?:uestion)?\s*)?(\d+)\s*[.)：:]\s*/gi;
  const matches = [...source.matchAll(header)];
  if (!matches.length) {
    return { sourceType, drafts: [], issues: [{ message: "No numbered questions were found. Start each question with Q1. or 1." }] };
  }

  const drafts: QuestionDraft[] = [];
  matches.forEach((match, index) => {
    const start = (match.index ?? 0) + match[0].length;
    const end = matches[index + 1]?.index ?? source.length;
    const block = source.slice(start, end).trim();
    const optionPattern = /^[ \t]*([A-D])\s*[.)：:]\s*(.*)$/gim;
    const optionMatches = [...block.matchAll(optionPattern)];
    const firstOption = optionMatches[0]?.index ?? block.length;
    const prompt = clean(block.slice(0, firstOption));
    const options: Partial<Record<AnswerKey, string>> = {};
    optionMatches.forEach((optionMatch) => {
      const key = optionMatch[1] as AnswerKey;
      options[key] = clean(optionMatch[2]);
    });
    const answer = block.match(/(?:^|\n)\s*(?:answer|correct answer)\s*[：:]\s*([A-D])/i)?.[1] as AnswerKey | undefined;
    const explanation = clean(block.match(/(?:^|\n)\s*(?:explanation|solution)\s*[：:]\s*([\s\S]*)$/i)?.[1] ?? "");
    drafts.push({ serial: Number(match[1]), prompt, options, correctOption: answer, explanation });
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
