import Database from "better-sqlite3";
import path from "path";
import fs from "fs";

let dbInstance: Database.Database | null = null;

export function getDb(): Database.Database {
  if (dbInstance) return dbInstance;

  const dataDir = path.join(process.cwd(), "data");
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }

  const dbPath = path.join(dataDir, "talentnet_forms.db");
  const db = new Database(dbPath);

  // WAL mode for high-concurrency and performance
  db.pragma("journal_mode = WAL");

  // Create tables
  db.exec(`
    CREATE TABLE IF NOT EXISTS forms (
      form_id TEXT PRIMARY KEY,
      revision INTEGER NOT NULL DEFAULT 1,
      current_step INTEGER NOT NULL DEFAULT 0,
      is_submitted INTEGER NOT NULL DEFAULT 0,
      answers TEXT NOT NULL DEFAULT '{}',
      other_answers TEXT NOT NULL DEFAULT '{}',
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS form_snapshots (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      form_id TEXT NOT NULL,
      revision INTEGER NOT NULL,
      current_step INTEGER NOT NULL,
      is_submitted INTEGER NOT NULL,
      answers TEXT NOT NULL,
      other_answers TEXT NOT NULL,
      created_at TEXT NOT NULL
    );

    CREATE INDEX IF NOT EXISTS idx_snapshots_form ON form_snapshots(form_id, revision);
  `);

  dbInstance = db;
  return dbInstance;
}
