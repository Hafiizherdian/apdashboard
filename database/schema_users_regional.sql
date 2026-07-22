-- ============================================================
-- Schema Users, Regional, Area, dan hierarki akses
-- psql -U <username> -d <database_name> -f database/schema_users_regional.sql
-- ============================================================

-- ---------- Regional (level di atas Area) ----------
CREATE TABLE IF NOT EXISTS regionals (
  id           TEXT PRIMARY KEY,           -- slug, mis. 'jatim-timur'
  name         TEXT NOT NULL,
  description  TEXT,
  created_at   TIMESTAMPTZ DEFAULT NOW(),
  updated_at   TIMESTAMPTZ DEFAULT NOW()
);

-- ---------- Area (dulunya statis di lib/areaConfig.ts, sekarang di DB) ----------
CREATE TABLE IF NOT EXISTS areas (
  id           TEXT PRIMARY KEY,           -- slug, mis. 'malang'
  name         TEXT NOT NULL,
  description  TEXT,
  regional_id  TEXT REFERENCES regionals(id) ON DELETE SET NULL,
  created_at   TIMESTAMPTZ DEFAULT NOW(),
  updated_at   TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_areas_regional ON areas (regional_id);

-- ---------- Users ----------
-- role: 'root' | 'admin' | 'user'
-- scope_type (HANYA relevan kalau role = 'user'):
--   'all'      -> akses semua regional & area (setara "userall")
--   'regional' -> akses semua area di dalam regional yang di-assign ("user1")
--   'area'     -> akses hanya area spesifik yang di-assign ("user2")
CREATE TABLE IF NOT EXISTS users (
  id             SERIAL PRIMARY KEY,
  username       TEXT UNIQUE NOT NULL,
  email          TEXT,
  password_hash  TEXT NOT NULL,
  role           TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('root','admin','user')),
  scope_type     TEXT NOT NULL DEFAULT 'all' CHECK (scope_type IN ('all','regional','area')),
  is_active      BOOLEAN NOT NULL DEFAULT true,
  created_at     TIMESTAMPTZ DEFAULT NOW(),
  updated_at     TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_users_role ON users (role);

-- ---------- Assignment: user -> regional (dipakai kalau scope_type = 'regional') ----------
CREATE TABLE IF NOT EXISTS user_regionals (
  user_id      INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  regional_id  TEXT NOT NULL REFERENCES regionals(id) ON DELETE CASCADE,
  PRIMARY KEY (user_id, regional_id)
);

-- ---------- Assignment: user -> area (dipakai kalau scope_type = 'area') ----------
CREATE TABLE IF NOT EXISTS user_areas (
  user_id   INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  area_id   TEXT NOT NULL REFERENCES areas(id) ON DELETE CASCADE,
  PRIMARY KEY (user_id, area_id)
);

-- ---------- Trigger updated_at ----------
DROP TRIGGER IF EXISTS trg_regionals_updated_at ON regionals;
CREATE TRIGGER trg_regionals_updated_at
  BEFORE UPDATE ON regionals FOR EACH ROW EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS trg_areas_updated_at ON areas;
CREATE TRIGGER trg_areas_updated_at
  BEFORE UPDATE ON areas FOR EACH ROW EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS trg_users_updated_at ON users;
CREATE TRIGGER trg_users_updated_at
  BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ---------- Seed data awal ----------
-- Ganti password_hash di bawah ini — generate dengan bcrypt (lihat lib/auth/password.ts)
-- Contoh ini HANYA placeholder, JANGAN dipakai di production.
INSERT INTO regionals (id, name, description) VALUES
  ('jatim-timur', 'Regional Jawa Timur Timur', 'Banyuwangi, Jember, dsb'),
  ('jatim-barat', 'Regional Jawa Timur Barat', 'Malang, Surabaya, Pasuruan')
ON CONFLICT (id) DO NOTHING;

INSERT INTO areas (id, name, description, regional_id) VALUES
  ('banyuwangi', 'Area Banyuwangi', 'Wilayah Banyuwangi dan sekitarnya', 'jatim'),
  ('jember',     'Area Jember',     'Wilayah Jember dan sekitarnya',     'jatim'),
  ('surabaya',   'Area Surabaya',   'Wilayah Surabaya Raya',             'jatim'),
  ('malang',     'Area Malang',     'Wilayah Malang Raya',               'jatim'),
  ('palopo',     'Area Palopo',     'Wilayah Palopo Raya',               'sulawesi')
ON CONFLICT (id) DO NOTHING;