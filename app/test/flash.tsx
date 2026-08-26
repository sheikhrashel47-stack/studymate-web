import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { AppHeader, Card, EmptyState, PrimaryButton, ProgressBar, StudyScreen, colors } from "@/components/study/ui";
import { type AnswerKey } from "@/lib/study/types";
import { useStudy } from "@/lib/study/store";

const formatTime = (seconds: number) => `${Math.floor(seconds / 60).toString().padStart(2, "0")}:${(seconds % 60).toString().padStart(2, "0")}`;

export default function FlashTestScreen() {
  const { subjectId = "", chapterId = "", count = "20", duration = "0" } = useLocalSearchParams<{ subjectId?: string; chapterId?: string; count?: string; duration?: string }>();
  const { data, recordFlashAttempt, completeFlashTest } = useStudy();
  const durationSeconds = Math.max(0, Number(duration) || 0);
  const [questionIds, setQuestionIds] = useState<string[]>([]);
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState<AnswerKey>();
  const [correctCount, setCorrectCount] = useState(0);
  const [wrongCount, setWrongCount] = useState(0);
  const [remaining, setRemaining] = useState(durationSeconds);
  const [starred, setStarred] = useState(false);
  const [answers, setAnswers] = useState<Record<string, AnswerKey | undefined>>({});
  const [startedAt] = useState(() => Date.now());
  const insets = useSafeAreaInsets();

  useEffect(() => { if (questionIds.length) return; const available = data.questions.filter((question) => (!subjectId || question.subjectId === subjectId) && (!chapterId || question.chapterId === chapterId)); const ids = [...available].sort(() => Math.random() - 0.5).slice(0, Math.max(1, Number(count) || 20)).map((question) => question.id); setQuestionIds(ids); }, [data.questions, subjectId, chapterId, count, questionIds.length]);
  useEffect(() => { if (!questionIds.length || !durationSeconds) return; const timer = setInterval(() => setRemaining((value) => Math.max(0, value - 1)), 1000); return () => clearInterval(timer); }, [questionIds.length, durationSeconds]);
  useEffect(() => { if (!questionIds.length || !durationSeconds || remaining > 0) return; const result = completeFlashTest(questionIds, answers, startedAt, 0, durationSeconds); if (result) router.replace({ pathname: "/test/result", params: { testId: result.id, timedOut: "1" } }); }, [answers, completeFlashTest, durationSeconds, questionIds, remaining, startedAt]);
  const questions = useMemo(() => questionIds.map((id) => data.questions.find((question) => question.id === id)).filter(Boolean), [questionIds, data.questions]);
  const question = questions[index];
  if (!questionIds.length) return <StudyScreen><AppHeader title="Flash Test" back={() => router.back()} /><EmptyState icon="bolt" title="Preparing questions" detail="Your quick practice set is loading." /></StudyScreen>;
  if (!question) return <StudyScreen><AppHeader title="Flash Test" back={() => router.back()} /><EmptyState icon="bolt" title="Add questions first" detail="Import questions to unlock quick practice." action={<PrimaryButton label="Import Questions" icon="file-upload" onPress={() => router.replace("/questions/import")} />} /></StudyScreen>;

  const total = correctCount + wrongCount;
  const choose = (key: AnswerKey) => { if (selected) return; const nextAnswers = { ...answers, [question.id]: key }; setAnswers(nextAnswers); setSelected(key); const correct = recordFlashAttempt(question.id, key); if (correct) setCorrectCount((value) => value + 1); else setWrongCount((value) => value + 1); };
  const next = () => { if (index >= questions.length - 1) { const result = completeFlashTest(questionIds, answers, startedAt, remaining, durationSeconds); if (result) router.replace({ pathname: "/test/result", params: { testId: result.id } }); return; } setIndex((value) => value + 1); setSelected(answers[questionIds[index + 1]]); };
  const previous = () => { if (index > 0) { const previousId = questionIds[index - 1]; setIndex((value) => value - 1); setSelected(answers[previousId]); } };
  const isCorrect = selected === question.correctOption;
  const progress = ((index + 1) / questions.length) * 100;

  return <StudyScreen>
    <AppHeader title="Flash Test" subtitle="⚡ Instant Feedback Mode" back={() => router.back()} right={<View style={styles.headerActions}><Pressable accessibilityRole="button" accessibilityLabel="Bookmark test" onPress={() => setStarred((value) => !value)} style={styles.headerIcon}><MaterialIcons name={starred ? "star" : "star-border"} size={24} color={starred ? colors.coral : colors.blue} /></Pressable><Pressable accessibilityRole="button" accessibilityLabel="More options" style={styles.headerIcon}><MaterialIcons name="more-vert" size={23} color={colors.ink} /></Pressable></View>} />
    <View style={styles.meta}><Text style={styles.metaText}>{index + 1}/{questions.length} Question</Text><Text style={styles.metaText}>{Math.round(progress)}% Complete</Text><View style={styles.timer}><MaterialIcons name="timer" size={17} color={colors.blue} /><Text style={styles.timerText}>{formatTime(remaining)}</Text><Text style={styles.timerLabel}>{durationSeconds ? "Time Left" : "No limit"}</Text></View></View>
    <View style={styles.progressWrap}><ProgressBar value={progress} color={colors.blue} /></View>
    <ScrollView style={styles.scroll} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <Card style={styles.questionCard}><View style={styles.cardTop}><View style={styles.typeBadge}><Text style={styles.typeText}>MCQ</Text></View><Text style={styles.point}>1 Point</Text></View><Text style={styles.breadcrumb}>মুহাম্মদ (সাঃ) · Practice</Text><Text style={styles.question}>{question.prompt}</Text><View style={styles.options}>{Object.entries(question.options).filter(([, value]) => Boolean(value)).map(([key, value]) => { const option = key as AnswerKey; const chosen = selected === option; const correctAnswer = Boolean(selected && option === question.correctOption); return <Pressable key={key} disabled={Boolean(selected)} onPress={() => choose(option)} style={({ pressed }) => [styles.option, chosen && (isCorrect ? styles.optionCorrect : styles.optionWrong), correctAnswer && styles.optionCorrect, pressed && !selected && styles.pressed]}><View style={[styles.optionKey, (chosen || correctAnswer) && styles.optionKeyActive]}><Text style={[styles.optionKeyText, (chosen || correctAnswer) && styles.optionKeyTextActive]}>{key}</Text></View><Text style={styles.optionText}>{value}</Text>{correctAnswer ? <MaterialIcons name="check-circle" size={21} color={colors.success} /> : null}</Pressable>; })}</View>{selected ? <View style={[styles.revealed, isCorrect ? styles.revealedCorrect : styles.revealedWrong]}><Text style={[styles.revealedTitle, { color: isCorrect ? colors.success : colors.error }]}>{isCorrect ? "Answer revealed · Correct" : "Answer revealed · Review"}</Text><Text style={styles.revealedAnswer}>Correct answer: {question.correctOption}. {question.options[question.correctOption]}</Text><Text style={styles.revealedDetail}>{question.explanation}</Text></View> : null}</Card>
    </ScrollView>
    <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, 12) }]}><View style={styles.navigation}><View style={{ flex: 1 }}><PrimaryButton label="< Previous" variant="secondary" onPress={previous} disabled={index === 0} compact /></View><View style={{ flex: 1 }}><PrimaryButton label={index === questions.length - 1 ? "See Result >" : "Next Question >"} onPress={next} disabled={!selected} compact /></View></View><Text style={styles.footerHint}>{selected ? "Feedback saved. Continue when you are ready." : "Choose one option to reveal the answer."}</Text></View>
  </StudyScreen>;
}

