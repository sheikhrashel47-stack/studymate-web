import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { router } from "expo-router";
import { ScrollView, StyleSheet, Text, View } from "react-native";

import { AppHeader, Card, EmptyState, IconBadge, Metric, PrimaryButton, ProgressBar, SectionTitle, StudyScreen, colors } from "@/components/study/ui";
import { calculateProgress, chapterAccuracy, subjectAccuracy } from "@/lib/study/analytics";
import { useStudy } from "@/lib/study/store";

export default function ProgressTab() {
  const { data } = useStudy();
  const progress = calculateProgress(data);
  if (!data.attempts.length) return <StudyScreen><AppHeader title="Progress" subtitle="Your learning story, kept simple" /><EmptyState icon="bar-chart" title="Your progress starts here" detail="Take a first mock or flash test and StudyMate will show your accuracy, strengths and topics to revisit." action={<PrimaryButton label="Choose a test" icon="play-arrow" onPress={() => router.push("/(tabs)/test")} />} /></StudyScreen>;

  return <StudyScreen><AppHeader title="Progress" subtitle="See what is improving and what needs practice" /><ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
    <Card style={styles.summaryCard}><View style={styles.summaryHeader}><View><Text style={styles.overline}>OVERALL SNAPSHOT</Text><Text style={styles.summaryTitle}>{progress.accuracy >= 80 ? "You’re building a strong rhythm" : "Small practice adds up"}</Text></View><IconBadge icon="insights" color={colors.success} background={colors.softSuccess} size={46} /></View><View style={styles.accuracyRow}><View style={styles.accuracyCopy}><Text style={styles.bigAccuracy}>{progress.accuracy}%</Text><Text style={styles.accuracyLabel}>overall accuracy</Text></View><View style={styles.accuracyBar}><ProgressBar value={progress.accuracy} color={progress.accuracy >= 80 ? colors.success : colors.blue} /></View></View><View style={styles.metrics}><Metric value={progress.attempted} label="Attempted" /><Metric value={progress.correct} label="Correct" /><Metric value={progress.testsCompleted} label="Tests" /></View></Card>

    <SectionTitle>Subject performance</SectionTitle>
    <View style={styles.performanceList}>{data.subjects.map((subject) => <PerformanceRow key={subject.id} label={subject.name} value={subjectAccuracy(data, subject.id)} icon="auto-stories" />)}</View>

    <SectionTitle>Chapter performance</SectionTitle>
    <View style={styles.performanceList}>{data.chapters.map((chapter) => <PerformanceRow key={chapter.id} label={chapter.name} value={chapterAccuracy(data, chapter.id)} icon="menu-book" />)}</View>

    <SectionTitle>Test history</SectionTitle>
    {data.testHistory.length ? data.testHistory.slice(0, 8).map((test) => { const accuracy = test.questionIds.length ? Math.round((test.correctCount / test.questionIds.length) * 100) : 0; return <Card key={test.id} style={styles.history}><View style={styles.historyIcon}><MaterialIcons name={test.mode === "mock" ? "assignment" : "bolt"} size={20} color={test.mode === "mock" ? colors.blue : colors.coral} /></View><View style={styles.historyCopy}><Text style={styles.historyTitle}>{test.mode === "mock" ? "Mock Test" : "Flash Test"}</Text><Text style={styles.historyDate}>{new Date(test.completedAt).toLocaleDateString()} · {test.correctCount}/{test.questionIds.length} correct</Text></View><View style={styles.historyScore}><Text style={[styles.score, { color: accuracy >= 80 ? colors.success : colors.blue }]}>{accuracy}%</Text><Text style={styles.scoreLabel}>accuracy</Text></View></Card>; }) : <Card><Text style={styles.emptyHistory}>Your completed tests will appear here.</Text></Card>}
  </ScrollView></StudyScreen>;
}

function PerformanceRow({ label, value, icon }: { label: string; value?: number; icon: "auto-stories" | "menu-book" }) {
  const state = value === undefined ? { label: "Not attempted", color: colors.muted } : value >= 80 ? { label: "Strong", color: colors.success } : value >= 60 ? { label: "Keep practising", color: colors.caution } : { label: "Needs practice", color: colors.error };
  return <Card style={styles.performance}><View style={styles.performanceTop}><View style={styles.performanceName}><IconBadge icon={icon} color={state.color} background={value === undefined ? "#F1F3F6" : value >= 80 ? colors.softSuccess : value >= 60 ? "#FFF5D8" : "#FFF0F0"} size={34} /><Text style={styles.performanceLabel}>{label}</Text></View><Text style={[styles.performanceValue, { color: state.color }]}>{value === undefined ? "—" : `${value}%`}</Text></View><ProgressBar value={value ?? 0} color={state.color} /><Text style={[styles.state, { color: state.color }]}>{state.label}</Text></Card>;
}

const styles = StyleSheet.create({
  content: { paddingHorizontal: 20, paddingBottom: 34, gap: 12 },
  summaryCard: { padding: 18, backgroundColor: colors.surface },
  summaryHeader: { flexDirection: "row", alignItems: "flex-start", justifyContent: "space-between", gap: 12 },
  overline: { color: colors.blue, fontSize: 10, fontWeight: "900", letterSpacing: 1.1 },
  summaryTitle: { color: colors.ink, fontSize: 18, lineHeight: 24, fontWeight: "800", marginTop: 5 },
  accuracyRow: { flexDirection: "row", alignItems: "center", gap: 15, marginTop: 20 },
  accuracyCopy: { width: 85 },
  bigAccuracy: { color: colors.ink, fontSize: 30, fontWeight: "800", letterSpacing: -0.7 },
  accuracyLabel: { color: colors.muted, fontSize: 11, lineHeight: 15, marginTop: 1 },
  accuracyBar: { flex: 1 },
  metrics: { marginTop: 19, paddingTop: 15, borderTopColor: colors.border, borderTopWidth: 1, flexDirection: "row", gap: 8 },
  performanceList: { gap: 9 },
  performance: { padding: 14 },
  performanceTop: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", gap: 12 },
  performanceName: { flexDirection: "row", alignItems: "center", gap: 10, flex: 1 },
  performanceLabel: { color: colors.ink, flex: 1, fontSize: 15, fontWeight: "800" },
  performanceValue: { fontSize: 15, fontWeight: "800" },
  state: { fontSize: 11, fontWeight: "800", marginTop: 7 },
  history: { flexDirection: "row", alignItems: "center", gap: 11, padding: 14 },
  historyIcon: { width: 40, height: 40, borderRadius: 13, alignItems: "center", justifyContent: "center", backgroundColor: colors.softBlue },
  historyCopy: { flex: 1 },
  historyTitle: { color: colors.ink, fontSize: 15, fontWeight: "800" },
  historyDate: { color: colors.muted, fontSize: 12, marginTop: 4 },
  historyScore: { alignItems: "flex-end" },
  score: { fontSize: 18, fontWeight: "800" },
  scoreLabel: { color: colors.muted, fontSize: 10, marginTop: 2 },
  emptyHistory: { color: colors.muted, textAlign: "center", fontSize: 13 },
});
