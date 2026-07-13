import { pool } from "@/lib/db"; // sesuaikan kalau nama export/path beda
import { parseActionPlanBuffer, type ActionPlanParsed, type MekanismeSheet } from "@/lib/parseActionsPlan";
import type { PoolClient } from "pg";

// ---------- Types (mirror frontend ActionPlanDetail) ----------

export interface ActionPlanListItem {
  id: number;
  no_action_plan: string | null;
  perwakilan_agen: string | null;
  brand: string | null;
  nama_program: string | null;
  tgl_mulai: string | null;
  tgl_selesai: string | null;
  total_biaya: number | null;
  created_at: string;
  status: "Running" | "Closed";
}

export interface ActionPlanDetail extends ActionPlanListItem {
  jenis_program: string | null;
  lokasi_program: string | null;
  ditujukan_kepada: string | null;
  tembusan: string[] | null;
  lama_program_hari: number | null;
  total_biaya_yang_dibutuhkan: number | null;
  cost_ratio_percent: number | null;
  source_filename: string | null;
  uraian: string | null;
  LatarBelakang: string | null;
  Objektif: string | null;
  Mekanisme: string | null;
  mekanismeDetail: MekanismeSheet | null;
  TargetProgram: {
    id: number; uraian: string, brand: string; wbp: number | null; rbp: number | null;
    cbp: number | null; estimasiSales: number | null; estimasiTotal: number | null;
  }[];
  TargetEvent: {
    id: number; JenisProgram: string; target: string; brand: string;
    qty: number | null; harga: number | null; TargetPenjualan: number | null; estimasiTotal: number | null;
  }[];
  DataDistribusi: {
    id: number; wilayah: string; outlet: number | null; avaibility: number | null;
    visibility: number | null; avg: number | null; status: string | null;
    keterangan: string | null; estimasiTotal: number | null;
  }[];
  anggaranBiaya: {
    id: number; uraian: string; qty: number | null; satuan: string | null;
    hargaUnit: number | null; totalBiaya: number | null;
  }[];
  thl: {
    id: number; jasaperorg: string; jumlahtng: number | null; harikerja: number | null;
    imbalanperhari: number | null; estimasiTotal: number | null;
  }[];
  barangPromo: {
    id: number; namaBarang: string; origin: string | null; satuan: string | null;
    qty: number | null; hargaUnit: number | null; estimasiTotal: number | null;
  }[];
  brandjln: {
    id: number; Programjln: string; qtybks: number | null; hrgbks: number | null;
    Nominal: number | null; estimasiTotal: number | null;
  }[];
  tbyd: {
    id: number; biayapromo: number | null; jasaperorg: number | null;
    kbtbrgprm: number | null; trialtaste: number | null; estimasiTotal: number | null;
  }[];
  transfer: { id: number; jenis: string; tanggal: string | null; jumlah: number | null }[];
  analisa: {
    id: number; analisabiaya: string; costperpack: number | null; costratio: number | null;
    totalcostperpack: number | null; totalcostratio: number | null;
  }[];
}

// ---------- Filter (Area / Kategori / Brand / Status) ----------

export interface ActionPlanFilters {
  area?: string;      // -> kolom perwakilan_agen
  kategori?: string;  // -> kolom jenis_program
  brand?: string;     // -> kolom brand
  status?: string;    // "Running" | "Selesai" -> dihitung dari tgl_selesai, bukan kolom asli
}

/**
 * Bangun potongan SQL "kolom = $n AND ..." dari filter yang aktif,
 * dan push value-nya ke array `params` yang sama dipakai query induk
 * (supaya index placeholder $1, $2, ... tetap konsisten).
 * tableAlias dipakai kalau query induk pakai alias tabel (mis. "ap").
 */
function buildFilterClause(
  filters: ActionPlanFilters | undefined,
  params: unknown[],
  tableAlias = ""
): string {
  if (!filters) return "";
  const prefix = tableAlias ? `${tableAlias}.` : "";
  const clauses: string[] = [];

  if (filters.area) {
    params.push(filters.area);
    clauses.push(`${prefix}perwakilan_agen = $${params.length}`);
  }
  if (filters.kategori) {
    params.push(filters.kategori);
    clauses.push(`${prefix}jenis_program = $${params.length}`);
  }
  if (filters.brand) {
    params.push(filters.brand);
    clauses.push(`${prefix}brand = $${params.length}`);
  }
  if (filters.status === "Running") {
    clauses.push(`(${prefix}tgl_selesai IS NULL OR ${prefix}tgl_selesai >= NOW())`);
  } else if (filters.status === "Closed") {
    clauses.push(`${prefix}tgl_selesai < NOW()`);
  }

  return clauses.length ? clauses.join(" AND ") : "";
}

