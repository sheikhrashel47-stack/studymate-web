import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { router, useLocalSearchParams } from "expo-router";
import { useMemo, useState } from "react";
import { FlatList, Pressable, StyleSheet, Text, TextInput, View } from "react-native";

import { AppHeader, Card, EmptyState, PrimaryButton, StudyScreen, colors } from "@/components/study/ui";
import { useStudy } from "@/lib/study/store";

export default function QuestionListScreen() {
  const { chapterId } = useLocalSearchParams<{ chapterId: string }>();
  const { getChapter, getQuestions } = useStudy();
  const chapter = getChapter(chapterId);
  const [query, setQuery] = useState("");
  const questions = getQuestions({ chapterId });
  const filtered = useMemo(() => {
    const needle = query.trim().toLocaleLowerCase();
    if (!needle) return questions;
    return questions.filter((question) => `${question.prompt} ${Object.values(question.options).join(" ")} ${question.explanation}`.toLocaleLowerCase().includes(needle));
  }, [questions, query]);
  if (!chapter) return <StudyScreen><AppHeader title="Questions" back={() => router.back()} /><EmptyState title="Chapter not found" detail="It may have been removed." /></StudyScreen>;
  return <StudyScreen><AppHeader title={chapter.name} subtitle={`${questions.length} questions`} back={() => router.back()} />
    <FlatList data={filtered} keyExtractor={(item) => item.id} contentContainerStyle={[styles.list, !questions.length && { flexGrow: 1 }]} keyboardShouldPersistTaps="handled" ListHeaderComponent={<View style={styles.searchWrap}><MaterialIcons name="search" size={20} color={colors.muted} /><TextInput value={query} onChangeText={setQuery} placeholder="Search questions, options, or explanation" placeholderTextColor="#8D9AAF" style={styles.search} returnKeyType="search" /></View>} ListEmptyComponent={questions.length ? <EmptyState icon="search-off" title="No matching questions" detail="Try another word or clear the search." /> : <EmptyState title="No questions yet" detail="Import questions into this chapter to start studying." action={<PrimaryButton label="Import Questions" icon="file-upload" onPress={() => router.push("/questions/import")} />} />} renderItem={({ item }) => <Pressable onPress={() => router.push({ pathname: "/questions/detail/[questionId]", params: { questionId: item.id } })} style={({ pressed }) => pressed && styles.pressed}><Card style={styles.questionCard}><View style={styles.cardTop}><Text style={styles.serial}>Q{item.serial}</Text><MaterialIcons name="chevron-right" size={21} color="#8D9AAF" /></View><Text numberOfLines={3} style={styles.question}>{item.prompt}</Text><Text numberOfLines={1} style={styles.meta}>{Object.keys(item.options).length} options · Answer saved · {item.explanation === "Explanation unavailable" ? "No explanation" : "Explanation included"}</Text></Card></Pressable>} />
  </StudyScreen>;
}

const styles = StyleSheet.create({ list: { padding: 20, paddingBottom: 34, gap: 9 }, searchWrap: { minHeight: 48, borderRadius: 13, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface, flexDirection: "row", alignItems: "center", paddingHorizontal: 12, gap: 8, marginBottom: 3 }, search: { flex: 1, color: colors.ink, fontSize: 14, height: 46 }, questionCard: { padding: 14 }, cardTop: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 5 }, serial: { color: colors.blue, fontSize: 12, fontWeight: "800" }, question: { color: colors.ink, fontSize: 15, lineHeight: 21, fontWeight: "800" }, meta: { color: colors.muted, fontSize: 12, marginTop: 8 }, pressed: { opacity: 0.68 } });
