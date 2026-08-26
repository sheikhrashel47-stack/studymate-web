import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { router } from "expo-router";
import { useEffect, useRef } from "react";
import { Alert, ScrollView, StyleSheet, Text, View } from "react-native";

import { AppHeader, Card, EmptyState, IconBadge, Metric, PrimaryButton, ProgressBar, SectionTitle, StudyScreen, colors } from "@/components/study/ui";
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
  const hasQuestions = data.questions.length > 0;

  useEffect(() => {
    if (data.activeExam && askedToResume.current !== data.activeExam.id) {
      askedToResume.current = data.activeExam.id;
      Alert.alert("Resume your test?", "Your answers, current question, and remaining time were saved on this device.", [{ text: "Exit Test", style: "destructive", onPress: discardActiveExam }, { text: "Resume", onPress: () => router.push("/test/exam") }]);
    }
  }, [data.activeExam, discardActiveExam]);

  if (!isReady) return <StudyScreen><AppHeader title="StudyMate" /><View style={styles.loading}><Text style={styles.loadingText}>Preparing your study space…</Text></View></StudyScreen>;

  return <StudyScreen>
    <AppHeader title={greeting()} subtitle="A quiet place to learn, practice and grow." />
    <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      {storageError ? <View style={styles.notice}><MaterialIcons name="info-outline" size={18} color={colors.caution} /><Text style={styles.noticeText}>{storageError}</Text></View> : null}

      <Card style={styles.welcomeCard}>
        <View style={styles.welcomeTop}>
          <View style={styles.welcomeCopy}>
            <Text style={styles.eyebrow}>TODAY’S STUDY SPACE</Text>
            <Text style={styles.welcomeTitle}>{hasQuestions ? "Ready for one focused session?" : "Let’s build your question bank."}</Text>
            <Text style={styles.welcomeDetail}>{hasQuestions ? "Start with a few questions and keep your momentum gentle." : "Import MCQs once, then practise them offline anytime."}</Text>
          </View>
          <IconBadge icon={hasQuestions ? "auto-stories" : "add-circle-outline"} size={54} color={colors.coral} background={colors.softCoral} />
        </View>
        <View style={styles.welcomeAction}>
          <PrimaryButton label={hasQuestions ? "Start practice" : "Import questions"} icon={hasQuestions ? "play-arrow" : "file-upload"} onPress={() => router.push(hasQuestions ? "/(tabs)/test" : "/questions/import")} />
        </View>
      </Card>

      <Card style={styles.progressCard}>
        <View style={styles.progressHeader}><View><Text style={styles.eyebrow}>YOUR PROGRESS</Text><Text style={styles.progressTitle}>{progress.attempted ? "Keep your rhythm going" : "Your first step starts here"}</Text></View><View style={styles.accuracyBadge}><Text style={styles.accuracyValue}>{progress.accuracy}%</Text><Text style={styles.accuracyLabel}>accuracy</Text></View></View>
        <ProgressBar value={progress.accuracy} color={progress.accuracy >= 80 ? colors.success : colors.blue} />
        <View style={styles.metrics}><Metric value={progress.totalQuestions} label="Questions" /><Metric value={progress.attempted} label="Attempted" /><Metric value={progress.correct} label="Correct" /><Metric value={progress.testsCompleted} label="Tests" /></View>
      </Card>

      <SectionTitle>Quick practice</SectionTitle>
      <View style={styles.quickGrid}>
        <QuickAction icon="menu-book" tint={colors.blue} background={colors.softBlue} label="Questions" detail="Browse and learn" onPress={() => router.push("/(tabs)/questions")} />
        <QuickAction icon="edit-note" tint={colors.coral} background={colors.softCoral} label="Mock Test" detail="Practise like an exam" onPress={() => router.push("/test/setup")} />
        <QuickAction icon="bolt" tint="#A56B00" background="#FFF5D8" label="Flash Test" detail="Quick recall practice" onPress={() => router.push("/test/flash-setup")} />
        <QuickAction icon="bar-chart" tint={colors.success} background={colors.softSuccess} label="Progress" detail="See your growth" onPress={() => router.push("/(tabs)/progress")} />
      </View>

      <SectionTitle>Recent test</SectionTitle>
      {recent ? <Card style={styles.recentCard}><View style={styles.recentIcon}><MaterialIcons name="assignment-turned-in" size={23} color={colors.success} /></View><View style={styles.recentCopy}><Text style={styles.recentTitle}>{recent.mode === "mock" ? "Mock Test" : "Flash Test"}</Text><Text style={styles.recentMeta}>{recent.correctCount}/{recent.questionIds.length} correct · {new Date(recent.completedAt).toLocaleDateString()}</Text></View><View style={styles.recentScore}><Text style={styles.score}>{Math.round((recent.correctCount / recent.questionIds.length) * 100)}%</Text><Text style={styles.scoreLabel}>accuracy</Text></View></Card> : <Card><EmptyState icon="event-note" title="Your first test is waiting" detail={hasQuestions ? "Choose a practice mode and your result will appear here." : "Add a few questions first, then your learning story will begin."} action={<PrimaryButton label={hasQuestions ? "Choose practice" : "View questions"} icon={hasQuestions ? "play-arrow" : "menu-book"} onPress={() => router.push(hasQuestions ? "/(tabs)/test" : "/(tabs)/questions")} />} /></Card>}
    </ScrollView>
  </StudyScreen>;
}