// ---------- Helpers ----------

function deriveStatus(tglSelesai: string | null): "Running" | "Closed" {
  if (!tglSelesai) return "Running";
  return new Date(tglSelesai).getTime() < Date.now() ? "Closed" : "Running";
}

function toDateOrNull(v: unknown): string | null {
  if (!v) return null;
  const d = new Date(v as string);
  if (isNaN(d.getTime())) return null;
  return d.toISOString().slice(0, 10); // YYYY-MM-DD buat kolom DATE
}

/** Parse kolom JSONB dari pg. Node-postgres biasanya sudah auto-parse JSONB jadi object,
 *  tapi kalau drivernya balikin string (tergantung konfigurasi), kita jaga-jaga di sini. */
function parseJsonbColumn<T>(v: unknown): T | null {
  if (v === null || v === undefined) return null;
  if (typeof v === "string") {
    try {
      return JSON.parse(v) as T;
    } catch {
      return null;
    }
  }
  return v as T;
}

// ---------- List ----------

export async function listActionPlans(opts: {
  search?: string;
  limit: number;
  offset: number;
  filters?: ActionPlanFilters;
}): Promise<{ items: ActionPlanListItem[]; total: number }> {
  const { search, limit, offset, filters } = opts;
  const params: unknown[] = [];
  const conditions: string[] = [];

  if (search) {
    params.push(`%${search}%`);
    conditions.push(`(
      no_action_plan ILIKE $${params.length}
      OR perwakilan_agen ILIKE $${params.length}
      OR brand ILIKE $${params.length}
      OR nama_program ILIKE $${params.length}
    )`);
  }

  const filterClause = buildFilterClause(filters, params);
  if (filterClause) conditions.push(filterClause);

  const whereClause = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";

  const countRes = await pool.query(
    `SELECT COUNT(*)::int AS total FROM action_plans ${whereClause}`,
    params
  );
  const total = countRes.rows[0]?.total ?? 0;

  params.push(limit, offset);
  const dataRes = await pool.query(
    `SELECT id, no_action_plan, perwakilan_agen, brand, nama_program,
            tgl_mulai, tgl_selesai, total_biaya, created_at
     FROM action_plans
     ${whereClause}
     ORDER BY created_at DESC
     LIMIT $${params.length - 1} OFFSET $${params.length}`,
    params
  );

  const items: ActionPlanListItem[] = dataRes.rows.map((r) => ({
    id: r.id,
    no_action_plan: r.no_action_plan,
    perwakilan_agen: r.perwakilan_agen,
    brand: r.brand,
    nama_program: r.nama_program,
    tgl_mulai: r.tgl_mulai,
    tgl_selesai: r.tgl_selesai,
    total_biaya: r.total_biaya !== null ? Number(r.total_biaya) : null,
    created_at: r.created_at,
    status: deriveStatus(r.tgl_selesai),
  }));

  return { items, total };
}

export interface ActionPlanTableRow {
  id: number;
  area: string;          // fallback ke lokasi_program
  no: string;
  tipe: string;           // fallback ke jenis_program
  brand: string;
  program: string;
  jenis: string;          // jenis_program
  mulai: string | null;
  selesai: string | null;
  Angbiaya: number;       // total anggaranBiaya
  jasa: number;           // total thl
  posm: number;           // total barangPromo
  trial: number;          // total brandJln
  Totbiaya: number;       // total_biaya_yang_dibutuhkan
  estsales: number;       // total target_program.estimasi_total
  tarsales: number;       // total target_event.target_penjualan
  costratio: number | null;   // dari action_plan_analisa row "Total Biaya"
  costperpack: number | null; // dari action_plan_analisa row "Total Biaya"
  status: "Running" | "Closed";
  entri: string | null;  // source_filename dipakai sbg fallback "entri by"
}

