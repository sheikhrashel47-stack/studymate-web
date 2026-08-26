import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { router } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

import { AppHeader, Card, EmptyState, PrimaryButton, StudyScreen, colors } from "@/components/study/ui";
import { type AnswerKey } from "@/lib/study/types";
import { useStudy } from "@/lib/study/store";

const formatTime = (seconds: number) => `${Math.floor(seconds / 60).toString().padStart(2, "0")}:${(seconds % 60).toString().padStart(2, "0")}`;

export default function ExamScreen() {
  const { data, getQuestions, updateActiveExam, submitActiveExam } = useStudy();
  const active = data.activeExam;
  const [remaining, setRemaining] = useState(active?.remainingSeconds);
  const questions = useMemo(() => active ? active.questionIds.map((id) => getQuestions().find((question) => question.id === id)).filter(Boolean) : [], [active, getQuestions]);
  const question = questions[active?.currentIndex ?? 0];
  useEffect(() => { setRemaining(active?.remainingSeconds); }, [active?.id]);
  useEffect(() => {
    if (!active?.remainingSeconds) return;
    const elapsed = Math.max(0, Math.floor((Date.now() - active.savedAt) / 1000));
    const initial = Math.max(0, active.remainingSeconds - elapsed);
    setRemaining(initial);
    const timer = setInterval(() => setRemaining((value) => Math.max(0, (value ?? initial) - 1)), 1000);
    return () => clearInterval(timer);
  }, [active?.id, active?.savedAt]);
  useEffect(() => { if (active && remaining === 0 && active.configuration.durationSeconds) finish(true); }, [remaining]);
  if (!active || !question) return <StudyScreen><AppHeader title="Mock Test" back={() => router.replace("/(tabs)/test")} /><EmptyState title="No running test" detail="Set up a new mock test whenever you are ready." action={<PrimaryButton label="Set up test" icon="edit-note" onPress={() => router.replace("/test/setup")} />} /></StudyScreen>;
  const save = (nextIndex: number, nextAnswers = active.answers) => updateActiveExam(nextIndex, nextAnswers, remaining);
  const select = (answer: AnswerKey) => save(active.currentIndex, { ...active.answers, [question.id]: answer });
  const finish = (timedOut = false) => {
    const result = submitActiveExam(remaining);
    if (result) router.replace({ pathname: "/test/result", params: { testId: result.id, timedOut: timedOut ? "1" : "0" } });
  };
  const requestSubmit = () => Alert.alert("Submit test?", "You will see your score and answer review after submitting.", [{ text: "Keep working", style: "cancel" }, { text: "Submit Test", onPress: () => finish() }]);
  return <StudyScreen><AppHeader title={`Question ${active.currentIndex + 1} / ${questions.length}`} subtitle="Correct answers stay hidden until you submit" back={() => save(active.currentIndex)} right={remaining !== undefined ? <View style={styles.timer}><MaterialIcons name="timer" size={16} color={colors.blue} /><Text style={styles.timerText}>{formatTime(remaining)}</Text></View> : undefined} />
    <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}><View style={styles.grid}>{questions.map((item, index) => <Pressable key={item!.id} onPress={() => save(index)} style={({ pressed }) => [styles.gridItem, index === active.currentIndex && styles.gridCurrent, active.answers[item!.id] && styles.gridAnswered, pressed && styles.pressed]}><Text style={[styles.gridText, (index === active.currentIndex || active.answers[item!.id]) && styles.gridTextActive]}>{index + 1}</Text></Pressable>)}</View><Card><Text style={styles.question}>Q{question.serial}. {question.prompt}</Text><View style={styles.options}>{Object.entries(question.options).filter(([, value]) => Boolean(value)).map(([key, value]) => { const optionKey = key as AnswerKey; return <Pressable key={key} accessibilityRole="radio" accessibilityState={{ selected: active.answers[question.id] === optionKey }} onPress={() => select(optionKey)} style={({ pressed }) => [styles.option, active.answers[question.id] === optionKey && styles.optionSelected, pressed && styles.pressed]}><Text style={[styles.optionKey, active.answers[question.id] === optionKey && styles.optionKeySelected]}>{key}</Text><Text style={[styles.optionText, active.answers[question.id] === optionKey && styles.optionTextSelected]}>{value}</Text></Pressable>; })}</View></Card><View style={styles.navigation}><PrimaryButton label="Previous" variant="secondary" onPress={() => save(Math.max(0, active.currentIndex - 1))} disabled={active.currentIndex === 0} /><PrimaryButton label={active.currentIndex === questions.length - 1 ? "Review" : "Next"} icon="arrow-forward" onPress={() => save(Math.min(questions.length - 1, active.currentIndex + 1))} /></View><PrimaryButton label="Submit Test" variant="secondary" icon="assignment-turned-in" onPress={requestSubmit} /></ScrollView>
  </StudyScreen>;
}

const styles = StyleSheet.create({ content: { padding: 20, paddingBottom: 34, gap: 14 }, timer: { flexDirection: "row", alignItems: "center", gap: 4, borderWidth: 1, borderColor: "#C9DBFF", backgroundColor: colors.softBlue, borderRadius: 12, paddingHorizontal: 9, paddingVertical: 7 }, timerText: { color: colors.blue, fontSize: 13, fontWeight: "800" }, grid: { flexDirection: "row", flexWrap: "wrap", gap: 7 }, gridItem: { width: 34, height: 34, borderRadius: 10, alignItems: "center", justifyContent: "center", backgroundColor: colors.surface, borderColor: colors.border, borderWidth: 1 }, gridCurrent: { borderColor: colors.blue, backgroundColor: colors.softBlue }, gridAnswered: { backgroundColor: colors.blue, borderColor: colors.blue }, gridText: { color: colors.muted, fontSize: 12, fontWeight: "800" }, gridTextActive: { color: "#FFFFFF" }, question: { color: colors.ink, fontSize: 18, fontWeight: "800", lineHeight: 27 }, options: { marginTop: 22, gap: 10 }, option: { minHeight: 54, borderRadius: 13, borderWidth: 1, borderColor: colors.border, backgroundColor: "#FCFDFE", flexDirection: "row", alignItems: "center", gap: 10, paddingHorizontal: 12 }, optionSelected: { borderColor: colors.blue, backgroundColor: colors.softBlue }, optionKey: { width: 27, height: 27, borderRadius: 9, backgroundColor: "#EEF2F7", color: colors.muted, textAlign: "center", lineHeight: 27, fontSize: 13, fontWeight: "800" }, optionKeySelected: { color: "#FFFFFF", backgroundColor: colors.blue }, optionText: { color: colors.ink, fontSize: 14, lineHeight: 19, flex: 1 }, optionTextSelected: { color: colors.blue, fontWeight: "700" }, navigation: { flexDirection: "row", gap: 10 }, pressed: { opacity: 0.7 } });
