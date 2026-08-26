import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { router, useLocalSearchParams } from "expo-router";
import { useState } from "react";
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

import { AppHeader, Card, EmptyState, PrimaryButton, StudyScreen, colors } from "@/components/study/ui";
import { useStudy } from "@/lib/study/store";

export default function QuestionDetailScreen() {
  const { questionId } = useLocalSearchParams<{ questionId: string }>();
  const { data, deleteQuestion } = useStudy();
  const [reveal, setReveal] = useState(true);
  const question = data.questions.find((item) => item.id === questionId);
  const remove = () => question && Alert.alert("Delete this question?", "This question will be removed. Earlier attempt history remains available for your progress record.", [{ text: "Cancel", style: "cancel" }, { text: "Delete", style: "destructive", onPress: () => { deleteQuestion(question.id); router.back(); } }]);
  if (!question) return <StudyScreen><AppHeader title="Question" back={() => router.back()} /><EmptyState title="Question not found" detail="It may have been removed." /></StudyScreen>;
  return <StudyScreen><AppHeader title={`Question ${question.serial}`} subtitle="Question details" back={() => router.back()} />
    <ScrollView contentContainerStyle={styles.content}><Card><Text style={styles.question}>{question.prompt}</Text><View style={styles.options}>{Object.entries(question.options).filter(([, value]) => Boolean(value)).map(([key, value]) => <View key={key} style={[styles.option, reveal && key === question.correctOption && styles.correctOption]}><Text style={[styles.optionKey, reveal && key === question.correctOption && styles.correctKey]}>{key}</Text><Text style={[styles.optionText, reveal && key === question.correctOption && styles.correctText]}>{value}</Text></View>)}</View>{reveal ? <View style={styles.explanation}><Text style={styles.explanationLabel}>EXPLANATION</Text><Text style={styles.explanationText}>{question.explanation}</Text></View> : <PrimaryButton label="Show Answer" icon="visibility" onPress={() => setReveal(true)} />}</Card><Pressable onPress={remove} accessibilityRole="button" style={({ pressed }) => [styles.deleteText, pressed && styles.pressed]}><MaterialIcons name="delete-outline" size={18} color={colors.error} /><Text style={styles.deleteLabel}>Delete this question</Text></Pressable></ScrollView>
  </StudyScreen>;
}

const styles = StyleSheet.create({ content: { padding: 20, paddingBottom: 34, gap: 14 }, question: { color: colors.ink, fontSize: 18, lineHeight: 27, fontWeight: "800" }, options: { marginTop: 22, gap: 10, marginBottom: 18 }, option: { flexDirection: "row", alignItems: "center", gap: 10, padding: 12, minHeight: 52, borderRadius: 13, borderWidth: 1, borderColor: colors.border, backgroundColor: "#FCFDFE" }, optionKey: { width: 26, height: 26, borderRadius: 8, backgroundColor: colors.softBlue, color: colors.blue, textAlign: "center", lineHeight: 26, fontWeight: "800" }, optionText: { flex: 1, color: colors.ink, fontSize: 14, lineHeight: 19 }, correctOption: { borderColor: "#A8DFC4", backgroundColor: "#F1FBF6" }, correctKey: { backgroundColor: colors.success, color: "#FFFFFF" }, correctText: { color: colors.success, fontWeight: "700" }, explanation: { borderTopWidth: 1, borderTopColor: colors.border, paddingTop: 16 }, explanationLabel: { color: colors.success, fontSize: 11, fontWeight: "800", letterSpacing: 0.7 }, explanationText: { color: colors.ink, fontSize: 14, lineHeight: 20, marginTop: 6 }, deleteText: { alignSelf: "center", flexDirection: "row", alignItems: "center", gap: 5, padding: 10 }, deleteLabel: { color: colors.error, fontSize: 13, fontWeight: "700" }, pressed: { opacity: 0.65 } });
