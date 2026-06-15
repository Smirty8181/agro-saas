import { pool, query } from './pool.js'

const migrations = `
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  login TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  name TEXT NOT NULL,
  role TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  status TEXT NOT NULL DEFAULT 'Активен',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS fields (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  legacy_id TEXT UNIQUE,
  number INT NOT NULL,
  name TEXT NOT NULL,
  crop TEXT NOT NULL,
  area DECIMAL(10,2) NOT NULL,
  status TEXT NOT NULL,
  sow_date TEXT,
  agronomist TEXT,
  yield DECIMAL(10,2) NOT NULL,
  coordinates JSONB NOT NULL DEFAULT '[]',
  field_code TEXT,
  humidity INT NOT NULL DEFAULT 45,
  health_index INT NOT NULL DEFAULT 75,
  history JSONB NOT NULL DEFAULT '[]',
  yield_history JSONB NOT NULL DEFAULT '[]',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  legacy_id TEXT UNIQUE,
  field_id UUID REFERENCES fields(id) ON DELETE SET NULL,
  field_name TEXT NOT NULL,
  assignee TEXT NOT NULL,
  type TEXT NOT NULL,
  date TEXT NOT NULL,
  priority TEXT NOT NULL,
  status TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS field_changelog (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  field_id UUID NOT NULL REFERENCES fields(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  user_name TEXT NOT NULL,
  changed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  property TEXT NOT NULL,
  old_value TEXT,
  new_value TEXT,
  change_type TEXT NOT NULL DEFAULT 'update'
);

CREATE TABLE IF NOT EXISTS import_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  file_name TEXT NOT NULL,
  format TEXT NOT NULL,
  status TEXT NOT NULL,
  imported_count INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS export_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  file_name TEXT NOT NULL,
  format TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'Готово',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS user_settings (
  user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  settings JSONB NOT NULL DEFAULT '{}'
);

CREATE TABLE IF NOT EXISTS risk_rules (
  user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  rules JSONB NOT NULL DEFAULT '{}'
);

CREATE INDEX IF NOT EXISTS idx_field_changelog_field ON field_changelog(field_id, changed_at DESC);
CREATE INDEX IF NOT EXISTS idx_tasks_field ON tasks(field_id);
`

async function migrate() {
  await query(migrations)
  console.log('Migrations applied')
  await pool.end()
}

migrate().catch((error) => {
  console.error(error)
  process.exit(1)
})
