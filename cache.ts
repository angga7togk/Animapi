import Database from "better-sqlite3";
import path from "path";
import fs from "fs";

export class Cache {
  private db: Database.Database;
  private ttl: number;

  constructor(dbFilePath?: string, ttl = 60 * 60) {
    const dbPath = path.resolve(dbFilePath || ".animapi/cache/animes.db");
    const cacheDir = path.dirname(dbPath);
    this.ttl = ttl;
    if (!fs.existsSync(cacheDir)) fs.mkdirSync(cacheDir, { recursive: true });

    this.db = new Database(dbPath);

    // Buat tabel cache kalau belum ada
    this.db
      .prepare(
        `
      CREATE TABLE IF NOT EXISTS anime_cache (
        key TEXT PRIMARY KEY,
        value TEXT,
        lastUpdated INTEGER
      )
    `
      )
      .run();
  }

  /**
   * Ambil cache
   * @param key Key cache
   * @param maxAgeSec TTL dalam detik (default 1 hari)
   * @returns Parsed JSON data atau null jika expired/tidak ada
   */
  get(key: string): any | null {
    const row: any = this.db
      .prepare("SELECT * FROM anime_cache WHERE key = ?")
      .get(key);
    if (!row) return null;

    const now = Date.now();
    if ((now - row.lastUpdated) / 1000 > this.ttl) {
      // ? hapus dari db
      this.db.prepare("DELETE FROM anime_cache WHERE key = ?").run(key);
      return null;
    }

    return JSON.parse(row.value);
  }

  /**
   * Set cache
   * @param key Key cache
   * @param data Data apapun yang bisa di-JSON stringify
   */
  set(key: string, data: any) {
    const now = Date.now();
    const value = JSON.stringify(data);

    this.db
      .prepare(
        `
      INSERT OR REPLACE INTO anime_cache (key, value, lastUpdated)
      VALUES (?, ?, ?)
    `
      )
      .run(key, value, now);
  }
}
