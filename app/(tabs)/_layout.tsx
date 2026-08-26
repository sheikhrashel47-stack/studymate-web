import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { Tabs } from "expo-router";
import { Platform } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { colors } from "@/components/study/ui";
import { HapticTab } from "@/components/haptic-tab";

const tabIcon = (name: keyof typeof MaterialIcons.glyphMap) => ({ color }: { color: string }) => <MaterialIcons name={name} color={color} size={24} />;

export default function TabLayout() {
  const insets = useSafeAreaInsets();
  const bottomPadding = Platform.OS === "web" ? 10 : Math.max(insets.bottom, 8);
  return <Tabs screenOptions={{ headerShown: false, tabBarActiveTintColor: colors.blue, tabBarInactiveTintColor: "#8290A5", tabBarButton: HapticTab, tabBarStyle: { backgroundColor: colors.surface, borderTopColor: colors.border, height: 58 + bottomPadding, paddingTop: 7, paddingBottom: bottomPadding }, tabBarLabelStyle: { fontSize: 11, fontWeight: "700" } }}>
    <Tabs.Screen name="index" options={{ title: "Home", tabBarIcon: tabIcon("home") }} />
    <Tabs.Screen name="questions" options={{ title: "Questions", tabBarIcon: tabIcon("menu-book") }} />
    <Tabs.Screen name="test" options={{ title: "Test", tabBarIcon: tabIcon("edit-note") }} />
    <Tabs.Screen name="progress" options={{ title: "Progress", tabBarIcon: tabIcon("bar-chart") }} />
  </Tabs>;
}