export async function listActionPlansTable(opts: {
  search?: string;
  limit: number;
  offset: number;
  filters?: ActionPlanFilters;
}): Promise<{ items: ActionPlanTableRow[]; total: number }> {
  const { search, limit, offset, filters } = opts;
  const params: unknown[] = [];
  const conditions: string[] = [];

  if (search) {
    params.push(`%${search}%`);
    conditions.push(`(
      ap.no_action_plan ILIKE $${params.length}
      OR ap.perwakilan_agen ILIKE $${params.length}
      OR ap.brand ILIKE $${params.length}
      OR ap.nama_program ILIKE $${params.length}
    )`);
  }

  const filterClause = buildFilterClause(filters, params, "ap");
  if (filterClause) conditions.push(filterClause);

  const whereClause = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";

  const countRes = await pool.query(
    `SELECT COUNT(*)::int AS total FROM action_plans ap ${whereClause}`,
    params
  );
  const total = countRes.rows[0]?.total ?? 0;

  params.push(limit, offset);
  const res = await pool.query(
    `
    SELECT
      ap.id,
      ap.lokasi_program,
      ap.no_action_plan,
      ap.jenis_program,
      ap.brand,
      ap.nama_program,
      ap.tgl_mulai,
      ap.tgl_selesai,
      ap.total_biaya_yang_dibutuhkan,
      ap.source_filename,
      COALESCE(agg_ang.total, 0)  AS total_anggaran,
      COALESCE(agg_thl.total, 0)  AS total_jasa,
      COALESCE(agg_brg.total, 0)  AS total_posm,
      COALESCE(agg_bjl.total, 0)  AS total_trial,
      COALESCE(agg_tp.total, 0)   AS total_estimasi_sales,
      COALESCE(agg_te.total, 0)   AS total_target_penjualan,
      an.cost_ratio,
      an.cost_per_pack
    FROM action_plans ap
    LEFT JOIN LATERAL (
      SELECT SUM(total_biaya) AS total FROM action_plan_anggaran WHERE action_plan_id = ap.id
    ) agg_ang ON true
    LEFT JOIN LATERAL (
      SELECT SUM(estimasi_total) AS total FROM action_plan_thl WHERE action_plan_id = ap.id
    ) agg_thl ON true
    LEFT JOIN LATERAL (
      SELECT SUM(estimasi_total) AS total FROM action_plan_barang_promo WHERE action_plan_id = ap.id
    ) agg_brg ON true
    LEFT JOIN LATERAL (
      SELECT SUM(estimasi_total) AS total FROM action_plan_brand_jln WHERE action_plan_id = ap.id
    ) agg_bjl ON true
    LEFT JOIN LATERAL (
      SELECT SUM(estimasi_total) AS total FROM action_plan_target_program WHERE action_plan_id = ap.id
    ) agg_tp ON true
    LEFT JOIN LATERAL (
      SELECT SUM(target_penjualan) AS total FROM action_plan_target_event WHERE action_plan_id = ap.id
    ) agg_te ON true
    LEFT JOIN LATERAL (
      SELECT cost_ratio, cost_per_pack
      FROM action_plan_analisa
      WHERE action_plan_id = ap.id AND analisa_biaya ILIKE 'Total%'
      LIMIT 1
    ) an ON true
    ${whereClause}
    ORDER BY ap.created_at DESC
    LIMIT $${params.length - 1} OFFSET $${params.length}
    `,
    params
  );

  const num = (v: unknown): number => (v === null || v === undefined ? 0 : Number(v));
  const numOrNull = (v: unknown): number | null => (v === null || v === undefined ? null : Number(v));

  const items: ActionPlanTableRow[] = res.rows.map((r) => ({
    id: r.id,
    area: r.lokasi_program ?? "-",
    no: r.no_action_plan ?? "-",
    tipe: r.jenis_program ?? "-",
    brand: r.brand ?? "-",
    program: r.nama_program ?? "-",
    jenis: r.jenis_program ?? "-",
    mulai: r.tgl_mulai,
    selesai: r.tgl_selesai,
    Angbiaya: num(r.total_anggaran),
    jasa: num(r.total_jasa),
    posm: num(r.total_posm),
    trial: num(r.total_trial),
    Totbiaya: numOrNull(r.total_biaya_yang_dibutuhkan) ?? 0,
    estsales: num(r.total_estimasi_sales),
    tarsales: num(r.total_target_penjualan),
    costratio: numOrNull(r.cost_ratio),
    costperpack: numOrNull(r.cost_per_pack),
    status: deriveStatus(r.tgl_selesai),
    entri: r.source_filename,
  }));

  return { items, total };
}

// ---------- Detail ----------

