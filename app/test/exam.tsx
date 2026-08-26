import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { router } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import { FlatList, Pressable, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { AppHeader, Card, EmptyState, PrimaryButton, ProgressBar, StudyScreen, colors } from "@/components/study/ui";
import { type AnswerKey, type Question } from "@/lib/study/types";
import { useStudy } from "@/lib/study/store";

const formatTime = (seconds: number) => `${Math.floor(seconds / 60).toString().padStart(2, "0")}:${(seconds % 60).toString().padStart(2, "0")}`;

export default function ExamScreen() {
  const { data, getQuestions, updateActiveExam, submitActiveExam } = useStudy();
  const active = data.activeExam;
  const [remaining, setRemaining] = useState(active?.remainingSeconds);
  const [confirmSubmit, setConfirmSubmit] = useState(false);
  const [starred, setStarred] = useState<Record<string, boolean>>({});
  const [flagged, setFlagged] = useState<Record<string, boolean>>({});
  const insets = useSafeAreaInsets();
  const questions = useMemo(() => active ? active.questionIds.map((id) => getQuestions().find((question) => question.id === id)).filter((question): question is Question => Boolean(question)) : [], [active?.questionIds, getQuestions]);
  const answered = active ? Object.keys(active.answers).length : 0;
  const submit = (timedOut = false) => { const result = submitActiveExam(remaining); if (result) router.replace({ pathname: "/test/result", params: { testId: result.id, timedOut: timedOut ? "1" : "0" } }); };

  useEffect(() => { setRemaining(active?.remainingSeconds); }, [active?.id]);
  useEffect(() => {
    if (!active?.remainingSeconds) return;
    const elapsed = Math.max(0, Math.floor((Date.now() - active.savedAt) / 1000));
    const initial = Math.max(0, active.remainingSeconds - elapsed);
    setRemaining(initial);
    const timer = setInterval(() => setRemaining((value) => Math.max(0, (value ?? initial) - 1)), 1000);
    return () => clearInterval(timer);
  }, [active?.id, active?.savedAt]);
  useEffect(() => { if (active && remaining === 0 && active.configuration.durationSeconds) submit(true); }, [remaining]);

  if (!active || !questions.length) return <StudyScreen><AppHeader title="Mock Test" back={() => router.replace("/(tabs)/test")} /><EmptyState title="No running test" detail="Set up a new mock test whenever you are ready." action={<PrimaryButton label="Set up test" icon="edit-note" onPress={() => router.replace("/test/setup")} />} /></StudyScreen>;

  const choose = (question: Question, option: AnswerKey) => updateActiveExam(active.currentIndex, { ...active.answers, [question.id]: option }, remaining);
  const exit = () => updateActiveExam(active.currentIndex, active.answers, remaining);
  return <StudyScreen>
    <AppHeader title="Mock Test" subtitle={`${answered} answered · ${questions.length} questions`} back={exit} right={<View style={styles.headerActions}>{remaining !== undefined ? <View style={styles.timer}><MaterialIcons name="timer" size={16} color={colors.blue} /><Text style={styles.timerText}>{formatTime(remaining)}</Text></View> : null}<Pressable accessibilityRole="button" accessibilityLabel="Submit test" onPress={() => setConfirmSubmit(true)} style={({ pressed }) => [styles.submitTop, pressed && styles.pressed]}><Text style={styles.submitTopText}>Submit</Text></Pressable></View>} />
    <View style={styles.progressWrap}><View style={styles.progressLine}><Text style={styles.progressText}>{answered}/{questions.length} answered</Text><Text style={styles.progressText}>{Math.round((answered / questions.length) * 100)}%</Text></View><ProgressBar value={(answered / questions.length) * 100} color={colors.blue} /></View>
    <FlatList data={questions} keyExtractor={(item) => item.id} style={styles.list} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false} renderItem={({ item, index }) => <QuestionCard question={item} index={index} selected={active.answers[item.id]} starred={Boolean(starred[item.id])} flagged={Boolean(flagged[item.id])} onSelect={(option) => choose(item, option)} onStar={() => setStarred((value) => ({ ...value, [item.id]: !value[item.id] }))} onFlag={() => setFlagged((value) => ({ ...value, [item.id]: !value[item.id] }))} />} ListFooterComponent={<View style={{ height: confirmSubmit ? 190 : 24 }} />} />
    <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, 12) }]}>{confirmSubmit ? <View style={styles.confirmCard}><Text style={styles.confirmTitle}>Submit this test?</Text><Text style={styles.confirmDetail}>{answered} of {questions.length} questions answered. You can still review unanswered cards before submitting.</Text><View style={styles.confirmActions}><View style={{ flex: 1 }}><PrimaryButton label="Keep scrolling" variant="secondary" onPress={() => setConfirmSubmit(false)} /></View><View style={{ flex: 1 }}><PrimaryButton label="Submit test" icon="assignment-turned-in" onPress={() => submit()} /></View></View></View> : <PrimaryButton label="Submit Test" icon="assignment-turned-in" onPress={() => setConfirmSubmit(true)} compact />}</View>
  </StudyScreen>;
}

