import { describe, it, expect, beforeAll, afterAll } from "vitest";
import Database from "better-sqlite3";
import path from "path";
import fs from "fs";

// Use a separate test database so we don't touch the real one
const TEST_DB_PATH = path.join(__dirname, "test-persona-dashboard.db");

let db: Database.Database;

beforeAll(() => {
  // Clean up any leftover test DB
  try { fs.unlinkSync(TEST_DB_PATH); } catch {}
  db = new Database(TEST_DB_PATH);
  db.pragma("journal_mode = WAL");
  db.pragma("foreign_keys = ON");

  // Create the tables we're testing
  db.exec(`
    CREATE TABLE IF NOT EXISTS applications (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      company TEXT NOT NULL,
      position TEXT NOT NULL,
      status TEXT DEFAULT 'APPLIED',
      date_applied TEXT DEFAULT '',
      location TEXT DEFAULT '',
      salary_min REAL DEFAULT 0,
      salary_max REAL DEFAULT 0,
      notes TEXT DEFAULT '',
      url TEXT DEFAULT '',
      category TEXT DEFAULT '',
      interview_date TEXT DEFAULT '',
      created_at TEXT DEFAULT (datetime('now')),
      user_id TEXT DEFAULT 'default'
    );

    CREATE TABLE IF NOT EXISTS certifications (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      category TEXT DEFAULT '',
      image_url TEXT DEFAULT '',
      price REAL DEFAULT 0,
      expiration_date TEXT DEFAULT '',
      exam_date TEXT DEFAULT '',
      status TEXT DEFAULT 'PLANNING',
      created_at TEXT DEFAULT (datetime('now')),
      user_id TEXT DEFAULT 'default'
    );

    CREATE TABLE IF NOT EXISTS projects (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      status TEXT DEFAULT 'TODO',
      technologies TEXT DEFAULT '',
      category TEXT DEFAULT '',
      deadline TEXT DEFAULT '',
      description TEXT DEFAULT '',
      goal TEXT DEFAULT '',
      created_at TEXT DEFAULT (datetime('now')),
      user_id TEXT DEFAULT 'default'
    );
  `);
});

afterAll(() => {
  db.close();
  try { fs.unlinkSync(TEST_DB_PATH); } catch {}
  // Clean WAL/SHM files
  try { fs.unlinkSync(TEST_DB_PATH + "-wal"); } catch {}
  try { fs.unlinkSync(TEST_DB_PATH + "-shm"); } catch {}
});

// ---------------------------------------------------------------------------
// Applications CRUD
// ---------------------------------------------------------------------------
describe("Applications CRUD", () => {
  let appId: number;

  it("creates an application", () => {
    const stmt = db.prepare(
      "INSERT INTO applications (company, position, status, date_applied, location, salary_min, salary_max, notes, url, category, interview_date, user_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)"
    );
    const result = stmt.run("Acme Corp", "Senior SRE", "APPLIED", "2026-05-20", "Remote", 120000, 180000, "Dream role", "https://acme.com/careers", "SRE", "", "test-user");
    appId = Number(result.lastInsertRowid);
    expect(appId).toBeGreaterThan(0);
  });

  it("reads the created application", () => {
    const row = db.prepare("SELECT * FROM applications WHERE id = ? AND user_id = ?").get(appId, "test-user") as any;
    expect(row).toBeDefined();
    expect(row.company).toBe("Acme Corp");
    expect(row.position).toBe("Senior SRE");
    expect(row.status).toBe("APPLIED");
    expect(row.salary_min).toBe(120000);
    expect(row.salary_max).toBe(180000);
  });

  it("updates the application status", () => {
    db.prepare("UPDATE applications SET status = ? WHERE id = ? AND user_id = ?").run("INTERVIEW", appId, "test-user");
    const row = db.prepare("SELECT status FROM applications WHERE id = ?").get(appId) as any;
    expect(row.status).toBe("INTERVIEW");
  });

  it("lists all applications for a user", () => {
    const rows = db.prepare("SELECT * FROM applications WHERE user_id = ? ORDER BY created_at DESC").all("test-user") as any[];
    expect(rows.length).toBeGreaterThanOrEqual(1);
    expect(rows[0].company).toBe("Acme Corp");
  });

  it("deletes the application", () => {
    db.prepare("DELETE FROM applications WHERE id = ? AND user_id = ?").run(appId, "test-user");
    const row = db.prepare("SELECT * FROM applications WHERE id = ?").get(appId);
    expect(row).toBeUndefined();
  });

  it("returns undefined for non-existent application", () => {
    const row = db.prepare("SELECT * FROM applications WHERE id = ? AND user_id = ?").get(99999, "test-user");
    expect(row).toBeUndefined();
  });
});

