import Database from "better-sqlite3";
import path from "path";
import fs from "fs";

const DATA_DIR = path.join(process.cwd(), "data");
const DB_PATH = path.join(DATA_DIR, "pens.db");

if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

const db = new Database(DB_PATH);

db.exec(`
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
`);

export default db;
