import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { router } from "expo-router";
import { FlatList, Pressable, StyleSheet, Text, View } from "react-native";

import { AppHeader, Card, EmptyState, PrimaryButton, StudyScreen, colors } from "@/components/study/ui";
import { useStudy } from "@/lib/study/store";

export default function QuestionsTab() {
  const { data, isReady } = useStudy();
  if (!isReady) return <StudyScreen><AppHeader title="Questions" /><View style={styles.center}><Text style={styles.loading}>Opening question bank…</Text></View></StudyScreen>;
  return <StudyScreen><AppHeader title="Questions" subtitle={data.questions.length ? `${data.questions.length} saved questions` : "Your offline question bank"} right={<View style={styles.headerActions}><Pressable accessibilityRole="button" accessibilityLabel="Manage subjects and chapters" onPress={() => router.push("/questions/manage")} style={({ pressed }) => [styles.manageButton, pressed && styles.pressed]}><MaterialIcons name="tune" size={20} color={colors.blue} /></Pressable><Pressable accessibilityRole="button" accessibilityLabel="Import questions" onPress={() => router.push("/questions/import")} style={({ pressed }) => [styles.addButton, pressed && styles.pressed]}><MaterialIcons name="add" size={23} color="#FFFFFF" /></Pressable></View>} />
    <FlatList data={data.subjects} keyExtractor={(item) => item.id} contentContainerStyle={[styles.list, !data.subjects.length && { flexGrow: 1 }]} showsVerticalScrollIndicator={false}
      ListEmptyComponent={<EmptyState title="No questions yet" detail="Import your first questions to get started." action={<PrimaryButton label="Import Questions" icon="file-upload" onPress={() => router.push("/questions/import")} />} />}
      renderItem={({ item }) => {
        const chapters = data.chapters.filter((chapter) => chapter.subjectId === item.id);
        const count = data.questions.filter((question) => question.subjectId === item.id).length;
        return <Pressable onPress={() => router.push({ pathname: "/questions/[subjectId]", params: { subjectId: item.id } })} style={({ pressed }) => pressed && styles.pressed}><Card style={styles.subjectCard}><View style={styles.subjectIcon}><MaterialIcons name="auto-stories" size={22} color={colors.blue} /></View><View style={styles.subjectCopy}><Text style={styles.subjectName}>{item.name}</Text><Text style={styles.subjectMeta}>{chapters.length} chapter{chapters.length === 1 ? "" : "s"} · {count} question{count === 1 ? "" : "s"}</Text></View><MaterialIcons name="chevron-right" size={24} color="#8D9AAF" /></Card></Pressable>;
      }}
      ListFooterComponent={data.subjects.length ? <View style={styles.footer}><PrimaryButton label="Import more questions" icon="file-upload" variant="secondary" onPress={() => router.push("/questions/import")} /></View> : null}
    />
  </StudyScreen>;
}

const styles = StyleSheet.create({ center: { flex: 1, justifyContent: "center", alignItems: "center" }, loading: { color: colors.muted, fontSize: 14 }, list: { padding: 20, gap: 10, paddingBottom: 32 }, headerActions: { flexDirection: "row", gap: 8 }, addButton: { width: 42, height: 42, borderRadius: 14, alignItems: "center", justifyContent: "center", backgroundColor: colors.blue }, manageButton: { width: 42, height: 42, borderRadius: 14, alignItems: "center", justifyContent: "center", borderWidth: 1, borderColor: "#C9DBFF", backgroundColor: colors.softBlue }, pressed: { opacity: 0.7 }, subjectCard: { flexDirection: "row", alignItems: "center", padding: 14 }, subjectIcon: { width: 42, height: 42, borderRadius: 13, backgroundColor: colors.softBlue, alignItems: "center", justifyContent: "center" }, subjectCopy: { flex: 1, marginLeft: 12 }, subjectName: { color: colors.ink, fontSize: 16, fontWeight: "800" }, subjectMeta: { color: colors.muted, marginTop: 3, fontSize: 12 }, footer: { paddingTop: 6 } });
