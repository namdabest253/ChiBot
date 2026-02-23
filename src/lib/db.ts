import Database from 'better-sqlite3';
import path from 'path';
import { Word, ChatMessage } from '@/types';
import { extractChineseCharacters } from './characters';

const DB_PATH = path.join(process.cwd(), 'vocab.db');

let db: Database.Database | null = null;

function getDb(): Database.Database {
  if (!db) {
    db = new Database(DB_PATH);
    db.pragma('journal_mode = WAL');
    db.exec(`
      CREATE TABLE IF NOT EXISTS vocab (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        chinese TEXT NOT NULL UNIQUE
      )
    `);
    db.exec(`
      CREATE TABLE IF NOT EXISTS chat_history (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        role TEXT NOT NULL,
        message TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);
  }
  return db;
}

export function getAllWords(): Word[] {
  const db = getDb();
  return db.prepare('SELECT id, chinese FROM vocab ORDER BY id').all() as Word[];
}

export function addWord(chinese: string): Word | null {
  const db = getDb();
  const stmt = db.prepare('INSERT OR IGNORE INTO vocab (chinese) VALUES (?)');
  const result = stmt.run(chinese);
  if (result.changes > 0) {
    return db.prepare('SELECT id, chinese FROM vocab WHERE id = ?').get(result.lastInsertRowid) as Word;
  }
  return null;
}

export function deleteWord(id: number): boolean {
  const db = getDb();
  const result = db.prepare('DELETE FROM vocab WHERE id = ?').run(id);
  return result.changes > 0;
}

export function deleteWords(ids: number[]): number {
  const db = getDb();
  const placeholders = ids.map(() => '?').join(',');
  const result = db.prepare(`DELETE FROM vocab WHERE id IN (${placeholders})`).run(...ids);
  return result.changes;
}

export function getKnownCharacters(): Set<string> {
  const words = getAllWords();
  const chars = new Set<string>();
  for (const word of words) {
    for (const char of extractChineseCharacters(word.chinese)) {
      chars.add(char);
    }
  }
  return chars;
}

export function getChatHistory(): ChatMessage[] {
  const db = getDb();
  return db.prepare('SELECT id, role, message, created_at FROM chat_history ORDER BY id').all() as ChatMessage[];
}

export function addChatMessage(role: 'user' | 'bot', message: string): void {
  const db = getDb();
  db.prepare('INSERT INTO chat_history (role, message) VALUES (?, ?)').run(role, message);
}

export function clearChatHistory(): void {
  const db = getDb();
  db.prepare('DELETE FROM chat_history').run();
}
