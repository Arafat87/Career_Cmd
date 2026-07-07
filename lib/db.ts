import Database from "better-sqlite3";
import path from "path";

const DB_PATH = path.join(process.cwd(), "persona-dashboard.db");

let db: Database.Database | null = null;

export function getDb(): Database.Database {
  if (!db) {
    db = new Database(DB_PATH);
    db.pragma("journal_mode = WAL");
    db.pragma("foreign_keys = ON");
    initializeTables(db);
  }
  return db;
}

function initializeTables(db: Database.Database) {
  db.exec(`
    CREATE TABLE IF NOT EXISTS categories (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      color TEXT DEFAULT '#00F5FF',
      scope TEXT DEFAULT 'global',
      created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS certifications (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      category TEXT DEFAULT '',
      image_url TEXT DEFAULT '',
      price REAL DEFAULT 0,
      expiration_date TEXT DEFAULT '',
      exam_date TEXT DEFAULT '',
      created_at TEXT DEFAULT (datetime('now'))
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
      created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS techstack (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      category TEXT DEFAULT '',
      proficiency_goal TEXT DEFAULT '',
      image_url TEXT DEFAULT '',
      created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS jobtitles (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      company TEXT DEFAULT '',
      category TEXT DEFAULT '',
      location TEXT DEFAULT '',
      salary_min REAL DEFAULT 0,
      salary_max REAL DEFAULT 0,
      description TEXT DEFAULT '',
      tech_stack TEXT DEFAULT '',
      icon TEXT DEFAULT '',
      created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS reminders (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      date TEXT NOT NULL,
      type TEXT DEFAULT 'custom',
      category TEXT DEFAULT '',
      color TEXT DEFAULT '#00F5FF',
      reference_id INTEGER,
      created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS assistant_sessions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      type TEXT NOT NULL,
      input_text TEXT DEFAULT '',
      result_json TEXT DEFAULT '',
      score REAL,
      model_used TEXT DEFAULT '',
      created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS model_config (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      provider TEXT NOT NULL,
      model_name TEXT NOT NULL,
      api_key TEXT DEFAULT '',
      base_url TEXT DEFAULT '',
      temperature REAL DEFAULT 0.7,
      max_tokens INTEGER DEFAULT 4096,
      top_p REAL DEFAULT 1.0,
      is_default INTEGER DEFAULT 0,
      created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS chat_conversations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL DEFAULT 'New Chat',
      model_used TEXT DEFAULT '',
      context_snapshot TEXT DEFAULT '{}',
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS chat_messages (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      conversation_id INTEGER NOT NULL,
      role TEXT NOT NULL,
      content TEXT NOT NULL DEFAULT '',
      attachments TEXT DEFAULT '[]',
      message_type TEXT DEFAULT 'text',
      model_used TEXT DEFAULT '',
      created_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (conversation_id) REFERENCES chat_conversations(id) ON DELETE CASCADE
    );

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
      created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS notes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      content TEXT DEFAULT '',
      category TEXT DEFAULT '',
      color TEXT DEFAULT '#00F5FF',
      pinned INTEGER DEFAULT 0,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS saved_jobs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL DEFAULT '',
      company TEXT NOT NULL DEFAULT '',
      url TEXT DEFAULT '',
      location TEXT DEFAULT '',
      salary_min REAL DEFAULT 0,
      salary_max REAL DEFAULT 0,
      description TEXT DEFAULT '',
      category TEXT DEFAULT '',
      match_score REAL DEFAULT 0,
      status TEXT DEFAULT 'BOOKMARKED',
      date_saved TEXT DEFAULT '',
      notes TEXT DEFAULT '',
      created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS referrals (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      contact_name TEXT NOT NULL DEFAULT '',
      contact_email TEXT DEFAULT '',
      company TEXT DEFAULT '',
      position TEXT DEFAULT '',
      status TEXT DEFAULT 'PENDING',
      date_referred TEXT DEFAULT '',
      notes TEXT DEFAULT '',
      referral_url TEXT DEFAULT '',
      created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS networking_contacts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL DEFAULT '',
      email TEXT DEFAULT '',
      company TEXT DEFAULT '',
      role TEXT DEFAULT '',
      linkedin_url TEXT DEFAULT '',
      category TEXT DEFAULT 'CONNECTION',
      last_contact_date TEXT DEFAULT '',
      next_follow_up TEXT DEFAULT '',
      notes TEXT DEFAULT '',
      status TEXT DEFAULT 'ACTIVE',
      created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS interviews (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      company TEXT NOT NULL DEFAULT '',
      position TEXT DEFAULT '',
      round_type TEXT DEFAULT 'PHONE',
      date TEXT DEFAULT '',
      time TEXT DEFAULT '',
      location TEXT DEFAULT '',
      interviewer_name TEXT DEFAULT '',
      feedback TEXT DEFAULT '',
      status TEXT DEFAULT 'SCHEDULED',
      prep_notes TEXT DEFAULT '',
      created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS questions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      question TEXT NOT NULL DEFAULT '',
      answer TEXT DEFAULT '',
      category TEXT DEFAULT 'TECHNICAL',
      difficulty TEXT DEFAULT 'MEDIUM',
      company TEXT DEFAULT '',
      tags TEXT DEFAULT '',
      role_id INTEGER DEFAULT 0,
      times_practiced INTEGER DEFAULT 0,
      created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS custom_templates (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      description TEXT DEFAULT '',
      icon TEXT DEFAULT '◆',
      color TEXT DEFAULT '#00F5FF',
      certs TEXT DEFAULT '[]',
      skills TEXT DEFAULT '[]',
      projects TEXT DEFAULT '[]',
      learning TEXT DEFAULT '[]',
      created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS interview_roles (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      company TEXT DEFAULT '',
      description TEXT DEFAULT '',
      color TEXT DEFAULT '#00F5FF',
      created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS goals (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      description TEXT DEFAULT '',
      category TEXT DEFAULT 'CAREER',
      target_date TEXT DEFAULT '',
      status TEXT DEFAULT 'NOT STARTED',
      progress INTEGER DEFAULT 0,
      milestones TEXT DEFAULT '[]',
      created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS roadmaps (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      target_role TEXT NOT NULL DEFAULT '',
      phases_json TEXT NOT NULL DEFAULT '[]',
      color TEXT DEFAULT '#00F5FF',
      model_used TEXT DEFAULT '',
      created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS user_background (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      current_role TEXT DEFAULT '',
      employment_status TEXT DEFAULT 'unemployed',
      years_experience INTEGER DEFAULT 0,
      education_level TEXT DEFAULT '',
      industry_focus TEXT DEFAULT '',
      bio TEXT DEFAULT '',
      location TEXT DEFAULT '',
      desired_salary_min INTEGER DEFAULT 0,
      desired_salary_max INTEGER DEFAULT 0,
      created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS companies (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      industry TEXT DEFAULT '',
      size TEXT DEFAULT '',
      location TEXT DEFAULT '',
      website TEXT DEFAULT '',
      glassdoor_rating REAL DEFAULT 0,
      tech_stack TEXT DEFAULT '',
      culture_notes TEXT DEFAULT '',
      contacts TEXT DEFAULT '',
      status TEXT DEFAULT 'RESEARCHING',
      color TEXT DEFAULT '#00F5FF',
      created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS job_boards (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      url TEXT DEFAULT '',
      category TEXT DEFAULT 'GENERAL',
      icon TEXT DEFAULT '🔗',
      color TEXT DEFAULT '#00F5FF',
      last_scanned TEXT DEFAULT '',
      job_count INTEGER DEFAULT 0,
      user_id TEXT DEFAULT 'default',
      created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS learning_paths (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL DEFAULT '',
      url TEXT DEFAULT '',
      resource_type TEXT DEFAULT 'COURSE',
      skill_category TEXT DEFAULT '',
      status TEXT DEFAULT 'NOT STARTED',
      progress_pct INTEGER DEFAULT 0,
      notes TEXT DEFAULT '',
      priority INTEGER DEFAULT 0,
      created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS documents (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL DEFAULT '',
      doc_type TEXT DEFAULT 'OTHER',
      url TEXT DEFAULT '',
      content_text TEXT DEFAULT '',
      tags TEXT DEFAULT '',
      version TEXT DEFAULT '1.0',
      notes TEXT DEFAULT '',
      created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS portfolio_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL DEFAULT '',
      description TEXT DEFAULT '',
      tech_stack TEXT DEFAULT '',
      repo_url TEXT DEFAULT '',
      live_url TEXT DEFAULT '',
      image_url TEXT DEFAULT '',
      category TEXT DEFAULT '',
      featured INTEGER DEFAULT 0,
      created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS custom_providers (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL UNIQUE,
      base_url TEXT DEFAULT '',
      api_key TEXT DEFAULT '',
      created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS provider_models (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      provider TEXT NOT NULL,
      model_name TEXT NOT NULL,
      is_default INTEGER DEFAULT 0,
      created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS job_rss_feeds (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL DEFAULT '',
      url TEXT DEFAULT '',
      last_scanned TEXT DEFAULT '',
      created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS job_searches (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL DEFAULT '',
      search_mode TEXT DEFAULT 'target',
      search_terms TEXT DEFAULT '',
      results_json TEXT DEFAULT '[]',
      last_run TEXT DEFAULT '',
      created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS mcp_servers (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL UNIQUE,
      description TEXT DEFAULT '',
      enabled INTEGER DEFAULT 1,
      config_json TEXT DEFAULT '{}',
      created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS mcp_tool_history (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      tool_name TEXT NOT NULL,
      server_name TEXT NOT NULL,
      input_json TEXT DEFAULT '{}',
      output_json TEXT DEFAULT '',
      success INTEGER DEFAULT 1,
      duration_ms INTEGER DEFAULT 0,
      user_id TEXT DEFAULT 'default',
      created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS calendar_events (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      date TEXT NOT NULL,
      end_date TEXT DEFAULT '',
      source TEXT DEFAULT 'manual',
      google_event_id TEXT DEFAULT '',
      color TEXT DEFAULT '#00F5FF',
      description TEXT DEFAULT '',
      user_id TEXT DEFAULT 'default',
      created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS oauth_tokens (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      provider TEXT NOT NULL,
      access_token TEXT DEFAULT '',
      refresh_token TEXT DEFAULT '',
      expires_at TEXT DEFAULT '',
      scope TEXT DEFAULT '',
      user_id TEXT DEFAULT 'default',
      created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS salary_cache (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      role TEXT NOT NULL,
      location TEXT DEFAULT '',
      data_json TEXT DEFAULT '{}',
      fetched_at TEXT DEFAULT (datetime('now')),
      user_id TEXT DEFAULT 'default'
    );

    CREATE TABLE IF NOT EXISTS github_activity (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      event_type TEXT NOT NULL,
      repo_name TEXT DEFAULT '',
      title TEXT DEFAULT '',
      url TEXT DEFAULT '',
      github_username TEXT DEFAULT '',
      payload_json TEXT DEFAULT '{}',
      github_created_at TEXT DEFAULT '',
      user_id TEXT DEFAULT 'default',
      created_at TEXT DEFAULT (datetime('now'))
    );
  `);

  // Seed default provider models
  seedDefaultProviderModels();

  // Add missing columns if they don't exist (migration for existing DBs)
  try { db.exec(`ALTER TABLE projects ADD COLUMN description TEXT DEFAULT ''`); } catch {}
  try { db.exec(`ALTER TABLE projects ADD COLUMN goal TEXT DEFAULT ''`); } catch {}
  try { db.exec(`ALTER TABLE techstack ADD COLUMN image_url TEXT DEFAULT ''`); } catch {}
  try { db.exec(`ALTER TABLE jobtitles ADD COLUMN tech_stack TEXT DEFAULT ''`); } catch {}
  try { db.exec(`ALTER TABLE certifications ADD COLUMN exam_date TEXT DEFAULT ''`); } catch {}
  try { db.exec(`ALTER TABLE certifications ADD COLUMN status TEXT DEFAULT 'PLANNING'`); } catch {}
  try { db.exec(`ALTER TABLE reminders ADD COLUMN category TEXT DEFAULT ''`); } catch {}
  try { db.exec(`ALTER TABLE reminders ADD COLUMN color TEXT DEFAULT '#00F5FF'`); } catch {}

  // Auth migration: add user_id to all tables
  const tables = [
    "categories", "certifications", "projects", "techstack", "jobtitles", "reminders",
    "assistant_sessions", "chat_conversations", "chat_messages", "applications", "notes",
    "saved_jobs", "referrals", "networking_contacts", "interviews", "questions",
    "custom_templates", "interview_roles", "goals", "companies", "learning_paths",
    "documents", "portfolio_items", "custom_providers", "provider_models", "job_rss_feeds", "job_searches",
    "roadmaps", "user_background", "mcp_servers", "mcp_tool_history", "github_activity", "calendar_events", "salary_cache", "oauth_tokens",
    "calendar_events", "oauth_tokens", "salary_cache",
  ];
  for (const table of tables) {
    try { db.exec(`ALTER TABLE ${table} ADD COLUMN user_id TEXT DEFAULT 'default'`); } catch {}
  }

  // Performance indexes on frequently queried columns
  const indexes = [
    "CREATE INDEX IF NOT EXISTS idx_applications_user_id ON applications(user_id)",
    "CREATE INDEX IF NOT EXISTS idx_applications_status ON applications(user_id, status)",
    "CREATE INDEX IF NOT EXISTS idx_applications_created_at ON applications(user_id, created_at DESC)",
    "CREATE INDEX IF NOT EXISTS idx_certifications_user_id ON certifications(user_id)",
    "CREATE INDEX IF NOT EXISTS idx_certifications_status ON certifications(user_id, status)",
    "CREATE INDEX IF NOT EXISTS idx_projects_user_id ON projects(user_id)",
    "CREATE INDEX IF NOT EXISTS idx_projects_status ON projects(user_id, status)",
    "CREATE INDEX IF NOT EXISTS idx_techstack_user_id ON techstack(user_id)",
    "CREATE INDEX IF NOT EXISTS idx_jobtitles_user_id ON jobtitles(user_id)",
    "CREATE INDEX IF NOT EXISTS idx_notes_user_id ON notes(user_id)",
    "CREATE INDEX IF NOT EXISTS idx_saved_jobs_user_id ON saved_jobs(user_id)",
    "CREATE INDEX IF NOT EXISTS idx_interviews_user_id ON interviews(user_id)",
    "CREATE INDEX IF NOT EXISTS idx_interviews_date ON interviews(user_id, date)",
    "CREATE INDEX IF NOT EXISTS idx_questions_user_id ON questions(user_id)",
    "CREATE INDEX IF NOT EXISTS idx_goals_user_id ON goals(user_id)",
    "CREATE INDEX IF NOT EXISTS idx_learning_paths_user_id ON learning_paths(user_id)",
    "CREATE INDEX IF NOT EXISTS idx_chat_messages_conv ON chat_messages(conversation_id)",
    "CREATE INDEX IF NOT EXISTS idx_chat_conversations_user ON chat_conversations(user_id)",
    "CREATE INDEX IF NOT EXISTS idx_networking_contacts_user ON networking_contacts(user_id)",
    "CREATE INDEX IF NOT EXISTS idx_referrals_user ON referrals(user_id)",
    "CREATE INDEX IF NOT EXISTS idx_companies_user ON companies(user_id)",
    "CREATE INDEX IF NOT EXISTS idx_portfolio_items_user ON portfolio_items(user_id)",
    "CREATE INDEX IF NOT EXISTS idx_documents_user ON documents(user_id)",
    "CREATE INDEX IF NOT EXISTS idx_reminders_user_date ON reminders(user_id, date)",
  ];
  for (const sql of indexes) {
    try { db.exec(sql); } catch {}
  }
}