function QuickAction({ icon, tint, background, label, detail, onPress }: { icon: keyof typeof MaterialIcons.glyphMap; tint: string; background: string; label: string; detail: string; onPress: () => void }) {
  return <Card style={styles.quickCard}><View style={styles.quickTop}><IconBadge icon={icon} color={tint} background={background} size={44} /><MaterialIcons name="arrow-forward" size={18} color={colors.muted} /></View><Text style={styles.quickLabel}>{label}</Text><Text style={styles.quickDetail}>{detail}</Text><View style={styles.quickButton}><PrimaryButton label="Open" onPress={onPress} /></View></Card>;
}

const styles = StyleSheet.create({
  content: { paddingHorizontal: 20, paddingBottom: 34, gap: 18 },
  loading: { flex: 1, justifyContent: "center", alignItems: "center" },
  loadingText: { color: colors.muted, fontSize: 14 },
  notice: { flexDirection: "row", gap: 8, borderRadius: 14, padding: 13, backgroundColor: "#FFF8E8" },
  noticeText: { color: colors.caution, flex: 1, fontSize: 13, lineHeight: 18 },
  welcomeCard: { backgroundColor: colors.blueDark, borderColor: colors.blueDark, padding: 19, shadowColor: colors.blueDark, shadowOpacity: 0.16, shadowRadius: 18, elevation: 3 },
  welcomeTop: { flexDirection: "row", gap: 14, alignItems: "flex-start" },
  welcomeCopy: { flex: 1 },
  eyebrow: { color: colors.blue, fontSize: 10, fontWeight: "900", letterSpacing: 1.1 },
  welcomeTitle: { color: "#FFFFFF", fontSize: 21, lineHeight: 27, fontWeight: "800", marginTop: 7, letterSpacing: -0.2 },
  welcomeDetail: { color: "#DDE6FF", fontSize: 13, lineHeight: 19, marginTop: 7 },
  welcomeAction: { marginTop: 18 },
  progressCard: { backgroundColor: colors.surface },
  progressHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", gap: 12 },
  progressTitle: { color: colors.ink, fontSize: 17, fontWeight: "800", marginTop: 5 },
  accuracyBadge: { paddingVertical: 7, paddingHorizontal: 11, alignItems: "center", backgroundColor: colors.softBlue, borderRadius: 13 },
  accuracyValue: { color: colors.blue, fontSize: 19, fontWeight: "800" },
  accuracyLabel: { color: colors.muted, fontSize: 10, fontWeight: "700", marginTop: 1 },
  metrics: { marginTop: 18, paddingTop: 15, borderTopColor: colors.border, borderTopWidth: 1, flexDirection: "row", gap: 8 },
  quickGrid: { flexDirection: "row", flexWrap: "wrap", marginHorizontal: -5, rowGap: 10 },
  quickCard: { width: "50%", minHeight: 160, padding: 14, marginHorizontal: 5, flexBasis: "46%" },
  quickTop: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  quickLabel: { color: colors.ink, fontSize: 15, fontWeight: "800", marginTop: 13 },
  quickDetail: { color: colors.muted, fontSize: 12, marginTop: 4, lineHeight: 17 },
  quickButton: { marginTop: "auto", paddingTop: 13 },
  recentCard: { flexDirection: "row", alignItems: "center", gap: 12 },
  recentIcon: { width: 44, height: 44, alignItems: "center", justifyContent: "center", backgroundColor: colors.softSuccess, borderRadius: 14 },
  recentCopy: { flex: 1 },
  recentTitle: { color: colors.ink, fontSize: 15, fontWeight: "800" },
  recentMeta: { color: colors.muted, fontSize: 12, marginTop: 4 },
  recentScore: { alignItems: "flex-end" },
  score: { color: colors.success, fontSize: 19, fontWeight: "800" },
  scoreLabel: { color: colors.muted, fontSize: 10, marginTop: 2 },
});