export async function getActionPlanById(id: number): Promise<ActionPlanDetail | null> {
  const headerRes = await pool.query(`SELECT * FROM action_plans WHERE id = $1`, [id]);
  if (headerRes.rowCount === 0) return null;
  const h = headerRes.rows[0];

  const [
    targetProgram, targetEvent, distribusi, anggaran,
    thl, barangPromo, brandJln, tbyd, transfer, analisa,
  ] = await Promise.all([
    pool.query(`SELECT * FROM action_plan_target_program WHERE action_plan_id = $1 ORDER BY sort_order, id`, [id]),
    pool.query(`SELECT * FROM action_plan_target_event WHERE action_plan_id = $1 ORDER BY sort_order, id`, [id]),
    pool.query(`SELECT * FROM action_plan_distribusi WHERE action_plan_id = $1 ORDER BY sort_order, id`, [id]),
    pool.query(`SELECT * FROM action_plan_anggaran WHERE action_plan_id = $1 ORDER BY sort_order, id`, [id]),
    pool.query(`SELECT * FROM action_plan_thl WHERE action_plan_id = $1 ORDER BY sort_order, id`, [id]),
    pool.query(`SELECT * FROM action_plan_barang_promo WHERE action_plan_id = $1 ORDER BY sort_order, id`, [id]),
    pool.query(`SELECT * FROM action_plan_brand_jln WHERE action_plan_id = $1 ORDER BY sort_order, id`, [id]),
    pool.query(`SELECT * FROM action_plan_tbyd WHERE action_plan_id = $1 ORDER BY sort_order, id`, [id]),
    pool.query(`SELECT * FROM action_plan_transfer WHERE action_plan_id = $1 ORDER BY sort_order, id`, [id]),
    pool.query(`SELECT * FROM action_plan_analisa WHERE action_plan_id = $1 ORDER BY sort_order, id`, [id]),
  ]);

  const num = (v: unknown): number | null => (v === null || v === undefined ? null : Number(v));

  return {
    id: h.id,
    no_action_plan: h.no_action_plan,
    perwakilan_agen: h.perwakilan_agen,
    brand: h.brand,
    nama_program: h.nama_program,
    jenis_program: h.jenis_program,
    lokasi_program: h.lokasi_program,
    ditujukan_kepada: h.ditujukan_kepada,
    tembusan: h.tembusan,
    tgl_mulai: h.tgl_mulai,
    tgl_selesai: h.tgl_selesai,
    lama_program_hari: h.lama_program_hari,
    total_biaya: num(h.total_biaya),
    total_biaya_yang_dibutuhkan: num(h.total_biaya_yang_dibutuhkan),
    cost_ratio_percent: num(h.cost_ratio_percent),
    source_filename: h.source_filename,
    uraian: h.uraian,
    LatarBelakang: h.latar_belakang,
    Objektif: h.objektif,
    Mekanisme: h.mekanisme,
    mekanismeDetail: parseJsonbColumn<MekanismeSheet>(h.mekanisme_detail),
    created_at: h.created_at,
    status: deriveStatus(h.tgl_selesai),

    TargetProgram: targetProgram.rows.map((r) => ({
      id: r.id, uraian: r.uraian, brand: r.brand, wbp: num(r.wbp), rbp: num(r.rbp), cbp: num(r.cbp),
      estimasiSales: num(r.estimasi_sales), estimasiTotal: num(r.estimasi_total),
    })),
    TargetEvent: targetEvent.rows.map((r) => ({
      id: r.id, JenisProgram: r.jenis_program, target: r.target, brand: r.brand,
      qty: num(r.qty), harga: num(r.harga), TargetPenjualan: num(r.target_penjualan),
      estimasiTotal: num(r.estimasi_total),
    })),
    DataDistribusi: distribusi.rows.map((r) => ({
      id: r.id, wilayah: r.wilayah, outlet: num(r.outlet), avaibility: num(r.avaibility),
      visibility: num(r.visibility), avg: num(r.avg), status: r.status,
      keterangan: r.keterangan, estimasiTotal: num(r.estimasi_total),
    })),
    anggaranBiaya: anggaran.rows.map((r) => ({
      id: r.id, uraian: r.uraian, qty: num(r.qty), satuan: r.satuan,
      hargaUnit: num(r.harga_unit), totalBiaya: num(r.total_biaya),
    })),
    thl: thl.rows.map((r) => ({
      id: r.id, jasaperorg: r.jasaperorg, jumlahtng: num(r.jumlah_tng),
      harikerja: num(r.hari_kerja), imbalanperhari: num(r.imbalan_perhari),
      estimasiTotal: num(r.estimasi_total),
    })),
    barangPromo: barangPromo.rows.map((r) => ({
      id: r.id, namaBarang: r.nama_barang, origin: r.origin, satuan: r.satuan,
      qty: num(r.qty), hargaUnit: num(r.harga_unit), estimasiTotal: num(r.estimasi_total),
    })),
    brandjln: brandJln.rows.map((r) => ({
      id: r.id, Programjln: r.program_jln, qtybks: num(r.qty_bks), hrgbks: num(r.hrg_bks),
      Nominal: num(r.nominal), estimasiTotal: num(r.estimasi_total),
    })),
    tbyd: tbyd.rows.map((r) => ({
      id: r.id, biayapromo: num(r.biaya_promo), jasaperorg: num(r.jasaperorg),
      kbtbrgprm: num(r.kbt_brg_prm), trialtaste: num(r.trial_taste),
      estimasiTotal: num(r.estimasi_total),
    })),
    transfer: transfer.rows.map((r) => ({
      id: r.id, jenis: r.jenis, tanggal: r.tanggal, jumlah: num(r.jumlah),
    })),
    analisa: analisa.rows.map((r) => ({
      id: r.id, analisabiaya: r.analisa_biaya, costperpack: num(r.cost_per_pack),
      costratio: num(r.cost_ratio), totalcostperpack: num(r.total_cost_per_pack),
      totalcostratio: num(r.total_cost_ratio),
    })),
  };
}

