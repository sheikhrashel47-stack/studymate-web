import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";

import { StudyProvider } from "@/lib/study/store";

export default function RootLayout() {
  const [fontsLoaded] = useFonts({ ...MaterialIcons.font });
  if (!fontsLoaded) return null;
  return <GestureHandlerRootView style={{ flex: 1 }}><SafeAreaProvider><StudyProvider><Stack screenOptions={{ headerShown: false, animation: "slide_from_right" }}><Stack.Screen name="(tabs)" /></Stack><StatusBar style="dark" /></StudyProvider></SafeAreaProvider></GestureHandlerRootView>;
}
