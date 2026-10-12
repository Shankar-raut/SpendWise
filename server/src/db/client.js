import fs from 'node:fs';
import path from 'node:path';
import { DatabaseSync } from 'node:sqlite';
import { config, resolveDatabasePath } from '../config.js';

let database;

export function getDb() {
  if (!database) {
    database = openDatabase(config.databaseUrl);
  }

  return database;
}

export function openDatabase(databaseUrl) {
  const dbPath = resolveDatabasePath(databaseUrl);

  if (typeof dbPath === 'string') {
    fs.mkdirSync(path.dirname(dbPath), { recursive: true });
  }

  const db = new DatabaseSync(dbPath);
  db.exec('PRAGMA foreign_keys = ON;');
  db.exec('PRAGMA journal_mode = WAL;');
  return db;
}
