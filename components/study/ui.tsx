import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { PropsWithChildren } from "react";
import { ActivityIndicator, Pressable, StyleSheet, Text, View, type StyleProp, type ViewStyle } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export const colors = {
  canvas: "#F8FAFC", surface: "#FFFFFF", blue: "#2563EB", softBlue: "#EAF2FF", ink: "#172033", muted: "#5E6A7D", border: "#E5EAF1", success: "#16805C", caution: "#B7791F", error: "#C43A3A",
};

export function StudyScreen({ children, style }: PropsWithChildren<{ style?: StyleProp<ViewStyle> }>) {
  return <SafeAreaView edges={["top", "left", "right"]} style={[styles.screen, style]}>{children}</SafeAreaView>;
}

export function AppHeader({ title, subtitle, back, right }: { title: string; subtitle?: string; back?: () => void; right?: React.ReactNode }) {
  return <View style={styles.header}>
    <View style={styles.headerRow}>
      {back ? <Pressable accessibilityRole="button" accessibilityLabel="Go back" onPress={back} style={({ pressed }) => [styles.iconButton, pressed && styles.pressed]}><MaterialIcons name="arrow-back" size={22} color={colors.ink} /></Pressable> : null}
      <View style={[styles.headerCopy, !back && { marginLeft: 2 }]}><Text style={styles.headerTitle}>{title}</Text>{subtitle ? <Text style={styles.headerSubtitle}>{subtitle}</Text> : null}</View>
      {right ? <View style={styles.headerRight}>{right}</View> : null}
    </View>
  </View>;
}

export function PrimaryButton({ label, onPress, icon, disabled, variant = "primary" }: { label: string; onPress: () => void; icon?: keyof typeof MaterialIcons.glyphMap; disabled?: boolean; variant?: "primary" | "secondary" | "danger" }) {
  const isPrimary = variant === "primary";
  const isDanger = variant === "danger";
  return <Pressable disabled={disabled} onPress={onPress} accessibilityRole="button" style={({ pressed }) => [styles.button, isPrimary ? styles.buttonPrimary : isDanger ? styles.buttonDanger : styles.buttonSecondary, disabled && styles.buttonDisabled, pressed && !disabled && styles.buttonPressed]}>
    {icon ? <MaterialIcons name={icon} size={19} color={isPrimary || isDanger ? "#FFFFFF" : colors.blue} /> : null}
    <Text style={[styles.buttonText, !isPrimary && !isDanger && styles.buttonTextSecondary]}>{label}</Text>
  </Pressable>;
}

export function Card({ children, style }: PropsWithChildren<{ style?: StyleProp<ViewStyle> }>) { return <View style={[styles.card, style]}>{children}</View>; }

export function SectionTitle({ children, action }: PropsWithChildren<{ action?: React.ReactNode }>) {
  return <View style={styles.sectionTitleRow}><Text style={styles.sectionTitle}>{children}</Text>{action}</View>;
}

export function EmptyState({ icon = "menu-book", title, detail, action }: { icon?: keyof typeof MaterialIcons.glyphMap; title: string; detail: string; action?: React.ReactNode }) {
  return <View style={styles.emptyState}><View style={styles.emptyIcon}><MaterialIcons name={icon} size={28} color={colors.blue} /></View><Text style={styles.emptyTitle}>{title}</Text><Text style={styles.emptyDetail}>{detail}</Text>{action ? <View style={styles.emptyAction}>{action}</View> : null}</View>;
}

export function LoadingState() { return <View style={styles.loading}><ActivityIndicator color={colors.blue} /><Text style={styles.loadingText}>Preparing your study space…</Text></View>; }

export function Metric({ label, value }: { label: string; value: string | number }) { return <View style={styles.metric}><Text style={styles.metricValue}>{value}</Text><Text style={styles.metricLabel}>{label}</Text></View>; }

export const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.canvas },
  header: { backgroundColor: colors.canvas, paddingHorizontal: 20, paddingTop: 6, paddingBottom: 12 },
  headerRow: { minHeight: 40, flexDirection: "row", alignItems: "center" },
  headerCopy: { flex: 1 }, headerTitle: { color: colors.ink, fontSize: 24, lineHeight: 31, fontWeight: "800" }, headerSubtitle: { color: colors.muted, fontSize: 13, lineHeight: 18, marginTop: 1 },
  headerRight: { marginLeft: 12 }, iconButton: { height: 42, width: 42, marginLeft: -10, marginRight: 6, borderRadius: 21, alignItems: "center", justifyContent: "center", backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border },
  card: { backgroundColor: colors.surface, borderColor: colors.border, borderWidth: 1, borderRadius: 18, padding: 16, shadowColor: "#172033", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.035, shadowRadius: 8, elevation: 1 },
  button: { minHeight: 48, borderRadius: 14, paddingHorizontal: 18, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8 }, buttonPrimary: { backgroundColor: colors.blue }, buttonSecondary: { backgroundColor: colors.softBlue, borderColor: "#C9DBFF", borderWidth: 1 }, buttonDanger: { backgroundColor: colors.error }, buttonText: { color: "#FFFFFF", fontSize: 15, fontWeight: "800" }, buttonTextSecondary: { color: colors.blue }, buttonDisabled: { opacity: 0.45 }, buttonPressed: { opacity: 0.9, transform: [{ scale: 0.975 }] }, pressed: { opacity: 0.68 },
  sectionTitleRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }, sectionTitle: { color: colors.ink, fontSize: 17, lineHeight: 23, fontWeight: "800" },
  emptyState: { alignItems: "center", justifyContent: "center", paddingHorizontal: 28, paddingVertical: 44 }, emptyIcon: { width: 58, height: 58, borderRadius: 18, justifyContent: "center", alignItems: "center", backgroundColor: colors.softBlue, marginBottom: 16 }, emptyTitle: { color: colors.ink, fontSize: 18, lineHeight: 24, fontWeight: "800", textAlign: "center" }, emptyDetail: { color: colors.muted, fontSize: 14, lineHeight: 20, textAlign: "center", marginTop: 7, maxWidth: 290 }, emptyAction: { marginTop: 20, width: "100%" },
  loading: { flex: 1, alignItems: "center", justifyContent: "center", gap: 12 }, loadingText: { color: colors.muted, fontSize: 14 },
  metric: { flex: 1, minWidth: 70 }, metricValue: { color: colors.ink, fontSize: 21, lineHeight: 27, fontWeight: "800" }, metricLabel: { color: colors.muted, fontSize: 11, lineHeight: 16, fontWeight: "600", marginTop: 2 },
});