// Categories CRUD
export function getCategories(scope?: string, userId: string = "default") {
  if (scope) {
    return getDb().prepare("SELECT * FROM categories WHERE (scope = ? OR scope = 'global') AND user_id = ? ORDER BY name").all(scope, userId);
  }
  return getDb().prepare("SELECT * FROM categories WHERE user_id = ? ORDER BY scope, name").all(userId);
}

export function createCategory(data: { name: string; color: string; scope: string }, userId: string = "default") {
  const stmt = getDb().prepare(
    "INSERT INTO categories (name, color, scope, user_id) VALUES (?, ?, ?, ?)"
  );
  return stmt.run(data.name, data.color, data.scope, userId);
}

export function updateCategory(id: number, data: { name: string; color: string; scope: string }, userId: string = "default") {
  const stmt = getDb().prepare(
    "UPDATE categories SET name = ?, color = ?, scope = ? WHERE id = ? AND user_id = ?"
  );
  return stmt.run(data.name, data.color, data.scope, id, userId);
}

export function deleteCategory(id: number, userId: string = "default") {
  return getDb().prepare("DELETE FROM categories WHERE id = ? AND user_id = ?").run(id, userId);
}

// Certifications CRUD
export function getCertifications(userId: string = "default") {
  return getDb().prepare("SELECT * FROM certifications WHERE user_id = ? ORDER BY category, name").all(userId);
}

export function getCertification(id: number, userId: string = "default") {
  return getDb().prepare("SELECT * FROM certifications WHERE id = ? AND user_id = ?").get(id, userId);
}

export function createCertification(data: { name: string; category: string; image_url: string; price: number; expiration_date: string; exam_date: string; status: string }, userId: string = "default") {
  const stmt = getDb().prepare(
    "INSERT INTO certifications (name, category, image_url, price, expiration_date, exam_date, status, user_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?)"
  );
  return stmt.run(data.name, data.category, data.image_url, data.price, data.expiration_date, data.exam_date, data.status || "PLANNING", userId);
}

export function updateCertification(id: number, data: { name: string; category: string; image_url: string; price: number; expiration_date: string; exam_date: string; status: string }, userId: string = "default") {
  const stmt = getDb().prepare(
    "UPDATE certifications SET name = ?, category = ?, image_url = ?, price = ?, expiration_date = ?, exam_date = ?, status = ? WHERE id = ? AND user_id = ?"
  );
  return stmt.run(data.name, data.category, data.image_url, data.price, data.expiration_date, data.exam_date, data.status || "PLANNING", id, userId);
}

export function deleteCertification(id: number, userId: string = "default") {
  return getDb().prepare("DELETE FROM certifications WHERE id = ? AND user_id = ?").run(id, userId);
}

// Projects CRUD
export function getProjects(userId: string = "default") {
  return getDb().prepare("SELECT * FROM projects WHERE user_id = ? ORDER BY category, name").all(userId);
}

export function getProject(id: number, userId: string = "default") {
  return getDb().prepare("SELECT * FROM projects WHERE id = ? AND user_id = ?").get(id, userId);
}

export function createProject(data: { name: string; status: string; technologies: string; category: string; deadline: string; description: string; goal: string }, userId: string = "default") {
  const stmt = getDb().prepare(
    "INSERT INTO projects (name, status, technologies, category, deadline, description, goal, user_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?)"
  );
  return stmt.run(data.name, data.status, data.technologies, data.category, data.deadline, data.description, data.goal, userId);
}

export function updateProject(id: number, data: { name: string; status: string; technologies: string; category: string; deadline: string; description: string; goal: string }, userId: string = "default") {
  const stmt = getDb().prepare(
    "UPDATE projects SET name = ?, status = ?, technologies = ?, category = ?, deadline = ?, description = ?, goal = ? WHERE id = ? AND user_id = ?"
  );
  return stmt.run(data.name, data.status, data.technologies, data.category, data.deadline, data.description, data.goal, id, userId);
}

export function deleteProject(id: number, userId: string = "default") {
  return getDb().prepare("DELETE FROM projects WHERE id = ? AND user_id = ?").run(id, userId);
}

