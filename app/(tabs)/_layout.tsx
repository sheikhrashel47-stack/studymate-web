import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { Tabs } from "expo-router";
import { Platform } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { colors } from "@/components/study/ui";
import { HapticTab } from "@/components/haptic-tab";

const tabIcon = (name: keyof typeof MaterialIcons.glyphMap) => ({ color, focused }: { color: string; focused: boolean }) => <MaterialIcons name={name} color={color} size={focused ? 24 : 23} />;

export default function TabLayout() {
  const insets = useSafeAreaInsets();
  const bottomPadding = Platform.OS === "web" ? 10 : Math.max(insets.bottom, 8);
  return <Tabs screenOptions={{ headerShown: false, tabBarActiveTintColor: colors.blue, tabBarInactiveTintColor: "#98A2B3", tabBarButton: HapticTab, tabBarStyle: { backgroundColor: colors.surface, borderTopColor: colors.border, height: 63 + bottomPadding, paddingTop: 8, paddingBottom: bottomPadding, shadowColor: colors.ink, shadowOffset: { width: 0, height: -3 }, shadowOpacity: 0.06, shadowRadius: 12, elevation: 10 }, tabBarLabelStyle: { fontSize: 11, fontWeight: "800", marginTop: 1 }, tabBarItemStyle: { borderRadius: 14, marginHorizontal: 3 } }}>
    <Tabs.Screen name="index" options={{ title: "Home", tabBarIcon: tabIcon("home") }} />
    <Tabs.Screen name="questions" options={{ title: "Questions", tabBarIcon: tabIcon("menu-book") }} />
    <Tabs.Screen name="test" options={{ title: "Test", tabBarIcon: tabIcon("edit-note") }} />
    <Tabs.Screen name="progress" options={{ title: "Progress", tabBarIcon: tabIcon("bar-chart") }} />
    <Tabs.Screen name="history" options={{ title: "History", tabBarIcon: tabIcon("history") }} />
  </Tabs>;
}