// ---------- Create (dari upload xlsx) ----------

export async function createActionPlanFromFile(
  buffer: Buffer,
  filename: string
): Promise<number> {
  const parsed: ActionPlanParsed = await parseActionPlanBuffer(buffer);
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    const h = parsed.header;
    const headerRes = await client.query(
      `INSERT INTO action_plans (
        no_action_plan, perwakilan_agen, brand, nama_program, jenis_program,
        lokasi_program, tgl_mulai, tgl_selesai, ditujukan_kepada, tembusan,
        lama_program_hari, total_biaya, total_biaya_yang_dibutuhkan,
        cost_ratio_percent, source_filename, uraian, latar_belakang, objektif,
        mekanisme, mekanisme_detail, raw_json
      ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21)
      RETURNING id`,
      [
        h.noActionPlan ?? null,
        h.perwakilanAgen ?? null,
        h.brand ?? null,
        h.namaProgram ?? null,
        h.jenisProgram ?? null,
        h.lokasiProgram ?? null,
        toDateOrNull(h.tglMulai),
        toDateOrNull(h.tglSelesai),
        h.ditujukanKepada ?? null,
        h.tembusan ?? null,
        h.lamaProgramHari ?? null,
        h.totalBiaya ?? null,
        parsed.totalBiayaYangDibutuhkan ?? null,
        parsed.costRatioPercent ?? null,
        filename,
        parsed.uraian ?? null,
        parsed.latarBelakang ?? null,
        parsed.objektif ?? null,
        parsed.mekanisme ?? null,
        parsed.mekanismeDetail ? JSON.stringify(parsed.mekanismeDetail) : null,
        JSON.stringify(parsed),
      ]
    );
    const id: number = headerRes.rows[0].id;

    await insertChildren(client, id, parsed);

    await client.query("COMMIT");
    return id;
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
}

