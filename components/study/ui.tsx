import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { PropsWithChildren } from "react";
import { ActivityIndicator, Pressable, StyleSheet, Text, View, type StyleProp, type ViewStyle } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export const colors = {
  canvas: "#F6F8FC",
  surface: "#FFFFFF",
  blue: "#0F6B4F",
  blueDark: "#0B4F3B",
  softBlue: "#E7F4EE",
  ink: "#14213D",
  muted: "#667085",
  border: "#E5EAF2",
  coral: "#C98A2C",
  softCoral: "#FFF4DC",
  success: "#18835A",
  softSuccess: "#EAF6EF",
  caution: "#B7791F",
  error: "#C43A3A",
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

export function PrimaryButton({ label, onPress, icon, disabled, variant = "primary", compact = false }: { label: string; onPress: () => void; icon?: keyof typeof MaterialIcons.glyphMap; disabled?: boolean; variant?: "primary" | "secondary" | "danger"; compact?: boolean }) {
  const isPrimary = variant === "primary";
  const isDanger = variant === "danger";
  return <Pressable disabled={disabled} onPress={onPress} accessibilityRole="button" style={({ pressed }) => [styles.button, compact && styles.buttonCompact, isPrimary ? styles.buttonPrimary : isDanger ? styles.buttonDanger : styles.buttonSecondary, disabled && styles.buttonDisabled, pressed && !disabled && styles.buttonPressed]}>
    {icon ? <MaterialIcons name={icon} size={compact ? 17 : 19} color={isPrimary || isDanger ? "#FFFFFF" : colors.blue} /> : null}
    <Text style={[styles.buttonText, compact && styles.buttonTextCompact, !isPrimary && !isDanger && styles.buttonTextSecondary]}>{label}</Text>
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

export function IconBadge({ icon, color = colors.blue, background = colors.softBlue, size = 46 }: { icon: keyof typeof MaterialIcons.glyphMap; color?: string; background?: string; size?: number }) {
  return <View style={{ width: size, height: size, borderRadius: Math.round(size * 0.32), alignItems: "center", justifyContent: "center", backgroundColor: background }}><MaterialIcons name={icon} size={Math.round(size * 0.48)} color={color} /></View>;
}

export function ProgressBar({ value, color = colors.blue }: { value: number; color?: string }) {
  return <View style={styles.progressTrack}><View style={[styles.progressFill, { width: `${Math.max(0, Math.min(100, value))}%`, backgroundColor: color }]} /></View>;
}

export const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.canvas },
  header: { backgroundColor: colors.canvas, paddingHorizontal: 20, paddingTop: 8, paddingBottom: 14 },
  headerRow: { minHeight: 44, flexDirection: "row", alignItems: "center" },
  headerCopy: { flex: 1, flexShrink: 1 },
  headerTitle: { color: colors.ink, fontSize: 25, lineHeight: 31, fontWeight: "800", letterSpacing: -0.4 },
  headerSubtitle: { color: colors.muted, fontSize: 13, lineHeight: 18, marginTop: 2, flexShrink: 1 },
  headerRight: { marginLeft: 12 },
  iconButton: { height: 42, width: 42, marginLeft: -10, marginRight: 6, borderRadius: 15, alignItems: "center", justifyContent: "center", backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border },
  card: { backgroundColor: colors.surface, borderColor: colors.border, borderWidth: 1, borderRadius: 20, padding: 17, shadowColor: colors.ink, shadowOffset: { width: 0, height: 5 }, shadowOpacity: 0.045, shadowRadius: 12, elevation: 1 },
  button: { minHeight: 50, borderRadius: 15, paddingHorizontal: 18, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8 },
  buttonCompact: { minHeight: 42, borderRadius: 12, paddingHorizontal: 13, gap: 6 },
  buttonPrimary: { backgroundColor: colors.blue },
  buttonSecondary: { backgroundColor: colors.softBlue, borderColor: "#C7E4D7", borderWidth: 1 },
  buttonDanger: { backgroundColor: colors.error },
  buttonText: { color: "#FFFFFF", fontSize: 15, fontWeight: "800", flexShrink: 1, textAlign: "center" },
  buttonTextCompact: { fontSize: 13 },
  buttonTextSecondary: { color: colors.blue },
  buttonDisabled: { opacity: 0.45 },
  buttonPressed: { opacity: 0.9, transform: [{ scale: 0.975 }] },
  pressed: { opacity: 0.68 },
  sectionTitleRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 10 },
  sectionTitle: { color: colors.ink, fontSize: 17, lineHeight: 23, fontWeight: "800" },
  emptyState: { alignItems: "center", justifyContent: "center", paddingHorizontal: 24, paddingVertical: 54 },
  emptyIcon: { width: 64, height: 64, borderRadius: 22, justifyContent: "center", alignItems: "center", backgroundColor: colors.softBlue, marginBottom: 17 },
  emptyTitle: { color: colors.ink, fontSize: 19, lineHeight: 25, fontWeight: "800", textAlign: "center" },
  emptyDetail: { color: colors.muted, fontSize: 14, lineHeight: 21, textAlign: "center", marginTop: 7, maxWidth: 300 },
  emptyAction: { marginTop: 21, width: "100%" },
  loading: { flex: 1, alignItems: "center", justifyContent: "center", gap: 12 },
  loadingText: { color: colors.muted, fontSize: 14 },
  metric: { flex: 1, minWidth: 64 },
  metricValue: { color: colors.ink, fontSize: 22, lineHeight: 27, fontWeight: "800" },
  metricLabel: { color: colors.muted, fontSize: 11, lineHeight: 16, fontWeight: "600", marginTop: 3 },
  progressTrack: { height: 8, borderRadius: 99, overflow: "hidden", backgroundColor: "#E5EEE9" },
  progressFill: { height: "100%", borderRadius: 99 },
});