function QuestionCard({ question, index, selected, starred, flagged, onSelect, onStar, onFlag }: { question: Question; index: number; selected?: AnswerKey; starred: boolean; flagged: boolean; onSelect: (option: AnswerKey) => void; onStar: () => void; onFlag: () => void }) {
  return <Card style={styles.questionCard}><View style={styles.questionHeader}><View><Text style={styles.questionNumber}>Q{String(index + 1).padStart(2, "0")}</Text><Text style={styles.breadcrumb}>মুহাম্মদ (সাঃ) · MCQ</Text></View><View style={styles.cardActions}><Pressable accessibilityRole="button" accessibilityLabel="Bookmark question" onPress={onStar} style={({ pressed }) => [styles.actionIcon, pressed && styles.pressed]}><MaterialIcons name={starred ? "star" : "star-border"} size={22} color={starred ? colors.coral : colors.muted} /></Pressable><Pressable accessibilityRole="button" accessibilityLabel="Flag question" onPress={onFlag} style={({ pressed }) => [styles.actionIcon, pressed && styles.pressed]}><MaterialIcons name={flagged ? "flag" : "outlined-flag"} size={21} color={flagged ? colors.error : colors.muted} /></Pressable></View></View><Text style={styles.prompt}>{question.prompt}</Text><View style={styles.options}>{Object.entries(question.options).filter(([, value]) => Boolean(value)).map(([key, value]) => { const option = key as AnswerKey; const isSelected = selected === option; return <Pressable key={key} accessibilityRole="radio" accessibilityState={{ selected: isSelected }} onPress={() => onSelect(option)} style={({ pressed }) => [styles.option, isSelected && styles.optionSelected, pressed && styles.pressed]}><View style={[styles.radio, isSelected && styles.radioSelected]}>{isSelected ? <View style={styles.radioDot} /> : null}</View><Text style={[styles.optionKey, isSelected && styles.optionKeySelected]}>{key}</Text><Text style={[styles.optionText, isSelected && styles.optionTextSelected]}>{value}</Text></Pressable>; })}</View><Text style={[styles.point, selected && styles.pointSelected]}>{selected ? "Answer saved" : "1 point"}</Text></Card>;
}

const styles = StyleSheet.create({
  headerActions: { flexDirection: "row", alignItems: "center", gap: 7 },
  timer: { flexDirection: "row", alignItems: "center", gap: 4, borderRadius: 12, paddingHorizontal: 9, paddingVertical: 7, backgroundColor: colors.softBlue },
  timerText: { color: colors.blue, fontSize: 13, fontWeight: "800" },
  submitTop: { minHeight: 38, borderRadius: 12, paddingHorizontal: 11, alignItems: "center", justifyContent: "center", backgroundColor: colors.coral },
  submitTopText: { color: "#FFFFFF", fontSize: 12, fontWeight: "900" },
  progressWrap: { paddingHorizontal: 12, paddingBottom: 6 },
  progressLine: { flexDirection: "row", justifyContent: "space-between", marginBottom: 6 },
  progressText: { color: colors.muted, fontSize: 12, fontWeight: "700" },
  list: { flex: 1 },
  content: { paddingHorizontal: 12, paddingTop: 6, gap: 8 },
  questionCard: { padding: 13, borderRadius: 17, borderTopWidth: 0, shadowOpacity: 0.025, elevation: 0 },
  questionHeader: { flexDirection: "row", alignItems: "flex-start", justifyContent: "space-between" },
  questionNumber: { color: colors.blue, fontSize: 14, fontWeight: "900", letterSpacing: 0.4 },
  breadcrumb: { color: colors.muted, fontSize: 11, marginTop: 3 },
  cardActions: { flexDirection: "row", gap: 3 },
  actionIcon: { width: 38, height: 38, borderRadius: 12, alignItems: "center", justifyContent: "center", backgroundColor: colors.canvas },
  prompt: { color: colors.ink, fontSize: 16, lineHeight: 23, fontWeight: "800", marginTop: 12 },
  options: { gap: 7, marginTop: 13 },
  option: { minHeight: 47, flexDirection: "row", alignItems: "center", gap: 9, borderRadius: 12, borderWidth: 1, borderColor: colors.border, backgroundColor: "#FFFFFF", paddingHorizontal: 10, paddingVertical: 7 },
  optionSelected: { borderColor: colors.blue, backgroundColor: colors.softBlue },
  radio: { width: 20, height: 20, borderRadius: 10, borderWidth: 1.5, borderColor: "#A7B3C2", alignItems: "center", justifyContent: "center" },
  radioSelected: { borderColor: colors.blue },
  radioDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: colors.blue },
  optionKey: { width: 27, height: 27, borderRadius: 9, textAlign: "center", lineHeight: 27, backgroundColor: colors.canvas, color: colors.muted, fontSize: 12, fontWeight: "900" },
  optionKeySelected: { backgroundColor: colors.blue, color: "#FFFFFF" },
  optionText: { flex: 1, color: colors.ink, fontSize: 14, lineHeight: 19 },
  optionTextSelected: { color: colors.blue, fontWeight: "800" },
  point: { color: colors.muted, fontSize: 11, fontWeight: "800", marginTop: 12 },
  pointSelected: { color: colors.success },
  footer: { backgroundColor: colors.surface, borderTopWidth: 1, borderTopColor: colors.border, paddingHorizontal: 20, paddingTop: 11 },
  confirmCard: { borderRadius: 16, padding: 13, backgroundColor: colors.softBlue, borderWidth: 1, borderColor: "#C7E4D7" },
  confirmTitle: { color: colors.ink, fontSize: 15, fontWeight: "900" },
  confirmDetail: { color: colors.muted, fontSize: 12, lineHeight: 17, marginTop: 3 },
  confirmActions: { flexDirection: "row", gap: 9, marginTop: 10 },
  pressed: { opacity: 0.7, transform: [{ scale: 0.98 }] },
});