async function insertChildren(client: PoolClient, id: number, parsed: ActionPlanParsed) {
  for (const [i, r] of parsed.targetProgram.entries()) {
    await client.query(
      `INSERT INTO action_plan_target_program (action_plan_id, brand, wbp, rbp, cbp, estimasi_sales, estimasi_total, sort_order)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8)`,
      [id, r.brand, r.wbp ?? null, r.rbp ?? null, r.cbp ?? null, r.estimasiSales ?? null, r.estimasiTotal ?? null, i]
    );
  }
  for (const [i, r] of parsed.targetEvent.entries()) {
    await client.query(
      `INSERT INTO action_plan_target_event (action_plan_id, jenis_program, target, brand, qty, harga, target_penjualan, estimasi_total, sort_order)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)`,
      [id, r.jenisProgram ?? null, r.target ?? null, r.brand ?? null, r.qty ?? null, r.harga ?? null, r.targetPenjualan ?? null, r.estimasiTotal ?? null, i]
    );
  }
  for (const [i, r] of parsed.distribusi.entries()) {
    await client.query(
      `INSERT INTO action_plan_distribusi (action_plan_id, wilayah, outlet, avaibility, visibility, avg, status, keterangan, estimasi_total, sort_order)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)`,
      [id, r.wilayah, r.outlet ?? null, r.avaibility ?? null, r.visibility ?? null, r.avg ?? null, r.status ?? null, r.keterangan ?? null, r.estimasiTotal ?? null, i]
    );
  }
  for (const [i, r] of parsed.anggaranBiaya.entries()) {
    await client.query(
      `INSERT INTO action_plan_anggaran (action_plan_id, uraian, qty, satuan, harga_unit, total_biaya, sort_order)
       VALUES ($1,$2,$3,$4,$5,$6,$7)`,
      [id, r.uraian, r.qty ?? null, r.satuan ?? null, r.hargaUnit ?? null, r.totalBiaya ?? null, i]
    );
  }
  for (const [i, r] of parsed.thl.entries()) {
    await client.query(
      `INSERT INTO action_plan_thl (action_plan_id, jasaperorg, jumlah_tng, hari_kerja, imbalan_perhari, estimasi_total, sort_order)
       VALUES ($1,$2,$3,$4,$5,$6,$7)`,
      [id, r.jasaperorg, r.jumlahTng ?? null, r.hariKerja ?? null, r.imbalanPerhari ?? null, r.estimasiTotal ?? null, i]
    );
  }
  for (const [i, r] of parsed.barangPromo.entries()) {
    await client.query(
      `INSERT INTO action_plan_barang_promo (action_plan_id, nama_barang, origin, satuan, qty, harga_unit, estimasi_total, sort_order)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8)`,
      [id, r.namaBarang, r.origin ?? null, r.satuan ?? null, r.qty ?? null, r.hargaUnit ?? null, r.estimasiTotal ?? null, i]
    );
  }
  for (const [i, r] of parsed.brandJln.entries()) {
    await client.query(
      `INSERT INTO action_plan_brand_jln (action_plan_id, program_jln, qty_bks, hrg_bks, nominal, estimasi_total, sort_order)
       VALUES ($1,$2,$3,$4,$5,$6,$7)`,
      [id, r.programJln, r.qtyBks ?? null, r.hrgBks ?? null, r.nominal ?? null, r.estimasiTotal ?? null, i]
    );
  }
  for (const [i, r] of parsed.tbyd.entries()) {
    await client.query(
      `INSERT INTO action_plan_tbyd (action_plan_id, biaya_promo, jasaperorg, kbt_brg_prm, trial_taste, estimasi_total, sort_order)
       VALUES ($1,$2,$3,$4,$5,$6,$7)`,
      [id, r.biayaPromo ?? null, r.jasaperorg ?? null, r.kbtBrgPrm ?? null, r.trialTaste ?? null, r.estimasiTotal ?? null, i]
    );
  }
  for (const [i, r] of parsed.transfer.entries()) {
    await client.query(
      `INSERT INTO action_plan_transfer (action_plan_id, jenis, tanggal, jumlah, sort_order)
       VALUES ($1,$2,$3,$4,$5)`,
      [id, r.jenis ?? null, toDateOrNull(r.tanggal), r.jumlah ?? null, i]
    );
  }
  for (const [i, r] of parsed.analisa.entries()) {
    await client.query(
      `INSERT INTO action_plan_analisa (action_plan_id, analisa_biaya, cost_per_pack, cost_ratio, sort_order)
       VALUES ($1,$2,$3,$4,$5)`,
      [id, r.analisaBiaya, r.costPerPack ?? null, r.costRatio ?? null, i]
    );
  }
}

// ---------- Update (edit dari form) ----------

const HEADER_FIELD_MAP: Record<string, string> = {
  no_action_plan: "no_action_plan",
  perwakilan_agen: "perwakilan_agen",
  brand: "brand",
  nama_program: "nama_program",
  jenis_program: "jenis_program",
  lokasi_program: "lokasi_program",
  tgl_mulai: "tgl_mulai",
  tgl_selesai: "tgl_selesai",
  ditujukan_kepada: "ditujukan_kepada",
  lama_program_hari: "lama_program_hari",
  total_biaya: "total_biaya",
  uraian: "uraian",
  LatarBelakang: "latar_belakang",
  Objektif: "objektif",
  Mekanisme: "mekanisme",
};

const DATE_FIELDS = new Set(["tgl_mulai", "tgl_selesai"]);