// TechStack CRUD
export function getTechStack(userId: string = "default") {
  return getDb().prepare("SELECT * FROM techstack WHERE user_id = ? ORDER BY category, name").all(userId);
}

export function getTechItem(id: number, userId: string = "default") {
  return getDb().prepare("SELECT * FROM techstack WHERE id = ? AND user_id = ?").get(id, userId);
}

export function createTechItem(data: { name: string; category: string; proficiency_goal: string; image_url: string }, userId: string = "default") {
  const stmt = getDb().prepare(
    "INSERT INTO techstack (name, category, proficiency_goal, image_url, user_id) VALUES (?, ?, ?, ?, ?)"
  );
  return stmt.run(data.name, data.category, data.proficiency_goal, data.image_url, userId);
}

export function updateTechItem(id: number, data: { name: string; category: string; proficiency_goal: string; image_url: string }, userId: string = "default") {
  const stmt = getDb().prepare(
    "UPDATE techstack SET name = ?, category = ?, proficiency_goal = ?, image_url = ? WHERE id = ? AND user_id = ?"
  );
  return stmt.run(data.name, data.category, data.proficiency_goal, data.image_url, id, userId);
}

export function deleteTechItem(id: number, userId: string = "default") {
  return getDb().prepare("DELETE FROM techstack WHERE id = ? AND user_id = ?").run(id, userId);
}

// JobTitles CRUD
export function getJobTitles(userId: string = "default") {
  return getDb().prepare("SELECT * FROM jobtitles WHERE user_id = ? ORDER BY category, title").all(userId);
}

export function getJobTitle(id: number, userId: string = "default") {
  return getDb().prepare("SELECT * FROM jobtitles WHERE id = ? AND user_id = ?").get(id, userId);
}

export function createJobTitle(data: any, userId: string = "default") {
  const stmt = getDb().prepare(
    "INSERT INTO jobtitles (title, company, category, location, salary_min, salary_max, description, tech_stack, icon, user_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)"
  );
  return stmt.run(data.title, data.company, data.category, data.location, data.salary_min, data.salary_max, data.description, data.tech_stack, data.icon || '', userId);
}

export function updateJobTitle(id: number, data: any, userId: string = "default") {
  const stmt = getDb().prepare(
    "UPDATE jobtitles SET title = ?, company = ?, category = ?, location = ?, salary_min = ?, salary_max = ?, description = ?, tech_stack = ?, icon = ? WHERE id = ? AND user_id = ?"
  );
  return stmt.run(data.title, data.company, data.category, data.location, data.salary_min, data.salary_max, data.description, data.tech_stack, data.icon || '', id, userId);
}

export function deleteJobTitle(id: number, userId: string = "default") {
  return getDb().prepare("DELETE FROM jobtitles WHERE id = ? AND user_id = ?").run(id, userId);
}

// Reminders CRUD
export function getReminders(userId: string = "default") {
  return getDb().prepare("SELECT * FROM reminders WHERE user_id = ? ORDER BY date").all(userId);
}

export function createReminder(data: { title: string; date: string; type: string; category: string; color: string; reference_id: number | null }, userId: string = "default") {
  const stmt = getDb().prepare(
    "INSERT INTO reminders (title, date, type, category, color, reference_id, user_id) VALUES (?, ?, ?, ?, ?, ?, ?)"
  );
  return stmt.run(data.title, data.date, data.type, data.category, data.color, data.reference_id, userId);
}

export function updateReminder(id: number, data: { title: string; date: string; type: string; category: string; color: string }, userId: string = "default") {
  const stmt = getDb().prepare(
    "UPDATE reminders SET title = ?, date = ?, type = ?, category = ?, color = ? WHERE id = ? AND user_id = ?"
  );
  return stmt.run(data.title, data.date, data.type, data.category, data.color, id, userId);
}

export function deleteReminder(id: number, userId: string = "default") {
  return getDb().prepare("DELETE FROM reminders WHERE id = ? AND user_id = ?").run(id, userId);
}

// Assistant Sessions
export function createAssistantSession(data: { type: string; input_text: string; result_json: string; score: number | null; model_used: string }, userId: string = "default") {
  const stmt = getDb().prepare(
    "INSERT INTO assistant_sessions (type, input_text, result_json, score, model_used, user_id) VALUES (?, ?, ?, ?, ?, ?)"
  );
  return stmt.run(data.type, data.input_text, data.result_json, data.score, data.model_used, userId);
}

export function getAssistantSessions(userId: string = "default") {
  return getDb().prepare("SELECT * FROM assistant_sessions WHERE user_id = ? ORDER BY created_at DESC").all(userId);
}

// Model Config (shared/global — not user-scoped)
export function getModelConfigs() {
  return getDb().prepare("SELECT * FROM model_config ORDER BY is_default DESC, provider, model_name").all();
}

export function getDefaultModel() {
  return getDb().prepare("SELECT * FROM model_config WHERE is_default = 1").get();
}

export function createModelConfig(data: { provider: string; model_name: string; api_key: string; base_url: string; temperature: number; max_tokens: number; top_p: number; is_default: number }) {
  const stmt = getDb().prepare(
    "INSERT INTO model_config (provider, model_name, api_key, base_url, temperature, max_tokens, top_p, is_default) VALUES (?, ?, ?, ?, ?, ?, ?, ?)"
  );
  return stmt.run(data.provider, data.model_name, data.api_key, data.base_url, data.temperature, data.max_tokens, data.top_p, data.is_default);
}

export function updateModelConfig(id: number, data: { provider: string; model_name: string; api_key: string; base_url: string; temperature: number; max_tokens: number; top_p: number; is_default: number }) {
  const stmt = getDb().prepare(
    "UPDATE model_config SET provider = ?, model_name = ?, api_key = ?, base_url = ?, temperature = ?, max_tokens = ?, top_p = ?, is_default = ? WHERE id = ?"
  );
  return stmt.run(data.provider, data.model_name, data.api_key, data.base_url, data.temperature, data.max_tokens, data.top_p, data.is_default, id);
}

export function deleteModelConfig(id: number) {
  return getDb().prepare("DELETE FROM model_config WHERE id = ?").run(id);
}

export function setDefaultModel(id: number) {
  getDb().prepare("UPDATE model_config SET is_default = 0").run();
  getDb().prepare("UPDATE model_config SET is_default = 1 WHERE id = ?").run(id);
}

// Chat Conversations
export function getConversations(userId: string = "default") {
  return getDb().prepare("SELECT * FROM chat_conversations WHERE user_id = ? ORDER BY updated_at DESC").all(userId);
}

export function getConversation(id: number, userId: string = "default") {
  return getDb().prepare("SELECT * FROM chat_conversations WHERE id = ? AND user_id = ?").get(id, userId);
}

export function createConversation(data: { title: string; model_used: string; context_snapshot: string }, userId: string = "default") {
  const stmt = getDb().prepare(
    "INSERT INTO chat_conversations (title, model_used, context_snapshot, user_id) VALUES (?, ?, ?, ?)"
  );
  const result = stmt.run(data.title, data.model_used, data.context_snapshot, userId);
  return getConversation(result.lastInsertRowid as number, userId);
}

export function updateConversation(id: number, data: { title?: string; model_used?: string }, userId: string = "default") {
  const fields: string[] = ["updated_at = datetime('now')"];
  const values: any[] = [];
  if (data.title !== undefined) { fields.push("title = ?"); values.push(data.title); }
  if (data.model_used !== undefined) { fields.push("model_used = ?"); values.push(data.model_used); }
  values.push(id, userId);
  return getDb().prepare(`UPDATE chat_conversations SET ${fields.join(", ")} WHERE id = ? AND user_id = ?`).run(...values);
}

export function deleteConversation(id: number, userId: string = "default") {
  getDb().prepare("DELETE FROM chat_messages WHERE conversation_id = ?").run(id);
  return getDb().prepare("DELETE FROM chat_conversations WHERE id = ? AND user_id = ?").run(id, userId);
}

// Chat Messages
export function getMessages(conversationId: number) {
  return getDb().prepare("SELECT * FROM chat_messages WHERE conversation_id = ? ORDER BY created_at ASC").all(conversationId);
}

export function createMessage(data: { conversation_id: number; role: string; content: string; attachments: string; message_type: string; model_used: string }) {
  const stmt = getDb().prepare(
    "INSERT INTO chat_messages (conversation_id, role, content, attachments, message_type, model_used) VALUES (?, ?, ?, ?, ?, ?)"
  );
  const result = stmt.run(data.conversation_id, data.role, data.content, data.attachments, data.message_type, data.model_used);
  getDb().prepare("UPDATE chat_conversations SET updated_at = datetime('now') WHERE id = ?").run(data.conversation_id);
  return getDb().prepare("SELECT * FROM chat_messages WHERE id = ?").get(result.lastInsertRowid as number);
}

export function deleteMessage(id: number) {
  return getDb().prepare("DELETE FROM chat_messages WHERE id = ?").run(id);
}

// Get context snapshot for chat conversations
export function getConversationContext(userId: string = "default") {
  const jobTitles = getDb().prepare("SELECT title, company, location, salary_min, salary_max, category FROM jobtitles WHERE user_id = ?").all(userId) as any[];
  const projects = getDb().prepare("SELECT name, status, technologies, category, description FROM projects WHERE user_id = ?").all(userId) as any[];
  const techStack = getDb().prepare("SELECT name, category, proficiency_goal FROM techstack WHERE user_id = ?").all(userId) as any[];
  const certifications = getDb().prepare("SELECT name, category, price, expiration_date, status FROM certifications WHERE user_id = ?").all(userId) as any[];
  const background = getBackground(userId);
  return { jobTitles, projects, techStack, certifications, background };
}

// Applications CRUD
export function getApplications(userId: string = "default") {
  return getDb().prepare("SELECT * FROM applications WHERE user_id = ? ORDER BY created_at DESC").all(userId);
}

