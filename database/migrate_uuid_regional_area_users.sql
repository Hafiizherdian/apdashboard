-- ============================================================
-- Migration: convert regionals.id, areas.id, users.id ke UUID
-- Versi 2 -- sudah menghitung dependent FK dari:
--   user_areas.area_id, user_areas.user_id,
--   user_regionals.regional_id, user_regionals.user_id,
--   areas.regional_id, action_plans.regional_id
--
-- Jalankan di STAGING dulu / backup database dulu.
-- psql -U postgres -d action_plan -f migrate_uuid_regional_area_users.sql
-- sudo -u postgres psql -d action_plan -f migrate_uuid_regional_area_users.sql
-- ============================================================

BEGIN;

CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- ============================================================
-- PHASE 0: lepas PK komposit di junction table dulu, supaya
-- kolomnya bisa diganti satu-satu di phase 2 & 3 tanpa
-- kebentur "column is part of primary key".
-- ============================================================
ALTER TABLE user_areas     DROP CONSTRAINT user_areas_pkey;
ALTER TABLE user_regionals DROP CONSTRAINT user_regionals_pkey;

-- ============================================================
-- PHASE 1: REGIONALS  (id text -> slug, new uuid jadi id)
-- ============================================================
ALTER TABLE regionals ADD COLUMN new_id UUID NOT NULL DEFAULT gen_random_uuid();

-- siapkan kolom uuid baru di semua tabel yang FK ke regionals
ALTER TABLE areas         ADD COLUMN new_regional_id UUID;
ALTER TABLE user_regionals ADD COLUMN new_regional_id UUID;
ALTER TABLE action_plans  ADD COLUMN new_regional_id UUID;

UPDATE areas a          SET new_regional_id = r.new_id FROM regionals r WHERE a.regional_id  = r.id;
UPDATE user_regionals ur SET new_regional_id = r.new_id FROM regionals r WHERE ur.regional_id = r.id;
UPDATE action_plans ap   SET new_regional_id = r.new_id FROM regionals r WHERE ap.regional_id  = r.id;

-- lepas FK lama yang masih nunjuk ke regionals(id) text
ALTER TABLE areas          DROP CONSTRAINT areas_regional_id_fkey;
ALTER TABLE user_regionals DROP CONSTRAINT user_regionals_regional_id_fkey;
ALTER TABLE action_plans   DROP CONSTRAINT action_plans_regional_id_fkey;

-- ganti kolom lama dengan yang baru
ALTER TABLE areas          DROP COLUMN regional_id;
ALTER TABLE areas          RENAME COLUMN new_regional_id TO regional_id;
ALTER TABLE user_regionals DROP COLUMN regional_id;
ALTER TABLE user_regionals RENAME COLUMN new_regional_id TO regional_id;
ALTER TABLE action_plans   DROP COLUMN regional_id;
ALTER TABLE action_plans   RENAME COLUMN new_regional_id TO regional_id;

-- finalisasi PK regionals
ALTER TABLE regionals RENAME COLUMN id TO slug;
ALTER TABLE regionals RENAME COLUMN new_id TO id;
ALTER TABLE regionals DROP CONSTRAINT regionals_pkey;
ALTER TABLE regionals ADD PRIMARY KEY (id);
ALTER TABLE regionals ADD CONSTRAINT regionals_slug_key UNIQUE (slug);

-- FK baru ke regionals(id) uuid
ALTER TABLE areas ADD CONSTRAINT areas_regional_id_fkey
  FOREIGN KEY (regional_id) REFERENCES regionals(id) ON DELETE SET NULL;
ALTER TABLE user_regionals ADD CONSTRAINT user_regionals_regional_id_fkey
  FOREIGN KEY (regional_id) REFERENCES regionals(id) ON DELETE CASCADE;
-- catatan: ON DELETE untuk action_plans saya set SET NULL (asumsi aman);
-- sesuaikan kalau di schema aslinya beda (mis. RESTRICT/CASCADE).
ALTER TABLE action_plans ADD CONSTRAINT action_plans_regional_id_fkey
  FOREIGN KEY (regional_id) REFERENCES regionals(id) ON DELETE SET NULL;

-- ============================================================
-- PHASE 2: AREAS  (id text -> slug, new uuid jadi id)
-- ============================================================
ALTER TABLE areas ADD COLUMN new_id UUID NOT NULL DEFAULT gen_random_uuid();

