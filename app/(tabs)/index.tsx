import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { router } from "expo-router";
import { useEffect, useRef } from "react";
import { Alert, ScrollView, StyleSheet, Text, View } from "react-native";

import { AppHeader, Card, EmptyState, Metric, PrimaryButton, SectionTitle, StudyScreen, colors } from "@/components/study/ui";
import { calculateProgress } from "@/lib/study/analytics";
import { useStudy } from "@/lib/study/store";

function greeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
}

export default function HomeScreen() {
  const { data, isReady, storageError, discardActiveExam } = useStudy();
  const progress = calculateProgress(data);
  const recent = data.testHistory[0];
  const askedToResume = useRef<string | undefined>(undefined);
  useEffect(() => {
    if (data.activeExam && askedToResume.current !== data.activeExam.id) {
      askedToResume.current = data.activeExam.id;
      Alert.alert("Resume your test?", "Your answers, current question, and remaining time were saved on this device.", [{ text: "Exit Test", style: "destructive", onPress: discardActiveExam }, { text: "Resume", onPress: () => router.push("/test/exam") }]);
    }
  }, [data.activeExam, discardActiveExam]);
  if (!isReady) return <StudyScreen><AppHeader title="StudyMate" /><View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}><Text style={{ color: colors.muted }}>Preparing your study space…</Text></View></StudyScreen>;

  return <StudyScreen><AppHeader title={greeting()} subtitle="A focused space for today’s study." />
    <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      {storageError ? <View style={styles.notice}><MaterialIcons name="info-outline" size={18} color={colors.caution} /><Text style={styles.noticeText}>{storageError}</Text></View> : null}
      <Card style={styles.progressCard}><View style={styles.progressTop}><View><Text style={styles.eyebrow}>MY PROGRESS</Text><Text style={styles.progressTitle}>Keep moving forward</Text></View><View style={styles.accuracyBadge}><Text style={styles.accuracyValue}>{progress.accuracy}%</Text><Text style={styles.accuracyLabel}>accuracy</Text></View></View><View style={styles.metrics}><Metric value={progress.totalQuestions} label="Questions" /><Metric value={progress.attempted} label="Attempted" /><Metric value={progress.testsCompleted} label="Tests" /></View></Card>
      <SectionTitle>Quick actions</SectionTitle>
      <View style={styles.quickGrid}>
        <QuickAction icon="menu-book" label="Questions" detail="Browse & learn" onPress={() => router.push("/(tabs)/questions")} />
        <QuickAction icon="edit-note" label="Mock Test" detail="Practice calmly" onPress={() => router.push("/test/setup")} />
        <QuickAction icon="bolt" label="Flash Test" detail="Quick practice" onPress={() => router.push("/test/flash")} />
        <QuickAction icon="bar-chart" label="Progress" detail="See your growth" onPress={() => router.push("/(tabs)/progress")} />
      </View>
      <SectionTitle>Recent test</SectionTitle>
      {recent ? <Card><View style={styles.recentRow}><View style={styles.recentIcon}><MaterialIcons name="assignment-turned-in" size={21} color={colors.blue} /></View><View style={{ flex: 1 }}><Text style={styles.recentTitle}>{recent.mode === "mock" ? "Mock Test" : "Flash Test"}</Text><Text style={styles.recentMeta}>{recent.correctCount}/{recent.questionIds.length} correct · {new Date(recent.completedAt).toLocaleDateString()}</Text></View><Text style={styles.recentScore}>{Math.round((recent.correctCount / recent.questionIds.length) * 100)}%</Text></View></Card> : <Card><EmptyState icon="schedule" title="Your first test is waiting!" detail="Choose a practice mode when you have added questions." action={<PrimaryButton label="View questions" onPress={() => router.push("/(tabs)/questions")} icon="menu-book" />} /></Card>}
    </ScrollView>
  </StudyScreen>;
}

function QuickAction({ icon, label, detail, onPress }: { icon: keyof typeof MaterialIcons.glyphMap; label: string; detail: string; onPress: () => void }) { return <View style={styles.quickItem}><Card style={styles.quickCard}><View style={styles.quickIcon}><MaterialIcons name={icon} size={22} color={colors.blue} /></View><Text style={styles.quickLabel}>{label}</Text><Text style={styles.quickDetail}>{detail}</Text><View style={styles.quickButton}><PrimaryButton label="Open" onPress={onPress} /></View></Card></View>; }

const styles = StyleSheet.create({ content: { paddingHorizontal: 20, paddingBottom: 32, gap: 20 }, notice: { flexDirection: "row", gap: 8, borderRadius: 12, padding: 12, backgroundColor: "#FFF8E8" }, noticeText: { color: colors.caution, flex: 1, fontSize: 13, lineHeight: 18 }, progressCard: { borderColor: "#D5E4FF", backgroundColor: "#F5F9FF" }, progressTop: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" }, eyebrow: { color: colors.blue, fontSize: 11, fontWeight: "800", letterSpacing: 0.8 }, progressTitle: { color: colors.ink, fontSize: 18, fontWeight: "800", marginTop: 5 }, accuracyBadge: { paddingVertical: 7, paddingHorizontal: 10, alignItems: "center", backgroundColor: colors.surface, borderRadius: 12, borderColor: "#D5E4FF", borderWidth: 1 }, accuracyValue: { color: colors.blue, fontSize: 18, fontWeight: "800" }, accuracyLabel: { color: colors.muted, fontSize: 10, fontWeight: "700" }, metrics: { marginTop: 18, paddingTop: 14, borderTopColor: "#D8E6FA", borderTopWidth: 1, flexDirection: "row", gap: 8 }, quickGrid: { flexDirection: "row", flexWrap: "wrap", marginHorizontal: -5, rowGap: 10 }, quickItem: { width: "50%", paddingHorizontal: 5 }, quickCard: { minHeight: 168, padding: 14 }, quickIcon: { height: 40, width: 40, borderRadius: 13, alignItems: "center", justifyContent: "center", backgroundColor: colors.softBlue }, quickLabel: { color: colors.ink, fontSize: 15, fontWeight: "800", marginTop: 12 }, quickDetail: { color: colors.muted, fontSize: 12, marginTop: 3 }, quickButton: { marginTop: "auto", paddingTop: 12 }, recentRow: { flexDirection: "row", alignItems: "center", gap: 12 }, recentIcon: { width: 42, height: 42, alignItems: "center", justifyContent: "center", backgroundColor: colors.softBlue, borderRadius: 13 }, recentTitle: { color: colors.ink, fontSize: 15, fontWeight: "800" }, recentMeta: { color: colors.muted, fontSize: 12, marginTop: 3 }, recentScore: { color: colors.blue, fontSize: 19, fontWeight: "800" } });
