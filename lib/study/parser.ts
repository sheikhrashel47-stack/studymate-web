import { ANSWER_KEYS, REQUIRED_ANSWER_KEYS, type AnswerKey, type ImportSourceType, type ParseIssue, type ParseResult, type QuestionDraft } from "./types";

const BANGLA_DIGITS: Record<string, string> = { "০": "0", "১": "1", "২": "2", "৩": "3", "৪": "4", "৫": "5", "৬": "6", "৭": "7", "৮": "8", "৯": "9" };
const BANGLA_OPTION_KEYS: Record<string, AnswerKey> = { "ক": "A", "খ": "B", "গ": "C", "ঘ": "D", "ঙ": "E", "চ": "F" };

const clean = (value: string) => value.replace(/\s+/g, " ").trim();
const normalizeDigits = (value: string) => value.replace(/[০-৯]/g, (digit) => BANGLA_DIGITS[digit]);
const comparable = (value: string) => clean(normalizeDigits(value).toLocaleLowerCase().replace(/[\s.,;:!?()[\]{}'"“”‘’।]/g, " "));
const comparablePrompt = (value: string) => {
  const normalizedValue = normalizeDigits(value).toLocaleLowerCase().trim();
  const withoutQuestionLabel = normalizedValue.replace(/^\s*(?:(?:question|q|প্রশ্ন)\s*\d+|\d+)\s*[.)।:：-]?\s*/i, "");
  return clean(withoutQuestionLabel.replace(/[\s.,;:!?()[\]{}'"“”‘’।]/g, " "));
};

export function questionSignature(prompt: string, options: Partial<Record<AnswerKey, string>>) {
  return [comparablePrompt(prompt), ...ANSWER_KEYS.map((key) => `${key}:${comparable(options[key] ?? "")}`)].join("|");
}

function answerKeyFromLabel(value: unknown): AnswerKey | undefined {
  const label = normalizeDigits(String(value ?? "")).trim().toUpperCase();
  if (BANGLA_OPTION_KEYS[label]) return BANGLA_OPTION_KEYS[label];
  if (/^[1-6]$/.test(label)) return ANSWER_KEYS[Number(label) - 1];
  const latin = label.match(/[A-F]/)?.[0] as AnswerKey | undefined;
  return latin && ANSWER_KEYS.includes(latin) ? latin : undefined;
}

function parseOptionLabel(value: string) {
  return answerKeyFromLabel(value);
}

function findAnswerKey(answerValue: string | undefined, options: Partial<Record<AnswerKey, string>>) {
  const label = answerKeyFromLabel(answerValue);
  if (label) return label;
  const target = comparable(answerValue ?? "");
  if (!target) return undefined;
  return ANSWER_KEYS.find((key) => comparable(options[key] ?? "") === target);
}

function draftFromObject(value: unknown, index: number): QuestionDraft | undefined {
  if (!value || typeof value !== "object") return undefined;
  const record = value as Record<string, unknown>;
  const prompt = clean(String(record.question ?? record.questionText ?? record.question_text ?? record.prompt ?? record.text ?? record["প্রশ্ন"] ?? ""));
  const rawOptions = record.options ?? record.choices ?? record["বিকল্প"];
  const options: Partial<Record<AnswerKey, string>> = {};
  if (Array.isArray(rawOptions)) {
    rawOptions.slice(0, 6).forEach((option, optionIndex) => { options[ANSWER_KEYS[optionIndex]] = clean(String(option)); });
  } else if (rawOptions && typeof rawOptions === "object") {
    Object.entries(rawOptions as Record<string, unknown>).forEach(([key, option]) => { const answerKey = answerKeyFromLabel(key); if (answerKey) options[answerKey] = clean(String(option)); });
  } else {
    ANSWER_KEYS.forEach((key) => { const option = record[key] ?? record[key.toLowerCase()]; if (option) options[key] = clean(String(option)); });
  }
  if (!prompt) return undefined;
  const rawAnswer = String(record.answer ?? record.ans ?? record.correct ?? record.correctAnswer ?? record.correct_option ?? record["উত্তর"] ?? record["সঠিক উত্তর"] ?? "");
  return {
    serial: Number(normalizeDigits(String(record.serial ?? record.number ?? record.questionNo ?? record.question_no ?? record.id ?? index + 1))) || index + 1,
    prompt,
    options,
    correctOption: findAnswerKey(rawAnswer, options),
    explanation: clean(String(record.explanation ?? record.explain ?? record.reason ?? record.solution ?? record["ব্যাখ্যা"] ?? record["কারণ"] ?? record["সমাধান"] ?? "")) || "Explanation unavailable",
  };
}

function parseJson(content: string): ParseResult {
  try {
    const parsed = JSON.parse(content) as unknown;
    const collection = Array.isArray(parsed) ? parsed : parsed && typeof parsed === "object" ? ((parsed as Record<string, unknown>).questions ?? (parsed as Record<string, unknown>).items ?? (parsed as Record<string, unknown>).data ?? (parsed as Record<string, unknown>)["প্রশ্নসমূহ"] ?? []) : [];
    if (!Array.isArray(collection)) return { sourceType: "json", drafts: [], issues: [{ severity: "error", message: "The JSON needs a question list." }] };
    const drafts: QuestionDraft[] = [];
    const issues: ParseIssue[] = [];
    collection.forEach((item, index) => { const draft = draftFromObject(item, index); if (draft) drafts.push(draft); else issues.push({ questionNumber: index + 1, severity: "error", message: "This item does not include a readable question." }); });
    return { sourceType: "json", drafts, issues: [...issues, ...validateDrafts(drafts)] };
  } catch {
    return { sourceType: "json", drafts: [], issues: [{ severity: "error", message: "This JSON could not be read. Check the format and try again." }] };
  }
}

function htmlToText(content: string) {
  return content.replace(/<\s*br\s*\/?>/gi, "\n").replace(/<\/(p|div|li|h[1-6]|tr)\s*>/gi, "\n").replace(/<[^>]*>/g, " ").replace(/&nbsp;/gi, " ").replace(/&amp;/gi, "&").replace(/&lt;/gi, "<").replace(/&gt;/gi, ">").replace(/\r/g, "");
}

function parseQuestionBlock(block: string, serial: number): QuestionDraft {
  const lines = block.replace(/\r/g, "").split("\n");
  const promptLines: string[] = [];
  const explanationLines: string[] = [];
  const options: Partial<Record<AnswerKey, string>> = {};
  let optionKey: AnswerKey | undefined;
  let answerValue: string | undefined;
  let isExplanation = false;
  const optionLine = /^[ \t]*([A-Fa-fকখগঘঙচ1-6])[ \t]*[.)।:：-][ \t]*(.*)$/;
  const answerLine = /^[ \t]*(?:answer|ans|correct answer|correct|উত্তর|সঠিক উত্তর)[ \t]*[：:.-][ \t]*(.+)$/i;
  const explanationLine = /^[ \t]*(?:explanation|explain|solution|reason|ব্যাখ্যা|কারণ|সমাধান)[ \t]*[：:.-][ \t]*(.*)$/i;

  lines.forEach((line) => {
    const option = line.match(optionLine);
    const answer = line.match(answerLine);
    const explanation = line.match(explanationLine);
    if (option) {
      optionKey = parseOptionLabel(option[1]);
      if (optionKey) options[optionKey] = clean(option[2]);
      isExplanation = false;
      return;
    }
    if (answer) { answerValue = clean(answer[1]); optionKey = undefined; isExplanation = false; return; }
    if (explanation) { explanationLines.push(explanation[1]); optionKey = undefined; isExplanation = true; return; }
    if (optionKey) { options[optionKey] = clean(`${options[optionKey] ?? ""} ${line}`); return; }
    if (isExplanation) { explanationLines.push(line); return; }
    if (line.trim()) promptLines.push(line);
  });

  return { serial, prompt: clean(promptLines.join(" ")), options, correctOption: findAnswerKey(answerValue, options), explanation: clean(explanationLines.join(" ")) || "Explanation unavailable" };
}

function parseText(content: string, sourceType: ImportSourceType): ParseResult {
  const source = sourceType === "html" ? htmlToText(content) : content.replace(/\r/g, "");
  const header = /(?:^|\n)[ \t]*(?:(?:q(?:uestion)?|প্রশ্ন)[ \t]*([0-9০-৯]*)|([0-9০-৯]+))[ \t]*[.)।:：-][ \t]*/gi;
  const matches = [...source.matchAll(header)];
  if (!matches.length) return { sourceType, drafts: [], issues: [{ severity: "error", message: "No numbered questions were found. Start with Q1., 1., or প্রশ্ন ১।" }] };
  const drafts = matches.map((match, index) => {
    const start = (match.index ?? 0) + match[0].length;
    const end = matches[index + 1]?.index ?? source.length;
    const serial = Number(normalizeDigits(match[1] || match[2] || "")) || index + 1;
    return parseQuestionBlock(source.slice(start, end).trim(), serial);
  });
  return { sourceType, drafts, issues: validateDrafts(drafts) };
}

function validateDrafts(drafts: QuestionDraft[]): ParseIssue[] {
  const issues: ParseIssue[] = [];
  drafts.forEach((draft) => {
    const optionCount = ANSWER_KEYS.filter((key) => Boolean(draft.options[key])).length;
    if (!draft.prompt) issues.push({ questionNumber: draft.serial, severity: "error", message: "Question text is missing." });
    if (optionCount < 4) issues.push({ questionNumber: draft.serial, severity: "error", message: `This question has only ${optionCount} options. Four are required.` });
    if (optionCount > 4) issues.push({ questionNumber: draft.serial, severity: "warning", message: `This question has ${optionCount} options. Review before importing.` });
    if (!draft.correctOption) issues.push({ questionNumber: draft.serial, severity: "error", message: "Correct answer not found." });
    if (draft.correctOption && !draft.options[draft.correctOption]) issues.push({ questionNumber: draft.serial, severity: "error", message: `Invalid answer: ${draft.correctOption}.` });
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
  return Boolean(draft.prompt && draft.correctOption && draft.options[draft.correctOption] && REQUIRED_ANSWER_KEYS.every((key) => Boolean(draft.options[key])));
}
