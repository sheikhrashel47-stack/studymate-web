import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { router } from "expo-router";
import { useMemo, useState } from "react";
import { FlatList, Pressable, StyleSheet, Text, TextInput, View } from "react-native";

import { AppHeader, Card, EmptyState, IconBadge, PrimaryButton, StudyScreen, colors } from "@/components/study/ui";
import { useStudy } from "@/lib/study/store";

export default function QuestionsTab() {
  const { data, isReady } = useStudy();
  const [query, setQuery] = useState("");
  const visibleSubjects = useMemo(() => {
    const normalizedQuery = query.trim().toLocaleLowerCase();
    if (!normalizedQuery) return data.subjects;
    return data.subjects.filter((subject) => {
      const chapters = data.chapters.filter((chapter) => chapter.subjectId === subject.id);
      return [subject.name, ...chapters.map((chapter) => chapter.name)].join(" ").toLocaleLowerCase().includes(normalizedQuery);
    });
  }, [data.chapters, data.subjects, query]);

  if (!isReady) return <StudyScreen><AppHeader title="Questions" /><View style={styles.center}><Text style={styles.loading}>Opening question bank…</Text></View></StudyScreen>;

  return <StudyScreen>
    <AppHeader title="Questions" subtitle={data.questions.length ? `${data.questions.length} saved questions · offline` : "Your offline question bank"} right={<View style={styles.headerActions}><Pressable accessibilityRole="button" accessibilityLabel="Manage subjects and chapters" onPress={() => router.push("/questions/manage")} style={({ pressed }) => [styles.headerAction, pressed && styles.pressed]}><MaterialIcons name="tune" size={20} color={colors.blue} /><Text style={styles.headerActionLabel}>Manage</Text></Pressable><Pressable accessibilityRole="button" accessibilityLabel="Import questions" onPress={() => router.push("/questions/import")} style={({ pressed }) => [styles.importAction, pressed && styles.pressed]}><MaterialIcons name="add" size={23} color="#FFFFFF" /></Pressable></View>} />
    {data.subjects.length ? <View style={styles.searchWrap}><MaterialIcons name="search" size={21} color={colors.muted} /><TextInput value={query} onChangeText={setQuery} placeholder="Search subjects or chapters" placeholderTextColor="#98A2B3" style={styles.searchInput} returnKeyType="search" /></View> : null}
    <FlatList data={visibleSubjects} keyExtractor={(item) => item.id} contentContainerStyle={[styles.list, !visibleSubjects.length && { flexGrow: 1 }]} showsVerticalScrollIndicator={false} ListEmptyComponent={data.subjects.length ? <EmptyState icon="search-off" title="No match found" detail="Try a different subject or chapter name." action={<PrimaryButton label="Clear search" variant="secondary" onPress={() => setQuery("")} />} /> : <EmptyState icon="menu-book" title="No questions yet" detail="Import your first MCQs, choose a subject and chapter, then practise offline whenever you want." action={<PrimaryButton label="Import questions" icon="file-upload" onPress={() => router.push("/questions/import")} />} />} renderItem={({ item }) => {
      const chapters = data.chapters.filter((chapter) => chapter.subjectId === item.id);
      const count = data.questions.filter((question) => question.subjectId === item.id).length;
      return <Pressable accessibilityRole="button" accessibilityLabel={`Open ${item.name}`} onPress={() => router.push({ pathname: "/questions/[subjectId]", params: { subjectId: item.id } })} style={({ pressed }) => [pressed && styles.pressed]}><Card style={styles.subjectCard}><IconBadge icon="auto-stories" color={colors.blue} background={colors.softBlue} size={46} /><View style={styles.subjectCopy}><Text style={styles.subjectName}>{item.name}</Text><Text style={styles.subjectMeta}>{chapters.length} chapter{chapters.length === 1 ? "" : "s"} · {count} question{count === 1 ? "" : "s"}</Text></View><View style={styles.chevron}><MaterialIcons name="chevron-right" size={23} color={colors.blue} /></View></Card></Pressable>;
    }} ListFooterComponent={data.subjects.length ? <View style={styles.footer}><PrimaryButton label="Import more questions" icon="file-upload" variant="secondary" onPress={() => router.push("/questions/import")} /></View> : null} />
  </StudyScreen>;
}

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  loading: { color: colors.muted, fontSize: 14 },
  headerActions: { flexDirection: "row", gap: 8, alignItems: "center" },
  headerAction: { minHeight: 42, paddingHorizontal: 9, borderRadius: 14, flexDirection: "row", alignItems: "center", gap: 5, borderWidth: 1, borderColor: "#CEDBFF", backgroundColor: colors.softBlue },
  headerActionLabel: { color: colors.blue, fontSize: 11, fontWeight: "800" },
  importAction: { width: 42, height: 42, borderRadius: 14, alignItems: "center", justifyContent: "center", backgroundColor: colors.blue },
  pressed: { opacity: 0.7, transform: [{ scale: 0.98 }] },
  searchWrap: { marginHorizontal: 20, marginBottom: 10, minHeight: 48, flexDirection: "row", alignItems: "center", gap: 9, paddingHorizontal: 14, borderRadius: 15, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface },
  searchInput: { flex: 1, color: colors.ink, fontSize: 15, paddingVertical: 10 },
  list: { paddingHorizontal: 20, paddingBottom: 30, gap: 10 },
  subjectCard: { flexDirection: "row", alignItems: "center", padding: 15 },
  subjectCopy: { flex: 1, marginLeft: 13 },
  subjectName: { color: colors.ink, fontSize: 17, fontWeight: "800" },
  subjectMeta: { color: colors.muted, marginTop: 4, fontSize: 12 },
  chevron: { width: 32, height: 32, borderRadius: 16, alignItems: "center", justifyContent: "center", backgroundColor: colors.softBlue },
  footer: { paddingTop: 4 },
});
