import { router } from "expo-router";
import { useMemo, useState } from "react";
import { Alert, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";

import { AppHeader, Card, PrimaryButton, StudyScreen, colors } from "@/components/study/ui";
import { parseQuestions } from "@/lib/study/parser";

const SAMPLE = `Q1. বাংলাদেশের রাজধানী কোনটি?\nA. চট্টগ্রাম\nB. ঢাকা\nC. খুলনা\nD. রাজশাহী\nAnswer: B\nExplanation: ঢাকা বাংলাদেশের রাজধানী।\n\nQ2. 8 × 7 = কত?\nA. 54\nB. 56\nC. 64\nD. 48\nAnswer: B\nExplanation: 8 গুণ 7 সমান 56।`;

export default function ImportQuestionsScreen() {
  const [content, setContent] = useState("");
  const [subject, setSubject] = useState("");
  const [chapter, setChapter] = useState("");
  const result = useMemo(() => content.trim() ? parseQuestions(content) : undefined, [content]);
  const ready = Boolean(subject.trim() && chapter.trim() && result?.drafts.length);
  const preview = () => {
    if (!subject.trim() || !chapter.trim()) { Alert.alert("Add a subject and chapter", "This keeps imported questions organized for study and testing."); return; }
    if (!result?.drafts.length) { Alert.alert("No questions found", "Paste Plain Text, JSON, or HTML containing numbered multiple-choice questions."); return; }
    router.push({ pathname: "/questions/preview", params: { content, subject: subject.trim(), chapter: chapter.trim() } });
  };
  return <StudyScreen><AppHeader title="Import Questions" subtitle="Paste Plain Text, JSON, or HTML" back={() => router.back()} />
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined}><ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
      <Card><Text style={styles.label}>Subject</Text><TextInput value={subject} onChangeText={setSubject} placeholder="e.g. গণিত" placeholderTextColor="#93A0B4" style={styles.input} returnKeyType="next" /><Text style={[styles.label, styles.laterLabel]}>Chapter or topic</Text><TextInput value={chapter} onChangeText={setChapter} placeholder="e.g. Linear Equation" placeholderTextColor="#93A0B4" style={styles.input} returnKeyType="done" /></Card>
      <Card><View style={styles.sourceRow}><View><Text style={styles.label}>Question content</Text><Text style={styles.help}>Detected: {result ? result.sourceType.toUpperCase() : "—"}</Text></View><Text style={styles.counter}>{content.length.toLocaleString()} chars</Text></View><TextInput value={content} onChangeText={setContent} placeholder="Paste questions here…" placeholderTextColor="#93A0B4" multiline textAlignVertical="top" style={styles.textarea} />
        <View style={styles.sampleButton}><PrimaryButton label="Use a sample" variant="secondary" icon="content-paste" onPress={() => setContent(SAMPLE)} /></View>
      </Card>
      {result ? <Card style={result.issues.length ? styles.warningCard : styles.readyCard}><Text style={styles.statusTitle}>{result.drafts.length} question{result.drafts.length === 1 ? "" : "s"} found</Text><Text style={styles.statusDetail}>{result.issues.length ? `${result.issues.length} item${result.issues.length === 1 ? " needs" : "s need"} attention before import.` : "Everything looks ready for preview."}</Text></Card> : null}
      <PrimaryButton label="Preview Questions" icon="visibility" onPress={preview} disabled={!ready} />
      <Text style={styles.note}>Existing questions are never deleted during import. You will review the results before saving.</Text>
    </ScrollView></KeyboardAvoidingView>
  </StudyScreen>;
}

const styles = StyleSheet.create({ content: { padding: 20, paddingBottom: 32, gap: 14 }, label: { color: colors.ink, fontSize: 14, fontWeight: "800" }, laterLabel: { marginTop: 16 }, input: { marginTop: 8, height: 48, borderWidth: 1, borderColor: colors.border, borderRadius: 12, paddingHorizontal: 13, color: colors.ink, fontSize: 15, backgroundColor: "#FCFDFE" }, sourceRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" }, help: { color: colors.muted, fontSize: 12, marginTop: 3 }, counter: { color: colors.muted, fontSize: 11 }, textarea: { minHeight: 240, marginTop: 10, borderWidth: 1, borderColor: colors.border, borderRadius: 12, padding: 13, color: colors.ink, fontSize: 15, lineHeight: 22, backgroundColor: "#FCFDFE" }, sampleButton: { marginTop: 10, alignSelf: "flex-start" }, statusTitle: { color: colors.ink, fontWeight: "800", fontSize: 16 }, statusDetail: { color: colors.muted, marginTop: 5, fontSize: 13, lineHeight: 18 }, warningCard: { backgroundColor: "#FFF9EC", borderColor: "#F6E1AE" }, readyCard: { backgroundColor: "#F1FBF6", borderColor: "#BFEAD3" }, note: { color: colors.muted, fontSize: 12, lineHeight: 18, textAlign: "center", paddingHorizontal: 12 } });
