import { router } from "expo-router";
import { useMemo, useState } from "react";
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { AppHeader, Card, PrimaryButton, StudyScreen, colors } from "@/components/study/ui";
import { isCompleteDraft, parseQuestions } from "@/lib/study/parser";

const SAMPLE = `Q1. বাংলাদেশের রাজধানী কোনটি?
A. চট্টগ্রাম
B. ঢাকা
C. খুলনা
D. রাজশাহী
Answer: B
Explanation: ঢাকা বাংলাদেশের রাজধানী।

Q2. 8 × 7 = কত?
A. 54
B. 56
C. 64
D. 48
Answer: B`;

export default function ImportQuestionsScreen() {
  const [content, setContent] = useState("");
  const [parsed, setParsed] = useState(false);
  const insets = useSafeAreaInsets();
  const result = useMemo(() => content.trim() ? parseQuestions(content) : undefined, [content]);
  const valid = result?.drafts.filter(isCompleteDraft).length ?? 0;
  const warnings = result?.issues.filter((issue) => issue.severity === "warning").length ?? 0;
  const invalid = (result?.drafts.length ?? 0) - valid;
  const parse = () => { if (!content.trim()) return; setParsed(true); };
  const preview = () => { if (!result?.drafts.length) return; router.push({ pathname: "/questions/preview", params: { content } }); };
  return <StudyScreen><AppHeader title="Import Questions" subtitle="Paste MCQs, then parse before saving" back={() => router.back()} />
    <KeyboardAvoidingView style={styles.keyboard} behavior={Platform.OS === "ios" ? "padding" : "height"} keyboardVerticalOffset={0}>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
        <Card><Text style={styles.label}>Question content</Text><Text style={styles.help}>Supports English/Bangla serials, A–D or ক–ঘ, Answer/উত্তর, and Explanation/ব্যাখ্যা.</Text><TextInput value={content} onChangeText={(value) => { setContent(value); setParsed(false); }} placeholder="Paste your questions here…" placeholderTextColor="#93A0B4" multiline textAlignVertical="top" style={styles.textarea} /><View style={styles.inlineActions}><Pressable onPress={() => setContent(SAMPLE)} style={({ pressed }) => [styles.textAction, pressed && styles.pressed]}><Text style={styles.textActionLabel}>Use sample</Text></Pressable><Pressable onPress={() => { setContent(""); setParsed(false); }} style={({ pressed }) => [styles.textAction, pressed && styles.pressed]}><Text style={styles.textActionLabel}>Clear</Text></Pressable></View></Card>
        {parsed && result ? <Card style={invalid ? styles.warningCard : styles.readyCard}><Text style={styles.statusTitle}>{result.drafts.length} questions found</Text><View style={styles.statusRow}><Status label="Valid" value={valid} color={colors.success} /><Status label="Review" value={warnings} color={colors.caution} /><Status label="Invalid" value={invalid} color={colors.error} /></View><Text style={styles.statusDetail}>{valid ? "Preview valid questions and choose where to save them." : result.issues[0]?.message ?? "Check the pasted format and try again."}</Text></Card> : null}
      </ScrollView>
      <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, 12) }]}><PrimaryButton label={parsed ? "Preview Questions" : "Parse Questions"} icon={parsed ? "visibility" : "search"} onPress={parsed ? preview : parse} disabled={!content.trim() || (parsed && !result?.drafts.length)} /><Text style={styles.footerNote}>{parsed ? "Preview before anything is added to your question bank." : "Nothing is saved until you preview and confirm."}</Text></View>
    </KeyboardAvoidingView>
  </StudyScreen>;
}

function Status({ label, value, color }: { label: string; value: number; color: string }) { return <View style={styles.statusItem}><Text style={[styles.statusValue, { color }]}>{value}</Text><Text style={styles.statusLabel}>{label}</Text></View>; }

const styles = StyleSheet.create({ keyboard: { flex: 1 }, scroll: { flex: 1 }, content: { padding: 20, paddingBottom: 16 }, label: { color: colors.ink, fontSize: 14, fontWeight: "800" }, help: { color: colors.muted, fontSize: 12, lineHeight: 18, marginTop: 4 }, textarea: { minHeight: 280, marginTop: 12, borderWidth: 1, borderColor: colors.border, borderRadius: 12, padding: 13, color: colors.ink, fontSize: 15, lineHeight: 23, backgroundColor: "#FCFDFE" }, inlineActions: { flexDirection: "row", gap: 18, marginTop: 12 }, textAction: { paddingVertical: 6 }, textActionLabel: { color: colors.blue, fontSize: 13, fontWeight: "800" }, readyCard: { marginTop: 14, backgroundColor: "#F1FBF6", borderColor: "#BFEAD3" }, warningCard: { marginTop: 14, backgroundColor: "#FFF9EC", borderColor: "#F6E1AE" }, statusTitle: { color: colors.ink, fontSize: 17, fontWeight: "800" }, statusRow: { flexDirection: "row", marginTop: 13, borderTopWidth: 1, borderTopColor: "#D7E5DB", paddingTop: 11 }, statusItem: { flex: 1 }, statusValue: { fontSize: 18, fontWeight: "800" }, statusLabel: { color: colors.muted, fontSize: 11, fontWeight: "700", marginTop: 2 }, statusDetail: { color: colors.muted, fontSize: 12, lineHeight: 18, marginTop: 12 }, footer: { backgroundColor: colors.surface, borderTopWidth: 1, borderTopColor: colors.border, paddingHorizontal: 20, paddingTop: 12 }, footerNote: { color: colors.muted, textAlign: "center", fontSize: 11, lineHeight: 16, marginTop: 8, paddingHorizontal: 10 }, pressed: { opacity: 0.65 } });