export async function updateActionPlanFull(
  id: number,
  data: Record<string, unknown>
): Promise<void> {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    // --- Update scalar header fields ---
    const setClauses: string[] = [];
    const values: unknown[] = [];
    let idx = 1;
    for (const [key, column] of Object.entries(HEADER_FIELD_MAP)) {
      if (key in data) {
        const raw = data[key];
        setClauses.push(`${column} = $${idx}`);
        values.push(DATE_FIELDS.has(column) ? toDateOrNull(raw) : raw);
        idx++;
      }
    }

    // mekanismeDetail (JSONB) ditangani terpisah karena perlu di-stringify
    if ("mekanismeDetail" in data) {
      setClauses.push(`mekanisme_detail = $${idx}`);
      values.push(data.mekanismeDetail ? JSON.stringify(data.mekanismeDetail) : null);
      idx++;
    }

    if (setClauses.length > 0) {
      values.push(id);
      await client.query(
        `UPDATE action_plans SET ${setClauses.join(", ")}, updated_at = NOW() WHERE id = $${idx}`,
        values
      );
    }

    // --- Replace child arrays (delete lalu insert ulang) ---
    if ("TargetProgram" in data) {
      await client.query(`DELETE FROM action_plan_target_program WHERE action_plan_id = $1`, [id]);
      const rows = data.TargetProgram as any[];
      for (const [i, r] of rows.entries()) {
        await client.query(
          `INSERT INTO action_plan_target_program (action_plan_id, brand, wbp, rbp, cbp, estimasi_sales, estimasi_total, sort_order)
           VALUES ($1,$2,$3,$4,$5,$6,$7,$8)`,
          [id, r.brand ?? null, r.wbp ?? null, r.rbp ?? null, r.cbp ?? null, r.estimasiSales ?? null, r.estimasiTotal ?? null, i]
        );
      }
    }
    if ("TargetEvent" in data) {
      await client.query(`DELETE FROM action_plan_target_event WHERE action_plan_id = $1`, [id]);
      const rows = data.TargetEvent as any[];
      for (const [i, r] of rows.entries()) {
        await client.query(
          `INSERT INTO action_plan_target_event (action_plan_id, jenis_program, target, brand, qty, harga, target_penjualan, estimasi_total, sort_order)
           VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)`,
          [id, r.JenisProgram ?? null, r.target ?? null, r.brand ?? null, r.qty ?? null, r.harga ?? null, r.TargetPenjualan ?? null, r.estimasiTotal ?? null, i]
        );
      }
    }
    if ("DataDistribusi" in data) {
      await client.query(`DELETE FROM action_plan_distribusi WHERE action_plan_id = $1`, [id]);
      const rows = data.DataDistribusi as any[];
      for (const [i, r] of rows.entries()) {
        await client.query(
          `INSERT INTO action_plan_distribusi (action_plan_id, wilayah, outlet, avaibility, visibility, avg, status, keterangan, estimasi_total, sort_order)
           VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)`,
          [id, r.wilayah ?? null, r.outlet ?? null, r.avaibility ?? null, r.visibility ?? null, r.avg ?? null, r.status ?? null, r.keterangan ?? null, r.estimasiTotal ?? null, i]
        );
      }
    }
    if ("anggaranBiaya" in data) {
      await client.query(`DELETE FROM action_plan_anggaran WHERE action_plan_id = $1`, [id]);
      const rows = data.anggaranBiaya as any[];
      for (const [i, r] of rows.entries()) {
        await client.query(
          `INSERT INTO action_plan_anggaran (action_plan_id, uraian, qty, satuan, harga_unit, total_biaya, sort_order)
           VALUES ($1,$2,$3,$4,$5,$6,$7)`,
          [id, r.uraian ?? null, r.qty ?? null, r.satuan ?? null, r.hargaUnit ?? null, r.totalBiaya ?? null, i]
        );
      }
    }
    if ("thl" in data) {
      await client.query(`DELETE FROM action_plan_thl WHERE action_plan_id = $1`, [id]);
      const rows = data.thl as any[];
      for (const [i, r] of rows.entries()) {
        await client.query(
          `INSERT INTO action_plan_thl (action_plan_id, jasaperorg, jumlah_tng, hari_kerja, imbalan_perhari, estimasi_total, sort_order)
           VALUES ($1,$2,$3,$4,$5,$6,$7)`,
          [id, r.jasaperorg ?? null, r.jumlahtng ?? null, r.harikerja ?? null, r.imbalanperhari ?? null, r.estimasiTotal ?? null, i]
        );
      }
    }
    if ("barangPromo" in data) {
      await client.query(`DELETE FROM action_plan_barang_promo WHERE action_plan_id = $1`, [id]);
      const rows = data.barangPromo as any[];
      for (const [i, r] of rows.entries()) {
        await client.query(
          `INSERT INTO action_plan_barang_promo (action_plan_id, nama_barang, origin, satuan, qty, harga_unit, estimasi_total, sort_order)
           VALUES ($1,$2,$3,$4,$5,$6,$7,$8)`,
          [id, r.namaBarang ?? null, r.origin ?? null, r.satuan ?? null, r.qty ?? null, r.hargaUnit ?? null, r.estimasiTotal ?? null, i]
        );
      }
    }
    if ("brandjln" in data) {
      await client.query(`DELETE FROM action_plan_brand_jln WHERE action_plan_id = $1`, [id]);
      const rows = data.brandjln as any[];
      for (const [i, r] of rows.entries()) {
        await client.query(
          `INSERT INTO action_plan_brand_jln (action_plan_id, program_jln, qty_bks, hrg_bks, nominal, estimasi_total, sort_order)
           VALUES ($1,$2,$3,$4,$5,$6,$7)`,
          [id, r.Programjln ?? null, r.qtybks ?? null, r.hrgbks ?? null, r.Nominal ?? null, r.estimasiTotal ?? null, i]
        );
      }
    }
    if ("tbyd" in data) {
      await client.query(`DELETE FROM action_plan_tbyd WHERE action_plan_id = $1`, [id]);
      const rows = data.tbyd as any[];
      for (const [i, r] of rows.entries()) {
        await client.query(
          `INSERT INTO action_plan_tbyd (action_plan_id, biaya_promo, jasaperorg, kbt_brg_prm, trial_taste, estimasi_total, sort_order)
           VALUES ($1,$2,$3,$4,$5,$6,$7)`,
          [id, r.biayapromo ?? null, r.jasaperorg ?? null, r.kbtbrgprm ?? null, r.trialtaste ?? null, r.estimasiTotal ?? null, i]
        );
      }
    }
    if ("transfer" in data) {
      await client.query(`DELETE FROM action_plan_transfer WHERE action_plan_id = $1`, [id]);
      const rows = data.transfer as any[];
      for (const [i, r] of rows.entries()) {
        await client.query(
          `INSERT INTO action_plan_transfer (action_plan_id, jenis, tanggal, jumlah, sort_order)
           VALUES ($1,$2,$3,$4,$5)`,
          [id, r.jenis ?? null, toDateOrNull(r.tanggal), r.jumlah ?? null, i]
        );
      }
    }
    if ("analisa" in data) {
      await client.query(`DELETE FROM action_plan_analisa WHERE action_plan_id = $1`, [id]);
      const rows = data.analisa as any[];
      for (const [i, r] of rows.entries()) {
        await client.query(
          `INSERT INTO action_plan_analisa (action_plan_id, analisa_biaya, cost_per_pack, cost_ratio, total_cost_per_pack, total_cost_ratio, sort_order)
           VALUES ($1,$2,$3,$4,$5,$6,$7)`,
          [id, r.analisabiaya ?? null, r.costperpack ?? null, r.costratio ?? null, r.totalcostperpack ?? null, r.totalcostratio ?? null, i]
        );
      }
    }

    await client.query("COMMIT");
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
}