export function getApplication(id: number, userId: string = "default") {
  return getDb().prepare("SELECT * FROM applications WHERE id = ? AND user_id = ?").get(id, userId);
}

export function createApplication(data: { company: string; position: string; status: string; date_applied: string; location: string; salary_min: number; salary_max: number; notes: string; url: string; category: string; interview_date: string }, userId: string = "default") {
  const stmt = getDb().prepare(
    "INSERT INTO applications (company, position, status, date_applied, location, salary_min, salary_max, notes, url, category, interview_date, user_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)"
  );
  return stmt.run(data.company, data.position, data.status || "APPLIED", data.date_applied, data.location, data.salary_min, data.salary_max, data.notes, data.url, data.category, data.interview_date, userId);
}

export function updateApplication(id: number, data: { company: string; position: string; status: string; date_applied: string; location: string; salary_min: number; salary_max: number; notes: string; url: string; category: string; interview_date: string }, userId: string = "default") {
  const stmt = getDb().prepare(
    "UPDATE applications SET company = ?, position = ?, status = ?, date_applied = ?, location = ?, salary_min = ?, salary_max = ?, notes = ?, url = ?, category = ?, interview_date = ? WHERE id = ? AND user_id = ?"
  );
  return stmt.run(data.company, data.position, data.status, data.date_applied, data.location, data.salary_min, data.salary_max, data.notes, data.url, data.category, data.interview_date, id, userId);
}

export function deleteApplication(id: number, userId: string = "default") {
  return getDb().prepare("DELETE FROM applications WHERE id = ? AND user_id = ?").run(id, userId);
}

// Notes CRUD
export function getNotes(userId: string = "default") {
  return getDb().prepare("SELECT * FROM notes WHERE user_id = ? ORDER BY pinned DESC, updated_at DESC").all(userId);
}

export function getNote(id: number, userId: string = "default") {
  return getDb().prepare("SELECT * FROM notes WHERE id = ? AND user_id = ?").get(id, userId);
}

export function createNote(data: { title: string; content: string; category: string; color: string; pinned: number }, userId: string = "default") {
  const stmt = getDb().prepare(
    "INSERT INTO notes (title, content, category, color, pinned, user_id) VALUES (?, ?, ?, ?, ?, ?)"
  );
  return stmt.run(data.title, data.content, data.category, data.color || "#00F5FF", data.pinned ? 1 : 0, userId);
}

export function updateNote(id: number, data: { title: string; content: string; category: string; color: string; pinned: number }, userId: string = "default") {
  const stmt = getDb().prepare(
    "UPDATE notes SET title = ?, content = ?, category = ?, color = ?, pinned = ?, updated_at = datetime('now') WHERE id = ? AND user_id = ?"
  );
  return stmt.run(data.title, data.content, data.category, data.color, data.pinned ? 1 : 0, id, userId);
}

export function deleteNote(id: number, userId: string = "default") {
  return getDb().prepare("DELETE FROM notes WHERE id = ? AND user_id = ?").run(id, userId);
}

// Analytics aggregation
export function getAnalyticsData(userId: string = "default") {
  const d = getDb();
  const totalApplications = (d.prepare("SELECT COUNT(*) as c FROM applications WHERE user_id = ?").get(userId) as any).c;
  const appsByStatus = d.prepare("SELECT status, COUNT(*) as c FROM applications WHERE user_id = ? GROUP BY status").all(userId) as any[];
  const totalCertifications = (d.prepare("SELECT COUNT(*) as c FROM certifications WHERE user_id = ?").get(userId) as any).c;
  const certsByStatus = d.prepare("SELECT status, COUNT(*) as c FROM certifications WHERE user_id = ? GROUP BY status").all(userId) as any[];
  const totalProjects = (d.prepare("SELECT COUNT(*) as c FROM projects WHERE user_id = ?").get(userId) as any).c;
  const projectsByStatus = d.prepare("SELECT status, COUNT(*) as c FROM projects WHERE user_id = ? GROUP BY status").all(userId) as any[];
  const totalSkills = (d.prepare("SELECT COUNT(*) as c FROM techstack WHERE user_id = ?").get(userId) as any).c;
  const totalJobTargets = (d.prepare("SELECT COUNT(*) as c FROM jobtitles WHERE user_id = ?").get(userId) as any).c;
  const salaryRanges = d.prepare("SELECT title, salary_min as min, salary_max as max FROM jobtitles WHERE salary_max > 0 AND user_id = ?").all(userId) as any[];
  const skillsCoverage = d.prepare("SELECT name as skill, category FROM techstack WHERE user_id = ?").all(userId) as any[];

  const applicationsByStatus: Record<string, number> = {};
  appsByStatus.forEach((r: any) => { applicationsByStatus[r.status] = r.c; });
  const certsByStatusMap: Record<string, number> = {};
  certsByStatus.forEach((r: any) => { certsByStatusMap[r.status || "PLANNING"] = r.c; });
  const projectsByStatusMap: Record<string, number> = {};
  projectsByStatus.forEach((r: any) => { projectsByStatusMap[r.status] = r.c; });

  // Calculate skill demand from job targets
  const allJobs = d.prepare("SELECT tech_stack FROM jobtitles WHERE tech_stack != '' AND user_id = ?").all(userId) as any[];
  const skillDemand: Record<string, number> = {};
  allJobs.forEach((j: any) => {
    const skills = j.tech_stack.split(",").map((s: string) => s.trim().toLowerCase());
    skills.forEach((s: string) => { if (s) skillDemand[s] = (skillDemand[s] || 0) + 1; });
  });
  const skillsWithDemand = skillsCoverage.map((s: any) => ({
    skill: s.skill,
    category: s.category,
    demand: skillDemand[s.skill.toLowerCase()] || 0,
  }));

  return {
    totalApplications,
    applicationsByStatus,
    totalCertifications,
    certsByStatus: certsByStatusMap,
    totalProjects,
    projectsByStatus: projectsByStatusMap,
    totalSkills,
    totalJobTargets,
    salaryRanges,
    skillsCoverage: skillsWithDemand,
  };
}

// Calendar events aggregation
export function getCalendarEvents(userId: string = "default") {
  const d = getDb();
  const events: Array<{ date: string; title: string; source: string; color: string; sourceId: number }> = [];

  // Certifications
  const certs = d.prepare("SELECT id, name, exam_date, expiration_date FROM certifications WHERE user_id = ?").all(userId) as any[];
  certs.forEach((c: any) => {
    if (c.exam_date) events.push({ date: c.exam_date, title: `${c.name} (Exam)`, source: "certification", color: "#00F5FF", sourceId: c.id });
    if (c.expiration_date) events.push({ date: c.expiration_date, title: `${c.name} (Expires)`, source: "certification", color: "#FF2D55", sourceId: c.id });
  });

  // Projects
  const projects = d.prepare("SELECT id, name, deadline FROM projects WHERE deadline != '' AND status != 'DONE' AND user_id = ?").all(userId) as any[];
  projects.forEach((p: any) => {
    events.push({ date: p.deadline, title: `${p.name} (Deadline)`, source: "project", color: "#BF00FF", sourceId: p.id });
  });

  // Reminders
  const reminders = d.prepare("SELECT id, title, date, color FROM reminders WHERE user_id = ?").all(userId) as any[];
  reminders.forEach((r: any) => {
    events.push({ date: r.date, title: r.title, source: "reminder", color: r.color || "#FF8C00", sourceId: r.id });
  });

  // Applications
  const apps = d.prepare("SELECT id, company, position, date_applied, interview_date FROM applications WHERE user_id = ?").all(userId) as any[];
  apps.forEach((a: any) => {
    if (a.date_applied) events.push({ date: a.date_applied, title: `${a.position} at ${a.company} (Applied)`, source: "application", color: "#00FF88", sourceId: a.id });
    if (a.interview_date) events.push({ date: a.interview_date, title: `${a.position} at ${a.company} (Interview)`, source: "application", color: "#FFD700", sourceId: a.id });
  });

  // Custom calendar events (manual + Google synced)
  const customEvents = d.prepare("SELECT id, title, date, source, color, description FROM calendar_events WHERE user_id = ?").all(userId) as any[];
  customEvents.forEach((e: any) => {
    events.push({ date: e.date, title: e.title, source: e.source || "manual", color: e.color || "#00F5FF", sourceId: e.id });
  });

  // GitHub activity — group by date
  const ghEvents = d.prepare("SELECT id, event_type, repo_name, title, url, github_created_at FROM github_activity WHERE user_id = ? AND github_created_at != ''").all(userId) as any[];
  const ghByDate: Record<string, any[]> = {};
  ghEvents.forEach((e: any) => {
    const date = e.github_created_at.substring(0, 10);
    if (!ghByDate[date]) ghByDate[date] = [];
    ghByDate[date].push(e);
  });
  Object.entries(ghByDate).forEach(([date, evts]) => {
    const count = evts.length;
    const types = [...new Set(evts.map(e => e.event_type))];
    events.push({ date, title: `${count} GitHub event${count > 1 ? "s" : ""} (${types.join(", ")})`, source: "github", color: "#6e40c9", sourceId: evts[0].id });
  });

  return events;
}

// Saved Jobs CRUD
export function getSavedJobs(userId: string = "default") { return getDb().prepare("SELECT * FROM saved_jobs WHERE user_id = ? ORDER BY created_at DESC").all(userId); }
export function getSavedJob(id: number, userId: string = "default") { return getDb().prepare("SELECT * FROM saved_jobs WHERE id = ? AND user_id = ?").get(id, userId); }
export function createSavedJob(data: any, userId: string = "default") {
  return getDb().prepare("INSERT INTO saved_jobs (title, company, url, location, salary_min, salary_max, description, category, match_score, status, date_saved, notes, user_id) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)").run(data.title, data.company, data.url, data.location, data.salary_min, data.salary_max, data.description, data.category, data.match_score, data.status || "BOOKMARKED", data.date_saved, data.notes, userId);
}
export function updateSavedJob(id: number, data: any, userId: string = "default") {
  return getDb().prepare("UPDATE saved_jobs SET title=?,company=?,url=?,location=?,salary_min=?,salary_max=?,description=?,category=?,match_score=?,status=?,date_saved=?,notes=? WHERE id=? AND user_id=?").run(data.title, data.company, data.url, data.location, data.salary_min, data.salary_max, data.description, data.category, data.match_score, data.status, data.date_saved, data.notes, id, userId);
}
export function deleteSavedJob(id: number, userId: string = "default") { return getDb().prepare("DELETE FROM saved_jobs WHERE id = ? AND user_id = ?").run(id, userId); }

