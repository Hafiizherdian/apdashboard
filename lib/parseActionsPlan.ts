import ExcelJS from "exceljs";

// ---------- Types ----------

export interface ActionPlanHeader {
  noActionPlan?: string;
  perwakilanAgen?: string;
  brand?: string;
  namaProgram?: string;
  jenisProgram?: string;
  lokasiProgram?: string;
  tglMulai?: string;
  tglSelesai?: string;
  ditujukanKepada?: string;
  tembusan?: string[];
  lamaProgramHari?: number;
  totalBiaya?: number;
}

export interface TargetProgramRow {
  brand: string;
  wbp?: number;
  rbp?: number;
  cbp?: number;
  estimasiSales?: number;
  estimasiTotal?: number;
}

export interface TargetEventRow {
  jenisProgram?: string;
  target?: string;
  brand?: string;
  qty?: number;
  harga?: number;
  targetPenjualan?: number;
  estimasiTotal?: number;
}

export interface DistribusiRow {
  wilayah: string;
  outlet?: number;
  avaibility?: number;
  visibility?: number;
  avg?: number;
  status?: string;
  keterangan?: string;
  estimasiTotal?: number;
}

export interface AnggaranRow {
  uraian: string;
  qty?: number;
  satuan?: string;
  hargaUnit?: number;
  totalBiaya?: number;
}

export interface ThlRow {
  jasaperorg: string;
  jumlahTng?: number;
  hariKerja?: number;
  imbalanPerhari?: number;
  estimasiTotal?: number;
}

export interface BarangPromoRow {
  namaBarang: string;
  origin?: string;
  satuan?: string;
  qty?: number;
  hargaUnit?: number;
  estimasiTotal?: number;
}

export interface BrandJlnRow {
  programJln: string;
  qtyBks?: number;
  hrgBks?: number;
  nominal?: number;
  estimasiTotal?: number;
}

export interface TbydRow {
  biayaPromo?: number;
  jasaperorg?: number;
  kbtBrgPrm?: number;
  trialTaste?: number;
  estimasiTotal?: number;
}

export interface TransferRow {
  jenis?: string;
  tanggal?: string;
  jumlah?: number;
}

export interface AnalisaRow {
  analisaBiaya: string;
  costPerPack?: number;
  costRatio?: number;
  totalCostPerPack?: number;
  totalCostRatio?: number;
}

/** Satu sub-program di sheet "MEKANISME PROGRAM" (mis. "POSM STIKER", "TRIAL TASTE...", "TARGET SALES") */
export interface MekanismeSubProgram {
  nomor: number | null;
  judul: string;
  tipe: "POSM" | "TRIAL_TASTE" | "TARGET_SALES" | "LAINNYA";
  headerKolom: string[];
  rows: (string | number | null)[][];
  totalRow?: (string | number | null)[] | null;
  notes: string[];
}

export interface MekanismeSheet {
  judulSheet?: string;
  noActionPlanRef?: string;
  deskripsi?: string;
  subPrograms: MekanismeSubProgram[];
}

// ---------- Sheet ke-3, varian A: EVALUASI ACTION PLAN (JENIS PROGRAM = ACTIVATION dsb) ----------

export interface EvaluasiEventRow {
  jenisProgram?: string;
  target?: string;
  brand: string;
  qty?: number;
  hargaBks?: number;
  persen?: number;
  totalTargetPenjualan?: number;
}

export interface EvaluasiAnggaranRow {
  label: string;
  biayaPromosi?: number;
  biayaPosm?: number;
  biayaSampling?: number;
  totalBiaya?: number;
}

export interface EvaluasiSamplingItemRow {
  brand: string;
  kebutuhan?: number | string;
  hargaBks?: number;
  nominal?: number;
}

export interface EvaluasiSamplingGroup {
  label: string;
  items: EvaluasiSamplingItemRow[];
}

export interface EvaluasiSignature {
  label: string;
  tanggal?: string;
  nama?: string;
  jabatan?: string;
}

export interface EvaluasiSheet {
  targetEvent: EvaluasiEventRow[];
  realisasiEvent: EvaluasiEventRow[];
  penjelasanTargetEvent: string[];
  anggaran: EvaluasiAnggaranRow[];
  penjelasanAnggaran: string[];
  samplingGroups: EvaluasiSamplingGroup[];
  samplingDeviasi: EvaluasiSamplingItemRow | null;
  penjelasanSampling: string[];
  evaluasiProgram: string[];
  signatures: EvaluasiSignature[];
}

// ---------- Sheet ke-3, varian B: EVALUASI ACTION PLAN (JENIS PROGRAM = TRADE PROMO) ----------

export interface EvaluasiPencapaianRow {
  /** Biasanya berisi "0" (placeholder template) atau nama baris, jarang bermakna kecuali baris TOTAL */
  keterangan?: string;
  totalTarget?: number;
  actualTercapai?: number;
  pencapaianPercent?: number;
}

export interface EvaluasiSalesRow {
  /** PENGAJUAN (default, baris pertama tanpa label eksplisit) / REALISASI SALES / DEVIASI */
  label: string;
  keterangan?: string;
  targetSalesBks?: number;
  potonganPerBks?: number;
  /** Kolom nominal rupiah di ujung kanan baris, biasanya tidak punya header sendiri */
  nominal?: number;
}

export interface EvaluasiWsWeekValue {
  /** Label minggu asli dari header, mis. "W01 - W04", "W03 - W06", dst — apapun isinya. */
  label: string;
  target?: number;
  actual?: number;
  /** Selalu dihitung (actual/target), bukan dibaca dari sheet — lihat catatan di extractWsTable. */
  pencapaianPercent?: number;
}

export interface EvaluasiWsRow {
  ws?: string;
  /** Bisa berisi berapapun grup minggu — 1, 2, 3, dst — tergantung file. */
  weeks: EvaluasiWsWeekValue[];
  totalTarget?: number;
  bonusPerBks?: number;
  keterangan?: string;
}

export interface EvaluasiBiayaRow {
  /** PENGAJUAN / REALISASI / DEVIASI */
  label: string;
  biayaPromosi?: number;
  jasaPerorangan?: number;
  biayaPosm?: number;
  trialTaste?: number;
  totalBiaya?: number;
}

export interface EvaluasiBiayaBreakdownRow {
  keterangan?: string;
  budget?: number;
  actual?: number;
  persen?: number;
}

export interface TradePromoEvaluasiSheet {
  pencapaianProgram: EvaluasiPencapaianRow[];
  pencapaianProgramTotal?: EvaluasiPencapaianRow;
  targetPenjualanTercapaiPercent1?: number;

  salesRows: EvaluasiSalesRow[];
  targetPenjualanTercapaiPercent2?: number;

  wsRows: EvaluasiWsRow[];
  wsTotal?: EvaluasiWsRow;
  targetPenjualanTercapaiPercent3?: number;

  biayaRows: EvaluasiBiayaRow[];
  totalBiayaTerpakaiPercent?: number;

  biayaPromosiBreakdown: EvaluasiBiayaBreakdownRow[];
  trialTasteBreakdown: EvaluasiBiayaBreakdownRow[];

  evaluasiProgram: string[];
  kendala: string[];
  planSelanjutnya: string[];
  signatures: EvaluasiSignature[]; 
}

/** Union hasil parsing sheet Evaluasi, karena layoutnya beda total antara jenis program Activation vs Trade Promo. */
export type EvaluasiSheetResult =
  | { kind: "activation"; data: EvaluasiSheet }
  | { kind: "trade_promo"; data: TradePromoEvaluasiSheet };

export interface ActionPlanParsed {
  header: ActionPlanHeader;
  uraian?: string;
  latarBelakang?: string;
  objektif?: string;
  mekanisme?: string;
  targetProgram: TargetProgramRow[];
  targetEvent: TargetEventRow[];
  distribusi: DistribusiRow[];
  anggaranBiaya: AnggaranRow[];
  thl: ThlRow[];
  barangPromo: BarangPromoRow[];
  brandJln: BrandJlnRow[];
  tbyd: TbydRow[];
  transfer: TransferRow[];
  analisa: AnalisaRow[];
  totalBiayaYangDibutuhkan?: number;
  costRatioPercent?: number;
  mekanismeDetail?: MekanismeSheet | null;
  evaluasi?: EvaluasiSheetResult | null;
  rawGrid: (string | number | null)[][];
}

// ---------- Core helpers ----------

function sheetToGrid(sheet: ExcelJS.Worksheet): (string | number | null)[][] {
  const grid: (string | number | null)[][] = [];
  const maxRow = sheet.rowCount;
  const maxCol = sheet.columnCount;

  for (let r = 1; r <= maxRow; r++) {
    const row: (string | number | null)[] = [];
    for (let c = 1; c <= maxCol; c++) {
      const cell = sheet.getCell(r, c);
      let val = cell.value;

      if (val && typeof val === "object") {
        if ("result" in val) val = (val as any).result;
        else if ("richText" in val) {
          val = (val as any).richText.map((t: any) => t.text).join("");
        } else if ("text" in val) {
          val = (val as any).text;
        }
      }

      row.push((val as string | number) ?? null);
    }
    grid.push(row);
  }
  return grid;
}

function normalize(s: unknown): string {
  return String(s ?? "")
    .replace(/\s+/g, " ")
    .trim()
    .toUpperCase();
}

/** Cari cell pertama di seluruh grid yang labelnya cocok (contains). */
function findLabelCell(
  grid: (string | number | null)[][],
  label: string,
  exact = false
): { row: number; col: number } | null {
  const target = normalize(label);
  for (let r = 0; r < grid.length; r++) {
    for (let c = 0; c < grid[r].length; c++) {
      const cellVal = normalize(grid[r][c]);
      if (!cellVal) continue;
      const match = exact ? cellVal === target : cellVal.includes(target);
      if (match) {
        return { row: r + 1, col: c + 1 };
      }
    }
  }
  return null;
}
/** Sama seperti findLabelCell, tapi KHUSUS buat cari section header di sheet Evaluasi.
 *  Coba EXACT match dulu -- sel judul section (mis. "SAMPLING", "ANGGARAN BIAYA PROMOSI")
 *  selalu pendek & berdiri sendiri di satu cell. Kalau langsung pakai substring match kayak
 *  findLabelCell biasa, kata yang sama bisa ke-collide sama kata di TENGAH paragraf
 *  penjelasan (mis. "...maupun sampling—telah..." di penjelasan Anggaran ikut ke-anggap
 *  match "SAMPLING"), padahal paragraf itu muncul SEBELUM section aslinya -> section
 *  row ke-detect salah, geser ke baris yang salah.
 *  Fallback ke substring cuma buat label yang emang gak akan exact-match (mis. "DIBUAT
 *  OLEH" vs cell asli "DIBUAT OLEH :"). */
function findSectionLabelCell(
  grid: (string | number | null)[][],
  label: string
): { row: number; col: number } | null {
  const target = normalize(label);

  for (let r = 0; r < grid.length; r++) {
    for (let c = 0; c < grid[r].length; c++) {
      if (normalize(grid[r][c]) === target) return { row: r + 1, col: c + 1 };
    }
  }
  for (let r = 0; r < grid.length; r++) {
    for (let c = 0; c < grid[r].length; c++) {
      const cellVal = normalize(grid[r][c]);
      if (cellVal && cellVal.includes(target)) return { row: r + 1, col: c + 1 };
    }
  }
  return null;
}

/** Sama seperti findLabelCell, tapi mulai pencarian dari baris tertentu (dipakai untuk
 *  mencari kemunculan KE-2/KE-3 dari sebuah label yang berulang di sheet Trade Promo). */
function findLabelCellFrom(
  grid: (string | number | null)[][],
  fromRow: number,
  label: string,
  exact = false
): { row: number; col: number } | null {
  const target = normalize(label);
  for (let r = Math.max(fromRow - 1, 0); r < grid.length; r++) {
    for (let c = 0; c < grid[r].length; c++) {
      const cellVal = normalize(grid[r][c]);
      if (!cellVal) continue;
      const match = exact ? cellVal === target : cellVal.includes(target);
      if (match) {
        return { row: r + 1, col: c + 1 };
      }
    }
  }
  return null;
}

/** Cari label di baris tertentu saja (buat disambiguasi tabel yang bersebelahan). */
function findLabelCellInRow(
  grid: (string | number | null)[][],
  rowIdx1: number,
  label: string
): number | null {
  const row = grid[rowIdx1 - 1];
  if (!row) return null;
  const target = normalize(label);

  // GUNAKAN === (EXACT MATCH) AGAR TIDAK TERKECOH "MIX BRAND" DI NO. ACTION PLAN
  const idx = row.findIndex((v) => normalize(v) === target);
  return idx === -1 ? null : idx + 1;
}

function valueRightOf(
  grid: (string | number | null)[][],
  row: number,
  col: number,
  maxLookahead = 15
): string | number | null {
  const r = row - 1;
  const labelText = normalize(grid[r][col - 1]);
  for (let c = col; c < col - 1 + maxLookahead && c < grid[r].length; c++) {
    const v = grid[r][c];
    const nv = normalize(v);
    if (v !== null && v !== "" && nv !== ":" && nv !== labelText) return v;
  }
  return null;
}

function toNumber(v: unknown): number | undefined {
  if (v === null || v === undefined || v === "") return undefined;
  if (typeof v === "number") return v;
  const cleaned = String(v).replace(/[^\d.-]/g, "");
  if (cleaned === "" || cleaned === "-" || cleaned === ".") return undefined;
  const n = parseFloat(cleaned);
  return isNaN(n) ? undefined : n;
}

/** True kalau cell berisi nilai error Excel (#DIV/0!, #REF!, #N/A, dst). toNumber() naif akan
 *  ikut "mengambil" digit yang nyasar di dalam teks error ini (mis. "#DIV/0!" -> 0), jadi
 *  semua pembacaan angka di sheet Trade Promo (yang banyak #DIV/0! & #REF!) wajib dicek dulu
 *  lewat toNumberSafe(), bukan toNumber() langsung. */
