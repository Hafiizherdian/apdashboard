-- ============================================================
-- Schema Action Plan / Trade Promo — disesuaikan penuh dengan
-- struktur ActionPlanDetail di EntriAP.tsx
-- psql -U <username> -d <database_name> -f schema_action_plan_full.sql
-- ============================================================

-- ---------- Tabel utama ----------
CREATE TABLE IF NOT EXISTS action_plans (
  id                            SERIAL PRIMARY KEY,
  no_action_plan                TEXT,
  perwakilan_agen                TEXT,
  brand                          TEXT,
  nama_program                  TEXT,
  jenis_program                 TEXT,
  lokasi_program                TEXT,
  tgl_mulai                     DATE,
  tgl_selesai                   DATE,
  ditujukan_kepada              TEXT,
  tembusan                      TEXT[],
  lama_program_hari             INTEGER,
  total_biaya                   NUMERIC(15,2),
  total_biaya_yang_dibutuhkan   NUMERIC(15,2),
  cost_ratio_percent            NUMERIC(5,2),
  source_filename               TEXT,

  -- field teks panjang yang dipakai di form (sec-latar, sec-objektif, sec-mekanisme)
  uraian                        TEXT,
  latar_belakang                TEXT,
  objektif                      TEXT,
  mekanisme                     TEXT,
  mekanisme_detail              JSONB,
  status                        TEXT DEFAULT 'Running',

  raw_json                      JSONB,           -- fallback: seluruh hasil parse mentah
  created_at                    TIMESTAMPTZ DEFAULT NOW(),
  updated_at                    TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_action_plans_no ON action_plans (no_action_plan);
CREATE INDEX IF NOT EXISTS idx_action_plans_perwakilan ON action_plans (perwakilan_agen);
CREATE INDEX IF NOT EXISTS idx_action_plans_status ON action_plans (status);
CREATE INDEX IF NOT EXISTS idx_action_plans_created_at ON action_plans (created_at DESC);


-- ---------- TargetProgram ----------
CREATE TABLE IF NOT EXISTS action_plan_target_program (
  id               SERIAL PRIMARY KEY,
  action_plan_id   INTEGER NOT NULL REFERENCES action_plans(id) ON DELETE CASCADE,
  uraian           TEXT,
  brand            TEXT,
  wbp              NUMERIC(15,2),
  rbp              NUMERIC(15,2),
  cbp              NUMERIC(15,2),
  estimasi_sales   NUMERIC(15,2),
  estimasi_total   NUMERIC(15,2),
  sort_order       INTEGER DEFAULT 0
);

-- ---------- TargetEvent ----------
CREATE TABLE IF NOT EXISTS action_plan_target_event (
  id                SERIAL PRIMARY KEY,
  action_plan_id    INTEGER NOT NULL REFERENCES action_plans(id) ON DELETE CASCADE,
  jenis_program     TEXT,
  target            TEXT,
  brand             TEXT,
  qty               NUMERIC(15,2),
  harga             NUMERIC(15,2),
  target_penjualan  NUMERIC(15,2),
  estimasi_total    NUMERIC(15,2),
  sort_order        INTEGER DEFAULT 0
);

-- ---------- DataDistribusi ----------
CREATE TABLE IF NOT EXISTS action_plan_distribusi (
  id               SERIAL PRIMARY KEY,
  action_plan_id   INTEGER NOT NULL REFERENCES action_plans(id) ON DELETE CASCADE,
  wilayah          TEXT,
  outlet           NUMERIC(15,2),
  avaibility       NUMERIC(15,2),
  visibility       NUMERIC(15,2),
  avg              NUMERIC(15,4),
  status           TEXT,
  keterangan       TEXT,
  estimasi_total   NUMERIC(15,2),
  sort_order       INTEGER DEFAULT 0
);

-- ---------- anggaranBiaya ----------
CREATE TABLE IF NOT EXISTS action_plan_anggaran (
  id               SERIAL PRIMARY KEY,
  action_plan_id   INTEGER NOT NULL REFERENCES action_plans(id) ON DELETE CASCADE,
  uraian           TEXT,
  qty              NUMERIC(15,2),
  satuan           TEXT,
  harga_unit       NUMERIC(15,2),
  total_biaya      NUMERIC(15,2),
  sort_order       INTEGER DEFAULT 0
);

-- ---------- thl (Tenaga Harian Lepas) ----------
CREATE TABLE IF NOT EXISTS action_plan_thl (
  id               SERIAL PRIMARY KEY,
  action_plan_id   INTEGER NOT NULL REFERENCES action_plans(id) ON DELETE CASCADE,
  jasaperorg       TEXT,
  jumlah_tng       NUMERIC(15,2),
  hari_kerja       NUMERIC(15,2),
  imbalan_perhari  NUMERIC(15,2),
  estimasi_total   NUMERIC(15,2),
  sort_order       INTEGER DEFAULT 0
);

-- ---------- barangPromo ----------
CREATE TABLE IF NOT EXISTS action_plan_barang_promo (
  id               SERIAL PRIMARY KEY,
  action_plan_id   INTEGER NOT NULL REFERENCES action_plans(id) ON DELETE CASCADE,
  nama_barang      TEXT,
  origin           TEXT,
  satuan           TEXT,
  qty              NUMERIC(15,2),
  harga_unit       NUMERIC(15,2),
  estimasi_total   NUMERIC(15,2),
  sort_order       INTEGER DEFAULT 0
);

-- ---------- brandjln ----------
CREATE TABLE IF NOT EXISTS action_plan_brand_jln (
  id               SERIAL PRIMARY KEY,
  action_plan_id   INTEGER NOT NULL REFERENCES action_plans(id) ON DELETE CASCADE,
  program_jln      TEXT,
  qty_bks          NUMERIC(15,2),
  hrg_bks          NUMERIC(15,2),
  nominal          NUMERIC(15,2),
  estimasi_total   NUMERIC(15,2),
  sort_order       INTEGER DEFAULT 0
);

-- ---------- tbyd (Total Biaya yang Dibutuhkan) ----------
CREATE TABLE IF NOT EXISTS action_plan_tbyd (
  id               SERIAL PRIMARY KEY,
  action_plan_id   INTEGER NOT NULL REFERENCES action_plans(id) ON DELETE CASCADE,
  biaya_promo      NUMERIC(15,2),
  jasaperorg       NUMERIC(15,2),
  kbt_brg_prm      NUMERIC(15,2),
  trial_taste      NUMERIC(15,2),
  estimasi_total   NUMERIC(15,2),
  sort_order       INTEGER DEFAULT 0
);

-- ---------- transfer ----------
CREATE TABLE IF NOT EXISTS action_plan_transfer (
  id               SERIAL PRIMARY KEY,
  action_plan_id   INTEGER NOT NULL REFERENCES action_plans(id) ON DELETE CASCADE,
  jenis            TEXT,
  tanggal          DATE,
  jumlah           NUMERIC(15,2),
  sort_order       INTEGER DEFAULT 0
);

-- ---------- analisa ----------
CREATE TABLE IF NOT EXISTS action_plan_analisa (
  id                    SERIAL PRIMARY KEY,
  action_plan_id        INTEGER NOT NULL REFERENCES action_plans(id) ON DELETE CASCADE,
  analisa_biaya         TEXT,
  cost_per_pack         NUMERIC(15,2),
  cost_ratio            NUMERIC(15,4),
  total_cost_per_pack   NUMERIC(15,2),
  total_cost_ratio      NUMERIC(15,4),
  sort_order            INTEGER DEFAULT 0
);


-- ---------- Index untuk semua tabel anak ----------
CREATE INDEX IF NOT EXISTS idx_aptp_plan   ON action_plan_target_program (action_plan_id);
CREATE INDEX IF NOT EXISTS idx_apte_plan   ON action_plan_target_event (action_plan_id);
CREATE INDEX IF NOT EXISTS idx_apd_plan    ON action_plan_distribusi (action_plan_id);
CREATE INDEX IF NOT EXISTS idx_apa_plan    ON action_plan_anggaran (action_plan_id);
CREATE INDEX IF NOT EXISTS idx_apthl_plan  ON action_plan_thl (action_plan_id);
CREATE INDEX IF NOT EXISTS idx_apbr_plan   ON action_plan_barang_promo (action_plan_id);
CREATE INDEX IF NOT EXISTS idx_apbj_plan   ON action_plan_brand_jln (action_plan_id);
CREATE INDEX IF NOT EXISTS idx_aptbyd_plan ON action_plan_tbyd (action_plan_id);
CREATE INDEX IF NOT EXISTS idx_aptrf_plan  ON action_plan_transfer (action_plan_id);
CREATE INDEX IF NOT EXISTS idx_apan_plan   ON action_plan_analisa (action_plan_id);


-- ---------- Trigger update updated_at otomatis ----------
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_action_plans_updated_at ON action_plans;
CREATE TRIGGER trg_action_plans_updated_at
  BEFORE UPDATE ON action_plans
  FOR EACH ROW
  EXECUTE FUNCTION set_updated_at();