// Referrals CRUD
export function getReferrals(userId: string = "default") { return getDb().prepare("SELECT * FROM referrals WHERE user_id = ? ORDER BY created_at DESC").all(userId); }
export function getReferral(id: number, userId: string = "default") { return getDb().prepare("SELECT * FROM referrals WHERE id = ? AND user_id = ?").get(id, userId); }
export function createReferral(data: any, userId: string = "default") {
  return getDb().prepare("INSERT INTO referrals (contact_name, contact_email, company, position, status, date_referred, notes, referral_url, user_id) VALUES (?,?,?,?,?,?,?,?,?)").run(data.contact_name, data.contact_email, data.company, data.position, data.status || "PENDING", data.date_referred, data.notes, data.referral_url, userId);
}
export function updateReferral(id: number, data: any, userId: string = "default") {
  return getDb().prepare("UPDATE referrals SET contact_name=?,contact_email=?,company=?,position=?,status=?,date_referred=?,notes=?,referral_url=? WHERE id=? AND user_id=?").run(data.contact_name, data.contact_email, data.company, data.position, data.status, data.date_referred, data.notes, data.referral_url, id, userId);
}
export function deleteReferral(id: number, userId: string = "default") { return getDb().prepare("DELETE FROM referrals WHERE id = ? AND user_id = ?").run(id, userId); }

// Networking Contacts CRUD
export function getNetworkingContacts(userId: string = "default") { return getDb().prepare("SELECT * FROM networking_contacts WHERE user_id = ? ORDER BY created_at DESC").all(userId); }
export function getNetworkingContact(id: number, userId: string = "default") { return getDb().prepare("SELECT * FROM networking_contacts WHERE id = ? AND user_id = ?").get(id, userId); }
export function createNetworkingContact(data: any, userId: string = "default") {
  return getDb().prepare("INSERT INTO networking_contacts (name, email, company, role, linkedin_url, category, last_contact_date, next_follow_up, notes, status, user_id) VALUES (?,?,?,?,?,?,?,?,?,?,?)").run(data.name, data.email, data.company, data.role, data.linkedin_url, data.category || "CONNECTION", data.last_contact_date, data.next_follow_up, data.notes, data.status || "ACTIVE", userId);
}
export function updateNetworkingContact(id: number, data: any, userId: string = "default") {
  return getDb().prepare("UPDATE networking_contacts SET name=?,email=?,company=?,role=?,linkedin_url=?,category=?,last_contact_date=?,next_follow_up=?,notes=?,status=? WHERE id=? AND user_id=?").run(data.name, data.email, data.company, data.role, data.linkedin_url, data.category, data.last_contact_date, data.next_follow_up, data.notes, data.status, id, userId);
}
export function deleteNetworkingContact(id: number, userId: string = "default") { return getDb().prepare("DELETE FROM networking_contacts WHERE id = ? AND user_id = ?").run(id, userId); }

// Interviews CRUD
export function getInterviews(userId: string = "default") { return getDb().prepare("SELECT * FROM interviews WHERE user_id = ? ORDER BY date DESC, time DESC").all(userId); }
export function getInterview(id: number, userId: string = "default") { return getDb().prepare("SELECT * FROM interviews WHERE id = ? AND user_id = ?").get(id, userId); }
export function createInterview(data: any, userId: string = "default") {
  return getDb().prepare("INSERT INTO interviews (company, position, round_type, date, time, location, interviewer_name, feedback, status, prep_notes, user_id) VALUES (?,?,?,?,?,?,?,?,?,?,?)").run(data.company, data.position, data.round_type || "PHONE", data.date, data.time, data.location, data.interviewer_name, data.feedback, data.status || "SCHEDULED", data.prep_notes, userId);
}
export function updateInterview(id: number, data: any, userId: string = "default") {
  return getDb().prepare("UPDATE interviews SET company=?,position=?,round_type=?,date=?,time=?,location=?,interviewer_name=?,feedback=?,status=?,prep_notes=? WHERE id=? AND user_id=?").run(data.company, data.position, data.round_type, data.date, data.time, data.location, data.interviewer_name, data.feedback, data.status, data.prep_notes, id, userId);
}
export function deleteInterview(id: number, userId: string = "default") { return getDb().prepare("DELETE FROM interviews WHERE id = ? AND user_id = ?").run(id, userId); }

// Questions CRUD
export function getQuestions(userId: string = "default") { return getDb().prepare("SELECT * FROM questions WHERE user_id = ? ORDER BY created_at DESC").all(userId); }
export function getQuestion(id: number, userId: string = "default") { return getDb().prepare("SELECT * FROM questions WHERE id = ? AND user_id = ?").get(id, userId); }
export function createQuestion(data: any, userId: string = "default") {
  return getDb().prepare("INSERT INTO questions (question, answer, category, difficulty, company, tags, role_id, times_practiced, user_id) VALUES (?,?,?,?,?,?,?,?,?)").run(data.question, data.answer, data.category || "TECHNICAL", data.difficulty || "MEDIUM", data.company, data.tags, data.role_id || 0, data.times_practiced || 0, userId);
}
export function updateQuestion(id: number, data: any, userId: string = "default") {
  return getDb().prepare("UPDATE questions SET question=?,answer=?,category=?,difficulty=?,company=?,tags=?,role_id=?,times_practiced=? WHERE id=? AND user_id=?").run(data.question, data.answer, data.category, data.difficulty, data.company, data.tags, data.role_id || 0, data.times_practiced, id, userId);
}
export function deleteQuestion(id: number, userId: string = "default") { return getDb().prepare("DELETE FROM questions WHERE id = ? AND user_id = ?").run(id, userId); }
export function incrementQuestionPractice(id: number, userId: string = "default") { return getDb().prepare("UPDATE questions SET times_practiced = times_practiced + 1 WHERE id = ? AND user_id = ?").run(id, userId); }
export function getQuestionsByRole(roleId: number, userId: string = "default") { return getDb().prepare("SELECT * FROM questions WHERE role_id = ? AND user_id = ? ORDER BY created_at DESC").all(roleId, userId); }

// Custom Templates CRUD
export function getCustomTemplates(userId: string = "default") { return getDb().prepare("SELECT * FROM custom_templates WHERE user_id = ? ORDER BY created_at DESC").all(userId); }
export function createCustomTemplate(data: any, userId: string = "default") {
  return getDb().prepare("INSERT INTO custom_templates (name, description, icon, color, certs, skills, projects, learning, user_id) VALUES (?,?,?,?,?,?,?,?,?)").run(
    data.name, data.description || '', data.icon || '◆', data.color || '#00F5FF',
    JSON.stringify(data.certs || []), JSON.stringify(data.skills || []),
    JSON.stringify(data.projects || []), JSON.stringify(data.learning || []), userId
  );
}
export function updateCustomTemplate(id: number, data: any, userId: string = "default") {
  return getDb().prepare("UPDATE custom_templates SET name=?,description=?,icon=?,color=?,certs=?,skills=?,projects=?,learning=? WHERE id=? AND user_id=?").run(
    data.name, data.description || '', data.icon || '◆', data.color || '#00F5FF',
    JSON.stringify(data.certs || []), JSON.stringify(data.skills || []),
    JSON.stringify(data.projects || []), JSON.stringify(data.learning || []), id, userId
  );
}
export function deleteCustomTemplate(id: number, userId: string = "default") { return getDb().prepare("DELETE FROM custom_templates WHERE id = ? AND user_id = ?").run(id, userId); }

// Interview Roles CRUD
export function getInterviewRoles(userId: string = "default") { return getDb().prepare("SELECT * FROM interview_roles WHERE user_id = ? ORDER BY created_at DESC").all(userId); }
export function createInterviewRole(data: any, userId: string = "default") {
  return getDb().prepare("INSERT INTO interview_roles (name, company, description, color, user_id) VALUES (?,?,?,?,?)").run(
    data.name, data.company || '', data.description || '', data.color || '#00F5FF', userId
  );
}
export function deleteInterviewRole(id: number, userId: string = "default") { return getDb().prepare("DELETE FROM interview_roles WHERE id = ? AND user_id = ?").run(id, userId); }

// Goals CRUD
export function getGoals(userId: string = "default") { return getDb().prepare("SELECT * FROM goals WHERE user_id = ? ORDER BY created_at DESC").all(userId); }
export function createGoal(data: any, userId: string = "default") {
  return getDb().prepare("INSERT INTO goals (title, description, category, target_date, status, progress, milestones, user_id) VALUES (?,?,?,?,?,?,?,?)").run(
    data.title, data.description || '', data.category || 'CAREER', data.target_date || '',
    data.status || 'NOT STARTED', data.progress || 0, JSON.stringify(data.milestones || []), userId
  );
}
export function updateGoal(id: number, data: any, userId: string = "default") {
  return getDb().prepare("UPDATE goals SET title=?,description=?,category=?,target_date=?,status=?,progress=?,milestones=? WHERE id=? AND user_id=?").run(
    data.title, data.description || '', data.category, data.target_date || '',
    data.status, data.progress || 0, JSON.stringify(data.milestones || []), id, userId
  );
}
export function deleteGoal(id: number, userId: string = "default") { return getDb().prepare("DELETE FROM goals WHERE id = ? AND user_id = ?").run(id, userId); }