function isErrorValue(v: unknown): boolean {
  return typeof v === "string" && v.trim().startsWith("#");
}

function toNumberSafe(v: unknown): number | undefined {
  if (isErrorValue(v)) return undefined;
  return toNumber(v);
}

/** Cari angka pertama di sebelah kanan sebuah label pada baris yang sama. */
function numberRightOfLabel(
  grid: (string | number | null)[][],
  row: number,
  label: string
): number | undefined {
  const rowVals = grid[row - 1];
  if (!rowVals) return undefined;
  const idx = rowVals.findIndex((v) => normalize(v).includes(normalize(label)));
  if (idx === -1) return undefined;
  for (let c = idx + 1; c < rowVals.length; c++) {
    if (isErrorValue(rowVals[c])) return undefined;
    const n = toNumber(rowVals[c]);
    if (n !== undefined) return n;
  }
  return undefined;
}

/** Buat peta { key: kolomIndex0 } dari sebuah baris header.
 *  labels bisa string tunggal ATAU array alias string (dicoba satu-satu). */
function getColumnMap(
  grid: (string | number | null)[][],
  rowIdx1: number,
  labels: Record<string, string | string[]>,
  excludeText?: string
): Record<string, number> {
  const row = grid[rowIdx1 - 1] || [];
  const excludeNorm = excludeText ? normalize(excludeText) : null;
  const map: Record<string, number> = {};

  for (const [key, labelOrAliases] of Object.entries(labels)) {
    const aliases = Array.isArray(labelOrAliases) ? labelOrAliases : [labelOrAliases];
    const targets = aliases.map(normalize);

    const idx = row.findIndex((v) => {
      const nv = normalize(v);
      if (excludeNorm && nv === excludeNorm) return false;
      return targets.some((target) => nv.includes(target));
    });

    if (idx !== -1) map[key] = idx;
  }
  return map;
}

function resolveTextColumn(
  rowVals: (string | number | null)[],
  colIdx: number
): string | number | null {
  const v = rowVals[colIdx];
  // kalau isinya angka polos kecil (1,2,3...) kemungkinan itu kolom nomor urut,
  // ambil kolom sebelah kanannya yang isinya teks
  if (typeof v === "number" && Number.isInteger(v) && v < 100) {
    const next = rowVals[colIdx + 1];
    if (next !== null && next !== "" && typeof next !== "number") return next;
  }
  return v;
}

function numberInSpan(
  headerRow: (string | number | null)[],
  dataRow: (string | number | null)[],
  startCol: number,
  labelNorm: string,
  maxSpan = 6
): number | undefined {
  for (let c = startCol; c < startCol + maxSpan && c < headerRow.length; c++) {
    if (!normalize(headerRow[c]).includes(labelNorm)) break; // keluar dari span header ini
    const n = toNumber(dataRow[c]);
    if (n !== undefined) return n;
  }
  return undefined;
}

// ---------- Peta section anak & batas baris ----------

const CHILD_SECTIONS = [
  "TARGET PROGRAM",
  "TARGET EVENT ATAU SEJENISNYA",
  "DATA DISTRIBUSI",
  "MEKANISME PROGRAM",
  "PELAKSANA PROGRAM",
  "ANGGARAN BIAYA PROMOSI YANG DIAJUKAN",
  "TENAGA KERJA LEPAS",
  "KEBUTUHAN BARANG PROMOSI YANG DIAJUKAN",
] as const;

function findSectionRows(grid: (string | number | null)[][]): Record<string, number> {
  const rows: Record<string, number> = {};
  for (const label of CHILD_SECTIONS) {
    const pos = findLabelCell(grid, label);
    if (pos) rows[label] = pos.row;
  }
  return rows;
}

/** Baris terakhir (inklusif) sebelum section anak berikutnya dimulai. */
function sectionEnd(rows: Record<string, number>, label: string, gridLen: number): number {
  const start = rows[label];
  if (!start) return gridLen;
  const nexts = Object.values(rows)
    .filter((r) => r > start)
    .sort((a, b) => a - b);
  return (nexts[0] ?? gridLen + 1) - 1;
}

// ---------- Header ----------

function extractHeader(grid: (string | number | null)[][]): ActionPlanHeader {
  const get = (label: string, exact = false) => {
    const pos = findLabelCell(grid, label, exact);
    return pos ? valueRightOf(grid, pos.row, pos.col) : null;
  };

  const header: ActionPlanHeader = {
    noActionPlan: String(get("NO. ACTION PLAN") ?? ""),
    perwakilanAgen: String(get("PERWAKILAN") ?? ""),
    brand: String(get("BRAND", true) ?? ""), // <-- exact match
    namaProgram: String(get("NAMA PROGRAM") ?? ""),
    jenisProgram: String(get("JENIS PROGRAM") ?? ""),
    lokasiProgram: String(get("LOKASI PROGRAM") ?? ""),
    ditujukanKepada: String(get("DITUJUKAN KPD") ?? ""),
    totalBiaya: toNumber(get("TOTAL BIAYA", true)), // jaga-jaga juga
  };

  // Tanggal pelaksanaan: pemisahnya bisa "S/D" atau "sd"
  const tglPos = findLabelCell(grid, "TGL. PELAKSANAAN");
  if (tglPos) {
    const rowVals = grid[tglPos.row - 1];
    const sdIdx = rowVals.findIndex((v) => ["S/D", "SD"].includes(normalize(v)));
    if (sdIdx > -1) {
      for (let c = tglPos.col; c < sdIdx; c++) {
        if (rowVals[c]) header.tglMulai = String(rowVals[c]);
      }
      for (let c = sdIdx + 1; c < rowVals.length; c++) {
        if (rowVals[c]) {
          header.tglSelesai = String(rowVals[c]);
          break;
        }
      }
    }
  }

  // Tembusan
  const cc = findLabelCell(grid, "TEMBUSAN");
  if (cc) {
    const list: string[] = [];
    const first = valueRightOf(grid, cc.row, cc.col);
    if (first) list.push(String(first));
    let r = cc.row + 1;
    while (r <= grid.length) {
      const rowVals = grid[r - 1];
      const val = rowVals[cc.col - 1] ?? rowVals.find((v) => v !== null && v !== "");
      if (!val || normalize(val).length < 2) break;
      if (/^[A-Z .]+:$/.test(normalize(val))) break;
      list.push(String(val));
      r++;
    }
    header.tembusan = list;

    // Lama program (hari)
    const rowVals = grid[cc.row - 1];
    const hariIdx = rowVals.findIndex((v) => normalize(v) === "HARI");
    if (hariIdx > 0) {
      const num = toNumber(rowVals[hariIdx - 1]);
      if (num !== undefined) header.lamaProgramHari = num;
    }
  }

  return header;
}

// ---------- Latar Belakang / Objektif / Mekanisme ----------

function extractNumberedList(
  grid: (string | number | null)[][],
  anchorLabel: string,
  stopLabels: string[]
): string | undefined {
  const pos = findLabelCell(grid, anchorLabel);
  if (!pos) return undefined;

  const lines: string[] = [];
  let emptyStreak = 0;
  let bulletCol: number | null = null;

  for (let r = pos.row; r <= grid.length; r++) {
    const rowVals = grid[r - 1];
    const startCol = r === pos.row ? pos.col : 0;

    // --- CEK DULU: apakah baris ini section header baru (stop / child section lain)? ---
    if (r > pos.row) {
      const headerHit = rowVals.some((v, idx) => {
        if (bulletCol !== null && idx === bulletCol) return false; // jangan cek kolom bullet
        const nv = normalize(v);
        if (!nv) return false;
        return (
          stopLabels.some((s) => nv.includes(normalize(s))) ||
          CHILD_SECTIONS.some((s) => nv.includes(normalize(s)))
        );
      });
      if (headerHit) break; // stop SEBELUM baca bullet di baris ini
    }

    let bulletIdx = -1;

    if (bulletCol !== null) {
      const v = rowVals[bulletCol];
      if (v !== null && /^\d{1,2}$/.test(String(v).trim())) {
        bulletIdx = bulletCol;
      }
    } else {
      for (let c = startCol; c < rowVals.length; c++) {
        const v = rowVals[c];
        if (v === null) continue;
        if (/^\d{1,2}$/.test(String(v).trim())) {
          bulletIdx = c;
          break;
        }
      }
    }

    if (bulletIdx === -1) {
      const anyVal = rowVals.slice(startCol).find((v) => v !== null && v !== "");
      if (anyVal && stopLabels.some((s) => normalize(anyVal).includes(normalize(s)))) break;
      if (r > pos.row) {
        emptyStreak++;
        if (emptyStreak >= 2) break;
      }
      continue;
    }

    if (bulletCol === null) bulletCol = bulletIdx;

    emptyStreak = 0;
    const text = rowVals.slice(bulletIdx + 1).find((v) => v !== null && v !== "");

    if (text) {
      const normalizedText = normalize(text);
      if (
        stopLabels.some((s) => normalizedText.includes(normalize(s))) ||
        CHILD_SECTIONS.some((s) => normalizedText.includes(normalize(s)))
      ) {
        break;
      }
      lines.push(String(text).trim());
    }
  }

  return lines.length ? lines.join("\n") : undefined;
}

// ---------- Target Program ----------

function extractUraianProgram(
  grid: (string | number | null)[][],
  rows: Record<string, number>,
  gridLen: number // <-- param baru
): string | undefined {
  const label = "TARGET PROGRAM";
  const pos = findLabelCell(grid, label);
  if (!pos || !rows[label]) return undefined;

  const headerRow = rows[label];
  const headerRowVals = grid[headerRow - 1];

  // cari posisi kolom "BRAND" di baris header, jadi batas kanan
  const colMap = getColumnMap(grid, headerRow, { brand: "BRAND" });
  const endCol = colMap.brand !== undefined ? colMap.brand : headerRowVals.length; // 0-based, exclusive

  // batas bawah = akhir section TARGET PROGRAM (sebelum section anak berikutnya)
  const end = sectionEnd(rows, label, gridLen);

  const parts: string[] = [];
  for (let r = headerRow; r <= end; r++) {
    const rowVals = grid[r - 1];
    // di baris header, mulai setelah cell "TARGET PROGRAM" itu sendiri
    // const startCol = r === headerRow ? pos.col : 0;
    for (let c = pos.col; c < endCol; c++) {
      const v = rowVals[c];
      if (v === null || v === "") continue;
      if (normalize(v) === normalize(label)) continue;
      parts.push(String(v).trim());
    }
  }

  return parts.length ? parts.join("\n") : undefined;
}

function extractTargetProgram(
  grid: (string | number | null)[][],
  rows: Record<string, number>,
  gridLen: number
): TargetProgramRow[] {
  const label = "TARGET PROGRAM";
  if (!rows[label]) return [];
  const headerRow = rows[label];

  const ESTIMASI_SALES_ALIASES = [
    "ESTIMASI SALES",
    "EST/SALES",
    "EST SALES",
    "ESTIMASI SALES/WEEK",
    "EST SALES/WEEK",
    "EST Omset/Week",
    "Est Omset/w",
    "EST OMZET/WEEK",
    "EST Omzet/Week",
  ];

  const colMap = getColumnMap(grid, headerRow, {
    brand: "BRAND",
    wbp: "WBP",
    rbp: "RBP",
    cbp: "CBP",
    estimasiSales: ESTIMASI_SALES_ALIASES,
  });

  const headerRowVals = grid[headerRow - 1];
  const end = sectionEnd(rows, label, gridLen);
  const out: TargetProgramRow[] = [];

  // ambil teks header ASLI yang ke-match, biar numberInSpan cocok persis
  // dengan varian penulisan yang dipakai di file ini (bukan hardcode).
  const estimasiSalesHeaderNorm =
    colMap.estimasiSales !== undefined ? normalize(headerRowVals[colMap.estimasiSales]) : "";

  for (let r = headerRow + 1; r <= end; r++) {
    const rowVals = grid[r - 1];
    const brand = colMap.brand !== undefined ? resolveTextColumn(rowVals, colMap.brand) : null;
    const wbp = colMap.wbp !== undefined ? toNumber(rowVals[colMap.wbp]) : undefined;
    const rbp = colMap.rbp !== undefined ? toNumber(rowVals[colMap.rbp]) : undefined;
    const cbp = colMap.cbp !== undefined ? toNumber(rowVals[colMap.cbp]) : undefined;
    const estimasiSales =
      colMap.estimasiSales !== undefined
        ? numberInSpan(headerRowVals, rowVals, colMap.estimasiSales, estimasiSalesHeaderNorm)
        : undefined;

    if (!brand && wbp === undefined && rbp === undefined && cbp === undefined && estimasiSales === undefined)
      continue;
    out.push({ brand: brand ? String(brand) : "", wbp, rbp, cbp, estimasiSales });
  }
  return out;
}

// ---------- Target Event atau Sejenisnya ----------

