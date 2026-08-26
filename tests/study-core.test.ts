import { describe, expect, it } from "vitest";

import { calculateProgress, chapterAccuracy, subjectAccuracy } from "../lib/study/analytics";
import { isCompleteDraft, parseQuestions } from "../lib/study/parser";
import type { StudyData } from "../lib/study/types";

describe("question import parser", () => {
  it("parses numbered plain text questions and reports a complete draft", () => {
    const result = parseQuestions(`Q1. বাংলাদেশের রাজধানী কোনটি?
A. চট্টগ্রাম
B. ঢাকা
C. খুলনা
D. রাজশাহী
Answer: B
Explanation: ঢাকা বাংলাদেশের রাজধানী।`);
    expect(result.sourceType).toBe("text");
    expect(result.issues).toEqual([]);
    expect(result.drafts).toHaveLength(1);
    expect(isCompleteDraft(result.drafts[0])).toBe(true);
    expect(result.drafts[0].correctOption).toBe("B");
  });

  it("accepts structured JSON question data", () => {
    const result = parseQuestions(JSON.stringify({ questions: [{ serial: 2, question: "2 + 2 = ?", options: ["2", "3", "4", "5"], answer: "C", explanation: "Two plus two is four." }] }));
    expect(result.sourceType).toBe("json");
    expect(result.drafts[0].options.C).toBe("4");
    expect(result.drafts[0].correctOption).toBe("C");
  });

  it("converts simple HTML into the supported question format", () => {
    const result = parseQuestions("<p>Q3. Sky colour?</p><p>A. Green</p><p>B. Blue</p><p>C. Red</p><p>D. Black</p><p>Answer: B</p>");
    expect(result.sourceType).toBe("html");
    expect(result.drafts).toHaveLength(1);
    expect(result.drafts[0].options.B).toBe("Blue");
  });
});

describe("progress calculations", () => {
  it("calculates total and subject/chapter accuracy from persisted attempts", () => {
    const data: StudyData = {
      version: 1,
      subjects: [{ id: "math", name: "Math", createdAt: 1 }],
      chapters: [{ id: "linear", subjectId: "math", name: "Linear Equation", createdAt: 1 }],
      questions: [
        { id: "q1", subjectId: "math", chapterId: "linear", serial: 1, prompt: "One", options: { A: "a", B: "b", C: "c", D: "d" }, correctOption: "A", explanation: "", createdAt: 1 },
        { id: "q2", subjectId: "math", chapterId: "linear", serial: 2, prompt: "Two", options: { A: "a", B: "b", C: "c", D: "d" }, correctOption: "B", explanation: "", createdAt: 1 },
      ],
      attempts: [
        { id: "a1", questionId: "q1", selectedOption: "A", correct: true, mode: "flash", answeredAt: 2 },
        { id: "a2", questionId: "q2", selectedOption: "C", correct: false, mode: "flash", answeredAt: 3 },
      ],
      testHistory: [],
    };
    expect(calculateProgress(data)).toMatchObject({ totalQuestions: 2, attempted: 2, correct: 1, accuracy: 50, testsCompleted: 0 });
    expect(subjectAccuracy(data, "math")).toBe(50);
    expect(chapterAccuracy(data, "linear")).toBe(50);
  });
});
