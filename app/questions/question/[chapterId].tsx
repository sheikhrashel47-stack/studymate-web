import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { router, useLocalSearchParams } from "expo-router";
import { useState } from "react";
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

import { AppHeader, Card, EmptyState, PrimaryButton, StudyScreen, colors } from "@/components/study/ui";
import { ANSWER_KEYS } from "@/lib/study/types";
import { useStudy } from "@/lib/study/store";

export default function QuestionListScreen() {
  const { chapterId } = useLocalSearchParams<{ chapterId: string }>();
  const { getChapter, getQuestions, deleteQuestion } = useStudy();
  const chapter = getChapter(chapterId);
  const questions = getQuestions({ chapterId });
  const [index, setIndex] = useState(0);
  const [reveal, setReveal] = useState(false);
  const question = questions[index];
  const remove = () => question && Alert.alert("Delete question?", "This question will be removed from this device.", [{ text: "Cancel", style: "cancel" }, { text: "Delete", style: "destructive", onPress: () => { deleteQuestion(question.id); setIndex((current) => Math.max(0, Math.min(current, questions.length - 2))); setReveal(false); } }]);
  if (!chapter) return <StudyScreen><AppHeader title="Questions" back={() => router.back()} /><EmptyState title="Chapter not found" detail="It may have been removed." /></StudyScreen>;
  if (!question) return <StudyScreen><AppHeader title={chapter.name} back={() => router.back()} /><EmptyState title="No questions yet" detail="Import questions into this chapter to start studying." action={<PrimaryButton label="Import Questions" icon="file-upload" onPress={() => router.push("/questions/import")} />} /></StudyScreen>;
  return <StudyScreen><AppHeader title={chapter.name} subtitle={`Question ${index + 1} of ${questions.length}`} back={() => router.back()} />
    <ScrollView contentContainerStyle={styles.content}><View style={styles.progressTrack}><View style={[styles.progressFill, { width: `${((index + 1) / questions.length) * 100}%` }]} /></View><Card><Text style={styles.question}>Q{question.serial}. {question.prompt}</Text><View style={styles.options}>{ANSWER_KEYS.map((key) => <View key={key} style={[styles.option, reveal && key === question.correctOption && styles.correctOption]}><Text style={[styles.optionKey, reveal && key === question.correctOption && styles.correctKey]}>{key}</Text><Text style={[styles.optionText, reveal && key === question.correctOption && styles.correctText]}>{question.options[key]}</Text></View>)}</View>{reveal ? <View style={styles.explanation}><Text style={styles.explanationLabel}>EXPLANATION</Text><Text style={styles.explanationText}>{question.explanation || "No explanation was added for this question."}</Text></View> : <PrimaryButton label="Show Answer" icon="visibility" onPress={() => setReveal(true)} />}</Card><View style={styles.navigation}><PrimaryButton label="Previous" variant="secondary" onPress={() => { setIndex(Math.max(0, index - 1)); setReveal(false); }} disabled={index === 0} /><PrimaryButton label="Next" icon="arrow-forward" onPress={() => { setIndex(Math.min(questions.length - 1, index + 1)); setReveal(false); }} disabled={index === questions.length - 1} /></View><Pressable onPress={remove} accessibilityRole="button" style={({ pressed }) => [styles.deleteText, pressed && styles.pressed]}><MaterialIcons name="delete-outline" size={18} color={colors.error} /><Text style={styles.deleteLabel}>Delete this question</Text></Pressable></ScrollView>
  </StudyScreen>;
}

const styles = StyleSheet.create({ content: { padding: 20, paddingBottom: 34, gap: 14 }, progressTrack: { height: 5, borderRadius: 4, overflow: "hidden", backgroundColor: "#DDE5F0" }, progressFill: { height: "100%", backgroundColor: colors.blue, borderRadius: 4 }, question: { color: colors.ink, fontSize: 18, lineHeight: 27, fontWeight: "800" }, options: { marginTop: 22, gap: 10, marginBottom: 18 }, option: { flexDirection: "row", alignItems: "center", gap: 10, padding: 12, minHeight: 52, borderRadius: 13, borderWidth: 1, borderColor: colors.border, backgroundColor: "#FCFDFE" }, optionKey: { width: 26, height: 26, borderRadius: 8, backgroundColor: colors.softBlue, color: colors.blue, textAlign: "center", lineHeight: 26, fontWeight: "800" }, optionText: { flex: 1, color: colors.ink, fontSize: 14, lineHeight: 19 }, correctOption: { borderColor: "#A8DFC4", backgroundColor: "#F1FBF6" }, correctKey: { backgroundColor: colors.success, color: "#FFFFFF" }, correctText: { color: colors.success, fontWeight: "700" }, explanation: { borderTopWidth: 1, borderTopColor: colors.border, paddingTop: 16 }, explanationLabel: { color: colors.success, fontSize: 11, fontWeight: "800", letterSpacing: 0.7 }, explanationText: { color: colors.ink, fontSize: 14, lineHeight: 20, marginTop: 6 }, navigation: { flexDirection: "row", gap: 10 }, deleteText: { alignSelf: "center", flexDirection: "row", alignItems: "center", gap: 5, padding: 10 }, deleteLabel: { color: colors.error, fontSize: 13, fontWeight: "700" }, pressed: { opacity: 0.65 } });
