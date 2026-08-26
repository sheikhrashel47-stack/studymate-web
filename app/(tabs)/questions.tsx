import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { router } from "expo-router";
import { useMemo, useState } from "react";
import { FlatList, Pressable, StyleSheet, Text, TextInput, View } from "react-native";

import { AppHeader, Card, EmptyState, IconBadge, PrimaryButton, StudyScreen, colors } from "@/components/study/ui";
import { useStudy } from "@/lib/study/store";

const initials = (name: string) => name.trim().split(/\s+/).slice(0, 2).map((part) => part[0]).join("").toLocaleUpperCase() || "QB";

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

  if (!isReady) return <StudyScreen><AppHeader title="Question Bank" subtitle="Loading your local bank" /><View style={styles.center}><Text style={styles.loading}>Opening question bank…</Text></View></StudyScreen>;

  return <StudyScreen>
    <AppHeader title="Question Bank" subtitle={data.questions.length ? "সব Subject" : "Your offline question bank"} right={<View style={styles.headerActions}><Pressable accessibilityRole="button" accessibilityLabel="Search question bank" onPress={() => setQuery((value) => value ? "" : " ")} style={({ pressed }) => [styles.headerIcon, pressed && styles.pressed]}><MaterialIcons name="search" size={22} color={colors.ink} /></Pressable><Pressable accessibilityRole="button" accessibilityLabel="Manage question bank" onPress={() => router.push("/questions/manage")} style={({ pressed }) => [styles.headerIcon, pressed && styles.pressed]}><MaterialIcons name="settings" size={21} color={colors.ink} /></Pressable></View>} />
    {data.subjects.length ? <View style={styles.searchWrap}><MaterialIcons name="search" size={20} color={colors.muted} /><TextInput value={query.trim()} onChangeText={setQuery} placeholder="Search subjects or chapters" placeholderTextColor="#98A2B3" style={styles.searchInput} returnKeyType="search" /></View> : null}
    <FlatList data={visibleSubjects} numColumns={2} keyExtractor={(item) => item.id} contentContainerStyle={[styles.list, !visibleSubjects.length && { flexGrow: 1 }]} columnWrapperStyle={styles.columns} showsVerticalScrollIndicator={false} ListHeaderComponent={data.subjects.length ? <Text style={styles.sectionLabel}>QUESTION BANK</Text> : null} ListEmptyComponent={data.subjects.length ? <EmptyState icon="search-off" title="No match found" detail="Try a different subject or chapter name." action={<PrimaryButton label="Clear search" variant="secondary" onPress={() => setQuery("")} />} /> : <EmptyState icon="menu-book" title="No questions yet" detail="Import your first MCQs, choose a subject and chapter, then practise offline." action={<PrimaryButton label="Import questions" icon="file-upload" onPress={() => router.push("/questions/import")} />} />} renderItem={({ item, index }) => {
      const chapters = data.chapters.filter((chapter) => chapter.subjectId === item.id);
      const count = data.questions.filter((question) => question.subjectId === item.id).length;
      const tone = index % 3 === 0 ? { color: colors.blue, background: colors.softBlue } : index % 3 === 1 ? { color: "#7B4ED6", background: "#F0EAFE" } : { color: colors.success, background: "#E8F5EE" };
      return <Pressable accessibilityRole="button" accessibilityLabel={`Open ${item.name}`} onPress={() => router.push({ pathname: "/questions/[subjectId]", params: { subjectId: item.id } })} style={({ pressed }) => [styles.cell, pressed && styles.pressed]}><Card style={styles.subjectCard}><View style={styles.subjectTop}><IconBadge icon="auto-stories" color={tone.color} background={tone.background} size={44} /><View style={styles.chevron}><MaterialIcons name="chevron-right" size={21} color={colors.muted} /></View></View><Text numberOfLines={1} style={styles.subjectName}>{item.name}</Text><Text style={styles.subjectMeta}>{chapters.length} topic{chapters.length === 1 ? "" : "s"} · {count} Q</Text></Card></Pressable>;
    }} ListFooterComponent={data.subjects.length ? <View style={styles.footer}><PrimaryButton label="Import more questions" icon="file-upload" variant="secondary" onPress={() => router.push("/questions/import")} /></View> : null} />
  </StudyScreen>;
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
  loading: { color: colors.muted, fontSize: 14 },
  headerActions: { flexDirection: "row", gap: 7 },
  headerIcon: { width: 42, height: 42, borderRadius: 14, alignItems: "center", justifyContent: "center", backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border },
  pressed: { opacity: 0.7, transform: [{ scale: 0.98 }] },
  searchWrap: { marginHorizontal: 20, marginBottom: 9, minHeight: 48, flexDirection: "row", alignItems: "center", gap: 9, paddingHorizontal: 14, borderRadius: 15, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface },
  searchInput: { flex: 1, color: colors.ink, fontSize: 15, paddingVertical: 10 },
  list: { paddingHorizontal: 20, paddingBottom: 30, gap: 10 },
  columns: { gap: 10 },
  sectionLabel: { color: colors.muted, fontSize: 11, fontWeight: "900", letterSpacing: 1.2, marginBottom: 1 },
  cell: { flex: 1, minWidth: 0 },
  subjectCard: { minHeight: 132, padding: 14, justifyContent: "space-between" },
  subjectTop: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  chevron: { width: 28, height: 28, alignItems: "center", justifyContent: "center" },
  subjectName: { color: colors.ink, fontSize: 17, fontWeight: "800", marginTop: 10 },
  subjectMeta: { color: colors.muted, fontSize: 12, marginTop: 4 },
  footer: { paddingTop: 3, paddingBottom: 7 },
});