// ---------- Delete ----------

export async function deleteActionPlan(id: number): Promise<void> {
  await pool.query(`DELETE FROM action_plans WHERE id = $1`, [id]);
}

// ---------- Summary (buat Overview.tsx) ----------

export interface ActionPlanSummary {
  totalActionPlan: number;
  totalClosed: number;
  totalRunning: number;
  totalBiaya: number;
}

export async function getActionPlanSummary(filters?: ActionPlanFilters): Promise<ActionPlanSummary> {
  const params: unknown[] = [];
  const conditions: string[] = [];

  const filterClause = buildFilterClause(filters, params);
  if (filterClause) conditions.push(filterClause);

  const whereClause = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";

  const res = await pool.query(
    `
    SELECT
      COUNT(*)::int AS total,
      COUNT(*) FILTER (WHERE tgl_selesai < NOW())::int AS closed,
      COUNT(*) FILTER (WHERE tgl_selesai >= NOW() OR tgl_selesai IS NULL)::int AS running,
      COALESCE(SUM(total_biaya), 0)::numeric AS total_biaya
    FROM action_plans
    ${whereClause}
    `,
    params
  );
  const r = res.rows[0];
  return {
    totalActionPlan: r.total,
    totalClosed: r.closed,
    totalRunning: r.running,
    totalBiaya: Number(r.total_biaya),
  };
}