function extractTargetEvent(
  grid: (string | number | null)[][],
  rows: Record<string, number>,
  gridLen: number
): TargetEventRow[] {
  const label = "TARGET EVENT ATAU SEJENISNYA";
  if (!rows[label]) return [];
  const headerRow = rows[label];
  const colMap = getColumnMap(
    grid,
    headerRow,
    {
      jenisProgram: "JENIS PROGRAM",
      target: "TARGET",
      brand: "BRAND",
      qty: "QTY",
      harga: ["HARGA", "HRG/BKS", "HARGA/BKS", "HRG BKS"],
      targetPenjualan: "TARGET PENJUALAN",
    },
    label
  );
  const end = sectionEnd(rows, label, gridLen);
  const out: TargetEventRow[] = [];

  let lastJenis: string | undefined;
  let lastTarget: string | undefined;

  for (let r = headerRow + 1; r <= end; r++) {
    const rowVals = grid[r - 1];
    const brandVal = colMap.brand !== undefined ? rowVals[colMap.brand] : null;
    if (brandVal && normalize(brandVal) === "TOTAL") break;

    const jenis = colMap.jenisProgram !== undefined ? rowVals[colMap.jenisProgram] : null;
    const target = colMap.target !== undefined ? rowVals[colMap.target] : null;
    if (jenis) lastJenis = String(jenis);
    if (target) lastTarget = String(target);

    const qty = colMap.qty !== undefined ? toNumber(rowVals[colMap.qty]) : undefined;
    const harga = colMap.harga !== undefined ? toNumber(rowVals[colMap.harga]) : undefined;
    const targetPenjualan =
      colMap.targetPenjualan !== undefined ? toNumber(rowVals[colMap.targetPenjualan]) : undefined;

    if (!brandVal && qty === undefined && harga === undefined && targetPenjualan === undefined) continue;

    out.push({
      jenisProgram: lastJenis,
      target: lastTarget,
      brand: brandVal ? String(brandVal) : undefined,
      qty,
      harga,
      targetPenjualan,
      estimasiTotal: targetPenjualan,
    });
  }
  return out;
}

// ---------- Data Distribusi ----------

function extractDistribusi(
  grid: (string | number | null)[][],
  rows: Record<string, number>,
  gridLen: number
): DistribusiRow[] {
  const label = "DATA DISTRIBUSI";
  if (!rows[label]) return [];
  const headerRow = rows[label];
  const colMap = getColumnMap(grid, headerRow, {
    wilayah: "AREA",
    outlet: "OUTLET",
    avaibility: "AVAILABILITY",
    visibility: "VISIBILITY",
    avg: "AVG",
    status: "STATUS",
    keterangan: "KETERANGAN",
  });
  const end = sectionEnd(rows, label, gridLen);
  const out: DistribusiRow[] = [];

  for (let r = headerRow + 1; r <= end; r++) {
    const rowVals = grid[r - 1];
    const noIdx = rowVals.findIndex((v) => v !== null && v !== "");
    if (noIdx === -1 || !/^\d+$/.test(String(rowVals[noIdx]).trim())) continue;
    const wilayahCheck = colMap.wilayah !== undefined ? rowVals[colMap.wilayah] : null;
    if (!wilayahCheck && r === headerRow + 1 === false) continue;
    const wilayahRaw = colMap.wilayah !== undefined ? resolveTextColumn(rowVals, colMap.wilayah) : null;
    const wilayah = wilayahRaw && normalize(wilayahRaw) !== "-" ? String(wilayahRaw) : "";
    const outlet = colMap.outlet !== undefined ? toNumber(rowVals[colMap.outlet]) : undefined;
    const avaibility = colMap.avaibility !== undefined ? toNumber(rowVals[colMap.avaibility]) : undefined;
    const visibility = colMap.visibility !== undefined ? toNumber(rowVals[colMap.visibility]) : undefined;
    const avg = colMap.avg !== undefined ? toNumber(rowVals[colMap.avg]) : undefined;
    const hasWilayah = wilayah && typeof wilayahRaw !== "number";
    const hasNumericData = [outlet, avaibility, visibility, avg].some((v) => v !== undefined && v > 0);
    if (!hasWilayah && !hasNumericData) continue;

    out.push({
      wilayah,
      outlet: colMap.outlet !== undefined ? toNumber(rowVals[colMap.outlet]) : undefined,
      avaibility: colMap.avaibility !== undefined ? toNumber(rowVals[colMap.avaibility]) : undefined,
      visibility: colMap.visibility !== undefined ? toNumber(rowVals[colMap.visibility]) : undefined,
      avg: colMap.avg !== undefined ? toNumber(rowVals[colMap.avg]) : undefined,
      status:
        colMap.status !== undefined && rowVals[colMap.status] ? String(rowVals[colMap.status]) : undefined,
      keterangan:
        colMap.keterangan !== undefined && rowVals[colMap.keterangan]
          ? String(rowVals[colMap.keterangan])
          : undefined,
    });
  }
  return out;
}

// ---------- Anggaran Biaya Promosi ----------

function extractAnggaranBiaya(
  grid: (string | number | null)[][],
  rows: Record<string, number>,
  gridLen: number
): AnggaranRow[] {
  const label = "ANGGARAN BIAYA PROMOSI YANG DIAJUKAN";
  if (!rows[label]) return [];
  const headerRow = rows[label] + 1;
  const colMap = getColumnMap(grid, headerRow, {
    uraian: "URAIAN",
    qty: "QTY",
    satuan: "SATUAN",
    hargaUnit: "HARGA",
    totalBiaya: "TOTAL BIAYA",
  });
  const end = sectionEnd(rows, label, gridLen);
  const out: AnggaranRow[] = [];

  for (let r = headerRow + 1; r <= end; r++) {
    const rowVals = grid[r - 1];
    const noIdx = rowVals.findIndex((v) => v !== null && v !== "");
    if (noIdx === -1) continue;
    if (normalize(rowVals[noIdx]).includes("TOTAL BIAYA PROMOSI")) break;
    if (!/^\d+$/.test(String(rowVals[noIdx]).trim())) continue;

    const uraian = colMap.uraian !== undefined ? rowVals[colMap.uraian] : null;
    if (!uraian) continue;

    out.push({
      uraian: String(uraian),
      qty: colMap.qty !== undefined ? toNumber(rowVals[colMap.qty]) : undefined,
      satuan: colMap.satuan !== undefined && rowVals[colMap.satuan] ? String(rowVals[colMap.satuan]) : undefined,
      hargaUnit: colMap.hargaUnit !== undefined ? toNumber(rowVals[colMap.hargaUnit]) : undefined,
      totalBiaya: colMap.totalBiaya !== undefined ? toNumber(rowVals[colMap.totalBiaya]) : undefined,
    });
  }
  return out;
}

// ---------- Tenaga Kerja Lepas ----------

function extractThl(
  grid: (string | number | null)[][],
  rows: Record<string, number>,
  gridLen: number
): ThlRow[] {
  const label = "TENAGA KERJA LEPAS";
  if (!rows[label]) return [];
  const headerRow = rows[label] + 1;
  const colMap = getColumnMap(grid, headerRow, {
    jasaperorg: "JASA PERORANGAN",
    jumlahTng: "JUMLAH TENAGA",
    hariKerja: "HARI KERJA",
    imbalanPerhari: "IMBALAN",
    estimasiTotal: "TOTAL IMBALAN",
  });
  const end = sectionEnd(rows, label, gridLen);
  const out: ThlRow[] = [];

  for (let r = headerRow + 1; r <= end; r++) {
    const rowVals = grid[r - 1];
    const noIdx = rowVals.findIndex((v) => v !== null && v !== "");
    if (noIdx === -1) continue;
    if (normalize(rowVals[noIdx]).includes("TOTAL BIAYA JASA")) break;
    if (!/^\d+$/.test(String(rowVals[noIdx]).trim())) continue;

    const jasaperorg = colMap.jasaperorg !== undefined ? rowVals[colMap.jasaperorg] : null;
    if (!jasaperorg) continue;

    out.push({
      jasaperorg: String(jasaperorg),
      jumlahTng: colMap.jumlahTng !== undefined ? toNumber(rowVals[colMap.jumlahTng]) : undefined,
      hariKerja: colMap.hariKerja !== undefined ? toNumber(rowVals[colMap.hariKerja]) : undefined,
      imbalanPerhari:
        colMap.imbalanPerhari !== undefined ? toNumber(rowVals[colMap.imbalanPerhari]) : undefined,
      estimasiTotal:
        colMap.estimasiTotal !== undefined ? toNumber(rowVals[colMap.estimasiTotal]) : undefined,
    });
  }
  return out;
}

// ---------- Kebutuhan Barang Promosi ----------

function extractBarangPromo(
  grid: (string | number | null)[][],
  rows: Record<string, number>,
  gridLen: number
): BarangPromoRow[] {
  const label = "KEBUTUHAN BARANG PROMOSI YANG DIAJUKAN";
  if (!rows[label]) return [];
  const headerRow = rows[label] + 1;
  const colMap = getColumnMap(grid, headerRow, {
    namaBarang: "NAMA BARANG",
    origin: "ORIGIN",
    satuan: "SATUAN",
    qty: "QTY",
    hargaUnit: "HARGA",
    estimasiTotal: "ESTIMASI TOTAL",
  });
  const end = sectionEnd(rows, label, gridLen);
  const out: BarangPromoRow[] = [];

  for (let r = headerRow + 1; r <= end; r++) {
    const rowVals = grid[r - 1];
    const noIdx = rowVals.findIndex((v) => v !== null && v !== "");
    if (noIdx === -1) continue;
    if (normalize(rowVals[noIdx]).includes("TOTAL BIAYA BARANG")) break;
    if (!/^\d+$/.test(String(rowVals[noIdx]).trim())) continue;

    const namaBarang = colMap.namaBarang !== undefined ? rowVals[colMap.namaBarang] : null;
    if (!namaBarang) continue;

    out.push({
      namaBarang: String(namaBarang),
      origin: colMap.origin !== undefined && rowVals[colMap.origin] ? String(rowVals[colMap.origin]) : undefined,
      satuan: colMap.satuan !== undefined && rowVals[colMap.satuan] ? String(rowVals[colMap.satuan]) : undefined,
      qty: colMap.qty !== undefined ? toNumber(rowVals[colMap.qty]) : undefined,
      hargaUnit: colMap.hargaUnit !== undefined ? toNumber(rowVals[colMap.hargaUnit]) : undefined,
      estimasiTotal:
        colMap.estimasiTotal !== undefined ? toNumber(rowVals[colMap.estimasiTotal]) : undefined,
    });
  }
  return out;
}

// ---------- Trial Taste / Brand Jalan + Total Biaya yang Dibutuhkan (bersebelahan) ----------

function extractBrandJln(grid: (string | number | null)[][], gridLen: number): BrandJlnRow[] {
  const pos = findLabelCell(grid, "PROGRAM YANG DIJALANKAN");
  if (!pos) return [];
  const headerRow = pos.row;

  const rightBoundCol = findLabelCellInRow(grid, headerRow - 1, "TOTAL BIAYA YANG DIBUTUHKAN");

  const colMap = getColumnMap(grid, headerRow, {
    programJln: "PROGRAM YANG DIJALANKAN",
    qtyBks: "QTY",
    hrgBks: "HARGA",
    nominal: "TOTAL NOMINAL",
  });

  const out: BrandJlnRow[] = [];
  const maxR = Math.min(headerRow + 10, gridLen);

  for (let r = headerRow + 1; r <= maxR; r++) {
    const rowVals = grid[r - 1];
    const limited = rightBoundCol ? rowVals.slice(0, rightBoundCol - 1) : rowVals;

    const noIdx = limited.findIndex((v) => v !== null && v !== "");
    if (noIdx === -1) continue;
    if (normalize(limited[noIdx]) === "TOTAL") break;
    if (!/^\d+$/.test(String(limited[noIdx]).trim())) continue;

    const programJln = colMap.programJln !== undefined ? limited[colMap.programJln] : null;
    if (!programJln) continue;

    out.push({
      programJln: String(programJln),
      qtyBks: colMap.qtyBks !== undefined ? toNumber(limited[colMap.qtyBks]) : undefined,
      hrgBks: colMap.hrgBks !== undefined ? toNumber(limited[colMap.hrgBks]) : undefined,
      nominal: colMap.nominal !== undefined ? toNumber(limited[colMap.nominal]) : undefined,
      estimasiTotal: colMap.nominal !== undefined ? toNumber(limited[colMap.nominal]) : undefined,
    });
  }
  return out;
}

function extractTbyd(grid: (string | number | null)[][], gridLen: number): TbydRow[] {
  const pos = findLabelCell(grid, "TOTAL BIAYA YANG DIBUTUHKAN");
  if (!pos) return [];

  const searchStart = pos.row + 1;
  const searchEnd = Math.min(pos.row + 8, gridLen);

  const findValueForLabel = (label: string): number | undefined => {
    for (let r = searchStart; r <= searchEnd; r++) {
      const rowVals = grid[r - 1];
      for (let c = pos.col - 1; c < rowVals.length; c++) {
        if (normalize(rowVals[c]).includes(normalize(label))) {
          for (let cc = c + 1; cc < rowVals.length; cc++) {
            const n = toNumber(rowVals[cc]);
            if (n !== undefined) return n;
          }
        }
      }
    }
    return undefined;
  };

  const biayaPromo = findValueForLabel("BIAYA PROMOSI");
  const jasaperorg = findValueForLabel("JASA PERORANGAN");
  const kbtBrgPrm = findValueForLabel("KEBUTUHAN POSM");
  const trialTaste = findValueForLabel("TRIAL TASTE");
  const estimasiTotal = findValueForLabel("TOTAL BIAYA");

  if ([biayaPromo, jasaperorg, kbtBrgPrm, trialTaste, estimasiTotal].every((v) => v === undefined)) {
    return [];
  }

  return [{ biayaPromo, jasaperorg, kbtBrgPrm, trialTaste, estimasiTotal }];
}

// ---------- Permintaan Transfer + Analisa (bersebelahan) ----------

