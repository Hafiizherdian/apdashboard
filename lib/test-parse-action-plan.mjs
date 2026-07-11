/**
 * Script test untuk parseActionPlanBuffer, TANPA insert ke database.
 *
 * Cara pakai:
 *   node test-parse-action-plan.mjs path/ke/file.xlsx
 *
 * Kalau project kamu pakai TypeScript (parseActionsPlan.ts), compile dulu
 * atau jalankan lewat ts-node/tsx:
 *   npx tsx test-parse-action-plan.mjs path/ke/file.xlsx
 *
 * Script ini meng-import parseActionPlanBuffer langsung dari lib kamu,
 * jadi pastikan path import di bawah sesuai struktur project (relatif
 * dari lokasi file ini, atau ganti jadi alias @/lib kalau pakai tsx
 * dengan tsconfig paths).
 * npx tsx test-parse-action-plan.mjs "D:/DCGKN/data/AP/AP Rakerkonprov Apindo.xlsx"
 */

import { readFile } from "node:fs/promises";
import path from "node:path";

// Sesuaikan path ini ke lokasi lib/parseActionsPlan.ts di project kamu.
// Contoh kalau script ini diletakkan di root project:
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

  printMekanismeDetail(summary.mekanismeDetail);

  console.log("\n=== RINGKASAN TOTAL ===");
  console.log("Total Biaya yang Dibutuhkan (parsed):", summary.totalBiayaYangDibutuhkan);
  console.log("Cost Ratio Percent (parsed):", summary.costRatioPercent);

  console.log("\n=== CEK KEKOSONGAN (kemungkinan label tidak match) ===");
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
    // Sheet ke-2 (mekanisme detail) — kosong di sini WAJAR kalau file cuma 1 sheet,
    // jadi tidak dihitung sebagai warning, hanya info terpisah di bawah.
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

  console.log("\n=== CEK KHUSUS SHEET KE-2 (MEKANISME DETAIL) ===");
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

  // Simpan hasil lengkap (termasuk rawGrid) ke file JSON biar bisa diperiksa detail.
  const outPath = absPath.replace(/\.(xlsx|xlsm)$/i, "") + ".parsed.json";
  const fs = await import("node:fs/promises");
  await fs.writeFile(outPath, JSON.stringify(parsed, null, 2), "utf-8");
  console.log(`\nHasil lengkap (termasuk rawGrid) disimpan ke: ${outPath}`);

  // Simpan khusus mekanismeDetail ke file terpisah juga, biar gampang di-review
  // tanpa harus scroll rawGrid sheet 1 yang panjang.
  if (summary.mekanismeDetail) {
    const mekPath = absPath.replace(/\.(xlsx|xlsm)$/i, "") + ".mekanisme-detail.json";
    await fs.writeFile(mekPath, JSON.stringify(summary.mekanismeDetail, null, 2), "utf-8");
    console.log(`Hasil khusus mekanismeDetail (sheet ke-2) disimpan ke: ${mekPath}`);
  }
}

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

main().catch((err) => {
  console.error("\n Gagal parsing:", err);
  process.exit(1);
});
