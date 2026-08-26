import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import { useMemo, useState } from "react";
import { Platform, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

import { AppHeader, Card, EmptyState, PrimaryButton, StudyScreen, colors } from "@/components/study/ui";
import { ANSWER_KEYS, type AnswerKey } from "@/lib/study/types";
import { useStudy } from "@/lib/study/store";

export default function FlashTestScreen() {
  const { data, recordFlashAttempt } = useStudy();
  const questions = useMemo(() => [...data.questions].sort(() => Math.random() - 0.5), [data.questions]);
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState<AnswerKey>();
  const question = questions[index];
  if (!question) return <StudyScreen><AppHeader title="Flash Test" back={() => router.back()} /><EmptyState icon="bolt" title="Add questions first" detail="Import questions to unlock quick practice." action={<PrimaryButton label="Import Questions" icon="file-upload" onPress={() => router.replace("/questions/import")} />} /></StudyScreen>;
  const choose = (key: AnswerKey) => {
    if (selected) return;
    setSelected(key);
    const correct = recordFlashAttempt(question.id, key);
    if (Platform.OS !== "web") Haptics.notificationAsync(correct ? Haptics.NotificationFeedbackType.Success : Haptics.NotificationFeedbackType.Error);
  };
  const next = () => { setIndex((current) => (current + 1) % questions.length); setSelected(undefined); };
  const isCorrect = selected === question.correctOption;
  return <StudyScreen><AppHeader title="Flash Test" subtitle={`Quick practice · Question ${index + 1}`} back={() => router.back()} />
    <ScrollView contentContainerStyle={styles.content}><View style={styles.progress}><View style={[styles.progressFill, { width: `${((index + 1) / questions.length) * 100}%` }]} /></View><Card><Text style={styles.question}>Q. {question.prompt}</Text><View style={styles.options}>{ANSWER_KEYS.map((key) => { const chosen = selected === key; const correctAnswer = Boolean(selected && key === question.correctOption); return <Pressable key={key} disabled={Boolean(selected)} onPress={() => choose(key)} style={({ pressed }) => [styles.option, chosen && (isCorrect ? styles.optionCorrect : styles.optionWrong), correctAnswer && styles.optionCorrect, pressed && !selected && styles.pressed]}><Text style={[styles.optionKey, (chosen || correctAnswer) && styles.optionKeyActive]}>{key}</Text><Text style={[styles.optionText, (chosen || correctAnswer) && styles.optionTextActive]}>{question.options[key]}</Text></Pressable>; })}</View>{selected ? <View style={[styles.feedback, isCorrect ? styles.feedbackCorrect : styles.feedbackWrong]}><Text style={[styles.feedbackTitle, { color: isCorrect ? colors.success : colors.error }]}>{isCorrect ? "Correct!" : "Incorrect"}</Text><Text style={styles.feedbackText}>Correct answer: {question.correctOption}. {question.options[question.correctOption]}</Text>{question.explanation ? <Text style={styles.feedbackExplanation}>{question.explanation}</Text> : null}</View> : null}</Card>{selected ? <PrimaryButton label="Next Question" icon="arrow-forward" onPress={next} /> : null}</ScrollView>
  </StudyScreen>;
}
const styles = StyleSheet.create({ content: { padding: 20, paddingBottom: 34, gap: 14 }, progress: { height: 5, overflow: "hidden", borderRadius: 4, backgroundColor: "#DDE5F0" }, progressFill: { height: "100%", borderRadius: 4, backgroundColor: colors.blue }, question: { color: colors.ink, fontSize: 19, lineHeight: 28, fontWeight: "800" }, options: { marginTop: 22, gap: 10 }, option: { minHeight: 54, borderRadius: 13, borderWidth: 1, borderColor: colors.border, backgroundColor: "#FCFDFE", flexDirection: "row", alignItems: "center", gap: 10, paddingHorizontal: 12 }, optionCorrect: { borderColor: "#A8DFC4", backgroundColor: "#F1FBF6" }, optionWrong: { borderColor: "#F2BFBF", backgroundColor: "#FFF4F4" }, optionKey: { width: 27, height: 27, borderRadius: 9, backgroundColor: "#EEF2F7", color: colors.muted, textAlign: "center", lineHeight: 27, fontSize: 13, fontWeight: "800" }, optionKeyActive: { backgroundColor: colors.blue, color: "#FFFFFF" }, optionText: { color: colors.ink, fontSize: 14, flex: 1, lineHeight: 19 }, optionTextActive: { fontWeight: "700" }, feedback: { marginTop: 18, borderRadius: 13, padding: 14 }, feedbackCorrect: { backgroundColor: "#F1FBF6" }, feedbackWrong: { backgroundColor: "#FFF4F4" }, feedbackTitle: { fontSize: 17, fontWeight: "800" }, feedbackText: { color: colors.ink, fontSize: 13, lineHeight: 19, marginTop: 5 }, feedbackExplanation: { color: colors.muted, fontSize: 13, lineHeight: 19, marginTop: 7 }, pressed: { opacity: 0.7 } });
