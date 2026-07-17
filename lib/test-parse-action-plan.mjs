/**
 * Script test untuk parseActionPlanBuffer, TANPA insert ke database.
 * Nge-cover sheet 1 (data utama AP), sheet 2 (mekanisme detail),
 * dan sheet 3 (evaluasi action plan).
 *
 * Cara pakai:
 *   npx tsx test-parse-action-plan.mjs path/ke/file.xlsx
 *
 * Sesuaikan path import di bawah ke lokasi lib/parseActionsPlan.ts di project kamu.
 */

import { readFile } from "node:fs/promises";
import path from "node:path";

const { parseActionPlanBuffer } = await import("./parseActionsPlan.ts");

async function main() {
  const filePath = process.argv[2];
  if (!filePath) {
    console.error("Usage: node test-parse-action-plan.mjs <path-to-xlsx>");
    process.exit(1);
  }

  const absPath = path.resolve(filePath);
  console.log(`\n=== Membaca file: ${absPath} ===\n`);

  const buffer = await readFile(absPath);
  const parsed = await parseActionPlanBuffer(buffer);

  // Buang rawGrid biar output nggak kepanjangan; simpan terpisah kalau perlu.
  const { rawGrid, ...summary } = parsed;

  // ========== SHEET 1: DATA UTAMA ACTION PLAN ==========
  printSection("HEADER", summary.header);
  printField("Uraian", summary.uraian);
  printField("Latar Belakang", summary.latarBelakang);
  printField("Objektif", summary.objektif);
  printField("Mekanisme", summary.mekanisme);

  printTable("Target Program", summary.targetProgram);
  printTable("Target Event atau Sejenisnya", summary.targetEvent);
  printTable("Data Distribusi", summary.distribusi);
  printTable("Anggaran Biaya Promosi", summary.anggaranBiaya);
  printTable("Tenaga Kerja Lepas (THL)", summary.thl);
  printTable("Kebutuhan Barang Promosi", summary.barangPromo);
  printTable("Trial Taste / Brand Jalan", summary.brandJln);
  printTable("Total Biaya yang Dibutuhkan (TBYD)", summary.tbyd);
  printTable("Permintaan Transfer", summary.transfer);
  printTable("Analisa Biaya", summary.analisa);

  console.log("\n=== RINGKASAN TOTAL (Sheet 1) ===");
  console.log("Total Biaya yang Dibutuhkan (parsed):", summary.totalBiayaYangDibutuhkan);
  console.log("Cost Ratio Percent (parsed):", summary.costRatioPercent);

  console.log("\n=== CEK KEKOSONGAN SHEET 1 (kemungkinan label tidak match) ===");
  const checks = [
    ["header.noActionPlan", summary.header.noActionPlan],
    ["header.perwakilanAgen", summary.header.perwakilanAgen],
    ["header.tglMulai", summary.header.tglMulai],
    ["header.tglSelesai", summary.header.tglSelesai],
    ["header.lamaProgramHari", summary.header.lamaProgramHari],
    ["header.totalBiaya", summary.header.totalBiaya],
    ["latarBelakang", summary.latarBelakang],
    ["objektif", summary.objektif],
    ["mekanisme", summary.mekanisme],
    ["targetProgram.length", summary.targetProgram.length],
    ["targetEvent.length", summary.targetEvent.length],
    ["distribusi.length", summary.distribusi.length],
    ["anggaranBiaya.length", summary.anggaranBiaya.length],
    ["thl.length", summary.thl.length],
    ["barangPromo.length", summary.barangPromo.length],
    ["brandJln.length", summary.brandJln.length],
    ["tbyd.length", summary.tbyd.length],
    ["transfer.length", summary.transfer.length],
    ["analisa.length", summary.analisa.length],
  ];

  let warnCount = 0;
  for (const [label, val] of checks) {
    const isEmpty =
      val === undefined ||
      val === null ||
      val === "" ||
      val === 0 ||
      (Array.isArray(val) && val.length === 0);
    if (isEmpty) {
      warnCount++;
      console.log(`${label} kosong/0 — cek label section di parser atau di file Excel`);
    }
  }
  if (warnCount === 0) {
    console.log("Semua field utama (sheet 1) terisi.");
  } else {
    console.log(`\n  Total ${warnCount} field kosong. Cek satu per satu di atas.`);
  }

  // ========== SHEET 2: MEKANISME DETAIL ==========
  console.log("\n\n########## SHEET KE-2: MEKANISME DETAIL ##########");
  printMekanismeDetail(summary.mekanismeDetail);

  if (!summary.mekanismeDetail) {
    console.log("Tidak ada sheet ke-2 terdeteksi, atau gagal parse (mekanismeDetail = null).");
    console.log("Ini normal kalau file hanya punya 1 sheet.");
  } else if (!summary.mekanismeDetail.subPrograms?.length) {
    console.log("Sheet ke-2 ada, tapi tidak ada sub-program terbaca (subPrograms kosong).");
    console.log("Kemungkinan pola bullet nomor di kolom kiri tidak terdeteksi — cek struktur sheet.");
  } else {
    console.log(`${summary.mekanismeDetail.subPrograms.length} sub-program terbaca dari sheet ke-2.`);
    const subProgramsMissingHeader = summary.mekanismeDetail.subPrograms.filter(
      (s) => !s.headerKolom?.length
    );
    const subProgramsMissingRows = summary.mekanismeDetail.subPrograms.filter((s) => !s.rows?.length);
    if (subProgramsMissingHeader.length) {
      console.log(
        `  ⚠️  ${subProgramsMissingHeader.length} sub-program tanpa headerKolom terdeteksi: ${subProgramsMissingHeader
          .map((s) => `#${s.nomor} "${s.judul}"`)
          .join(", ")}`
      );
    }
    if (subProgramsMissingRows.length) {
      console.log(
        `  ${subProgramsMissingRows.length} sub-program tanpa baris data: ${subProgramsMissingRows
          .map((s) => `#${s.nomor} "${s.judul}"`)
          .join(", ")}`
      );
    }
  }

  // ========== SHEET 3: EVALUASI ACTION PLAN ==========
  console.log("\n\n########## SHEET KE-3: EVALUASI ACTION PLAN ##########");
  printEvaluasi(summary.evaluasi);

  // ========== SIMPAN OUTPUT ==========
  const fs = await import("node:fs/promises");

  const outPath = absPath.replace(/\.(xlsx|xlsm)$/i, "") + ".parsed.json";
  await fs.writeFile(outPath, JSON.stringify(parsed, null, 2), "utf-8");
  console.log(`\nHasil lengkap (termasuk rawGrid) disimpan ke: ${outPath}`);

  if (summary.mekanismeDetail) {
    const mekPath = absPath.replace(/\.(xlsx|xlsm)$/i, "") + ".mekanisme-detail.json";
    await fs.writeFile(mekPath, JSON.stringify(summary.mekanismeDetail, null, 2), "utf-8");
    console.log(`Hasil khusus mekanismeDetail (sheet ke-2) disimpan ke: ${mekPath}`);
  }

  if (summary.evaluasi) {
    const evalPath = absPath.replace(/\.(xlsx|xlsm)$/i, "") + ".evaluasi.json";
    await fs.writeFile(evalPath, JSON.stringify(summary.evaluasi, null, 2), "utf-8");
    console.log(`Hasil khusus evaluasi (sheet ke-3) disimpan ke: ${evalPath}`);
  }
}

// ---------- Helpers umum ----------

function printSection(title, obj) {
  console.log(`\n=== ${title} ===`);
  console.log(JSON.stringify(obj, null, 2));
}

function printField(label, val) {
  console.log(`\n--- ${label} ---`);
  console.log(val ?? "(kosong)");
}

function printTable(title, rows) {
  console.log(`\n=== ${title} (${rows.length} baris) ===`);
  if (rows.length === 0) {
    console.log("  (tidak ada data terparse)");
    return;
  }
  console.table(rows);
}

function printTableCols(title, rows, cols) {
  console.log(`\n=== ${title} (${rows.length} baris) ===`);
  if (!rows.length) {
    console.log("  (tidak ada data terparse)");
    return;
  }
  console.table(rows.map((r) => Object.fromEntries(cols.map((c) => [c, r[c] ?? ""]))));
}

function printList(title, arr) {
  console.log(`\n--- ${title} ---`);
  if (!arr || !arr.length) {
    console.log("  (kosong)");
    return;
  }
  arr.forEach((t, i) => console.log(`  ${i + 1}. ${t}`));
}

/**
 * Print khusus untuk mekanismeDetail (hasil parse sheet ke-2).
 * Formatnya beda dari printTable biasa karena strukturnya block-based
 * (tiap sub-program punya headerKolom + rows sendiri, bukan array flat).
 */
function printMekanismeDetail(mekanismeDetail) {
  console.log(`\n=== MEKANISME DETAIL (Sheet ke-2) ===`);

  if (!mekanismeDetail) {
    console.log("  (tidak ada / sheet ke-2 tidak ditemukan / gagal parse)");
    return;
  }

  if (mekanismeDetail.judulSheet) console.log(`  Judul Sheet   : ${mekanismeDetail.judulSheet}`);
  if (mekanismeDetail.noActionPlanRef) console.log(`  AP No. Ref    : ${mekanismeDetail.noActionPlanRef}`);
  if (mekanismeDetail.deskripsi) console.log(`  Deskripsi     : ${mekanismeDetail.deskripsi}`);

  const subPrograms = mekanismeDetail.subPrograms ?? [];
  console.log(`  Jumlah Sub-Program: ${subPrograms.length}\n`);

  subPrograms.forEach((sub, i) => {
    console.log(`  ── [${i + 1}] ${sub.nomor !== null ? sub.nomor + ". " : ""}${sub.judul || "(tanpa judul)"} ──`);
    console.log(`      Tipe        : ${sub.tipe}`);
    console.log(`      Header Kolom: ${sub.headerKolom?.length ? sub.headerKolom.join(" | ") : "(tidak ada)"}`);

    if (sub.rows?.length) {
      console.log(`      Baris Data  : ${sub.rows.length} baris`);
      console.table(sub.rows.map((r) => Object.fromEntries(r.map((v, idx) => [`col${idx}`, v]))));
    } else {
      console.log(`      Baris Data  : (kosong)`);
    }

    if (sub.totalRow?.length) {
      console.log(`      Total Row   : ${sub.totalRow.map((v) => (v === null ? "-" : v)).join(" | ")}`);
    }

    if (sub.notes?.length) {
      console.log(`      Notes       :`);
      sub.notes.forEach((n, ni) => console.log(`        ${ni + 1}. ${n}`));
    }

    console.log("");
  });
}

/**
 * Print khusus untuk evaluasi (hasil parse sheet ke-3).
 */
function printEvaluasi(evaluasi) {
  if (!evaluasi) {
    console.log("evaluasi = null.");
    console.log("Kemungkinan: file cuma punya 1-2 sheet, atau section 'TARGET UNTUK EVENT ATAU SEJENISNYA'");
    console.log("tidak ketemu di sheet ke-3 (cek nama section / typo di file Excel).");
    return;
  }

  printTableCols("Target Event", evaluasi.targetEvent, [
    "jenisProgram",
    "target",
    "brand",
    "qty",
    "hargaBks",
    "persen",
    "totalTargetPenjualan",
  ]);

  printTableCols("Realisasi Event", evaluasi.realisasiEvent, [
    "brand",
    "qty",
    "hargaBks",
    "persen",
    "totalTargetPenjualan",
  ]);

  printList("Penjelasan Target Event", evaluasi.penjelasanTargetEvent);

  printTableCols("Anggaran", evaluasi.anggaran, [
    "label",
    "biayaPromosi",
    "biayaPosm",
    "biayaSampling",
    "totalBiaya",
  ]);

  printList("Penjelasan Anggaran", evaluasi.penjelasanAnggaran);

  console.log(`\n=== Sampling Groups (${evaluasi.samplingGroups.length}) ===`);
  if (!evaluasi.samplingGroups.length) {
    console.log("  (tidak ada data)");
  } else {
    evaluasi.samplingGroups.forEach((g) => {
      console.log(`  -- ${g.label} (${g.items.length} item) --`);
      if (g.items.length) console.table(g.items);
    });
  }

  console.log("\n=== Sampling Deviasi ===");
  console.log(evaluasi.samplingDeviasi ?? "(tidak ada / null)");

  printList("Penjelasan Sampling", evaluasi.penjelasanSampling);
  printList("Evaluasi Program", evaluasi.evaluasiProgram);

  console.log(`\n=== Signatures (${evaluasi.signatures.length}) ===`);
  if (evaluasi.signatures.length) console.table(evaluasi.signatures);
  else console.log("  (tidak ada)");

  console.log("\n=== CEK KEKOSONGAN SHEET 3 (kemungkinan label section tidak match) ===");
  const checks = [
    ["targetEvent.length", evaluasi.targetEvent.length],
    ["realisasiEvent.length", evaluasi.realisasiEvent.length],
    ["anggaran.length", evaluasi.anggaran.length],
    ["samplingGroups.length", evaluasi.samplingGroups.length],
    ["evaluasiProgram.length", evaluasi.evaluasiProgram.length],
    ["signatures.length", evaluasi.signatures.length],
  ];
  let warnCount = 0;
  for (const [label, val] of checks) {
    const isEmpty = val === undefined || val === null || val === 0;
    if (isEmpty) {
      warnCount++;
      console.log(`${label} kosong/0 — cek label section 'EVALUASI ACTION PLAN' di file Excel / parser`);
    }
  }
  if (warnCount === 0) console.log("Semua field utama evaluasi terisi.");
  else console.log(`\n  Total ${warnCount} field kosong. Cek satu per satu di atas.`);
}

main().catch((err) => {
  console.error("\n Gagal parsing:", err);
  process.exit(1);
});
