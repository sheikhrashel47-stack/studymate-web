import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { router, useLocalSearchParams } from "expo-router";
import { useMemo, useState } from "react";
import { Alert, FlatList, Pressable, StyleSheet, Text, TextInput, View } from "react-native";

import { AppHeader, Card, EmptyState, IconBadge, PrimaryButton, StudyScreen, colors } from "@/components/study/ui";
import { useStudy } from "@/lib/study/store";

export default function SubjectChaptersScreen() {
  const { subjectId } = useLocalSearchParams<{ subjectId: string }>();
  const { data, getSubject, deleteSubject } = useStudy();
  const subject = getSubject(subjectId);
  const [query, setQuery] = useState("");
  const chapters = data.chapters.filter((chapter) => chapter.subjectId === subjectId);
  const visibleChapters = useMemo(() => { const needle = query.trim().toLocaleLowerCase(); return needle ? chapters.filter((chapter) => chapter.name.toLocaleLowerCase().includes(needle)) : chapters; }, [chapters, query]);
  const remove = () => Alert.alert(`Delete ${subject?.name ?? "subject"}?`, "All chapters and questions inside it will also be removed from this device.", [{ text: "Cancel", style: "cancel" }, { text: "Delete", style: "destructive", onPress: () => { deleteSubject(subjectId); router.back(); } }]);
  if (!subject) return <StudyScreen><AppHeader title="Subject" back={() => router.back()} /><EmptyState title="Subject not found" detail="It may have been removed." /></StudyScreen>;
  return <StudyScreen><AppHeader title={subject.name} subtitle={`${chapters.length} chapter${chapters.length === 1 ? "" : "s"} · local question bank`} back={() => router.back()} right={<Pressable accessibilityRole="button" accessibilityLabel="Delete subject" onPress={remove} style={({ pressed }) => [styles.deleteButton, pressed && styles.pressed]}><MaterialIcons name="delete-outline" size={21} color={colors.error} /></Pressable>} />
    {chapters.length ? <View style={styles.searchWrap}><MaterialIcons name="search" size={20} color={colors.muted} /><TextInput value={query} onChangeText={setQuery} placeholder="Search chapters" placeholderTextColor="#98A2B3" style={styles.search} /></View> : null}
    <FlatList data={visibleChapters} keyExtractor={(item) => item.id} contentContainerStyle={[styles.list, !visibleChapters.length && { flexGrow: 1 }]} showsVerticalScrollIndicator={false} ListEmptyComponent={chapters.length ? <EmptyState icon="search-off" title="No chapter found" detail="Try another chapter name or clear the search." action={<PrimaryButton label="Clear search" variant="secondary" onPress={() => setQuery("")} />} /> : <EmptyState icon="topic" title="No chapters yet" detail="Import questions or add a chapter to start building this subject." action={<PrimaryButton label="Import questions" icon="file-upload" onPress={() => router.push("/questions/import")} />} />} renderItem={({ item }) => { const count = data.questions.filter((question) => question.chapterId === item.id).length; return <Pressable accessibilityRole="button" accessibilityLabel={`Open ${item.name}`} onPress={() => router.push({ pathname: "/questions/question/[chapterId]", params: { chapterId: item.id } })} style={({ pressed }) => [pressed && styles.pressed]}><Card style={styles.chapterCard}><IconBadge icon="topic" color={colors.blue} background={colors.softBlue} size={46} /><View style={styles.chapterCopy}><Text style={styles.chapterName}>{item.name}</Text><Text style={styles.chapterMeta}>{count} question{count === 1 ? "" : "s"} · tap to browse</Text></View><View style={styles.chevron}><MaterialIcons name="chevron-right" size={23} color={colors.blue} /></View></Card></Pressable>; }} />
  </StudyScreen>;
}

const styles = StyleSheet.create({
  deleteButton: { width: 42, height: 42, borderRadius: 14, alignItems: "center", justifyContent: "center", backgroundColor: "#FFF1F1", borderWidth: 1, borderColor: "#FFD5D5" },
  pressed: { opacity: 0.7, transform: [{ scale: 0.98 }] },
  searchWrap: { marginHorizontal: 20, marginBottom: 10, minHeight: 48, flexDirection: "row", alignItems: "center", gap: 9, paddingHorizontal: 14, borderRadius: 15, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface },
  search: { flex: 1, color: colors.ink, fontSize: 15, paddingVertical: 10 },
  list: { paddingHorizontal: 20, paddingBottom: 34, gap: 10 },
  chapterCard: { flexDirection: "row", alignItems: "center", padding: 15 },
  chapterCopy: { flex: 1, marginLeft: 13 },
  chapterName: { color: colors.ink, fontSize: 17, fontWeight: "800" },
  chapterMeta: { color: colors.muted, fontSize: 12, marginTop: 4 },
  chevron: { width: 32, height: 32, borderRadius: 16, alignItems: "center", justifyContent: "center", backgroundColor: colors.softBlue },
});