function extractTransfer(grid: any[][], gridLen: number): TransferRow[] {
  const pos = findLabelCell(grid, "PERMINTAAN TRANSFER");
  if (!pos) return [];

  const analisaCol = findLabelCellInRow(grid, pos.row, "ANALISA BIAYA");
  const rightBoundCol = analisaCol ?? undefined;

  const headerRow = pos.row + 1;
  const colMap = getColumnMap(grid, headerRow, {
    jenis: "JENIS TRANSFER",
    tanggal: "TANGGAL TRANSFER",
    jumlah: "JUMLAH TRANSFER",
  });

  const out: TransferRow[] = [];
  const maxR = Math.min(headerRow + 10, gridLen);

  for (let r = headerRow + 1; r <= maxR; r++) {
    const rowVals = grid[r - 1];
    const limited = rightBoundCol ? rowVals.slice(0, rightBoundCol - 1) : rowVals;

    const jenis = colMap.jenis !== undefined ? limited[colMap.jenis] : null;
    const tanggal = colMap.tanggal !== undefined ? limited[colMap.tanggal] : null;
    const jumlah = colMap.jumlah !== undefined ? toNumber(limited[colMap.jumlah]) : undefined;

    if (!jenis && !tanggal && jumlah === undefined) break;

    if (jenis && /DI BUAT OLEH|DIPERIKSA OLEH|DIREVIEW OLEH|DISETUJUI OLEH/.test(normalize(jenis))) break;

    out.push({
      jenis: jenis ? String(jenis) : undefined,
      tanggal: tanggal ? String(tanggal) : undefined,
      jumlah,
    });
  }
  return out;
}

function extractAnalisa(grid: (string | number | null)[][], gridLen: number): AnalisaRow[] {
  const pos = findLabelCell(grid, "PERMINTAAN TRANSFER");
  if (!pos) return [];

  const analisaCol = findLabelCellInRow(grid, pos.row, "ANALISA BIAYA");
  if (!analisaCol) return [];

  const colMap = getColumnMap(grid, pos.row, {
    analisaBiaya: "ANALISA BIAYA",
    costPerPack: "COST PER PACK",
    costRatio: "COST RATIO",
  });
  const headerRowVals = grid[pos.row - 1];

  const out: AnalisaRow[] = [];
  const maxR = Math.min(pos.row + 8, gridLen);

  for (let r = pos.row + 1; r <= maxR; r++) {
    const rowVals = grid[r - 1];
    const noIdx = rowVals.slice(analisaCol - 2).findIndex((v) => v !== null && v !== "");
    if (noIdx === -1) continue;

    const label = colMap.analisaBiaya !== undefined ? rowVals[colMap.analisaBiaya] : null;
    if (!label) continue;

    // SAFETY NET: Stop if we hit the signature blocks
    if (/DI BUAT OLEH|DIPERIKSA OLEH|DIREVIEW OLEH|DISETUJUI OLEH/.test(normalize(label))) {
      break;
    }

    out.push({
      analisaBiaya: String(label),
      costPerPack:
        colMap.costPerPack !== undefined
          ? numberInSpan(headerRowVals, rowVals, colMap.costPerPack, normalize("COST PER PACK"))
          : undefined,
      costRatio:
        colMap.costRatio !== undefined
          ? numberInSpan(headerRowVals, rowVals, colMap.costRatio, normalize("COST RATIO"))
          : undefined,
    });
  }
  return out;
}

// ---------- SHEET KE-2: MEKANISME PROGRAM (block-based, generik) ----------

/** Deteksi tipe sub-program dari judulnya, dipakai frontend buat pilih cara render tabel. */
function detectSubProgramType(judul: string): MekanismeSubProgram["tipe"] {
  const j = normalize(judul);
  if (j.includes("TARGET SALES")) return "TARGET_SALES";
  if (j.includes("TRIAL TASTE")) return "TRIAL_TASTE";
  if (j.includes("POSM") || j.includes("STIKER") || j.includes("STICKER")) return "POSM";
  return "LAINNYA";
}

/** True kalau baris ini keliatan seperti header tabel (isinya mayoritas teks label pendek, bukan data). */
function looksLikeHeaderRow(cells: (string | number | null)[]): boolean {
  const filled = cells.filter((v) => v !== null && v !== "");
  if (!filled.length) return false;
  const textCount = filled.filter((v) => typeof v === "string" && isNaN(Number(v))).length;
  return textCount / filled.length >= 0.6;
}

/** Cari baris "judul sheet" (mis. "MEKANISME PROGRAM - MPO BOGOR - Mix Brand") di beberapa baris pertama. */
function extractSheetTitle(grid: (string | number | null)[][]): string | undefined {
  for (let r = 0; r < Math.min(grid.length, 5); r++) {
    const v = grid[r].find((c) => c !== null && c !== "");
    if (v && normalize(v).includes("MEKANISME PROGRAM")) return String(v).trim();
  }
  return undefined;
}

/** Cari baris "AP no. .../.../.../..." di beberapa baris pertama. */
function extractApNoRef(grid: (string | number | null)[][]): string | undefined {
  for (let r = 0; r < Math.min(grid.length, 5); r++) {
    const v = grid[r].find((c) => c !== null && c !== "");
    if (v && /^AP\s*NO/.test(normalize(v))) return String(v).trim();
  }
  return undefined;
}

/** Cari baris deskripsi singkat (baris teks panjang tanpa bullet number, sebelum sub-program pertama). */
function extractSheetDeskripsi(grid: (string | number | null)[][], firstBulletRow: number): string | undefined {
  for (let r = 0; r < Math.min(firstBulletRow - 1, grid.length); r++) {
    const v = grid[r].find((c) => c !== null && c !== "");
    if (!v) continue;
    const nv = normalize(v);
    if (nv.includes("MEKANISME PROGRAM") || /^AP\s*NO/.test(nv)) continue;
    if (String(v).trim().length > 15) return String(v).trim();
  }
  return undefined;
}

/**
 * Bersihkan kolom-kolom "sampah" hasil merged-cell / trailing kosong pada satu sub-program:
 *  1. Kolom yang isinya kosong total di header + semua rows + totalRow -> dibuang.
 *  2. Kolom duplikat berturut-turut (mis. "BRAND","BRAND","BRAND" dari merge horizontal
 *     yang datanya juga ikut ke-duplikat persis sama) -> disisakan satu saja.
 */
function pruneEmptyColumns(sub: MekanismeSubProgram): void {
  const width = Math.max(
    sub.headerKolom.length,
    sub.totalRow?.length ?? 0,
    ...sub.rows.map((r) => r.length)
  );
  if (width === 0) return;

  const isBlank = (v: unknown) => v === null || v === undefined || String(v).trim() === "";

  // "Total" di totalRow diperlakukan seperti blank untuk keperluan bandingin duplikat kolom,
  // karena teks "Total" cuma label pengisi lebar merge, bukan data unik per kolom.
  const isBlankOrTotalLabel = (v: unknown) => isBlank(v) || normalize(v) === "TOTAL";

  // Tahap 1: tandai kolom yang benar-benar kosong di semua baris (header, data, total)
  const keep: boolean[] = new Array(width).fill(false);
  for (let c = 0; c < width; c++) {
    const headerBlank = isBlank(sub.headerKolom[c]);
    const totalBlank = sub.totalRow ? isBlankOrTotalLabel(sub.totalRow[c]) : true;
    const rowsBlank = sub.rows.every((r) => isBlank(r[c]));
    if (!(headerBlank && totalBlank && rowsBlank)) keep[c] = true;
  }

  // Tahap 2: dari kolom yang keep, buang duplikat berturut-turut.
  // Kolom dianggap duplikat kalau header SAMA PERSIS (atau sama-sama blank),
  // rows SAMA PERSIS (atau sama-sama blank), DAN totalRow sama/blank/label-"Total".
  const keptIdx = keep.map((k, i) => (k ? i : -1)).filter((i) => i !== -1);
  const finalIdx: number[] = [];
  for (let k = 0; k < keptIdx.length; k++) {
    const c = keptIdx[k];
    if (k === 0) {
      finalIdx.push(c);
      continue;
    }
    const prev = keptIdx[k - 1];

    const sameHeader =
      (normalize(sub.headerKolom[c]) === normalize(sub.headerKolom[prev]) && !isBlank(sub.headerKolom[c])) ||
      (isBlank(sub.headerKolom[c]) && isBlank(sub.headerKolom[prev]));

    const sameAllRows = sub.rows.every(
      (r) => normalize(r[c]) === normalize(r[prev]) || (isBlank(r[c]) && isBlank(r[prev]))
    );

    const totalC = sub.totalRow ? sub.totalRow[c] : null;
    const totalPrev = sub.totalRow ? sub.totalRow[prev] : null;
    const sameTotal =
      !sub.totalRow ||
      normalize(totalC) === normalize(totalPrev) ||
      isBlankOrTotalLabel(totalC) ||
      isBlankOrTotalLabel(totalPrev);

    if (sameHeader && sameAllRows && sameTotal) {
      continue; // duplikat, skip -> pertahankan kolom sebelumnya saja
    }
    finalIdx.push(c);
  }

  sub.headerKolom = finalIdx.map((i) => sub.headerKolom[i] ?? "");
  sub.rows = sub.rows.map((r) => finalIdx.map((i) => r[i] ?? null));
  if (sub.totalRow) {
    sub.totalRow = finalIdx.map((i) => sub.totalRow![i] ?? null);

    // Rapikan label "Total" yang berulang berturut-turut (sisa merged-cell horizontal
    // di Excel asli, mis. "Total|Total|Total|Total|Total|3000|699|2097000").
    // Cukup pertahankan kemunculan PERTAMA, sisanya dikosongkan.
    let totalLabelSeen = false;
    sub.totalRow = sub.totalRow.map((v) => {
      if (normalize(v) === "TOTAL") {
        if (totalLabelSeen) return null; // sudah pernah muncul -> kosongkan
        totalLabelSeen = true;
        return v;
      }
      return v;
    });
  }
}

/**
 * Parser generik untuk sheet "MEKANISME PROGRAM".
 * Mendeteksi blok sub-program lewat nomor urut di kolom kiri (1., 2., 3., dst),
 * lalu mengambil baris header tabel mini, baris data, baris "Total", dan baris "Note :"
 * di bawahnya sampai ketemu bullet berikutnya.
 *
 * Didesain toleran terhadap variasi jumlah brand / kolom antar file,
 * karena tidak mengasumsikan posisi kolom yang tetap.
 */
function extractMekanismeDetail(grid: (string | number | null)[][]): MekanismeSheet | null {
  if (!grid.length) return null;
  // Cari semua baris yang kolom pertama terisinya berupa angka bulat kecil (1-20) -> kandidat bullet sub-program.
  const bulletRows: { row: number; col: number; nomor: number }[] = [];
  for (let r = 0; r < grid.length; r++) {
    const row = grid[r];
    const firstCellIdx = row.findIndex((v) => v !== null && v !== "");
    if (firstCellIdx !== 0) continue; // judul section selalu di kolom paling kiri
    const firstVal = row[firstCellIdx];
    const m = String(firstVal ?? "").trim().match(/^(\d{1,2})\.$/); // wajib ada titik di belakang
    if (!m) continue;
    const nomor = parseInt(m[1], 10);
    if (nomor < 1 || nomor > 20) continue;
    // pastikan ada teks judul di sebelah kanannya (bukan cuma angka nyasar)
    const judul = row.slice(firstCellIdx + 1).find((c) => c !== null && c !== "");
    if (judul && typeof judul !== "number") {
      bulletRows.push({ row: r, col: firstCellIdx, nomor });
    }
  }
  if (!bulletRows.length) return null;
  const judulSheet = extractSheetTitle(grid);
  const noActionPlanRef = extractApNoRef(grid);
  const deskripsi = extractSheetDeskripsi(grid, bulletRows[0].row);
  const subPrograms: MekanismeSubProgram[] = [];
  for (let i = 0; i < bulletRows.length; i++) {
    const { row: startRow, col: bulletCol, nomor } = bulletRows[i];
    const endRow = i + 1 < bulletRows.length ? bulletRows[i + 1].row : grid.length;
    const titleRow = grid[startRow];
    const judul = String(titleRow.slice(bulletCol + 1).find((c) => c !== null && c !== "") ?? "").trim();
    const sub: MekanismeSubProgram = {
      nomor,
      judul,
      tipe: detectSubProgramType(judul),
      headerKolom: [],
      rows: [],
      notes: [],
    };
    let headerCaptured = false;
    let inNoteBlock = false;

    for (let r = startRow + 1; r < endRow; r++) {
      const rowVals = grid[r];
      const firstIdx = rowVals.findIndex((v) => v !== null && v !== "");
      if (firstIdx === -1) continue; // baris kosong total, skip

      const firstVal = rowVals[firstIdx];
      const firstNorm = normalize(firstVal);

      // Baris "Note :" -> aktifkan mode note
      if (firstNorm === "NOTE" || firstNorm === "NOTE :" || firstNorm.startsWith("NOTE")) {
        inNoteBlock = true;
        continue;
      }

      // Mode note aktif: SEMUA baris berikutnya dianggap note, apapun formatnya
      // (bernomor, tanpa nomor, tanpa tanda sama sekali).
      if (inNoteBlock) {
        const cells = rowVals.slice(firstIdx).filter((v) => v !== null && String(v).trim() !== "");
        if (cells.length) {
          const firstIsBulletNumber = /^\d{1,2}\.$/.test(String(cells[0]).trim());
          const text = (firstIsBulletNumber ? cells.slice(1) : cells).map((v) => String(v).trim()).join(" ");
          if (text) sub.notes.push(text);
        }
        continue;
      }

      // Fallback: baris note bernomor "1.", "2." dst TANPA label "Note :" eksplisit di depannya
      const isNoteBullet = typeof firstVal === "string" && /^\d{1,2}\.$/.test(String(firstVal).trim());
      if (isNoteBullet) {
        const text = rowVals.slice(firstIdx + 1).find((v) => v !== null && v !== "");
        if (text) sub.notes.push(String(text).trim());
        continue;
      }

      // Baris Total: diperlonggar jadi "TOTAL" ATAU "TOTAL ..." (mis. "TOTAL BIAYA BARANG PROMOSI"),
      // dan hanya diambil SEKALI (guard !sub.totalRow) supaya gak ketimpa baris lain.
      if (!sub.totalRow && (firstNorm === "TOTAL" || firstNorm.startsWith("TOTAL "))) {
        sub.totalRow = rowVals.slice(firstIdx);
        continue;
      }

      // Baris header tabel mini
      if (!headerCaptured && looksLikeHeaderRow(rowVals.slice(firstIdx))) {
        sub.headerKolom = rowVals.slice(firstIdx).map((v) => (v === null ? "" : String(v)));
        headerCaptured = true;
        continue;
      }

      const dataSlice = rowVals.slice(firstIdx);
      const hasRealContent = dataSlice.some((v) => v !== null && String(v).trim() !== "");
      if (!hasRealContent) continue;

      // PENTING: kalau totalRow tabel utama sudah ke-capture, berarti kita sudah lewat
      // tabel data. Baris berikutnya yang cuma berisi 1-2 cell teks tanpa angka lain
      // (mis. "TUGAS USHER", "Event Desk", "Rotary Lamp") kemungkinan besar adalah
      // catatan/sub-poin tambahan, bukan baris data baru -> masukkan ke notes,
      // meskipun tidak ada label "NOTE :" ataupun nomor bullet di depannya.
      if (sub.totalRow) {
        const nonBlankCells = dataSlice.filter((v) => v !== null && String(v).trim() !== "");
        const isTextOnly = nonBlankCells.length > 0 && nonBlankCells.every((v) => typeof v === "string");
        if (isTextOnly && nonBlankCells.length <= 2) {
          const text = nonBlankCells.map((v) => String(v).trim()).join(" ");
          if (text) sub.notes.push(text);
          continue;
        }
      }

      sub.rows.push(dataSlice);
    }
    pruneEmptyColumns(sub);
    subPrograms.push(sub);
  }
  return { judulSheet, noActionPlanRef, deskripsi, subPrograms };
}

