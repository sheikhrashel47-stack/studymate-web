import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";

import { StudyProvider } from "@/lib/study/store";

export default function RootLayout() {
  return <GestureHandlerRootView style={{ flex: 1 }}><SafeAreaProvider><StudyProvider><Stack screenOptions={{ headerShown: false, animation: "slide_from_right" }}><Stack.Screen name="(tabs)" /></Stack><StatusBar style="dark" /></StudyProvider></SafeAreaProvider></GestureHandlerRootView>;
}
