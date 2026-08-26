import * as SQLite from "expo-sqlite";

import { EMPTY_STUDY_DATA, type StudyData } from "./types";

let databasePromise: Promise<SQLite.SQLiteDatabase> | undefined;

async function getDatabase() {
  if (!databasePromise) {
    databasePromise = SQLite.openDatabaseAsync("studymate.db").then(async (database) => {
      await database.execAsync("PRAGMA journal_mode = WAL;");
      await database.execAsync("CREATE TABLE IF NOT EXISTS study_state (id INTEGER PRIMARY KEY NOT NULL, data TEXT NOT NULL, updated_at INTEGER NOT NULL);");
      return database;
    });
  }
  return databasePromise;
}

export async function loadStudyData(): Promise<StudyData> {
  try {
    const database = await getDatabase();
    const row = await database.getFirstAsync<{ data: string }>("SELECT data FROM study_state WHERE id = 1");
    return row?.data ? (JSON.parse(row.data) as StudyData) : EMPTY_STUDY_DATA;
  } catch {
    return EMPTY_STUDY_DATA;
  }
}

export async function persistStudyData(data: StudyData) {
  const database = await getDatabase();
  await database.runAsync("INSERT OR REPLACE INTO study_state (id, data, updated_at) VALUES (1, ?, ?)", JSON.stringify(data), Date.now());
}
