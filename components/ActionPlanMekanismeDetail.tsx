"use client";

import React from "react";

const C = {
  yellow: "#FFFF99",
  green: "#D9EAD3",
  greenBorder: "#93C47D",
  blackBar: "#000000",
  border: "#000000",
  text: "#000000",
  white: "#FFFFFF",
  totalRow: "#D9D9D9",
};

const cellBase: React.CSSProperties = {
  border: `1px solid ${C.border}`,
  padding: "4px 8px",
  fontSize: 13,
  verticalAlign: "middle",
};

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

function SectionBar({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        background: C.blackBar,
        color: C.white,
        fontWeight: 700,
        padding: "6px 10px",
        fontSize: 13,
        letterSpacing: 0.3,
      }}
    >
      {children}
    </div>
  );
}

function formatCell(v: string | number | null): string {
  if (v === null || v === undefined || v === "") return "-";
  return String(v);
}

// Kata kunci header yang dianggap kolom nominal Rupiah (case-insensitive).
// Sesuaikan daftar ini kalau ada nama kolom lain di sheet MEKANISME yang perlu diformat currency.
const CURRENCY_HEADER_KEYWORDS = ["harga", "biaya", "nominal", "imbalan", "rp", "budget", "penjualan", "biaya", "estimasi total"];

function isCurrencyColumn(header: string | undefined): boolean {
  if (!header) return false;
  const h = header.toLowerCase();
  return CURRENCY_HEADER_KEYWORDS.some((k) => h.includes(k));
}

/** Render satu tabel mini generik: header apapun kolomnya, rows apapun isinya. */
function GenericMiniTable({
  sub,
  formatRupiah,
}: {
  sub: MekanismeSubProgram;
  formatRupiah?: (v: number) => string;
}) {
  if (!sub.headerKolom.length && !sub.rows.length) {
    return <div style={{ padding: 8, fontSize: 13, color: "#888" }}>Tidak ada data tabel.</div>;
  }

  const currencyCols = sub.headerKolom.map((h) => isCurrencyColumn(h));

  const renderCell = (cell: string | number | null, ci: number) => {
    if (formatRupiah && currencyCols[ci] && typeof cell === "number") {
      return formatRupiah(cell);
    }
    return formatCell(cell);
  };

  return (
    <table style={{ width: "100%", borderCollapse: "collapse" }}>
      {sub.headerKolom.length > 0 && (
        <thead>
          <tr>
            {sub.headerKolom.map((h, i) => (
              <th
                key={i}
                style={{
                  ...cellBase,
                  background: C.green,
                  borderColor: C.greenBorder,
                  fontWeight: 700,
                  textAlign: i === 0 ? "center" : "left",
                }}
              >
                {h || "-"}
              </th>
            ))}
          </tr>
        </thead>
      )}
      <tbody>
        {sub.rows.map((row, ri) => (
          <tr key={ri}>
            {row.map((cell, ci) => (
              <td
                key={ci}
                style={{
                  ...cellBase,
                  textAlign: typeof cell === "number" ? "right" : ci === 0 ? "center" : "left",
                }}
              >
                {renderCell(cell, ci)}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
      {sub.totalRow && sub.totalRow.length > 0 && (
        <tfoot>
          <tr>
            {sub.totalRow.map((cell, ci) => (
              <td
                key={ci}
                style={{
                  ...cellBase,
                  background: ci === 0 ? C.totalRow : C.yellow,
                  fontWeight: 700,
                  textAlign: typeof cell === "number" ? "right" : ci === 0 ? "center" : "left",
                }}
              >
                {renderCell(cell, ci)}
              </td>
            ))}
          </tr>
        </tfoot>
      )}
    </table>
  );
}

/** Render daftar catatan "Note :" sebagai list bernomor. */
function NotesList({ notes }: { notes: string[] }) {
  if (!notes.length) return null;
  return (
    <div style={{ padding: "8px 8px 4px", fontSize: 12, color: "#555" }}>
      <div style={{ fontWeight: 700, marginBottom: 2 }}>Note :</div>
      <ol style={{ margin: 0, padding: "0 0 0 18px" }}>
        {notes.map((n, i) => (
          <li key={i} style={{ marginBottom: 2 }}>
            {n}
          </li>
        ))}
      </ol>
    </div>
  );
}

/**
 * Komponen read-only untuk menampilkan detail sheet ke-2 ("MEKANISME PROGRAM")
 * hasil parse Excel. Bentuk tabelnya generik — mengikuti apapun kolom/jumlah
 * sub-program yang terbaca dari file, tanpa asumsi struktur tetap.
 *
 * `formatRupiah` opsional: kalau diisi, kolom yang headernya mengandung kata kunci
 * currency (lihat CURRENCY_HEADER_KEYWORDS) akan diformat sebagai Rupiah.
 */
export default function ActionPlanMekanismeDetail({
  detail,
  formatRupiah,
}: {
  detail: MekanismeSheet | null | undefined;
  formatRupiah?: (v: number) => string;
}) {
  if (!detail || !detail.subPrograms?.length) {
    return (
      <div style={{ padding: 12, fontSize: 13, color: "#888" }}>
        Tidak ada detail mekanisme program (sheet ke-2 tidak ditemukan atau kosong).
      </div>
    );
  }

  return (
    <div style={{ background: C.white, fontFamily: "Calibri, Arial, sans-serif", color: C.text }}>
      {(detail.judulSheet || detail.noActionPlanRef || detail.deskripsi) && (
        <div style={{ padding: "8px 10px", borderBottom: `1px solid ${C.border}`, fontSize: 13 }}>
          {detail.judulSheet && <div style={{ fontWeight: 700 }}>{detail.judulSheet}</div>}
          {detail.noActionPlanRef && <div>{detail.noActionPlanRef}</div>}
          {detail.deskripsi && <div style={{ marginTop: 4, color: "#555" }}>{detail.deskripsi}</div>}
        </div>
      )}

      {detail.subPrograms.map((sub, i) => (
        <div key={i} style={{ marginBottom: 12 }}>
          <SectionBar>
            {sub.nomor !== null ? `${sub.nomor}. ` : ""}
            {sub.judul || "(Tanpa judul)"}
          </SectionBar>
          <GenericMiniTable sub={sub} formatRupiah={formatRupiah} />
          <NotesList notes={sub.notes} />
        </div>
      ))}
    </div>
  );
}