// ---------- SHEET KE-3 (varian A): EVALUASI ACTION PLAN — ACTIVATION dsb ----------

const EVALUASI_SECTIONS = [
  "TARGET UNTUK EVENT ATAU SEJENISNYA",
  "REALISASI TARGET UNTUK EVENT",
  "ANGGARAN BIAYA PROMOSI",
  "SAMPLING",
  "EVALUASI PROGRAM",
  "DIBUAT OLEH",
] as const;

/** Label-label yang menandakan kita sudah keluar dari blok data tabel event/anggaran
 *  dan masuk ke blok penjelasan / section lain. Dipakai sebagai stop-condition
 *  tambahan supaya baris penjelasan (yang isinya ikut ke-duplikat lewat merged cell)
 *  tidak ke-parse sebagai baris data. */
const EVALUASI_STOP_MARKERS = ["BERIKAN PENJELASAN", ...EVALUASI_SECTIONS];

function isEvaluasiStopRow(rowVals: (string | number | null)[]): boolean {
  const firstFilled = rowVals.find((v) => v !== null && v !== "");
  if (!firstFilled) return false;
  const n = normalize(firstFilled);
  return EVALUASI_STOP_MARKERS.some((m) => n.includes(normalize(m)));
}

function findEvaluasiSectionRows(grid: (string | number | null)[][]): Record<string, number> {
  const rows: Record<string, number> = {};
  for (const label of EVALUASI_SECTIONS) {
    const pos = findSectionLabelCell(grid, label);
    if (pos) rows[label] = pos.row;
  }
  return rows;
}

/**
 * Ambil baris-baris data tabel event (Target / Realisasi).
 * FIX: sekarang juga return `nextRow`, yaitu baris tepat setelah baris data
 * terakhir yang berhasil dibaca (titik berhenti loop, entah karena stop-row
 * atau baris brand kosong). Dipakai supaya pencarian penjelasan setelahnya
 * TIDAK mulai dari header (yang bisa ikut membaca baris data sebagai
 * "paragraf"), tapi mulai persis setelah data habis.
 */
function extractEvaluasiEventRows(
  grid: (string | number | null)[][],
  headerRow: number,
  endRow: number,
  withJenisTarget: boolean
): { rows: EvaluasiEventRow[]; nextRow: number } {
  const colMap = getColumnMap(grid, headerRow, {
    jenisProgram: "JENIS PROGRAM",
    target: "TARGET",
    brand: "BRAND",
    qty: "QTY",
    hargaBks: ["HARGA/BKS", "HARGA / BKS", "HARGA BKS", "HARGA"],
    persen: "%",
    total: "TOTAL TARGET PENJUALAN",
  });

  // FIX BUG 2a: kolom "target" / "jenisProgram" gampang ke-match ke judul section
  // "TARGET UNTUK EVENT ATAU SEJENISNYA" itu sendiri karena getColumnMap pakai
  // substring match ("includes"). Validasi ulang: kolom cuma valid kalau isi
  // header-nya PERSIS "TARGET" / "JENIS PROGRAM", bukan cuma mengandung kata itu.
  const headerRowVals = grid[headerRow - 1] || [];
  if (colMap.target !== undefined && normalize(headerRowVals[colMap.target]) !== "TARGET") {
    delete colMap.target;
  }
  if (
    colMap.jenisProgram !== undefined &&
    normalize(headerRowVals[colMap.jenisProgram]) !== "JENIS PROGRAM"
  ) {
    delete colMap.jenisProgram;
  }

  const rows: EvaluasiEventRow[] = [];
  let lastJenis: string | undefined;
  let lastTarget: string | undefined;
  let nextRow = endRow + 1; // default kalau loop habis tanpa break (tidak ada baris "sisa")

  for (let r = headerRow + 1; r <= endRow; r++) {
    const rowVals = grid[r - 1];

    // FIX BUG 2b: stop begitu ketemu marker penjelasan / section lain, jangan
    // cuma andalkan brandVal kosong (baris penjelasan tetap punya isi karena
    // merged cell ikut ke-duplikat ke banyak kolom, termasuk kolom brand).
    if (isEvaluasiStopRow(rowVals)) {
      nextRow = r;
      break;
    }

    const brandVal = colMap.brand !== undefined ? rowVals[colMap.brand] : null;
    if (!brandVal) {
      nextRow = r; // <-- titik ini dipakai sebagai start pencarian penjelasan
      break;
    }

    const jenis = colMap.jenisProgram !== undefined ? rowVals[colMap.jenisProgram] : null;
    const target = colMap.target !== undefined ? rowVals[colMap.target] : null;
    if (jenis) lastJenis = String(jenis);
    if (target) lastTarget = String(target);

    rows.push({
      jenisProgram: withJenisTarget ? lastJenis : undefined,
      target: withJenisTarget ? lastTarget : undefined,
      brand: String(brandVal),
      qty: colMap.qty !== undefined ? toNumber(rowVals[colMap.qty]) : undefined,
      hargaBks: colMap.hargaBks !== undefined ? toNumber(rowVals[colMap.hargaBks]) : undefined,
      persen: colMap.persen !== undefined ? toNumber(rowVals[colMap.persen]) : undefined,
      totalTargetPenjualan: colMap.total !== undefined ? toNumber(rowVals[colMap.total]) : undefined,
    });
  }
  return { rows, nextRow };
}

/** Gabungkan baris bernomor ("1","2",...) ATAU paragraf polos jadi array string. */
function collectBulletOrParagraphRows(
  grid: (string | number | null)[][],
  fromRow: number,
  toRow: number
): string[] {
  const out: string[] = [];
  for (let r = fromRow; r <= toRow; r++) {
    const rowVals = grid[r - 1];
    if (!rowVals) continue;
    const firstIdx = rowVals.findIndex((v) => v !== null && v !== "");
    if (firstIdx === -1) continue;
    let cells = rowVals
      .slice(firstIdx)
      .filter((v): v is string | number => v !== null && v !== "");
    if (cells.length && /^\d{1,2}$/.test(String(cells[0]).trim())) cells = cells.slice(1);

    // FIX BUG 1: baris merged-cell yang lebar bikin nilai yang sama kebawa
    // berkali-kali ke tiap kolom di rentang merge, jadi cells = [teksA, teksA,
    // teksA, ...]. Dedup: buang cell yang isinya sama persis (setelah dinormalisasi)
    // dengan cell sebelumnya, supaya paragraf gak ke-print puluhan kali.
    const deduped: (string | number)[] = [];
    for (const c of cells) {
      const prev = deduped[deduped.length - 1];
      if (deduped.length === 0 || normalize(prev) !== normalize(c)) {
        deduped.push(c);
      }
    }

    const text = deduped.map((v) => String(v).trim()).join(" ").trim();
    if (text) out.push(text);
  }
  return out;
}

/**
 * Cari marker "Berikan penjelasan..." di dalam range, lalu kumpulkan teks setelahnya.
 * FIX: kalau markernya gak ada (banyak sheet Evaluasi langsung nulis paragraf
 * bernomor tanpa marker apapun -- lihat section Target Event & Sampling),
 * jangan return array kosong; fallback ke `searchStart` langsung.
 *
 * PENTING: `searchStart` di sini WAJIB diposisikan tepat setelah baris data
 * terakhir (pakai `nextRow` dari extractEvaluasiEventRows / extractEvaluasiAnggaran /
 * extractEvaluasiSampling), bukan dari headerRow section -- supaya baris data
 * (brand/qty/dst) gak ikut kebaca jadi "paragraf penjelasan".
 */
function extractEvaluasiExplanation(
  grid: (string | number | null)[][],
  searchStart: number,
  searchEnd: number
): string[] {
  let markerRow: number | null = null;
  for (let r = searchStart; r <= searchEnd; r++) {
    if (grid[r - 1]?.some((v) => normalize(v).includes("BERIKAN PENJELASAN"))) {
      markerRow = r;
      break;
    }
  }
  const from = markerRow !== null ? markerRow + 1 : searchStart;
  return collectBulletOrParagraphRows(grid, from, searchEnd);
}

/**
 * Ambil baris data tabel Anggaran (PENGAJUAN / REALISASI / DEVIASI).
 * FIX: sekarang juga return `nextRow`, dipakai buat pencarian penjelasan
 * (jaga-jaga kalau ada file yang gak pakai marker "Berikan penjelasan..." juga
 * di section ini).
 */
function extractEvaluasiAnggaran(
  grid: (string | number | null)[][],
  headerRow: number,
  endRow: number
): { rows: EvaluasiAnggaranRow[]; nextRow: number } {
  const headerRowVals = grid[headerRow - 1] ?? [];

  // FIX: sebelumnya getColumnMap ke-collision ke sel judul section "ANGGARAN BIAYA
  // PROMOSI" sendiri (karena teks itu SECARA SUBSTRING mengandung "BIAYA PROMOSI", dan
  // posisinya lebih kiri dari header kolom aslinya). Sekarang cari dulu kolom judul
  // section itu, lalu batasi pencarian kolom data HANYA di sebelah kanannya -- ini
  // menghilangkan seluruh kelas bug collision-substring tanpa bergantung ke exact-match.
  const sectionTitleCol = headerRowVals.findIndex((v) => normalize(v) === normalize("ANGGARAN BIAYA PROMOSI"));
  const searchFrom = sectionTitleCol !== -1 ? sectionTitleCol + 1 : 0;

  const findCol = (labelOrAliases: string | string[]): number | undefined => {
    const aliases = Array.isArray(labelOrAliases) ? labelOrAliases : [labelOrAliases];
    const targets = aliases.map(normalize);
    for (let c = searchFrom; c < headerRowVals.length; c++) {
      const nv = normalize(headerRowVals[c]);
      if (nv && targets.some((t) => nv.includes(t))) return c;
    }
    return undefined;
  };

  const colMap: Record<string, number | undefined> = {
    biayaPromosi: findCol("BIAYA PROMOSI"),
    biayaPosm: findCol(["BIAYA POS M", "BIAYA POSM"]),
    biayaSampling: findCol("BIAYA SAMPLING"),
    totalBiaya: findCol("TOTAL BIAYA"),
  };

  const rows: EvaluasiAnggaranRow[] = [];
  const dataCols = [colMap.biayaPromosi, colMap.biayaPosm, colMap.biayaSampling, colMap.totalBiaya].filter(
    (v): v is number => v !== undefined
  );
  const firstDataCol = dataCols.length ? Math.min(...dataCols) : 0;
  let lastDataRow = headerRow;

  for (let r = headerRow + 1; r <= endRow; r++) {
    const rowVals = grid[r - 1];

    const isStopMarker = rowVals.some((v) => {
      if (!v) return false;
      const n = normalize(v);
      return EVALUASI_STOP_MARKERS.some((m) => n.includes(normalize(m)));
    });
    if (isStopMarker) break;

    const vals = [colMap.biayaPromosi, colMap.biayaPosm, colMap.biayaSampling, colMap.totalBiaya].map((i) =>
      i !== undefined ? rowVals[i] : null
    );
    const hasData = vals.some((v) => v !== null && v !== "");

    if (!hasData) {
      if (rows.length > 0) break;
      continue;
    }

    const labelCell = rowVals
      .slice(0, firstDataCol)
      .find((v) => v !== null && v !== "" && !/^\d+[\.\)]?$/.test(String(v).trim()));

    const label = labelCell ? String(labelCell).toUpperCase() : rows.length === 0 ? "PENGAJUAN" : "";

    rows.push({
      label,
      biayaPromosi: colMap.biayaPromosi !== undefined ? toNumber(rowVals[colMap.biayaPromosi]) : undefined,
      biayaPosm: colMap.biayaPosm !== undefined ? toNumber(rowVals[colMap.biayaPosm]) : undefined,
      biayaSampling: colMap.biayaSampling !== undefined ? toNumber(rowVals[colMap.biayaSampling]) : undefined,
      totalBiaya: colMap.totalBiaya !== undefined ? toNumber(rowVals[colMap.totalBiaya]) : undefined,
    });
    lastDataRow = r;
  }

  return { rows, nextRow: lastDataRow + 1 };
}

