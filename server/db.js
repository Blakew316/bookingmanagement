import Database from 'better-sqlite3';
import { mkdirSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const dataDir = join(__dirname, '..', 'data');

mkdirSync(dataDir, { recursive: true });

const db = new Database(join(dataDir, 'booking.db'));

db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

export default db;
