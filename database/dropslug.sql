-- Slug/legacy_id cuma dipakai buat lookup id lama (hasil migration UUID).
-- Row baru yang dibuat lewat form sekarang gak pernah ngisi ini, jadi
-- constraint NOT NULL-nya perlu dilepas supaya insert baru gak gagal.
-- psql -U postgres -d action_plan -f dropslug.sql
-- sudo -u postgres psql -d action_plan -f dropslug.sql

ALTER TABLE regionals ALTER COLUMN slug DROP NOT NULL;
ALTER TABLE areas     ALTER COLUMN slug DROP NOT NULL;
ALTER TABLE users     ALTER COLUMN legacy_id DROP NOT NULL;