// Roadmaps CRUD
export function getRoadmaps(userId: string = "default") { return getDb().prepare("SELECT * FROM roadmaps WHERE user_id = ? ORDER BY created_at DESC").all(userId); }
export function createRoadmap(data: any, userId: string = "default") {
  return getDb().prepare("INSERT INTO roadmaps (title, target_role, phases_json, color, model_used, user_id) VALUES (?,?,?,?,?,?)").run(
    data.title, data.target_role, JSON.stringify(data.phases || []), data.color || '#00F5FF', data.model_used || '', userId
  );
}
export function deleteRoadmap(id: number, userId: string = "default") { return getDb().prepare("DELETE FROM roadmaps WHERE id = ? AND user_id = ?").run(id, userId); }

// User Background CRUD
export function getBackground(userId: string = "default") { return getDb().prepare("SELECT * FROM user_background WHERE user_id = ? LIMIT 1").get(userId) || null; }
export function upsertBackground(data: any, userId: string = "default") {
  const existing = getBackground(userId);
  if (existing) {
    return getDb().prepare("UPDATE user_background SET current_role=?, employment_status=?, years_experience=?, education_level=?, industry_focus=?, bio=?, location=?, desired_salary_min=?, desired_salary_max=? WHERE user_id=?").run(
      data.current_role, data.employment_status, data.years_experience, data.education_level, data.industry_focus, data.bio, data.location, data.desired_salary_min, data.desired_salary_max, userId
    );
  }
  return getDb().prepare("INSERT INTO user_background (current_role, employment_status, years_experience, education_level, industry_focus, bio, location, desired_salary_min, desired_salary_max, user_id) VALUES (?,?,?,?,?,?,?,?,?,?)").run(
    data.current_role, data.employment_status, data.years_experience, data.education_level, data.industry_focus, data.bio, data.location, data.desired_salary_min, data.desired_salary_max, userId
  );
}

// Companies CRUD
export function getCompanies(userId: string = "default") { return getDb().prepare("SELECT * FROM companies WHERE user_id = ? ORDER BY created_at DESC").all(userId); }
export function createCompany(data: any, userId: string = "default") {
  return getDb().prepare("INSERT INTO companies (name, industry, size, location, website, glassdoor_rating, tech_stack, culture_notes, contacts, status, color, user_id) VALUES (?,?,?,?,?,?,?,?,?,?,?,?)").run(
    data.name, data.industry || '', data.size || '', data.location || '', data.website || '',
    data.glassdoor_rating || 0, data.tech_stack || '', data.culture_notes || '', data.contacts || '',
    data.status || 'RESEARCHING', data.color || '#00F5FF', userId
  );
}
export function updateCompany(id: number, data: any, userId: string = "default") {
  return getDb().prepare("UPDATE companies SET name=?,industry=?,size=?,location=?,website=?,glassdoor_rating=?,tech_stack=?,culture_notes=?,contacts=?,status=?,color=? WHERE id=? AND user_id=?").run(
    data.name, data.industry || '', data.size || '', data.location || '', data.website || '',
    data.glassdoor_rating || 0, data.tech_stack || '', data.culture_notes || '', data.contacts || '',
    data.status, data.color || '#00F5FF', id, userId
  );
}
export function deleteCompany(id: number, userId: string = "default") { return getDb().prepare("DELETE FROM companies WHERE id = ? AND user_id = ?").run(id, userId); }

// Learning Paths CRUD
export function getLearningPaths(userId: string = "default") { return getDb().prepare("SELECT * FROM learning_paths WHERE user_id = ? ORDER BY priority DESC, created_at DESC").all(userId); }
export function getLearningPath(id: number, userId: string = "default") { return getDb().prepare("SELECT * FROM learning_paths WHERE id = ? AND user_id = ?").get(id, userId); }
export function createLearningPath(data: any, userId: string = "default") {
  return getDb().prepare("INSERT INTO learning_paths (title, url, resource_type, skill_category, status, progress_pct, notes, priority, user_id) VALUES (?,?,?,?,?,?,?,?,?)").run(data.title, data.url, data.resource_type || "COURSE", data.skill_category, data.status || "NOT STARTED", data.progress_pct || 0, data.notes, data.priority || 0, userId);
}
export function updateLearningPath(id: number, data: any, userId: string = "default") {
  return getDb().prepare("UPDATE learning_paths SET title=?,url=?,resource_type=?,skill_category=?,status=?,progress_pct=?,notes=?,priority=? WHERE id=? AND user_id=?").run(data.title, data.url, data.resource_type, data.skill_category, data.status, data.progress_pct, data.notes, data.priority, id, userId);
}
export function deleteLearningPath(id: number, userId: string = "default") { return getDb().prepare("DELETE FROM learning_paths WHERE id = ? AND user_id = ?").run(id, userId); }

// Documents CRUD
export function getDocuments(userId: string = "default") { return getDb().prepare("SELECT * FROM documents WHERE user_id = ? ORDER BY created_at DESC").all(userId); }
export function getDocument(id: number, userId: string = "default") { return getDb().prepare("SELECT * FROM documents WHERE id = ? AND user_id = ?").get(id, userId); }
export function createDocument(data: any, userId: string = "default") {
  return getDb().prepare("INSERT INTO documents (title, doc_type, url, content_text, tags, version, notes, user_id) VALUES (?,?,?,?,?,?,?,?)").run(data.title, data.doc_type || "OTHER", data.url, data.content_text, data.tags, data.version || "1.0", data.notes, userId);
}
export function updateDocument(id: number, data: any, userId: string = "default") {
  return getDb().prepare("UPDATE documents SET title=?,doc_type=?,url=?,content_text=?,tags=?,version=?,notes=? WHERE id=? AND user_id=?").run(data.title, data.doc_type, data.url, data.content_text, data.tags, data.version, data.notes, id, userId);
}
export function deleteDocument(id: number, userId: string = "default") { return getDb().prepare("DELETE FROM documents WHERE id = ? AND user_id = ?").run(id, userId); }

// Portfolio Items CRUD
export function getPortfolioItems(userId: string = "default") { return getDb().prepare("SELECT * FROM portfolio_items WHERE user_id = ? ORDER BY featured DESC, created_at DESC").all(userId); }
export function getPortfolioItem(id: number, userId: string = "default") { return getDb().prepare("SELECT * FROM portfolio_items WHERE id = ? AND user_id = ?").get(id, userId); }
export function createPortfolioItem(data: any, userId: string = "default") {
  return getDb().prepare("INSERT INTO portfolio_items (title, description, tech_stack, repo_url, live_url, image_url, category, featured, user_id) VALUES (?,?,?,?,?,?,?,?,?)").run(data.title, data.description, data.tech_stack, data.repo_url, data.live_url, data.image_url, data.category, data.featured ? 1 : 0, userId);
}
export function updatePortfolioItem(id: number, data: any, userId: string = "default") {
  return getDb().prepare("UPDATE portfolio_items SET title=?,description=?,tech_stack=?,repo_url=?,live_url=?,image_url=?,category=?,featured=? WHERE id=? AND user_id=?").run(data.title, data.description, data.tech_stack, data.repo_url, data.live_url, data.image_url, data.category, data.featured ? 1 : 0, id, userId);
}
export function deletePortfolioItem(id: number, userId: string = "default") { return getDb().prepare("DELETE FROM portfolio_items WHERE id = ? AND user_id = ?").run(id, userId); }

// Achievement data aggregation
export function getAchievementData(userId: string = "default") {
  const d = getDb();
  return {
    totalApplications: (d.prepare("SELECT COUNT(*) as c FROM applications WHERE user_id = ?").get(userId) as any).c,
    totalCertifications: (d.prepare("SELECT COUNT(*) as c FROM certifications WHERE user_id = ?").get(userId) as any).c,
    passedCertifications: (d.prepare("SELECT COUNT(*) as c FROM certifications WHERE status = 'PASSED' AND user_id = ?").get(userId) as any).c,
    totalProjects: (d.prepare("SELECT COUNT(*) as c FROM projects WHERE user_id = ?").get(userId) as any).c,
    totalSkills: (d.prepare("SELECT COUNT(*) as c FROM techstack WHERE user_id = ?").get(userId) as any).c,
    totalSavedJobs: (d.prepare("SELECT COUNT(*) as c FROM saved_jobs WHERE user_id = ?").get(userId) as any).c,
    totalInterviews: (d.prepare("SELECT COUNT(*) as c FROM interviews WHERE user_id = ?").get(userId) as any).c,
    totalQuestions: (d.prepare("SELECT COUNT(*) as c FROM questions WHERE user_id = ?").get(userId) as any).c,
    totalLearningPaths: (d.prepare("SELECT COUNT(*) as c FROM learning_paths WHERE user_id = ?").get(userId) as any).c,
    completedLearning: (d.prepare("SELECT COUNT(*) as c FROM learning_paths WHERE status = 'COMPLETED' AND user_id = ?").get(userId) as any).c,
    totalDocuments: (d.prepare("SELECT COUNT(*) as c FROM documents WHERE user_id = ?").get(userId) as any).c,
    totalPortfolio: (d.prepare("SELECT COUNT(*) as c FROM portfolio_items WHERE user_id = ?").get(userId) as any).c,
    totalNetworking: (d.prepare("SELECT COUNT(*) as c FROM networking_contacts WHERE user_id = ?").get(userId) as any).c,
    totalReferrals: (d.prepare("SELECT COUNT(*) as c FROM referrals WHERE user_id = ?").get(userId) as any).c,
  };
}

// Custom Providers CRUD (shared/global — not user-scoped)
export function getCustomProviders() { return getDb().prepare("SELECT * FROM custom_providers ORDER BY name").all(); }
export function createCustomProvider(data: { name: string; base_url: string; api_key: string }) {
  return getDb().prepare("INSERT INTO custom_providers (name, base_url, api_key) VALUES (?, ?, ?)").run(data.name, data.base_url, data.api_key);
}
export function deleteCustomProvider(id: number) {
  // Also delete all models for this provider
  const provider = getDb().prepare("SELECT name FROM custom_providers WHERE id = ?").get(id) as any;
  if (provider) {
    getDb().prepare("DELETE FROM provider_models WHERE provider = ?").run(provider.name);
  }
  return getDb().prepare("DELETE FROM custom_providers WHERE id = ?").run(id);
}