function extractEvaluasiSampling(
  grid: (string | number | null)[][],
  headerRow: number,
  endRow: number
): { groups: EvaluasiSamplingGroup[]; deviasi: EvaluasiSamplingItemRow | null; nextRow: number } {
  const colMap = getColumnMap(grid, headerRow, {
    brand: "BRAND",
    kebutuhan: "KEBUTUHAN",
    hargaBks: ["HARGA/BKS", "HARGA / BKS", "HARGA BKS"],
    nominal: "NOMINAL",
  });

  const groups: EvaluasiSamplingGroup[] = [];
  let deviasi: EvaluasiSamplingItemRow | null = null;
  let currentGroup: EvaluasiSamplingGroup | null = null;

  let lastDataRow = headerRow;
  let nextRow = headerRow + 1; // Default awal

  const readItem = (rowVals: (string | number | null)[]): EvaluasiSamplingItemRow => {
    const brandVal = colMap.brand !== undefined ? rowVals[colMap.brand] : null;
    const kebutuhanRaw = colMap.kebutuhan !== undefined ? rowVals[colMap.kebutuhan] : null;
    const kebutuhanNum = toNumber(kebutuhanRaw);
    return {
      brand: brandVal !== null ? String(brandVal).trim() : "",
      kebutuhan: kebutuhanNum !== undefined ? kebutuhanNum : kebutuhanRaw !== null ? String(kebutuhanRaw) : undefined,
      hargaBks: colMap.hargaBks !== undefined ? toNumber(rowVals[colMap.hargaBks]) : undefined,
      nominal: colMap.nominal !== undefined ? toNumber(rowVals[colMap.nominal]) : undefined,
    };
  };

  for (let r = headerRow + 1; r <= endRow; r++) {
    const rowVals = grid[r - 1];

    // 1. Deteksi Blok Penjelasan (Break Condition)
    // Gabungkan teks untuk melihat apakah ini adalah paragraf penjelasan yang panjang
    const joinedText = rowVals.filter(v => v !== null && v !== "").join(" ");

    // Stop jika ada marker spesifik ATAU jika ada teks panjang yang jelas bukan baris data
    if (
      joinedText.toUpperCase().includes("BERIKAN PENJELASAN") ||
      (joinedText.length > 50 && !joinedText.toUpperCase().includes("PENGAJUAN") && !joinedText.toUpperCase().includes("REALISASI"))
    ) {
      nextRow = r; // nextRow langsung di-set ke baris penjelasan ini
      break;
    }

    // 2. Tentukan Label Group atau Deviasi
    const rowTextNorm = normalize(rowVals.filter((v) => v !== null && v !== "").join(" "));
    let normLabel = "";
    if (rowTextNorm.includes("DEVIASI")) normLabel = "DEVIASI";
    else if (rowTextNorm.includes("PENGAJUAN")) normLabel = "PENGAJUAN";
    else if (rowTextNorm.includes("REALISASI")) normLabel = "REALISASI";

    // 3. Cek DEVIASI (Lakukan SEBELUM mengecek kekosongan brandVal)
    if (normLabel.includes("DEVIASI")) {
      deviasi = readItem(rowVals);
      lastDataRow = r;
      nextRow = r + 1;
      continue;
    }

    // 4. Validasi Data Item Standar (PENGAJUAN / REALISASI)
    const brandVal = colMap.brand !== undefined ? rowVals[colMap.brand] : null;
    if (!brandVal || String(brandVal).trim() === "" || String(brandVal).trim() === "-") {
      continue; // Skip baris jika benar-benar kosong/tidak ada brand
    }

    // 5. Masukkan ke Group yang Tepat
    if (normLabel.includes("PENGAJUAN") || normLabel.includes("REALISASI")) {
      // FIX: cuma bikin group baru kalau label BERUBAH dari group aktif.
      // Sebelumnya di sini selalu push group baru tiap ketemu teks "PENGAJUAN"/"REALISASI",
      // padahal teks itu ikut ke-duplikat ke SETIAP baris brand akibat merged cell,
      // jadi tiap brand kepecah jadi group-nya sendiri-sendiri (1 item per group).
      if (!currentGroup || currentGroup.label !== normLabel) {
        currentGroup = { label: normLabel, items: [] };
        groups.push(currentGroup);
      }
    } else if (!currentGroup) {
      currentGroup = { label: "PENGAJUAN", items: [] }; // Fallback jika tidak ada label
      groups.push(currentGroup);
    }

    currentGroup.items.push(readItem(rowVals));
    lastDataRow = r;
    nextRow = r + 1;
  }

  return { groups, deviasi, nextRow };
}

function extractEvaluasiSignatures(
  grid: (string | number | null)[][],
  headerRow: number
): EvaluasiSignature[] {
  const rowVals = grid[headerRow - 1] ?? [];
  const labelCols: number[] = [];

  let lastLabel = "";
  rowVals.forEach((v, idx) => {
    if (v) {
      const normV = normalize(v);
      if (normV.includes("OLEH") && normV !== lastLabel) {
        labelCols.push(idx);
        lastLabel = normV;
      }
    }
  });

  const signatures: EvaluasiSignature[] = [];

  labelCols.forEach((col, i) => {
    const nextCol = labelCols[i + 1] ?? rowVals.length;
    const label = String(rowVals[col]);
    const tglVal = grid[headerRow]?.[col];

    // Cari baris nama pertama yang ada isinya di range kolom label ini.
    let namaRow: number | null = null;
    let rawEntries: { col: number; value: string }[] = [];

    for (let r = headerRow + 2; r <= grid.length; r++) {
      const entries: { col: number; value: string }[] = [];
      for (let c = col; c < nextCol; c++) {
        const v = grid[r - 1]?.[c];
        if (v !== null && v !== undefined && v !== "") entries.push({ col: c, value: String(v) });
      }
      if (entries.length) {
        namaRow = r;
        rawEntries = entries;
        break;
      }
    }

    if (!namaRow || !rawEntries.length) {
      signatures.push({ label, tanggal: tglVal ? String(tglVal) : undefined });
      return;
    }

    // FIX: dedup nilai yang berturut-turut sama (hasil duplikasi merged-cell horizontal),
    // sisakan cuma kemunculan pertama tiap "blok" nama. Tanpa ini, satu nama yang mergenya
    // lebar bisa kebaca berkali-kali jadi banyak entri signature palsu.
    const namaEntries: { col: number; value: string }[] = [];
    for (const entry of rawEntries) {
      const prev = namaEntries[namaEntries.length - 1];
      if (!prev || normalize(prev.value) !== normalize(entry.value)) {
        namaEntries.push(entry);
      }
    }

    const jabatanRowVals = grid[namaRow] ?? []; // baris tepat setelah baris nama

    namaEntries.forEach((entry, idx) => {
      const jabatanVal = jabatanRowVals[entry.col];
      signatures.push({
        label,
        tanggal: idx === 0 && tglVal ? String(tglVal) : undefined,
        nama: entry.value,
        jabatan: jabatanVal !== null && jabatanVal !== undefined && jabatanVal !== "" ? String(jabatanVal) : undefined,
      });
    });
  });

  return signatures;
}

function extractEvaluasiSheet(grid: (string | number | null)[][]): EvaluasiSheet | null {
  const sectionRows = findEvaluasiSectionRows(grid);
  if (!sectionRows["TARGET UNTUK EVENT ATAU SEJENISNYA"]) return null;
  const gridLen = grid.length;

  const targetHeaderRow = sectionRows["TARGET UNTUK EVENT ATAU SEJENISNYA"];
  const targetEndRow = sectionEnd(sectionRows, "TARGET UNTUK EVENT ATAU SEJENISNYA", gridLen);
  const { rows: targetEvent } = extractEvaluasiEventRows(grid, targetHeaderRow, targetEndRow, true);

  let realisasiEvent: EvaluasiEventRow[] = [];
  let realisasiEndRow = targetEndRow;
  // FIX: default start pencarian penjelasan = setelah section target (kalau
  // realisasi gak ada sama sekali). Begitu ada data realisasi, ini di-update
  // ke nextRow-nya di bawah.
  let penjelasanStart = targetHeaderRow;
  if (sectionRows["REALISASI TARGET UNTUK EVENT"]) {
    const realisasiHeaderRow = sectionRows["REALISASI TARGET UNTUK EVENT"];
    realisasiEndRow = sectionEnd(sectionRows, "REALISASI TARGET UNTUK EVENT", gridLen);
    const res = extractEvaluasiEventRows(grid, realisasiHeaderRow, realisasiEndRow, false);
    realisasiEvent = res.rows;
    penjelasanStart = res.nextRow; // FIX UTAMA: mulai SETELAH data realisasi, bukan dari header
  }
  const penjelasanTargetEvent = extractEvaluasiExplanation(grid, penjelasanStart, realisasiEndRow);

  let anggaran: EvaluasiAnggaranRow[] = [];
  let penjelasanAnggaran: string[] = [];
  if (sectionRows["ANGGARAN BIAYA PROMOSI"]) {
    const hRow = sectionRows["ANGGARAN BIAYA PROMOSI"];
    const eRow = sectionEnd(sectionRows, "ANGGARAN BIAYA PROMOSI", gridLen);
    const res = extractEvaluasiAnggaran(grid, hRow, eRow);
    anggaran = res.rows;
    penjelasanAnggaran = extractEvaluasiExplanation(grid, res.nextRow, eRow);
  }

  let samplingGroups: EvaluasiSamplingGroup[] = [];
  let samplingDeviasi: EvaluasiSamplingItemRow | null = null;
  let penjelasanSampling: string[] = [];
  if (sectionRows["SAMPLING"]) {
    const hRow = sectionRows["SAMPLING"];
    const eRow = sectionEnd(sectionRows, "SAMPLING", gridLen);
    const s = extractEvaluasiSampling(grid, hRow, eRow);
    samplingGroups = s.groups;
    samplingDeviasi = s.deviasi;
    penjelasanSampling = extractEvaluasiExplanation(grid, s.nextRow, eRow); // FIX UTAMA: mulai setelah baris DEVIASI
  }

  let evaluasiProgram: string[] = [];
  if (sectionRows["EVALUASI PROGRAM"]) {
    const hRow = sectionRows["EVALUASI PROGRAM"];
    const eRow = sectionEnd(sectionRows, "EVALUASI PROGRAM", gridLen);
    evaluasiProgram = collectBulletOrParagraphRows(grid, hRow + 1, eRow);
  }

  const signatures = sectionRows["DIBUAT OLEH"] ? extractEvaluasiSignatures(grid, sectionRows["DIBUAT OLEH"]) : [];

  return { targetEvent, realisasiEvent, penjelasanTargetEvent, anggaran, penjelasanAnggaran, samplingGroups, samplingDeviasi, penjelasanSampling, evaluasiProgram, signatures };
}
// ---------- SHEET KE-3 (varian B): EVALUASI ACTION PLAN — TRADE PROMO ----------
//
// CATATAN: kolom-kolom di bawah ini diturunkan dari dump teks (tab-padded) contoh file,
// bukan dari grid ExcelJS asli. Posisi kolom "nominal" tanpa header eksplisit di tabel
// Sales adalah asumsi awal.
//
// FIX (setelah tes di file AP Karawang.xlsx): pola lama pakai `cursor += 5` sebagai
// tebakan jarak baris kosong setelah baris "Target penjualan tercapai X%" / "Total
// Biaya terpakai X%". Tebakan itu ternyata gak konsisten antar file — kalau baris
// kosongnya lebih dikit dari yang diasumsikan, cursor overshoot dan skip anchor
// section berikutnya ("TOTAL PENCAPAIAN PROGRAM" buat tabel WS, "Biaya Promosi
// terdiri atas :" buat breakdown), bikin wsRows & biayaPromosiBreakdown jadi kosong
// padahal datanya ADA di file.
//
// Fix-nya: `findPercentAfterLabel` sekarang return row PERSIS tempat label ketemu,
// jadi cursor bisa di-set row+1 tanpa nebak jarak kosongnya.

/** Cari baris berisi label tertentu (mis. "TARGET PENJUALAN TERCAPAI" / "TOTAL BIAYA
 *  TERPAKAI"), ambil angka % di sebelah kanannya, DAN return row tempat ketemu.
 *  Row ini dipakai buat set cursor persis (row + 1), gantiin pola "cursor += N" yang
 *  cuma tebakan jarak baris kosong. Mengabaikan nilai error (#DIV/0! dsb). */
function findPercentAfterLabel(
  grid: (string | number | null)[][],
  label: string,
  fromRow: number,
  toRow: number
): { value?: number; row?: number } {
  const target = normalize(label);
  for (let r = fromRow; r <= toRow && r <= grid.length; r++) {
    const rowVals = grid[r - 1];
    if (!rowVals) continue;
    const idx = rowVals.findIndex((v) => normalize(v).includes(target));
    if (idx === -1) continue;
    for (let c = idx + 1; c < rowVals.length; c++) {
      if (isErrorValue(rowVals[c])) return { value: undefined, row: r };
      const n = toNumber(rowVals[c]);
      if (n !== undefined) return { value: n, row: r };
    }
    return { value: undefined, row: r };
  }
  return {};
}

