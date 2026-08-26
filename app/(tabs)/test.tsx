import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { router } from "expo-router";
import { StyleSheet, Text, View } from "react-native";

import { AppHeader, Card, EmptyState, IconBadge, PrimaryButton, StudyScreen, colors } from "@/components/study/ui";
import { useStudy } from "@/lib/study/store";

export default function TestTab() {
  const { data } = useStudy();
  const hasQuestions = Boolean(data.questions.length);
  return <StudyScreen>
    <AppHeader title="Test" subtitle="Choose a focused practice mode" />
    <View style={styles.content}>
      {hasQuestions ? <>
        <Card style={styles.introCard}><View style={styles.introIcon}><MaterialIcons name="track-changes" size={23} color={colors.coral} /></View><View style={styles.introCopy}><Text style={styles.introTitle}>Practice with purpose</Text><Text style={styles.introDetail}>Choose a real-exam session or a quick recall round.</Text></View></Card>
        <ModeCard title="Mock Test" detail="Set a timer, answer without hints, then review your result." icon="edit-note" tint={colors.blue} background={colors.softBlue} action="Set up mock test" onPress={() => router.push("/test/setup")} />
        <ModeCard title="Flash Test" detail="One question at a time with instant feedback and explanation." icon="bolt" tint={colors.coral} background={colors.softCoral} action="Start flash test" onPress={() => router.push("/test/flash-setup")} />
      </> : <EmptyState icon="library-add" title="Add questions first" detail="Import a few MCQs to unlock mock tests, flash practice and progress tracking." action={<PrimaryButton label="Import questions" icon="file-upload" onPress={() => router.push("/questions/import")} />} />}
    </View>
  </StudyScreen>;
}

function ModeCard({ title, detail, icon, tint, background, action, onPress }: { title: string; detail: string; icon: "edit-note" | "bolt"; tint: string; background: string; action: string; onPress: () => void }) {
  return <Card style={styles.modeCard}><View style={styles.modeHeader}><IconBadge icon={icon} color={tint} background={background} size={50} /><View style={styles.modeTag}><Text style={[styles.modeTagText, { color: tint }]}>FOCUSED MODE</Text></View></View><Text style={styles.modeTitle}>{title}</Text><Text style={styles.modeDetail}>{detail}</Text><View style={styles.modeAction}><PrimaryButton label={action} icon="arrow-forward" onPress={onPress} compact /></View></Card>;
}

const styles = StyleSheet.create({
  content: { paddingHorizontal: 18, paddingBottom: 28, gap: 9 },
  introCard: { flexDirection: "row", alignItems: "center", gap: 10, backgroundColor: "#FFF9F6", borderColor: "#FBE1D8", padding: 12, borderRadius: 17 },
  introIcon: { width: 42, height: 42, borderRadius: 14, alignItems: "center", justifyContent: "center", backgroundColor: colors.softCoral },
  introCopy: { flex: 1 },
  introTitle: { color: colors.ink, fontSize: 15, fontWeight: "800" },
  introDetail: { color: colors.muted, fontSize: 12, lineHeight: 17, marginTop: 3 },
  modeCard: { padding: 14, borderRadius: 18 },
  modeHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" },
  modeTag: { paddingHorizontal: 9, paddingVertical: 6, borderRadius: 99, backgroundColor: "#F7F8FB" },
  modeTagText: { fontSize: 9, fontWeight: "900", letterSpacing: 0.8 },
  modeTitle: { color: colors.ink, fontSize: 18, fontWeight: "800", marginTop: 11 },
  modeDetail: { color: colors.muted, fontSize: 13, lineHeight: 19, marginTop: 4 },
  modeAction: { marginTop: 12 },
});
