import { router } from "expo-router";
import { useMemo, useState } from "react";
import { Alert, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";

import { AppHeader, Card, PrimaryButton, SectionTitle, StudyScreen, colors } from "@/components/study/ui";
import { useStudy } from "@/lib/study/store";

const QUESTION_COUNTS = [10, 20, 30, 50];
const TIMERS = [{ label: "No limit", seconds: undefined }, { label: "10 min", seconds: 600 }, { label: "20 min", seconds: 1200 }, { label: "30 min", seconds: 1800 }];

export default function MockSetupScreen() {
  const { data, startMockExam } = useStudy();
  const [subjectId, setSubjectId] = useState<string>();
  const [chapterId, setChapterId] = useState<string>();
  const [count, setCount] = useState(10);
  const [customCount, setCustomCount] = useState("");
  const [durationSeconds, setDurationSeconds] = useState<number | undefined>(undefined);
  const [customMinutes, setCustomMinutes] = useState("");
  const chapters = useMemo(() => data.chapters.filter((chapter) => !subjectId || chapter.subjectId === subjectId), [data.chapters, subjectId]);
  const available = data.questions.filter((question) => (!subjectId || question.subjectId === subjectId) && (!chapterId || question.chapterId === chapterId));
  const effectiveCount = customCount.trim() ? Math.max(1, Number(customCount) || 1) : count;
  const effectiveDuration = customMinutes.trim() ? Math.max(60, (Number(customMinutes) || 1) * 60) : durationSeconds;
  const begin = () => {
    if (!available.length) { Alert.alert("No matching questions", "Import questions or choose a subject and chapter that have questions."); return; }
    const exam = startMockExam({ subjectId, chapterId, questionCount: effectiveCount, durationSeconds: effectiveDuration });
    if (!exam) { Alert.alert("Could not start test", "Please try again after checking your questions."); return; }
    router.replace("/test/exam");
  };
  return <StudyScreen><AppHeader title="Mock Test" subtitle="Choose a calm, focused practice session" back={() => router.back()} />
    <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <SectionTitle>1. Choose questions</SectionTitle>
      <SelectionCard title="Subject" items={[{ id: "all", label: "All subjects" }, ...data.subjects.map((subject) => ({ id: subject.id, label: subject.name }))]} selectedId={subjectId ?? "all"} onSelect={(id) => { setSubjectId(id === "all" ? undefined : id); setChapterId(undefined); }} />
      <SelectionCard title="Chapter" items={[{ id: "all", label: "All chapters" }, ...chapters.map((chapter) => ({ id: chapter.id, label: chapter.name }))]} selectedId={chapterId ?? "all"} onSelect={(id) => setChapterId(id === "all" ? undefined : id)} />
      <Text style={styles.available}>{available.length} question{available.length === 1 ? "" : "s"} available</Text>
      <SectionTitle>2. Number of questions</SectionTitle>
      <View style={styles.pills}>{QUESTION_COUNTS.map((value) => <Choice key={value} label={String(value)} selected={!customCount && count === value} onPress={() => { setCount(value); setCustomCount(""); }} />)}<TextInput value={customCount} onChangeText={setCustomCount} placeholder="Custom" placeholderTextColor="#8290A5" keyboardType="number-pad" style={[styles.customInput, customCount && styles.customInputActive]} /></View>
      <SectionTitle>3. Time</SectionTitle>
      <View style={styles.timerPills}>{TIMERS.map((timer) => <Choice key={timer.label} label={timer.label} selected={!customMinutes && durationSeconds === timer.seconds} onPress={() => { setDurationSeconds(timer.seconds); setCustomMinutes(""); }} />)}</View><TextInput value={customMinutes} onChangeText={setCustomMinutes} placeholder="Custom minutes" placeholderTextColor="#8290A5" keyboardType="number-pad" style={[styles.minutesInput, customMinutes && styles.customInputActive]} />
      <Card style={styles.readyCard}><Text style={styles.readyTitle}>Ready when you are</Text><Text style={styles.readyDetail}>{Math.min(effectiveCount, available.length || effectiveCount)} questions · {effectiveDuration ? `${Math.round(effectiveDuration / 60)} minutes` : "No time limit"}</Text></Card>
      <PrimaryButton label="Start Test" icon="play-arrow" onPress={begin} disabled={!available.length} />
    </ScrollView>
  </StudyScreen>;
}

function SelectionCard({ title, items, selectedId, onSelect }: { title: string; items: { id: string; label: string }[]; selectedId: string; onSelect: (id: string) => void }) { return <Card><Text style={styles.fieldTitle}>{title}</Text><View style={styles.selectRows}>{items.map((item) => <Pressable key={item.id} onPress={() => onSelect(item.id)} style={({ pressed }) => [styles.selectRow, selectedId === item.id && styles.selectRowSelected, pressed && styles.pressed]}><View style={[styles.radio, selectedId === item.id && styles.radioSelected]}>{selectedId === item.id ? <View style={styles.radioDot} /> : null}</View><Text style={[styles.selectLabel, selectedId === item.id && styles.selectLabelSelected]}>{item.label}</Text></Pressable>)}</View></Card>; }
function Choice({ label, selected, onPress }: { label: string; selected: boolean; onPress: () => void }) { return <Pressable onPress={onPress} style={({ pressed }) => [styles.choice, selected && styles.choiceSelected, pressed && styles.pressed]}><Text style={[styles.choiceText, selected && styles.choiceTextSelected]}>{label}</Text></Pressable>; }

const styles = StyleSheet.create({ content: { padding: 20, paddingBottom: 34, gap: 12 }, fieldTitle: { color: colors.ink, fontSize: 14, fontWeight: "800", marginBottom: 10 }, selectRows: { gap: 3 }, selectRow: { minHeight: 43, flexDirection: "row", alignItems: "center", gap: 10, paddingHorizontal: 8, borderRadius: 10 }, selectRowSelected: { backgroundColor: colors.softBlue }, radio: { width: 19, height: 19, borderRadius: 10, borderWidth: 1.5, borderColor: "#9BA9BC", alignItems: "center", justifyContent: "center" }, radioSelected: { borderColor: colors.blue }, radioDot: { width: 9, height: 9, borderRadius: 5, backgroundColor: colors.blue }, selectLabel: { color: colors.ink, fontSize: 14 }, selectLabelSelected: { color: colors.blue, fontWeight: "800" }, available: { marginTop: -2, color: colors.muted, fontSize: 12, paddingLeft: 3 }, pills: { flexDirection: "row", flexWrap: "wrap", gap: 8 }, timerPills: { flexDirection: "row", flexWrap: "wrap", gap: 8 }, choice: { minHeight: 42, paddingHorizontal: 14, borderRadius: 12, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface, alignItems: "center", justifyContent: "center" }, choiceSelected: { backgroundColor: colors.softBlue, borderColor: "#B8D1FF" }, choiceText: { color: colors.muted, fontSize: 13, fontWeight: "700" }, choiceTextSelected: { color: colors.blue }, customInput: { width: 86, height: 42, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface, borderRadius: 12, paddingHorizontal: 11, color: colors.ink, fontSize: 13, textAlign: "center" }, minutesInput: { marginTop: 10, height: 46, borderRadius: 12, borderWidth: 1, borderColor: colors.border, paddingHorizontal: 13, backgroundColor: colors.surface, color: colors.ink, fontSize: 14 }, customInputActive: { borderColor: "#B8D1FF", backgroundColor: colors.softBlue }, readyCard: { backgroundColor: "#F5F9FF", borderColor: "#D5E4FF" }, readyTitle: { color: colors.ink, fontSize: 16, fontWeight: "800" }, readyDetail: { color: colors.muted, fontSize: 13, marginTop: 5 }, pressed: { opacity: 0.7 } });
