import Database from "better-sqlite3";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const currentFile = fileURLToPath(import.meta.url);
const currentDir = path.dirname(currentFile);

const dataDir = path.join(currentDir, "../data");

if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const dbPath = process.env.DB_PATH || path.join(dataDir, "library.db");

export const db = new Database(dbPath);

export function initDb() {
  db.prepare(`
    CREATE TABLE IF NOT EXISTS books (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      author TEXT NOT NULL,
      genre TEXT NOT NULL,
      year INTEGER,
      rating INTEGER NOT NULL DEFAULT 1,
      status TEXT NOT NULL DEFAULT 'planned',
      favorite INTEGER NOT NULL DEFAULT 0,
      createdAt TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    )
  `).run();
}