/** Tabel "TOTAL PENCAPAIAN PROGRAM" (Keterangan / Total Target / Actual Tercapai / Pencapaian). */
function extractPencapaianTable(
  grid: (string | number | null)[][],
  headerRow: number,
  gridLen: number
): { rows: EvaluasiPencapaianRow[]; total?: EvaluasiPencapaianRow; nextRow: number } {
  const colMap = getColumnMap(grid, headerRow, {
    keterangan: "KETERANGAN",
    totalTarget: "TOTAL TARGET",
    actualTercapai: "ACTUAL TERCAPAI",
    pencapaian: "PENCAPAIAN",
  });

  const rows: EvaluasiPencapaianRow[] = [];
  let total: EvaluasiPencapaianRow | undefined;
  let nextRow = headerRow + 1;
  const maxR = Math.min(headerRow + 15, gridLen);

  for (let r = headerRow + 1; r <= maxR; r++) {
    const rowVals = grid[r - 1];
    const totalTarget = colMap.totalTarget !== undefined ? toNumberSafe(rowVals[colMap.totalTarget]) : undefined;
    const actualTercapai =
      colMap.actualTercapai !== undefined ? toNumberSafe(rowVals[colMap.actualTercapai]) : undefined;
    const pencapaianPercent =
      colMap.pencapaian !== undefined ? toNumberSafe(rowVals[colMap.pencapaian]) : undefined;
    const keteranganRaw = colMap.keterangan !== undefined ? rowVals[colMap.keterangan] : null;

    if (totalTarget === undefined && actualTercapai === undefined && pencapaianPercent === undefined) {
      nextRow = r;
      break;
    }

    const isTotalRow = normalize(keteranganRaw) === "TOTAL";
    const row: EvaluasiPencapaianRow = {
      keterangan: keteranganRaw !== null && keteranganRaw !== "" && !isTotalRow ? String(keteranganRaw) : undefined,
      totalTarget,
      actualTercapai,
      pencapaianPercent,
    };

    nextRow = r + 1;
    if (isTotalRow) {
      total = row;
      break; // baris TOTAL selalu jadi penutup tabel ini
    }
    rows.push(row);
  }

  return { rows, total, nextRow };
}

/** Tabel mingguan WS (kolom "PENCAPAIAN" muncul 2x: untuk W01-W04 dan W05-W08). */
interface WsWeekGroupCol {
  label: string;
  targetCol?: number;
  actualCol?: number;
}

/** Deteksi grup minggu ("Target Wxx-Wyy" / "Actual Wxx-Wyy") dari header secara dinamis —
 *  gak hardcode "W01"/"W05". Jumlah grup bisa berapa aja, urutan/nama minggu bebas;
 *  parser cukup ngikutin urutan kolom yang ADA di header file itu sendiri. */
/** Cari label minggu dari header yang sudah dinormalisasi (mis. "TARGET W01 - W04" -> "W01 - W04"),
 *  dengan cara STRIP kata kunci prefix-nya (TARGET/ACTUAL) di manapun posisinya, bukan cuma di awal
 *  string persis. Return null kalau sisanya nggak mengandung pola minggu "Wxx" -- ini penting biar
 *  kolom lain yang kebetulan mengandung kata "TARGET" (mis. "TOTAL TARGET") nggak ikut ke-anggap
 *  grup minggu. */
function extractWeekLabel(normalizedHeader: string, keyword: "TARGET" | "ACTUAL"): string | null {
  if (!normalizedHeader.includes(keyword)) return null;
  const rest = normalizedHeader.replace(keyword, "").trim();
  if (!/W\s?\d+/.test(rest)) return null;
  return rest.replace(/\s+/g, " ").trim();
}

/** Deteksi grup minggu ("Target Wxx-Wyy" / "Actual Wxx-Wyy") dari header secara dinamis.
 *
 *  FIX: sebelumnya pairing target<->actual dilakukan POSISIONAL (assign actualCol ke grup target
 *  terdekat sebelumnya di urutan kolom). Itu ternyata gampang meleset -- kolom "Target" ke-detect
 *  tapi pasangan "Actual"-nya kepasang ke grup yang salah / nggak kepasang sama sekali, tergantung
 *  urutan & jarak kolom di file (apalagi kalau ada pengaruh merged cell).
 *
 *  Sekarang target & actual dicari independen per kolom, lalu dipasangkan lewat KEY LABEL MINGGU
 *  ("W01-W04" dst), bukan lewat posisi/urutan kolom. Ini kebal terhadap urutan kolom terbalik,
 *  ada gap, atau kolom target/actual nggak langsung bersebelahan -- selama teks label mingguannya
 *  konsisten antara header Target & Actual-nya. */
function detectWsWeekGroups(headerVals: (string | number | null)[]): WsWeekGroupCol[] {
  const targetCols = new Map<string, number>(); // key (label tanpa spasi) -> kolom PERTAMA ketemu
  const actualCols = new Map<string, number>();
  const labelByKey = new Map<string, string>();

  for (let c = 0; c < headerVals.length; c++) {
    const n = normalize(headerVals[c]);
    if (!n) continue;

    // "TOTAL TARGET" (atau kolom TOTAL lain) bukan grup minggu -- exclude eksplisit.
    if (n === "TOTAL TARGET" || n.startsWith("TOTAL ")) continue;

    const targetLabel = extractWeekLabel(n, "TARGET");
    if (targetLabel) {
      const key = targetLabel.replace(/\s/g, "");
      if (!targetCols.has(key)) targetCols.set(key, c);
      if (!labelByKey.has(key)) labelByKey.set(key, targetLabel);
      continue;
    }

    const actualLabel = extractWeekLabel(n, "ACTUAL");
    if (actualLabel) {
      const key = actualLabel.replace(/\s/g, "");
      if (!actualCols.has(key)) actualCols.set(key, c);
      if (!labelByKey.has(key)) labelByKey.set(key, actualLabel);
      continue;
    }
  }

  const keys = new Set<string>([...targetCols.keys(), ...actualCols.keys()]);
  const groups: WsWeekGroupCol[] = [];
  for (const key of keys) {
    groups.push({
      label: labelByKey.get(key) ?? key,
      targetCol: targetCols.get(key),
      actualCol: actualCols.get(key),
    });
  }

  // Urutkan berdasarkan posisi kolom paling kiri (target atau actual, mana yang duluan) biar
  // urutan output tetap kiri-ke-kanan sesuai file, bukan urutan Set yang nggak terjamin.
  groups.sort((a, b) => (a.targetCol ?? a.actualCol ?? 0) - (b.targetCol ?? b.actualCol ?? 0));

  return groups;
}

/** Tabel mingguan WS. Jumlah & nama grup minggu dideteksi dinamis dari header (lihat
 *  detectWsWeekGroups) — bukan hardcode W01-W04/W05-W08, jadi tetap kepake walau di file
 *  lain rentang mingguannya beda atau jumlah grupnya lebih dari 2.
 *
 *  Kolom "Pencapaian" di sheet SENGAJA tidak dipakai untuk baca nilai — di beberapa file
 *  kolom itu kena merged-cell sehingga index-nya gak reliable (nilai bisa ke-duplikat ke
 *  kolom yang salah). Pencapaian dihitung manual (actual/target), yang selalu akurat
 *  selama actual & target-nya sendiri kebaca benar. */
function extractWsTable(
  grid: (string | number | null)[][],
  headerRow: number,
  gridLen: number
): { rows: EvaluasiWsRow[]; total?: EvaluasiWsRow; nextRow: number } {
  const headerVals = grid[headerRow - 1] ?? [];
  const weekGroups = detectWsWeekGroups(headerVals);

  const findFirstCol = (label: string) => {
    const idx = headerVals.findIndex((v) => normalize(v).includes(normalize(label)));
    return idx === -1 ? undefined : idx;
  };

  const wsCol = findFirstCol("WS");
  const totalTargetCol = (() => {
    const idx = headerVals.findIndex((v) => normalize(v) === "TOTAL TARGET");
    return idx === -1 ? undefined : idx;
  })();
  const bonusCol = findFirstCol("BONUS");
  const ketCol = findFirstCol("KET");

  // Batas kiri buat nyari label "TOTAL" — cek semua kolom sebelum grup minggu pertama,
  // bukan cuma kolom WS, karena label TOTAL bisa nongol di kolom manapun tergantung merge.
  const firstDataCol = (weekGroups[0]?.targetCol ?? weekGroups[0]?.actualCol) ?? (wsCol ?? 0);

  const rows: EvaluasiWsRow[] = [];
  let total: EvaluasiWsRow | undefined;
  let nextRow = headerRow + 1;
  const maxR = Math.min(headerRow + 15, gridLen);

  for (let r = headerRow + 1; r <= maxR; r++) {
    const rowVals = grid[r - 1];

    const weeks: EvaluasiWsWeekValue[] = weekGroups.map((g) => {
      const target = g.targetCol !== undefined ? toNumberSafe(rowVals[g.targetCol]) : undefined;
      const actual = g.actualCol !== undefined ? toNumberSafe(rowVals[g.actualCol]) : undefined;
      const pencapaianPercent =
        target !== undefined && target !== 0 && actual !== undefined ? actual / target : undefined;
      return { label: g.label, target, actual, pencapaianPercent };
    });

    const totalTarget = totalTargetCol !== undefined ? toNumberSafe(rowVals[totalTargetCol]) : undefined;
    const bonusPerBks = bonusCol !== undefined ? toNumberSafe(rowVals[bonusCol]) : undefined;

    const hasAnyData =
      weeks.some((w) => w.target !== undefined || w.actual !== undefined) ||
      totalTarget !== undefined ||
      bonusPerBks !== undefined;

    if (!hasAnyData) {
      nextRow = r;
      break;
    }

    const labelArea = rowVals.slice(0, Math.max(firstDataCol, 1));
    const isTotalRow = labelArea.some((v) => normalize(v) === "TOTAL");

    const wsRaw = wsCol !== undefined ? rowVals[wsCol] : null;
    const row: EvaluasiWsRow = {
      ws: wsRaw !== null && wsRaw !== "" && !isTotalRow ? String(wsRaw) : undefined,
      weeks,
      totalTarget,
      bonusPerBks,
      keterangan: ketCol !== undefined && rowVals[ketCol] ? String(rowVals[ketCol]) : undefined,
    };

    nextRow = r + 1;
    if (isTotalRow) {
      total = row;
      break;
    }
    rows.push(row);
  }

  return { rows, total, nextRow };
}

/** Tabel Section "01": Target Sales (Bks) / Potongan per Bks, baris Pengajuan(implisit)/Realisasi/Deviasi. */
function extractSalesTable(
  grid: (string | number | null)[][],
  headerRow: number,
  gridLen: number
): { rows: EvaluasiSalesRow[]; nextRow: number } {
  const colMap = getColumnMap(grid, headerRow, {
    keterangan: "KETERANGAN",
    targetSales: "TARGET SALES",
    potongan: "POTONGAN",
  });

  const rows: EvaluasiSalesRow[] = [];
  let nextRow = headerRow + 1;
  const maxR = Math.min(headerRow + 10, gridLen);

  for (let r = headerRow + 1; r <= maxR; r++) {
    const rowVals = grid[r - 1];
    const targetSalesBks = colMap.targetSales !== undefined ? toNumberSafe(rowVals[colMap.targetSales]) : undefined;
    const potonganPerBks = colMap.potongan !== undefined ? toNumberSafe(rowVals[colMap.potongan]) : undefined;

    // "nominal": angka paling kanan di baris (biasanya hasil kali/total tanpa header sendiri).
    let nominal: number | undefined;
    const rightBound = colMap.potongan !== undefined ? colMap.potongan : 0;
    for (let c = rowVals.length - 1; c > rightBound; c--) {
      const n = toNumberSafe(rowVals[c]);
      if (n !== undefined) {
        nominal = n;
        break;
      }
    }

    if (targetSalesBks === undefined && potonganPerBks === undefined && nominal === undefined) {
      nextRow = r;
      break;
    }

    const labelRaw = colMap.keterangan !== undefined ? rowVals[colMap.keterangan] : null;
    const isNumericPlaceholder = labelRaw !== null && /^-?\d+(\.\d+)?$/.test(String(labelRaw).trim());
    const label =
      labelRaw && !isNumericPlaceholder
        ? String(labelRaw).trim().toUpperCase()
        : rows.length === 0
        ? "PENGAJUAN"
        : "";

    rows.push({ label, keterangan: label || undefined, targetSalesBks, potonganPerBks, nominal });
    nextRow = r + 1;
  }

  return { rows, nextRow };
}

/** Tabel Section "02" (kedua): Biaya Pengajuan/Realisasi/Deviasi. */
function extractBiayaTable(
  grid: (string | number | null)[][],
  headerRow: number,
  gridLen: number
): { rows: EvaluasiBiayaRow[]; nextRow: number } {
  const colMap = getColumnMap(grid, headerRow, {
    keterangan: "KETERANGAN",
    biayaPromosi: "BIAYA PROMOSI",
    jasaPerorangan: "JASA PERORANGAN",
    biayaPosm: "BIAYA POSM",
    trialTaste: "TRIAL TASTE",
    totalBiaya: "TOTAL BIAYA",
  });

  const rows: EvaluasiBiayaRow[] = [];
  let nextRow = headerRow + 1;
  const maxR = Math.min(headerRow + 10, gridLen);

  for (let r = headerRow + 1; r <= maxR; r++) {
    const rowVals = grid[r - 1];
    const biayaPromosi = colMap.biayaPromosi !== undefined ? toNumberSafe(rowVals[colMap.biayaPromosi]) : undefined;
    const jasaPerorangan =
      colMap.jasaPerorangan !== undefined ? toNumberSafe(rowVals[colMap.jasaPerorangan]) : undefined;
    const biayaPosm = colMap.biayaPosm !== undefined ? toNumberSafe(rowVals[colMap.biayaPosm]) : undefined;
    const trialTaste = colMap.trialTaste !== undefined ? toNumberSafe(rowVals[colMap.trialTaste]) : undefined;
    const totalBiaya = colMap.totalBiaya !== undefined ? toNumberSafe(rowVals[colMap.totalBiaya]) : undefined;

    if ([biayaPromosi, jasaPerorangan, biayaPosm, trialTaste, totalBiaya].every((v) => v === undefined)) {
      nextRow = r;
      break;
    }

    const labelRaw = colMap.keterangan !== undefined ? rowVals[colMap.keterangan] : null;
    const label = labelRaw ? String(labelRaw).trim().toUpperCase() : rows.length === 0 ? "PENGAJUAN" : "";

    rows.push({ label, biayaPromosi, jasaPerorangan, biayaPosm, trialTaste, totalBiaya });
    nextRow = r + 1;
  }

  return { rows, nextRow };
}

/** Tabel breakdown "... terdiri atas :" (Keterangan / Budget (Rp) / Actual (Rp) / %), dipakai
 *  dua kali (Biaya Promosi & Trial Taste), ditutup oleh baris "Total ...". */
