import { router } from "expo-router";
import { StyleSheet, Text, View } from "react-native";

import { AppHeader, Card, EmptyState, PrimaryButton, StudyScreen, colors } from "@/components/study/ui";
import { useStudy } from "@/lib/study/store";

export default function TestTab() {
  const { data } = useStudy();
  const hasQuestions = Boolean(data.questions.length);
  return <StudyScreen><AppHeader title="Test" subtitle="Choose a focused practice mode" /><View style={styles.content}>{hasQuestions ? <><ModeCard title="Mock Test" detail="Practice like a real exam, then review your answers." icon="edit-note" action="Set up test" onPress={() => router.push("/test/setup")} /><ModeCard title="Flash Test" detail="Get instant feedback, one question at a time." icon="bolt" action="Start Flash Test" onPress={() => router.push("/test/flash")} /></> : <EmptyState title="Add questions first" detail="Import questions to create your mock tests and flash practice." action={<PrimaryButton label="Import Questions" icon="file-upload" onPress={() => router.push("/questions/import")} />} />}</View></StudyScreen>;
}
function ModeCard({ title, detail, icon, action, onPress }: { title: string; detail: string; icon: "edit-note" | "bolt"; action: string; onPress: () => void }) { return <Card style={styles.card}><View style={styles.icon}><Text style={styles.iconText}>{icon === "bolt" ? "⚡" : "✎"}</Text></View><Text style={styles.title}>{title}</Text><Text style={styles.detail}>{detail}</Text><View style={{ marginTop: 18 }}><PrimaryButton label={action} icon="arrow-forward" onPress={onPress} /></View></Card>; }
const styles = StyleSheet.create({ content: { padding: 20, gap: 12 }, card: { padding: 18 }, icon: { width: 44, height: 44, borderRadius: 14, backgroundColor: colors.softBlue, alignItems: "center", justifyContent: "center" }, iconText: { color: colors.blue, fontSize: 23, fontWeight: "800" }, title: { color: colors.ink, fontSize: 18, fontWeight: "800", marginTop: 14 }, detail: { color: colors.muted, fontSize: 14, lineHeight: 20, marginTop: 5 } });
