import Database from "better-sqlite3";
import path from "path";
import fs from "fs";

const DATA_DIR = process.env.DATA_DIR || path.join(process.cwd(), "data");
const DB_PATH = path.join(DATA_DIR, "pens.db");

if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

const db = new Database(DB_PATH);

db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    name TEXT DEFAULT '',
    email TEXT UNIQUE NOT NULL,
    email_verified INTEGER DEFAULT 0,
    image TEXT DEFAULT '',
    password_hash TEXT DEFAULT '',
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS pens (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    brand TEXT NOT NULL DEFAULT '',
    model TEXT DEFAULT '',
    color TEXT DEFAULT '',
    nib_size TEXT DEFAULT '',
    nib_material TEXT DEFAULT '',
    nib_type TEXT DEFAULT '',
    fill_system TEXT DEFAULT '',
    date_purchased TEXT DEFAULT '',
    purchase_price REAL,
    purchase_location TEXT DEFAULT '',
    current_ink TEXT DEFAULT '',
    condition TEXT DEFAULT '',
    notes TEXT DEFAULT '',
    image_url TEXT DEFAULT '',
    rating INTEGER DEFAULT 0,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS ink_history (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    pen_id INTEGER NOT NULL,
    ink_name TEXT NOT NULL,
    inked_date TEXT NOT NULL,
    notes TEXT DEFAULT '',
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (pen_id) REFERENCES pens(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS ink_bottles (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL DEFAULT '',
    brand TEXT NOT NULL DEFAULT '',
    color_description TEXT DEFAULT '',
    type TEXT DEFAULT '',
    bottle_size_ml REAL,
    remaining_pct INTEGER DEFAULT 100,
    notes TEXT DEFAULT '',
    swatch_url TEXT DEFAULT '',
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS pen_tags (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    pen_id INTEGER NOT NULL,
    tag TEXT NOT NULL,
    FOREIGN KEY (pen_id) REFERENCES pens(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS maintenance_log (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    pen_id INTEGER NOT NULL,
    type TEXT DEFAULT '',
    notes TEXT DEFAULT '',
    date TEXT NOT NULL,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (pen_id) REFERENCES pens(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS writing_samples (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    pen_id INTEGER NOT NULL,
    ink_name TEXT DEFAULT '',
    paper TEXT DEFAULT '',
    notes TEXT DEFAULT '',
    image_url TEXT DEFAULT '',
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (pen_id) REFERENCES pens(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS wishlist (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    brand TEXT NOT NULL DEFAULT '',
    model TEXT DEFAULT '',
    notes TEXT DEFAULT '',
    url TEXT DEFAULT '',
    estimated_price REAL,
    priority TEXT DEFAULT 'medium',
    acquired INTEGER DEFAULT 0,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
  );
`);

// Migration: add new columns to pens table (safe for existing DBs)
const penMigrations = [
  "ALTER TABLE pens ADD COLUMN is_daily_carry INTEGER DEFAULT 0",
  "ALTER TABLE pens ADD COLUMN provenance TEXT DEFAULT ''",
  "ALTER TABLE pens ADD COLUMN storage_location TEXT DEFAULT ''",
];

for (const sql of penMigrations) {
  try {
    db.exec(sql);
  } catch {
    // Column already exists — safe to ignore
  }
}

const authMigrations = [
  `ALTER TABLE pens ADD COLUMN user_id TEXT REFERENCES users(id)`,
  `ALTER TABLE ink_bottles ADD COLUMN user_id TEXT REFERENCES users(id)`,
  `ALTER TABLE wishlist ADD COLUMN user_id TEXT REFERENCES users(id)`,
];
for (const sql of authMigrations) {
  try { db.exec(sql); } catch { /* already exists */ }
}

export default db;