function extractBiayaBreakdownTable(
  grid: (string | number | null)[][],
  headerRow: number,
  gridLen: number
): { rows: EvaluasiBiayaBreakdownRow[]; totalLabel?: string; nextRow: number } {
  const colMap = getColumnMap(grid, headerRow, {
    keterangan: "KETERANGAN",
    budget: "BUDGET",
    actual: "ACTUAL",
    persen: "%",
  });

  const rows: EvaluasiBiayaBreakdownRow[] = [];
  let totalLabel: string | undefined;
  let nextRow = headerRow + 1;
  const maxR = Math.min(headerRow + 15, gridLen);

  for (let r = headerRow + 1; r <= maxR; r++) {
    const rowVals = grid[r - 1];
    const budget = colMap.budget !== undefined ? toNumberSafe(rowVals[colMap.budget]) : undefined;
    const actual = colMap.actual !== undefined ? toNumberSafe(rowVals[colMap.actual]) : undefined;
    const persen = colMap.persen !== undefined ? toNumberSafe(rowVals[colMap.persen]) : undefined;
    const keteranganRaw = colMap.keterangan !== undefined ? rowVals[colMap.keterangan] : null;

    if (budget === undefined && actual === undefined && persen === undefined) {
      nextRow = r;
      break;
    }

    const isTotalRow = normalize(keteranganRaw).startsWith("TOTAL");
    nextRow = r + 1;
    if (isTotalRow) {
      totalLabel = keteranganRaw ? String(keteranganRaw).trim() : undefined;
      break; // baris Total menutup tabel breakdown ini
    }

    rows.push({
      keterangan: keteranganRaw ? String(keteranganRaw).trim() : undefined,
      budget,
      actual,
      persen,
    });
  }

  return { rows, totalLabel, nextRow };
}

function extractTradePromoEvaluasiSheet(grid: (string | number | null)[][]): TradePromoEvaluasiSheet | null {
  const gridLen = grid.length;
  const pencapaianPos = findLabelCell(grid, "TOTAL PENCAPAIAN PROGRAM");
  if (!pencapaianPos) return null;

  // --- Tabel pencapaian program (atas) ---
  const pencapaianHeaderPos = findLabelCellFrom(grid, pencapaianPos.row + 1, "KETERANGAN", true);
  let pencapaianProgram: EvaluasiPencapaianRow[] = [];
  let pencapaianProgramTotal: EvaluasiPencapaianRow | undefined;
  let cursor = pencapaianPos.row + 1;
  if (pencapaianHeaderPos) {
    const res = extractPencapaianTable(grid, pencapaianHeaderPos.row, gridLen);
    pencapaianProgram = res.rows;
    pencapaianProgramTotal = res.total;
    cursor = res.nextRow;
  }

  // FIX: pakai row hasil ketemu, bukan cursor += 5 (tebakan jarak).
  const tpt1 = findPercentAfterLabel(grid, "TARGET PENJUALAN TERCAPAI", cursor, cursor + 5);
  const targetPenjualanTercapaiPercent1 = tpt1.value;
  cursor = tpt1.row ? tpt1.row + 1 : cursor;

  // --- Section "01": Target Sales / Realisasi Sales / Deviasi ---
  let salesRows: EvaluasiSalesRow[] = [];
  let targetPenjualanTercapaiPercent2: number | undefined;
  const salesHeaderPos = findLabelCellFrom(grid, cursor, "KETERANGAN", true);
  if (salesHeaderPos) {
    const res = extractSalesTable(grid, salesHeaderPos.row, gridLen);
    salesRows = res.rows;
    cursor = res.nextRow;
    const tpt2 = findPercentAfterLabel(grid, "TARGET PENJUALAN TERCAPAI", cursor, cursor + 5);
    targetPenjualanTercapaiPercent2 = tpt2.value;
    // fallback +1 (bukan +5) kalau marker gak ketemu, biar gak overshoot
    cursor = tpt2.row ? tpt2.row + 1 : cursor + 1;
  }

  // --- Section "02" (pertama): tabel WS mingguan ---
  const wsPencapaianPos = findLabelCellFrom(grid, cursor, "TOTAL PENCAPAIAN PROGRAM");
  let wsRows: EvaluasiWsRow[] = [];
  let wsTotal: EvaluasiWsRow | undefined;
  let targetPenjualanTercapaiPercent3: number | undefined;
  if (wsPencapaianPos) {
    const wsHeaderPos = findLabelCellFrom(grid, wsPencapaianPos.row + 1, "WS", true);
    if (wsHeaderPos) {
      const res = extractWsTable(grid, wsHeaderPos.row, gridLen);
      wsRows = res.rows;
      wsTotal = res.total;
      cursor = res.nextRow;
      const tpt3 = findPercentAfterLabel(grid, "TARGET PENJUALAN TERCAPAI", cursor, cursor + 5);
      targetPenjualanTercapaiPercent3 = tpt3.value;
      cursor = tpt3.row ? tpt3.row + 1 : cursor + 1;
    }
  }

  // --- Section "02" (kedua): tabel Biaya Pengajuan/Realisasi/Deviasi ---
  let biayaRows: EvaluasiBiayaRow[] = [];
  let totalBiayaTerpakaiPercent: number | undefined;
  const biayaHeaderPos = findLabelCellFrom(grid, cursor, "BIAYA PROMOSI");
  if (biayaHeaderPos) {
    const res = extractBiayaTable(grid, biayaHeaderPos.row, gridLen);
    biayaRows = res.rows;
    cursor = res.nextRow;
    const tbt = findPercentAfterLabel(grid, "TOTAL BIAYA TERPAKAI", cursor, cursor + 5);
    totalBiayaTerpakaiPercent = tbt.value;
    cursor = tbt.row ? tbt.row + 1 : cursor + 1;
  }

  // --- Breakdown "Biaya Promosi terdiri atas :" ---
  let biayaPromosiBreakdown: EvaluasiBiayaBreakdownRow[] = [];
  const biayaBreakdownAnchor = findLabelCellFrom(grid, cursor, "BIAYA PROMOSI TERDIRI ATAS");
  if (biayaBreakdownAnchor) {
    const headerPos = findLabelCellFrom(grid, biayaBreakdownAnchor.row + 1, "KETERANGAN", true);
    if (headerPos) {
      const res = extractBiayaBreakdownTable(grid, headerPos.row, gridLen);
      biayaPromosiBreakdown = res.rows;
      cursor = res.nextRow;
    }
  }

  // --- Breakdown kedua (mis. "Bonus Rokok" / "Trial Taste terdiri atas :") ---
  // Labelnya kadang beda-beda antar file ("Trial Taste terdiri atas", "Bonus Rokok",
  // bahkan rusak jadi "#REF!"), jadi dideteksi lewat header tabel berikutnya
  // ("Keterangan | Budget (Rp) | Actual (Rp) | %"), bukan lewat teks labelnya.
  let trialTasteBreakdown: EvaluasiBiayaBreakdownRow[] = [];
  const trialTasteHeaderPos = findLabelCellFrom(grid, cursor, "KETERANGAN", true);
  if (trialTasteHeaderPos) {
    const res = extractBiayaBreakdownTable(grid, trialTasteHeaderPos.row, gridLen);
    trialTasteBreakdown = res.rows;
    cursor = res.nextRow;
  }

  // --- Section "03": EVALUASI PROGRAM / Kendala / Plan selanjutnya ---
  let evaluasiProgram: string[] = [];
  let kendala: string[] = [];
  let planSelanjutnya: string[] = [];
  let dibuatOlehPos: { row: number; col: number } | null = null;

  const evalPos = findLabelCellFrom(grid, cursor, "EVALUASI PROGRAM");
  if (evalPos) {
    const kendalaPos = findLabelCellFrom(grid, evalPos.row + 1, "KENDALA");
    const planPos = findLabelCellFrom(grid, kendalaPos ? kendalaPos.row + 1 : evalPos.row + 1, "PLAN SELANJUTNYA");

    // FIX: cari batas "DIBUAT OLEH" LEBIH DULU, supaya Plan Selanjutnya bisa dipagari
    // sebelum blok tanda tangan (nama/jabatan/tanggal) ikut ke-baca sebagai poin plan.
    dibuatOlehPos = findLabelCellFrom(grid, planPos ? planPos.row + 1 : evalPos.row + 1, "DIBUAT OLEH");

    const evalEnd = (kendalaPos?.row ?? planPos?.row ?? gridLen + 1) - 1;
    evaluasiProgram = collectBulletOrParagraphRows(grid, evalPos.row + 1, evalEnd);

    if (kendalaPos) {
      const kendalaEnd = (planPos?.row ?? gridLen + 1) - 1;
      kendala = collectBulletOrParagraphRows(grid, kendalaPos.row + 1, kendalaEnd);
    }
    if (planPos) {
      const planEnd = (dibuatOlehPos?.row ?? gridLen + 1) - 1; // <-- FIX UTAMA
      planSelanjutnya = collectBulletOrParagraphRows(grid, planPos.row + 1, planEnd);
    }
  } else {
    dibuatOlehPos = findLabelCellFrom(grid, cursor, "DIBUAT OLEH");
  }

  const signatures = dibuatOlehPos ? extractEvaluasiSignatures(grid, dibuatOlehPos.row) : [];

  return {
    pencapaianProgram,
    pencapaianProgramTotal,
    targetPenjualanTercapaiPercent1,
    salesRows,
    targetPenjualanTercapaiPercent2,
    wsRows,
    wsTotal,
    targetPenjualanTercapaiPercent3,
    biayaRows,
    totalBiayaTerpakaiPercent,
    biayaPromosiBreakdown,
    trialTasteBreakdown,
    evaluasiProgram,
    kendala,
    planSelanjutnya,
    signatures
  };
}

// ---------- SHEET KE-3: dispatcher varian A (Activation) vs varian B (Trade Promo) ----------

function extractEvaluasiSheetAny(grid: (string | number | null)[][]): EvaluasiSheetResult | null {
  const activation = extractEvaluasiSheet(grid);
  if (activation) return { kind: "activation", data: activation };

  const tradePromo = extractTradePromoEvaluasiSheet(grid);
  if (tradePromo) return { kind: "trade_promo", data: tradePromo };

  return null;
}

// ---------- Main entry point ----------

export async function parseActionPlanBuffer(
  buffer: Buffer | ArrayBuffer
): Promise<ActionPlanParsed> {
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.load(buffer as any);

  const sheet1 = workbook.worksheets[0];
  const sheet2 = workbook.worksheets[1]; // sheet kedua (opsional) -> detail mekanisme program
  const sheet3 = workbook.worksheets[2];

  const grid = sheetToGrid(sheet1);
  const gridLen = grid.length;
  const sectionRows = findSectionRows(grid);

  const header = extractHeader(grid);
  const uraian = extractUraianProgram(grid, sectionRows, gridLen);
  const latarBelakang = extractNumberedList(grid, "LATAR BELAKANG PROGRAM", ["OBJEKTIF PROGRAM"]);
  const objektif = extractNumberedList(grid, "OBJEKTIF PROGRAM", ["TARGET PROGRAM"]);
  const mekanisme = extractNumberedList(grid, "MEKANISME PROGRAM", ["PELAKSANA PROGRAM"]);

  const targetProgram = extractTargetProgram(grid, sectionRows, gridLen);
  const targetEvent = extractTargetEvent(grid, sectionRows, gridLen);
  const distribusi = extractDistribusi(grid, sectionRows, gridLen);
  const anggaranBiaya = extractAnggaranBiaya(grid, sectionRows, gridLen);
  const thl = extractThl(grid, sectionRows, gridLen);
  const barangPromo = extractBarangPromo(grid, sectionRows, gridLen);
  const brandJln = extractBrandJln(grid, gridLen);
  const tbyd = extractTbyd(grid, gridLen);
  const transfer = extractTransfer(grid, gridLen);
  const analisa = extractAnalisa(grid, gridLen);

  const totalBiayaYangDibutuhkan = tbyd[0]?.estimasiTotal;
  const costRatioPercent = analisa.find((a) => normalize(a.analisaBiaya).includes("TOTAL"))?.costRatio;

  // Fallback: kalau header.totalBiaya tidak ketemu di area header,
  // pakai totalBiayaYangDibutuhkan dari section TBYD.
  if (totalBiayaYangDibutuhkan === undefined) {
    header.totalBiaya = totalBiayaYangDibutuhkan;
  }

  // --- Sheet ke-2: MEKANISME PROGRAM (detail POSM / Trial Taste / Target Sales per sub-program) ---
  let mekanismeDetail: MekanismeSheet | null = null;
  if (sheet2) {
    try {
      const grid2 = sheetToGrid(sheet2);
      mekanismeDetail = extractMekanismeDetail(grid2);
    } catch (err) {
      // jangan sampai kegagalan parsing sheet 2 menggagalkan seluruh upload
      console.error("Gagal parsing sheet ke-2 (mekanisme detail):", err);
      mekanismeDetail = null;
    }
  }

  // --- Sheet ke-3: EVALUASI ACTION PLAN (Activation ATAU Trade Promo) ---
  let evaluasi: EvaluasiSheetResult | null = null;
  if (sheet3) {
    try {
      const grid3 = sheetToGrid(sheet3);
      evaluasi = extractEvaluasiSheetAny(grid3);
    } catch (err) {
      console.error("Gagal parsing sheet ke-3 (evaluasi):", err);
      evaluasi = null;
    }
  }

  return {
    header,
    uraian,
    latarBelakang,
    objektif,
    mekanisme,
    targetProgram,
    targetEvent,
    distribusi,
    anggaranBiaya,
    thl,
    barangPromo,
    brandJln,
    tbyd,
    transfer,
    analisa,
    totalBiayaYangDibutuhkan,
    costRatioPercent,
    mekanismeDetail,
    evaluasi,
    rawGrid: grid,
  };
}