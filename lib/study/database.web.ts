import AsyncStorage from "@react-native-async-storage/async-storage";

import { mergeBuiltInStudyContent } from "./seed";
import { EMPTY_STUDY_DATA, type StudyData } from "./types";

const WEB_KEY = "studymate.study-data.v1";

export async function loadStudyData(): Promise<StudyData> {
  try {
    const stored = await AsyncStorage.getItem(WEB_KEY);
    const saved = stored ? (JSON.parse(stored) as StudyData) : EMPTY_STUDY_DATA;
    const merged = mergeBuiltInStudyContent(saved);
    if (merged !== saved) await AsyncStorage.setItem(WEB_KEY, JSON.stringify(merged));
    return merged;
  } catch {
    return EMPTY_STUDY_DATA;
  }
}

export async function persistStudyData(data: StudyData) {
  await AsyncStorage.setItem(WEB_KEY, JSON.stringify(data));
}