// Provider Models CRUD (shared/global — not user-scoped)
export function getProviderModels(provider?: string) {
  if (provider) return getDb().prepare("SELECT * FROM provider_models WHERE provider = ? ORDER BY model_name").all(provider);
  return getDb().prepare("SELECT * FROM provider_models ORDER BY provider, model_name").all();
}
export function createProviderModel(data: { provider: string; model_name: string }) {
  // Check if already exists
  const existing = getDb().prepare("SELECT id FROM provider_models WHERE provider = ? AND model_name = ?").get(data.provider, data.model_name);
  if (existing) return { lastInsertRowid: (existing as any).id };
  return getDb().prepare("INSERT INTO provider_models (provider, model_name) VALUES (?, ?)").run(data.provider, data.model_name);
}
export function deleteProviderModel(id: number) {
  return getDb().prepare("DELETE FROM provider_models WHERE id = ?").run(id);
}

// Seed default provider models if table is empty
export function seedDefaultProviderModels() {
  const count = (getDb().prepare("SELECT COUNT(*) as c FROM provider_models").get() as any).c;
  if (count > 0) return;

  const defaults: Record<string, string[]> = {
    openai: ["gpt-4o", "gpt-4o-mini", "gpt-4-turbo", "o1", "o1-mini", "o3-mini"],
    anthropic: ["claude-sonnet-4-20250514", "claude-3-5-sonnet-20241022", "claude-3-5-haiku-20241022", "claude-3-opus-20240229"],
    google: ["gemini-2.0-flash", "gemini-1.5-pro", "gemini-1.5-flash"],
    groq: ["llama-3.3-70b-versatile", "llama-3.1-70b-versatile", "mixtral-8x7b-32768"],
    openrouter: [
      "anthropic/claude-sonnet-4", "anthropic/claude-3.5-sonnet", "openai/gpt-4o", "openai/gpt-4o-mini",
      "google/gemini-2.0-flash", "meta-llama/llama-3.3-70b-instruct", "mistralai/mistral-large-latest",
      "deepseek/deepseek-r1", "qwen/qwen-2.5-72b-instruct",
    ],
    ollama: ["llama3.3", "llama3.1", "llama3.1:8b", "mistral", "mixtral", "codellama", "qwen2.5", "deepseek-r1", "phi3", "gemma2"],
    custom: [],
  };

  const stmt = getDb().prepare("INSERT INTO provider_models (provider, model_name) VALUES (?, ?)");
  for (const [provider, models] of Object.entries(defaults)) {
    for (const model of models) {
      stmt.run(provider, model);
    }
  }
}

// Job Boards CRUD
export function getJobBoards(userId: string = "default") { return getDb().prepare("SELECT * FROM job_boards WHERE user_id = ? ORDER BY created_at DESC").all(userId); }
export function getJobBoard(id: number, userId: string = "default") { return getDb().prepare("SELECT * FROM job_boards WHERE id = ? AND user_id = ?").get(id, userId); }
export function createJobBoard(data: { name: string; url: string; category: string; icon: string; color: string }, userId: string = "default") {
  return getDb().prepare("INSERT INTO job_boards (name, url, category, icon, color, user_id) VALUES (?, ?, ?, ?, ?, ?)").run(data.name, data.url, data.category, data.icon, data.color, userId);
}
export function updateJobBoard(id: number, data: { name: string; url: string; category: string; icon: string; color: string }, userId: string = "default") {
  return getDb().prepare("UPDATE job_boards SET name=?, url=?, category=?, icon=?, color=? WHERE id = ? AND user_id = ?").run(data.name, data.url, data.category, data.icon, data.color, id, userId);
}
export function deleteJobBoard(id: number, userId: string = "default") { return getDb().prepare("DELETE FROM job_boards WHERE id = ? AND user_id = ?").run(id, userId); }
export function updateJobBoardScan(id: number, jobCount: number) {
  return getDb().prepare("UPDATE job_boards SET last_scanned = datetime('now'), job_count = ? WHERE id = ?").run(jobCount, id);
}

// Job RSS Feeds CRUD (shared/global — not user-scoped)
export function getJobRssFeeds() { return getDb().prepare("SELECT * FROM job_rss_feeds ORDER BY created_at DESC").all(); }
export function createJobRssFeed(data: { name: string; url: string }) {
  return getDb().prepare("INSERT INTO job_rss_feeds (name, url) VALUES (?, ?)").run(data.name, data.url);
}
export function deleteJobRssFeed(id: number) { return getDb().prepare("DELETE FROM job_rss_feeds WHERE id = ?").run(id); }
export function updateJobRssFeedScan(id: number) {
  return getDb().prepare("UPDATE job_rss_feeds SET last_scanned = datetime('now') WHERE id = ?").run(id);
}

// Job Searches CRUD
export function getJobSearches(userId: string = "default") { return getDb().prepare("SELECT * FROM job_searches WHERE user_id = ? ORDER BY created_at DESC").all(userId); }
export function createJobSearch(data: { name: string; search_mode: string; search_terms: string }, userId: string = "default") {
  return getDb().prepare("INSERT INTO job_searches (name, search_mode, search_terms, user_id) VALUES (?, ?, ?, ?)").run(data.name, data.search_mode, data.search_terms, userId);
}
export function updateJobSearchResults(id: number, resultsJson: string) {
  return getDb().prepare("UPDATE job_searches SET results_json = ?, last_run = datetime('now') WHERE id = ?").run(resultsJson, id);
}
export function deleteJobSearch(id: number, userId: string = "default") { return getDb().prepare("DELETE FROM job_searches WHERE id = ? AND user_id = ?").run(id, userId); }

// Career Score computation
export function getCareerScore(userId: string = "default") {
  const d = getDb();
  const totalSkills = (d.prepare("SELECT COUNT(*) as c FROM techstack WHERE user_id = ?").get(userId) as any).c;
  const totalCerts = (d.prepare("SELECT COUNT(*) as c FROM certifications WHERE user_id = ?").get(userId) as any).c;
  const passedCerts = (d.prepare("SELECT COUNT(*) as c FROM certifications WHERE status = 'PASSED' AND user_id = ?").get(userId) as any).c;
  const totalApps = (d.prepare("SELECT COUNT(*) as c FROM applications WHERE user_id = ?").get(userId) as any).c;
  const activeApps = (d.prepare("SELECT COUNT(*) as c FROM applications WHERE status IN ('APPLIED','PHONE SCREEN','INTERVIEW') AND user_id = ?").get(userId) as any).c;
  const totalPortfolio = (d.prepare("SELECT COUNT(*) as c FROM portfolio_items WHERE user_id = ?").get(userId) as any).c;
  const totalInterviews = (d.prepare("SELECT COUNT(*) as c FROM interviews WHERE user_id = ?").get(userId) as any).c;
  const completedInterviews = (d.prepare("SELECT COUNT(*) as c FROM interviews WHERE status = 'COMPLETED' AND user_id = ?").get(userId) as any).c;
  const totalLearning = (d.prepare("SELECT COUNT(*) as c FROM learning_paths WHERE user_id = ?").get(userId) as any).c;
  const completedLearning = (d.prepare("SELECT COUNT(*) as c FROM learning_paths WHERE status = 'COMPLETED' AND user_id = ?").get(userId) as any).c;
  const jobTargets = (d.prepare("SELECT COUNT(*) as c FROM jobtitles WHERE user_id = ?").get(userId) as any).c;

  // Skill coverage: how many skills vs typical 20
  const skillScore = Math.min(100, (totalSkills / 20) * 100);
  // Cert progress: passed vs total (or 0)
  const certScore = totalCerts > 0 ? (passedCerts / Math.max(totalCerts, 1)) * 100 : 0;
  // Application pipeline: active apps
  const appScore = Math.min(100, (activeApps / Math.max(jobTargets, 1)) * 100);
  // Portfolio strength
  const portfolioScore = Math.min(100, (totalPortfolio / 5) * 100);
  // Interview performance
  const interviewScore = totalInterviews > 0 ? (completedInterviews / totalInterviews) * 100 : 0;
  // Learning progress
  const learningScore = totalLearning > 0 ? (completedLearning / totalLearning) * 100 : 0;

  const composite = Math.round(
    skillScore * 0.25 + certScore * 0.2 + appScore * 0.2 + portfolioScore * 0.15 + interviewScore * 0.1 + learningScore * 0.1
  );

  return {
    composite,
    breakdown: {
      skills: { score: Math.round(skillScore), weight: 25, total: totalSkills },
      certs: { score: Math.round(certScore), weight: 20, passed: passedCerts, total: totalCerts },
      applications: { score: Math.round(appScore), weight: 20, active: activeApps, total: totalApps },
      portfolio: { score: Math.round(portfolioScore), weight: 15, total: totalPortfolio },
      interviews: { score: Math.round(interviewScore), weight: 10, completed: completedInterviews, total: totalInterviews },
      learning: { score: Math.round(learningScore), weight: 10, completed: completedLearning, total: totalLearning },
    },
  };
}