ALTER TABLE user_areas ADD COLUMN new_area_id UUID;
UPDATE user_areas ua SET new_area_id = a.new_id FROM areas a WHERE ua.area_id = a.id;

ALTER TABLE user_areas DROP CONSTRAINT user_areas_area_id_fkey;
ALTER TABLE user_areas DROP COLUMN area_id;
ALTER TABLE user_areas RENAME COLUMN new_area_id TO area_id;

ALTER TABLE areas RENAME COLUMN id TO slug;
ALTER TABLE areas RENAME COLUMN new_id TO id;
ALTER TABLE areas DROP CONSTRAINT areas_pkey;
ALTER TABLE areas ADD PRIMARY KEY (id);
ALTER TABLE areas ADD CONSTRAINT areas_slug_key UNIQUE (slug);

ALTER TABLE user_areas ADD CONSTRAINT user_areas_area_id_fkey
  FOREIGN KEY (area_id) REFERENCES areas(id) ON DELETE CASCADE;

-- ============================================================
-- PHASE 3: USERS  (id serial int -> legacy_id, new uuid jadi id)
-- ============================================================
ALTER TABLE users ADD COLUMN new_id UUID NOT NULL DEFAULT gen_random_uuid();

ALTER TABLE user_areas     ADD COLUMN new_user_id UUID;
ALTER TABLE user_regionals ADD COLUMN new_user_id UUID;

UPDATE user_areas ua     SET new_user_id = u.new_id FROM users u WHERE ua.user_id = u.id;
UPDATE user_regionals ur SET new_user_id = u.new_id FROM users u WHERE ur.user_id = u.id;

ALTER TABLE user_areas     DROP CONSTRAINT user_areas_user_id_fkey;
ALTER TABLE user_regionals DROP CONSTRAINT user_regionals_user_id_fkey;

ALTER TABLE user_areas     DROP COLUMN user_id;
ALTER TABLE user_areas     RENAME COLUMN new_user_id TO user_id;
ALTER TABLE user_regionals DROP COLUMN user_id;
ALTER TABLE user_regionals RENAME COLUMN new_user_id TO user_id;

ALTER TABLE users RENAME COLUMN id TO legacy_id;
ALTER TABLE users RENAME COLUMN new_id TO id;
ALTER TABLE users DROP CONSTRAINT users_pkey;
ALTER TABLE users ADD PRIMARY KEY (id);
ALTER TABLE users ADD CONSTRAINT users_legacy_id_key UNIQUE (legacy_id);

ALTER TABLE user_areas ADD CONSTRAINT user_areas_user_id_fkey
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;
ALTER TABLE user_regionals ADD CONSTRAINT user_regionals_user_id_fkey
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;

-- ============================================================
-- PHASE 4: bangun ulang PK komposit di junction table
-- ============================================================
ALTER TABLE user_areas     ADD PRIMARY KEY (user_id, area_id);
ALTER TABLE user_regionals ADD PRIMARY KEY (user_id, regional_id);

-- ============================================================
-- PHASE 5: index yang tadinya nempel ke kolom lama, buat ulang
-- ============================================================
DROP INDEX IF EXISTS idx_areas_regional;
CREATE INDEX idx_areas_regional ON areas (regional_id);

DROP INDEX IF EXISTS idx_users_role;
CREATE INDEX idx_users_role ON users (role);

COMMIT;

-- ============================================================
-- SETELAH INI, cek manual (belum otomatis di script):
-- 1. Nullability action_plans.regional_id -- kalau di schema asli NOT NULL,
--    tambahkan: ALTER TABLE action_plans ALTER COLUMN regional_id SET NOT NULL;
-- 2. Cek apakah ada tabel/kolom lain di action_plans (mis. area_id) yang juga
--    FK ke areas -- query find_dependent_fks.sql tadi cuma nyari yang ref ke
--    regionals/areas/users, tapi kalau action_plans juga simpan area_id
--    langsung, itu perlu step tambahan serupa Phase 2.
-- 3. Update kode aplikasi: tipe id sekarang string (UUID), bukan lagi
--    text-slug atau integer -- terutama untuk user.id di JWT/session.
-- 4. Kolom `slug` (regionals/areas) & `legacy_id` (users) bisa dipakai
--    sementara buat lookup pakai id lama; drop belakangan kalau sudah
--    tidak dipakai.
-- ============================================================