import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { router, useLocalSearchParams } from "expo-router";
import { Alert, FlatList, Pressable, StyleSheet, Text, View } from "react-native";

import { AppHeader, Card, EmptyState, PrimaryButton, StudyScreen, colors } from "@/components/study/ui";
import { useStudy } from "@/lib/study/store";

export default function SubjectChaptersScreen() {
  const { subjectId } = useLocalSearchParams<{ subjectId: string }>();
  const { data, getSubject, deleteSubject } = useStudy();
  const subject = getSubject(subjectId);
  const chapters = data.chapters.filter((chapter) => chapter.subjectId === subjectId);
  const remove = () => Alert.alert("Delete subject?", "Its chapters and questions will be removed from this device. This cannot be undone.", [{ text: "Cancel", style: "cancel" }, { text: "Delete", style: "destructive", onPress: () => { deleteSubject(subjectId); router.back(); } }]);
  if (!subject) return <StudyScreen><AppHeader title="Subject" back={() => router.back()} /><EmptyState title="Subject not found" detail="It may have been removed." /></StudyScreen>;
  return <StudyScreen><AppHeader title={subject.name} subtitle={`${chapters.length} chapter${chapters.length === 1 ? "" : "s"}`} back={() => router.back()} right={<Pressable accessibilityRole="button" accessibilityLabel="Delete subject" onPress={remove} style={({ pressed }) => [styles.deleteButton, pressed && styles.pressed]}><MaterialIcons name="delete-outline" size={21} color={colors.error} /></Pressable>} />
    <FlatList data={chapters} keyExtractor={(item) => item.id} contentContainerStyle={[styles.list, !chapters.length && { flexGrow: 1 }]} ListEmptyComponent={<EmptyState title="No chapters yet" detail="Import questions to create a chapter here." action={<PrimaryButton label="Import Questions" icon="file-upload" onPress={() => router.push("/questions/import")} />} />} renderItem={({ item }) => { const count = data.questions.filter((question) => question.chapterId === item.id).length; return <Pressable onPress={() => router.push({ pathname: "/questions/question/[chapterId]", params: { chapterId: item.id } })} style={({ pressed }) => pressed && styles.pressed}><Card style={styles.chapterCard}><View style={styles.chapterIcon}><MaterialIcons name="topic" size={21} color={colors.blue} /></View><View style={{ flex: 1 }}><Text style={styles.chapterName}>{item.name}</Text><Text style={styles.chapterMeta}>{count} question{count === 1 ? "" : "s"}</Text></View><MaterialIcons name="chevron-right" size={24} color="#8D9AAF" /></Card></Pressable>; }} />
  </StudyScreen>;
}

const styles = StyleSheet.create({ list: { padding: 20, gap: 10, paddingBottom: 32 }, deleteButton: { width: 42, height: 42, borderRadius: 14, alignItems: "center", justifyContent: "center", backgroundColor: "#FFF1F1", borderWidth: 1, borderColor: "#FFD5D5" }, pressed: { opacity: 0.7 }, chapterCard: { flexDirection: "row", alignItems: "center", gap: 12, padding: 14 }, chapterIcon: { width: 42, height: 42, borderRadius: 13, backgroundColor: colors.softBlue, alignItems: "center", justifyContent: "center" }, chapterName: { color: colors.ink, fontSize: 16, fontWeight: "800" }, chapterMeta: { color: colors.muted, fontSize: 12, marginTop: 3 } });