// Notifications aggregation
export function getNotifications(userId: string = "default") {
  const d = getDb();
  const now = new Date();
  const in7Days = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0];
  const in30Days = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0];
  const today = now.toISOString().split("T")[0];

  const alerts: Array<{ type: string; title: string; detail: string; link: string; color: string }> = [];

  // Upcoming interviews (next 7 days)
  const upcomingInterviews = d.prepare("SELECT company, position, date, time FROM interviews WHERE date >= ? AND date <= ? AND status = 'SCHEDULED' AND user_id = ? ORDER BY date").all(today, in7Days, userId) as any[];
  upcomingInterviews.forEach((i: any) => {
    alerts.push({ type: "interview", title: `${i.position} at ${i.company}`, detail: `${i.date} ${i.time || ""}`, link: "/interviews", color: "#FFD700" });
  });

  // Overdue follow-ups
  const overdueFollowups = d.prepare("SELECT name, company, next_follow_up FROM networking_contacts WHERE next_follow_up < ? AND next_follow_up != '' AND status != 'COLD' AND user_id = ?").all(today, userId) as any[];
  overdueFollowups.forEach((c: any) => {
    alerts.push({ type: "followup", title: `Follow up: ${c.name}`, detail: `${c.company} — due ${c.next_follow_up}`, link: "/networking", color: "#FF2D55" });
  });

  // Expiring certs (next 30 days)
  const expiringCerts = d.prepare("SELECT name, expiration_date FROM certifications WHERE expiration_date >= ? AND expiration_date <= ? AND user_id = ?").all(today, in30Days, userId) as any[];
  expiringCerts.forEach((c: any) => {
    alerts.push({ type: "cert", title: `Cert expiring: ${c.name}`, detail: `Expires ${c.expiration_date}`, link: "/certifications", color: "#FF8C00" });
  });

  // Upcoming project deadlines (next 7 days)
  const upcomingDeadlines = d.prepare("SELECT name, deadline FROM projects WHERE deadline >= ? AND deadline <= ? AND status != 'DONE' AND user_id = ?").all(today, in7Days, userId) as any[];
  upcomingDeadlines.forEach((p: any) => {
    alerts.push({ type: "deadline", title: `Deadline: ${p.name}`, detail: `Due ${p.deadline}`, link: "/projects", color: "#BF00FF" });
  });

  return alerts;
}

// Gap Analysis computation
export function getGapAnalysis(userId: string = "default") {
  const d = getDb();
  const skills = d.prepare("SELECT LOWER(name) as name, category FROM techstack WHERE user_id = ?").all(userId) as any[];
  const jobs = d.prepare("SELECT tech_stack FROM jobtitles WHERE tech_stack != '' AND user_id = ?").all(userId) as any[];

  const skillSet = new Set(skills.map((s: any) => s.name));
  const demand: Record<string, number> = {};

  jobs.forEach((j: any) => {
    j.tech_stack.split(",").forEach((s: string) => {
      const trimmed = s.trim().toLowerCase();
      if (trimmed) demand[trimmed] = (demand[trimmed] || 0) + 1;
    });
  });

  const covered: Array<{ skill: string; demand: number }> = [];
  const missing: Array<{ skill: string; demand: number }> = [];

  for (const [skill, count] of Object.entries(demand)) {
    if (skillSet.has(skill)) {
      covered.push({ skill, demand: count });
    } else {
      missing.push({ skill, demand: count });
    }
  }

  covered.sort((a, b) => b.demand - a.demand);
  missing.sort((a, b) => b.demand - a.demand);

  return { covered, missing, totalDemand: Object.keys(demand).length, coveragePct: covered.length > 0 ? Math.round((covered.length / Object.keys(demand).length) * 100) : 0 };
}

// MCP Server Config CRUD
export function getMcpServerConfigs() {
  return getDb().prepare("SELECT * FROM mcp_servers ORDER BY name").all();
}

export function getMcpServerConfig(name: string) {
  return getDb().prepare("SELECT * FROM mcp_servers WHERE name = ?").get(name);
}

export function upsertMcpServer(data: { name: string; description: string; enabled?: number }) {
  const existing = getMcpServerConfig(data.name);
  if (existing) {
    return getDb().prepare("UPDATE mcp_servers SET description = ?, enabled = ? WHERE name = ?").run(data.description, data.enabled ?? 1, data.name);
  }
  return getDb().prepare("INSERT INTO mcp_servers (name, description, enabled) VALUES (?, ?, ?)").run(data.name, data.description, data.enabled ?? 1);
}

export function toggleMcpServer(name: string, enabled: number) {
  return getDb().prepare("UPDATE mcp_servers SET enabled = ? WHERE name = ?").run(enabled, name);
}

// MCP Tool History
export function logToolHistory(data: { tool_name: string; server_name: string; input_json: string; output_json: string; success: number; duration_ms: number; user_id: string }) {
  return getDb().prepare(
    "INSERT INTO mcp_tool_history (tool_name, server_name, input_json, output_json, success, duration_ms, user_id) VALUES (?, ?, ?, ?, ?, ?, ?)"
  ).run(data.tool_name, data.server_name, data.input_json, data.output_json, data.success, data.duration_ms, data.user_id);
}

export function getMcpToolHistory(userId: string = "default", limit: number = 50) {
  return getDb().prepare("SELECT * FROM mcp_tool_history WHERE user_id = ? ORDER BY created_at DESC LIMIT ?").all(userId, limit);
}

export function getMcpServerStats(userId: string = "default") {
  const servers = getDb().prepare("SELECT * FROM mcp_servers ORDER BY name").all() as any[];
  return servers.map((s: any) => {
    const stats = getDb().prepare(
      "SELECT COUNT(*) as total_calls, SUM(CASE WHEN success = 1 THEN 1 ELSE 0 END) as success_calls, MAX(created_at) as last_call FROM mcp_tool_history WHERE server_name = ? AND user_id = ?"
    ).get(s.name, userId) as any;
    return { ...s, total_calls: stats?.total_calls || 0, success_calls: stats?.success_calls || 0, last_call: stats?.last_call || null };
  });
}

// Calendar Events CRUD
export function getCalendarEventsCustom(userId: string = "default") {
  return getDb().prepare("SELECT * FROM calendar_events WHERE user_id = ? ORDER BY date ASC").all(userId);
}

export function createCalendarEvent(data: { title: string; date: string; end_date?: string; source?: string; google_event_id?: string; color?: string; description?: string; user_id?: string }) {
  return getDb().prepare(
    "INSERT INTO calendar_events (title, date, end_date, source, google_event_id, color, description, user_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?)"
  ).run(data.title, data.date, data.end_date || "", data.source || "manual", data.google_event_id || "", data.color || "#00F5FF", data.description || "", data.user_id || "default");
}

export function upsertGoogleEvent(data: { title: string; date: string; end_date?: string; google_event_id: string; description?: string; user_id?: string }) {
  const existing = getDb().prepare("SELECT id FROM calendar_events WHERE google_event_id = ? AND user_id = ?").get(data.google_event_id, data.user_id || "default");
  if (existing) {
    return getDb().prepare("UPDATE calendar_events SET title = ?, date = ?, end_date = ?, description = ? WHERE google_event_id = ? AND user_id = ?")
      .run(data.title, data.date, data.end_date || "", data.description || "", data.google_event_id, data.user_id || "default");
  }
  return createCalendarEvent({ ...data, source: "google", color: "#4285F4" });
}

export function deleteCalendarEvent(id: number, userId: string = "default") {
  return getDb().prepare("DELETE FROM calendar_events WHERE id = ? AND user_id = ?").run(id, userId);
}

// OAuth Tokens
export function getOAuthToken(provider: string, userId: string = "default") {
  return getDb().prepare("SELECT * FROM oauth_tokens WHERE provider = ? AND user_id = ?").get(provider, userId) as any;
}

export function upsertOAuthToken(data: { provider: string; access_token: string; refresh_token?: string; expires_at?: string; scope?: string; user_id?: string }) {
  const existing = getOAuthToken(data.provider, data.user_id || "default");
  if (existing) {
    return getDb().prepare("UPDATE oauth_tokens SET access_token = ?, refresh_token = ?, expires_at = ?, scope = ? WHERE provider = ? AND user_id = ?")
      .run(data.access_token, data.refresh_token || "", data.expires_at || "", data.scope || "", data.provider, data.user_id || "default");
  }
  return getDb().prepare("INSERT INTO oauth_tokens (provider, access_token, refresh_token, expires_at, scope, user_id) VALUES (?, ?, ?, ?, ?, ?)")
    .run(data.provider, data.access_token, data.refresh_token || "", data.expires_at || "", data.scope || "", data.user_id || "default");
}

export function deleteOAuthToken(provider: string, userId: string = "default") {
  return getDb().prepare("DELETE FROM oauth_tokens WHERE provider = ? AND user_id = ?").run(provider, userId);
}

// GitHub Activity CRUD
export function getGithubActivity(username: string, userId: string = "default", limit: number = 50) {
  return getDb().prepare("SELECT * FROM github_activity WHERE github_username = ? AND user_id = ? ORDER BY github_created_at DESC LIMIT ?").all(username, userId, limit);
}

export function insertGithubActivity(data: { event_type: string; repo_name: string; title: string; url: string; github_username: string; payload_json?: string; github_created_at: string; user_id?: string }) {
  // Deduplicate by event_type + url + github_created_at
  const existing = getDb().prepare("SELECT id FROM github_activity WHERE event_type = ? AND url = ? AND github_created_at = ? AND user_id = ?")
    .get(data.event_type, data.url, data.github_created_at, data.user_id || "default");
  if (existing) return existing;
  return getDb().prepare("INSERT INTO github_activity (event_type, repo_name, title, url, github_username, payload_json, github_created_at, user_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?)")
    .run(data.event_type, data.repo_name, data.title, data.url, data.github_username, data.payload_json || "{}", data.github_created_at, data.user_id || "default");
}

// Salary Cache CRUD
export function getSalaryCache(role: string, location: string = "") {
  return getDb().prepare("SELECT * FROM salary_cache WHERE role = ? AND location = ?").get(role, location) || null;
}

export function upsertSalaryCache(data: { role: string; location: string; data_json: string }) {
  const existing = getSalaryCache(data.role, data.location);
  if (existing) {
    return getDb().prepare("UPDATE salary_cache SET data_json = ?, fetched_at = datetime('now') WHERE role = ? AND location = ?")
      .run(data.data_json, data.role, data.location);
  }
  return getDb().prepare("INSERT INTO salary_cache (role, location, data_json) VALUES (?, ?, ?)")
    .run(data.role, data.location, data.data_json);
}
