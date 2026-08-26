import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { router, useLocalSearchParams } from "expo-router";
import { useMemo } from "react";
import { Alert, FlatList, StyleSheet, Text, View } from "react-native";

import { AppHeader, Card, PrimaryButton, StudyScreen, colors } from "@/components/study/ui";
import { isCompleteDraft, parseQuestions } from "@/lib/study/parser";
import { useStudy } from "@/lib/study/store";

export default function ImportPreviewScreen() {
  const { content = "", subject = "", chapter = "" } = useLocalSearchParams<{ content: string; subject: string; chapter: string }>();
  const { importQuestions } = useStudy();
  const result = useMemo(() => parseQuestions(content), [content]);
  const complete = result.drafts.filter(isCompleteDraft);
  const save = () => {
    const summary = importQuestions(subject, chapter, result.drafts);
    if (!summary) { Alert.alert("Nothing to import", "Please go back and check the question format."); return; }
    Alert.alert("Questions imported", `${summary.added} question${summary.added === 1 ? "" : "s"} saved to ${subject} · ${chapter}.`, [{ text: "View questions", onPress: () => router.replace({ pathname: "/questions/[subjectId]", params: { subjectId: summary.subjectId } }) }]);
  };
  return <StudyScreen><AppHeader title="Import Preview" subtitle={`${subject} · ${chapter}`} back={() => router.back()} />
    <FlatList data={result.drafts} keyExtractor={(item, index) => `${item.serial}-${index}`} contentContainerStyle={styles.list} ListHeaderComponent={<><Card style={result.issues.length ? styles.warn : styles.success}><View style={styles.summaryRow}><MaterialIcons name={result.issues.length ? "info-outline" : "check-circle-outline"} size={23} color={result.issues.length ? colors.caution : colors.success} /><View style={{ flex: 1 }}><Text style={styles.summaryTitle}>{result.drafts.length} questions found</Text><Text style={styles.summaryDetail}>{result.issues.length ? `${complete.length} complete; ${result.issues.length} details need attention.` : "All questions have the required answer data."}</Text></View></View></Card>{result.issues.length ? <Card style={styles.issuesCard}><Text style={styles.issueHeader}>Needs attention</Text>{result.issues.slice(0, 5).map((issue, index) => <Text style={styles.issueText} key={`${issue.message}-${index}`}>• {issue.questionNumber ? `Q${issue.questionNumber}: ` : ""}{issue.message}</Text>)}</Card> : null}<Text style={styles.previewLabel}>PREVIEW</Text></>} renderItem={({ item }) => <Card style={[styles.questionCard, !isCompleteDraft(item) && styles.incomplete]}><Text style={styles.question}>Q{item.serial}. {item.prompt || "Question text is missing"}</Text>{["A", "B", "C", "D"].map((key) => <Text style={styles.option} key={key}>{key}. {item.options[key as "A"] || "—"}</Text>)}<Text style={styles.answer}>Answer: {item.correctOption ?? "Missing"}</Text></Card>} ListFooterComponent={<View style={styles.footer}><PrimaryButton label={`Import ${complete.length} Question${complete.length === 1 ? "" : "s"}`} icon="file-download" onPress={save} disabled={!complete.length} /><Text style={styles.note}>Incomplete items are not imported, and existing questions remain unchanged.</Text></View>} />
  </StudyScreen>;
}

const styles = StyleSheet.create({ list: { padding: 20, gap: 10, paddingBottom: 32 }, summaryRow: { flexDirection: "row", alignItems: "center", gap: 11 }, summaryTitle: { color: colors.ink, fontSize: 16, fontWeight: "800" }, summaryDetail: { color: colors.muted, fontSize: 12, lineHeight: 17, marginTop: 3 }, warn: { backgroundColor: "#FFF9EC", borderColor: "#F6E1AE" }, success: { backgroundColor: "#F1FBF6", borderColor: "#BFEAD3" }, issuesCard: { backgroundColor: "#FFFDF8" }, issueHeader: { color: colors.caution, fontSize: 14, fontWeight: "800", marginBottom: 6 }, issueText: { color: colors.muted, fontSize: 12, lineHeight: 18, marginTop: 3 }, previewLabel: { color: colors.muted, fontSize: 11, fontWeight: "800", letterSpacing: 0.8, marginTop: 8, marginLeft: 4 }, questionCard: { gap: 8 }, incomplete: { borderColor: "#F6D5A0", backgroundColor: "#FFFDF8" }, question: { color: colors.ink, fontSize: 15, lineHeight: 22, fontWeight: "800" }, option: { color: colors.muted, fontSize: 13, lineHeight: 18 }, answer: { color: colors.success, fontSize: 12, fontWeight: "800", marginTop: 3 }, footer: { marginTop: 8, gap: 12 }, note: { color: colors.muted, fontSize: 12, lineHeight: 17, textAlign: "center" } });