const styles = StyleSheet.create({
  headerActions: { flexDirection: "row", gap: 5 },
  headerIcon: { width: 40, height: 40, borderRadius: 12, alignItems: "center", justifyContent: "center", backgroundColor: colors.surface },
  meta: { paddingHorizontal: 12, flexDirection: "row", alignItems: "center", gap: 12 },
  metaText: { color: colors.muted, fontSize: 14, fontWeight: "800" },
  timer: { marginLeft: "auto", flexDirection: "row", alignItems: "center", gap: 4 },
  timerText: { color: colors.ink, fontSize: 14, fontWeight: "800" },
  timerLabel: { color: colors.muted, fontSize: 12 },
  progressWrap: { paddingHorizontal: 12, paddingTop: 9, paddingBottom: 5 },
  scroll: { flex: 1 },
  content: { paddingHorizontal: 8, paddingVertical: 7, paddingBottom: 14 },
  questionCard: { marginHorizontal: 4, borderRadius: 17, padding: 14, borderTopWidth: 0, borderColor: "#B5D4C5", backgroundColor: "#FCFEFD", shadowOpacity: 0.025, elevation: 0 },
  cardTop: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  typeBadge: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 12, borderWidth: 1, borderColor: "#A6C7B7", backgroundColor: colors.softBlue },
  typeText: { color: colors.blueDark, fontSize: 13, fontWeight: "900", letterSpacing: 1.2 },
  point: { color: colors.muted, fontSize: 14, fontWeight: "700" },
  breadcrumb: { color: colors.muted, fontSize: 12, marginTop: 14 },
  question: { color: colors.ink, fontSize: 20, lineHeight: 29, fontWeight: "900", marginTop: 12 },
  options: { gap: 7, marginTop: 17 },
  option: { minHeight: 50, flexDirection: "row", alignItems: "center", gap: 10, borderRadius: 13, borderWidth: 1, borderColor: "#B8CEC4", backgroundColor: "#FFFFFF", paddingHorizontal: 11, paddingVertical: 8 },
  optionCorrect: { borderColor: "#7CB89A", backgroundColor: "#EFF9F3" },
  optionWrong: { borderColor: "#E6A3A3", backgroundColor: "#FFF5F5" },
  optionKey: { width: 34, height: 34, borderRadius: 12, alignItems: "center", justifyContent: "center", borderWidth: 1, borderColor: "#B8CEC4", backgroundColor: colors.softBlue },
  optionKeyActive: { borderColor: colors.blue, backgroundColor: colors.blue },
  optionKeyText: { color: colors.blueDark, fontSize: 14, fontWeight: "900" },
  optionKeyTextActive: { color: "#FFFFFF" },
  optionText: { flex: 1, color: colors.ink, fontSize: 16, lineHeight: 23 },
  revealed: { marginTop: 18, padding: 14, borderRadius: 15 },
  revealedCorrect: { backgroundColor: "#EFF9F3" },
  revealedWrong: { backgroundColor: "#FFF5F5" },
  revealedTitle: { fontSize: 15, fontWeight: "900" },
  revealedAnswer: { color: colors.ink, fontSize: 13, lineHeight: 19, marginTop: 5 },
  revealedDetail: { color: colors.muted, fontSize: 13, lineHeight: 19, marginTop: 7 },
  footer: { backgroundColor: colors.canvas, borderTopWidth: 0, paddingHorizontal: 14, paddingTop: 6 },
  navigation: { flexDirection: "row", gap: 10 },
  footerHint: { color: colors.muted, textAlign: "center", fontSize: 11, marginTop: 7 },
  pressed: { opacity: 0.72, transform: [{ scale: 0.98 }] },
});