// ---------------------------------------------------------------------------
// Certifications CRUD
// ---------------------------------------------------------------------------
describe("Certifications CRUD", () => {
  let certId: number;

  it("creates a certification", () => {
    const stmt = db.prepare(
      "INSERT INTO certifications (name, category, image_url, price, expiration_date, exam_date, status, user_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?)"
    );
    const result = stmt.run("AWS Solutions Architect", "Cloud", "", 300, "2028-05-20", "2026-06-15", "PLANNING", "test-user");
    certId = Number(result.lastInsertRowid);
    expect(certId).toBeGreaterThan(0);
  });

  it("reads the created certification", () => {
    const row = db.prepare("SELECT * FROM certifications WHERE id = ? AND user_id = ?").get(certId, "test-user") as any;
    expect(row).toBeDefined();
    expect(row.name).toBe("AWS Solutions Architect");
    expect(row.category).toBe("Cloud");
    expect(row.price).toBe(300);
    expect(row.status).toBe("PLANNING");
  });

  it("updates certification status to PASSED", () => {
    db.prepare("UPDATE certifications SET status = ? WHERE id = ? AND user_id = ?").run("PASSED", certId, "test-user");
    const row = db.prepare("SELECT status FROM certifications WHERE id = ?").get(certId) as any;
    expect(row.status).toBe("PASSED");
  });

  it("lists all certifications for a user", () => {
    const rows = db.prepare("SELECT * FROM certifications WHERE user_id = ? ORDER BY category, name").all("test-user") as any[];
    expect(rows.length).toBeGreaterThanOrEqual(1);
    expect(rows.find((r: any) => r.id === certId)).toBeDefined();
  });

  it("deletes the certification", () => {
    db.prepare("DELETE FROM certifications WHERE id = ? AND user_id = ?").run(certId, "test-user");
    const row = db.prepare("SELECT * FROM certifications WHERE id = ?").get(certId);
    expect(row).toBeUndefined();
  });
});

// ---------------------------------------------------------------------------
// Projects CRUD
// ---------------------------------------------------------------------------
describe("Projects CRUD", () => {
  let projectId: number;

  it("creates a project", () => {
    const stmt = db.prepare(
      "INSERT INTO projects (name, status, technologies, category, deadline, description, goal, user_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?)"
    );
    const result = stmt.run("Career Dashboard", "IN_PROGRESS", "Next.js,SQLite,Tailwind", "Web Dev", "2026-08-01", "Full-stack career command center", "Ship v1.0", "test-user");
    projectId = Number(result.lastInsertRowid);
    expect(projectId).toBeGreaterThan(0);
  });

  it("reads the created project", () => {
    const row = db.prepare("SELECT * FROM projects WHERE id = ? AND user_id = ?").get(projectId, "test-user") as any;
    expect(row).toBeDefined();
    expect(row.name).toBe("Career Dashboard");
    expect(row.status).toBe("IN_PROGRESS");
    expect(row.technologies).toBe("Next.js,SQLite,Tailwind");
    expect(row.description).toBe("Full-stack career command center");
  });

  it("updates project status to DONE", () => {
    db.prepare("UPDATE projects SET status = ? WHERE id = ? AND user_id = ?").run("DONE", projectId, "test-user");
    const row = db.prepare("SELECT status FROM projects WHERE id = ?").get(projectId) as any;
    expect(row.status).toBe("DONE");
  });

  it("lists all projects for a user", () => {
    const rows = db.prepare("SELECT * FROM projects WHERE user_id = ? ORDER BY category, name").all("test-user") as any[];
    expect(rows.length).toBeGreaterThanOrEqual(1);
    expect(rows.find((r: any) => r.id === projectId)).toBeDefined();
  });

  it("deletes the project", () => {
    db.prepare("DELETE FROM projects WHERE id = ? AND user_id = ?").run(projectId, "test-user");
    const row = db.prepare("SELECT * FROM projects WHERE id = ?").get(projectId);
    expect(row).toBeUndefined();
  });
});

// ---------------------------------------------------------------------------
// Cross-cutting: user_id isolation
// ---------------------------------------------------------------------------
describe("User isolation", () => {
  it("does not leak data across user_ids", () => {
    // Insert as user-a
    db.prepare("INSERT INTO applications (company, position, user_id) VALUES (?, ?, ?)").run("Secret Co", "Hacker", "user-a");

    // Query as user-b
    const rows = db.prepare("SELECT * FROM applications WHERE user_id = ?").all("user-b") as any[];
    const found = rows.find((r: any) => r.company === "Secret Co");
    expect(found).toBeUndefined();

    // Cleanup
    db.prepare("DELETE FROM applications WHERE user_id = ?").run("user-a");
  });
});
