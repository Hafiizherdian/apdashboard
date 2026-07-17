"use client";

import React from "react";
import type { MekanismeSheet, MekanismeSubProgram } from "@/components/ActionPlanMekanismeDetail";

const C = {
  yellow: "#FFFF99",
  green: "#D9EAD3",
  greenBorder: "#93C47D",
  blackBar: "#000000",
  border: "#000000",
  text: "#000000",
  white: "#FFFFFF",
  totalRow: "#D9D9D9",
  red: "#B3261E",
};

const cellBase: React.CSSProperties = {
  border: `1px solid ${C.border}`,
  padding: 0,
  fontSize: 13,
  verticalAlign: "middle",
};

const inputStyle: React.CSSProperties = {
  width: "100%",
  border: "none",
  outline: "none",
  background: "transparent",
  padding: "4px 8px",
  fontSize: 13,
};

const mobileInputStyle: React.CSSProperties = {
  width: "100%",
  border: "1px solid #ccc",
  borderRadius: 6,
  padding: "7px 8px",
  fontSize: 13,
  outline: "none",
  background: "#fff",
};

// Kata kunci header yang dianggap kolom nominal Rupiah (case-insensitive).
// Samakan dengan daftar di ActionPlanMekanismeDetail.tsx supaya konsisten antara mode edit & view.
const CURRENCY_HEADER_KEYWORDS = ["harga", "biaya", "nominal", "imbalan", "rp", "estimasi"];

function isCurrencyColumn(header: string | undefined): boolean {
  if (!header) return false;
  const h = header.toLowerCase();
  return CURRENCY_HEADER_KEYWORDS.some((k) => h.includes(k));
}

function SectionBar({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ background: C.blackBar, color: C.white, fontWeight: 700, padding: "6px 10px", fontSize: 13, letterSpacing: 0.3 }}>
      {children}
    </div>
  );
}

function AddRowButton({ onClick, label = "+ Tambah Baris" }: { onClick: () => void; label?: string }) {
  return (
    <div style={{ padding: "6px 4px" }}>
      <button
        type="button"
        onClick={onClick}
        style={{ padding: "4px 12px", fontSize: 12, fontWeight: 600, background: C.green, border: `1px solid ${C.greenBorder}`, borderRadius: 4, cursor: "pointer", color: C.text }}
      >
        {label}
      </button>
    </div>
  );
}

/** Input khusus kolom currency: prefix "Rp", tampilan diformat, input hanya menyimpan digit mentah. */
function CurrencyCellInput({
  value,
  onChange,
  formatRupiah,
  bold,
  mobile,
}: {
  value: string | number | null;
  onChange: (v: string) => void;
  formatRupiah?: (v: number) => string;
  bold?: boolean;
  mobile?: boolean;
}) {
  const numeric = Number(value) || 0;
  // formatRupiah biasanya mengembalikan "Rp 1.000.000" — buang prefix "Rp" karena sudah ditampilkan terpisah.
  const display = formatRupiah ? formatRupiah(numeric).replace(/^Rp\s?/, "") : String(value ?? "");

  return (
    <div
      style={
        mobile
          ? { display: "flex", alignItems: "center", border: "1px solid #ccc", borderRadius: 6, padding: "0 8px", background: "#fff" }
          : { display: "flex", alignItems: "center", padding: "0 8px" }
      }
    >
      <span style={{ fontSize: 13, whiteSpace: "nowrap", marginRight: 6, color: mobile ? "#666" : undefined }}>Rp</span>
      <input
        type="text"
        value={display}
        onChange={(e) => onChange(e.target.value.replace(/[^\d]/g, ""))}
        style={{
          flex: 1,
          border: "none",
          outline: "none",
          background: "transparent",
          padding: mobile ? "7px 0" : "4px 0",
          fontSize: 13,
          textAlign: "right",
          fontWeight: bold ? 700 : 400,
        }}
      />
    </div>
  );
}

// ============================================================
// MOBILE: header-kolom editor (dinamis) + row cards + total card
// ============================================================
function MobileHeaderEditor({
  headerKolom,
  colCount,
  onChangeHeader,
}: {
  headerKolom: string[];
  colCount: number;
  onChangeHeader: (colIdx: number, value: string) => void;
}) {
  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: 6, padding: "8px", background: "#FAFAFA", borderBottom: `1px solid ${C.border}` }}>
      {Array.from({ length: colCount }).map((_, i) => (
        <div key={i} style={{ flex: "1 1 110px", minWidth: 100 }}>
          <label style={{ display: "block", fontSize: 10, color: "#666", marginBottom: 2, fontWeight: 700 }}>Kolom {i + 1}</label>
          <input
            value={headerKolom[i] ?? ""}
            onChange={(e) => onChangeHeader(i, e.target.value)}
            style={{ ...mobileInputStyle, fontSize: 12, fontWeight: 600, padding: "5px 6px" }}
            placeholder="-"
          />
        </div>
      ))}
    </div>
  );
}

function MobileRowCards({
  rows,
  colCount,
  headerKolom,
  currencyCols,
  onChangeCell,
  onRemoveRow,
  formatRupiah,
}: {
  rows: (string | number | null)[][];
  colCount: number;
  headerKolom: string[];
  currencyCols: boolean[];
  onChangeCell: (rowIdx: number, colIdx: number, value: string) => void;
  onRemoveRow: (rowIdx: number) => void;
  formatRupiah?: (v: number) => string;
}) {
  if (!rows.length) {
    return <div style={{ padding: "12px 8px", fontSize: 13, color: "#888", textAlign: "center" }}>Belum ada baris.</div>;
  }
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8, padding: 8 }}>
      {rows.map((row, ri) => (
        <div key={ri} style={{ border: `1px solid ${C.greenBorder}`, borderRadius: 8, overflow: "hidden", background: "#fff" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: C.green, padding: "6px 10px", fontSize: 12, fontWeight: 700 }}>
            <span>Baris {ri + 1}</span>
            <button
              type="button"
              onClick={() => onRemoveRow(ri)}
              title="Hapus baris"
              style={{ border: "none", background: "transparent", color: C.red, fontWeight: 700, fontSize: 16, cursor: "pointer", padding: 2 }}
            >
              ×
            </button>
          </div>
          <div style={{ padding: "8px 10px", display: "flex", flexDirection: "column", gap: 6 }}>
            {Array.from({ length: colCount }).map((_, ci) => (
              <div key={ci} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8 }}>
                <span style={{ fontSize: 11, color: "#666", fontWeight: 600, whiteSpace: "nowrap" }}>
                  {headerKolom[ci] || `Kolom ${ci + 1}`}
                </span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  {currencyCols[ci] ? (
                    <CurrencyCellInput value={row[ci] ?? ""} onChange={(v) => onChangeCell(ri, ci, v)} formatRupiah={formatRupiah} mobile />
                  ) : (
                    <input value={(row[ci] as any) ?? ""} onChange={(e) => onChangeCell(ri, ci, e.target.value)} style={mobileInputStyle} />
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

function MobileTotalCard({
  totalRow,
  colCount,
  headerKolom,
  currencyCols,
  onChangeTotal,
  formatRupiah,
}: {
  totalRow: (string | number | null)[];
  colCount: number;
  headerKolom: string[];
  currencyCols: boolean[];
  onChangeTotal: (colIdx: number, value: string) => void;
  formatRupiah?: (v: number) => string;
}) {
  if (!totalRow.length) return null;
  return (
    <div style={{ margin: "0 8px 8px", border: `1px solid ${C.greenBorder ?? "#BFBF00"}`, borderRadius: 8, overflow: "hidden" }}>
      <div style={{ background: C.totalRow, padding: "6px 10px", fontSize: 12, fontWeight: 700 }}>TOTAL</div>
      <div style={{ padding: "8px 10px", display: "flex", flexDirection: "column", gap: 6, background: C.yellow }}>
        {Array.from({ length: colCount }).map((_, ci) => (
          <div key={ci} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8 }}>
            <span style={{ fontSize: 11, color: "#555", fontWeight: 700, whiteSpace: "nowrap" }}>
              {headerKolom[ci] || `Kolom ${ci + 1}`}
            </span>
            <div style={{ flex: 1, minWidth: 0 }}>
              {currencyCols[ci] ? (
                <CurrencyCellInput value={totalRow[ci] ?? ""} onChange={(v) => onChangeTotal(ci, v)} formatRupiah={formatRupiah} bold mobile />
              ) : (
                <input
                  value={(totalRow[ci] as any) ?? ""}
                  onChange={(e) => onChangeTotal(ci, e.target.value)}
                  style={{ ...mobileInputStyle, fontWeight: 700, background: "transparent", border: "1px solid rgba(0,0,0,0.2)" }}
                />
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/** Satu tabel mini editable untuk satu sub-program. */
function EditableMiniTable({
  sub,
  onChangeCell,
  onChangeHeader,
  onChangeTotal,
  onAddRow,
  onRemoveRow,
  formatRupiah,
  isMobile,
}: {
  sub: MekanismeSubProgram;
  onChangeCell: (rowIdx: number, colIdx: number, value: string) => void;
  onChangeHeader: (colIdx: number, value: string) => void;
  onChangeTotal: (colIdx: number, value: string) => void;
  onAddRow: () => void;
  onRemoveRow: (rowIdx: number) => void;
  formatRupiah?: (v: number) => string;
  isMobile?: boolean;
}) {
  const colCount = Math.max(sub.headerKolom.length, sub.totalRow?.length ?? 0, ...sub.rows.map((r) => r.length), 1);
  const currencyCols = Array.from({ length: colCount }).map((_, i) => isCurrencyColumn(sub.headerKolom[i]));

  if (isMobile) {
    return (
      <div style={{ border: `1px solid ${C.border}`, borderRadius: 8, overflow: "hidden", margin: "0 0 4px" }}>
        <MobileHeaderEditor headerKolom={sub.headerKolom} colCount={colCount} onChangeHeader={onChangeHeader} />
        <MobileRowCards
          rows={sub.rows}
          colCount={colCount}
          headerKolom={sub.headerKolom}
          currencyCols={currencyCols}
          onChangeCell={onChangeCell}
          onRemoveRow={onRemoveRow}
          formatRupiah={formatRupiah}
        />
        {sub.totalRow && sub.totalRow.length > 0 && (
          <MobileTotalCard
            totalRow={sub.totalRow}
            colCount={colCount}
            headerKolom={sub.headerKolom}
            currencyCols={currencyCols}
            onChangeTotal={onChangeTotal}
            formatRupiah={formatRupiah}
          />
        )}
        <AddRowButton onClick={onAddRow} />
      </div>
    );
  }

  return (
    <div>
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr>
            {Array.from({ length: colCount }).map((_, i) => (
              <th key={i} style={{ ...cellBase, background: C.green, borderColor: C.greenBorder, fontWeight: 700 }}>
                <input
                  value={sub.headerKolom[i] ?? ""}
                  onChange={(e) => onChangeHeader(i, e.target.value)}
                  style={{ ...inputStyle, fontWeight: 700 }}
                  placeholder="-"
                />
              </th>
            ))}
            <th style={{ ...cellBase, background: C.green, borderColor: C.greenBorder, width: 28 }} />
          </tr>
        </thead>
        <tbody>
          {sub.rows.map((row, ri) => (
            <tr key={ri}>
              {Array.from({ length: colCount }).map((_, ci) => (
                <td key={ci} style={cellBase}>
                  {currencyCols[ci] ? (
                    <CurrencyCellInput
                      value={row[ci] ?? ""}
                      onChange={(v) => onChangeCell(ri, ci, v)}
                      formatRupiah={formatRupiah}
                    />
                  ) : (
                    <input
                      value={row[ci] ?? ""}
                      onChange={(e) => onChangeCell(ri, ci, e.target.value)}
                      style={inputStyle}
                    />
                  )}
                </td>
              ))}
              <td style={{ ...cellBase, width: 28, textAlign: "center" }}>
                <button
                  type="button"
                  onClick={() => onRemoveRow(ri)}
                  title="Hapus baris"
                  style={{ border: "none", background: "transparent", color: C.red, cursor: "pointer", fontWeight: 700, fontSize: 15, padding: "4px 6px" }}
                >
                  ×
                </button>
              </td>
            </tr>
          ))}
        </tbody>
        {sub.totalRow && sub.totalRow.length > 0 && (
          <tfoot>
            <tr>
              {Array.from({ length: colCount }).map((_, ci) => (
                <td key={ci} style={{ ...cellBase, background: ci === 0 ? C.totalRow : C.yellow, fontWeight: 700 }}>
                  {currencyCols[ci] ? (
                    <CurrencyCellInput
                      value={sub.totalRow?.[ci] ?? ""}
                      onChange={(v) => onChangeTotal(ci, v)}
                      formatRupiah={formatRupiah}
                      bold
                    />
                  ) : (
                    <input
                      value={sub.totalRow?.[ci] ?? ""}
                      onChange={(e) => onChangeTotal(ci, e.target.value)}
                      style={{ ...inputStyle, fontWeight: 700 }}
                    />
                  )}
                </td>
              ))}
              <td style={{ ...cellBase, background: C.totalRow, width: 28 }} />
            </tr>
          </tfoot>
        )}
      </table>
      <AddRowButton onClick={onAddRow} />
    </div>
  );
}

/** Daftar note editable, satu baris per note + tombol tambah/hapus. */
function EditableNotesList({
  notes,
  onChangeNote,
  onAddNote,
  onRemoveNote,
  isMobile,
}: {
  notes: string[];
  onChangeNote: (idx: number, value: string) => void;
  onAddNote: () => void;
  onRemoveNote: (idx: number) => void;
  isMobile?: boolean;
}) {
  return (
    <div style={{ padding: "8px 8px 4px", fontSize: 12 }}>
      <div style={{ fontWeight: 700, marginBottom: 4 }}>Note :</div>
      {notes.map((n, i) => (
        <div key={i} style={{ display: "flex", alignItems: "center", gap: 4, marginBottom: 4 }}>
          <span style={{ width: 18 }}>{i + 1}.</span>
          <input
            value={n}
            onChange={(e) => onChangeNote(i, e.target.value)}
            style={
              isMobile
                ? { flex: 1, border: "1px solid #ccc", borderRadius: 6, outline: "none", padding: "6px 8px", fontSize: 12 }
                : { flex: 1, border: `1px dotted ${C.border}`, outline: "none", padding: "3px 6px", fontSize: 12 }
            }
          />
          <button
            type="button"
            onClick={() => onRemoveNote(i)}
            style={{ border: "none", background: "transparent", color: C.red, cursor: "pointer", fontWeight: 700 }}
          >
            ×
          </button>
        </div>
      ))}
      <AddRowButton onClick={onAddNote} label="+ Tambah Note" />
    </div>
  );
}

/**
 * Versi EDITABLE dari detail sheet ke-2 ("MEKANISME PROGRAM").
 * Dipakai di halaman Entri (mode edit), berbeda dari ActionPlanMekanismeDetail
 * yang read-only (dipakai di halaman View/Detail).
 *
 * `formatRupiah` opsional: kalau diisi, kolom yang headernya mengandung kata kunci
 * currency (lihat CURRENCY_HEADER_KEYWORDS) dirender sebagai input bergaya Rupiah.
 *
 * `isMobile` opsional: kalau true, tiap sub-program direflow jadi card per-baris
 * (kolom dinamis tetap didukung — label field diambil dari headerKolom).
 */
export default function ActionPlanMekanismeDetailEdit({
  detail,
  onChange,
  formatRupiah,
  isMobile = false,
}: {
  detail: MekanismeSheet | null | undefined;
  onChange: (next: MekanismeSheet) => void;
  formatRupiah?: (v: number) => string;
  isMobile?: boolean;
}) {
  if (!detail || !detail.subPrograms) {
    return (
      <div style={{ padding: 12, fontSize: 13, color: "#888" }}>
        Tidak ada detail mekanisme program (sheet ke-2 tidak ditemukan atau kosong).
      </div>
    );
  }

  const updateSub = (subIdx: number, updater: (sub: MekanismeSubProgram) => MekanismeSubProgram) => {
    const nextSubPrograms = detail.subPrograms.map((s, i) => (i === subIdx ? updater(s) : s));
    onChange({ ...detail, subPrograms: nextSubPrograms });
  };

  return (
    <div style={{ background: C.white, fontFamily: "Calibri, Arial, sans-serif", color: C.text }}>
      {detail.subPrograms.map((sub, si) => (
        <div key={si} style={{ marginBottom: 12 }}>
          <SectionBar>
            <input
              value={sub.judul}
              onChange={(e) => updateSub(si, (s) => ({ ...s, judul: e.target.value }))}
              style={{ ...inputStyle, color: C.white, fontWeight: 700, fontSize: 13 }}
            />
          </SectionBar>

          <EditableMiniTable
            sub={sub}
            formatRupiah={formatRupiah}
            isMobile={isMobile}
            onChangeCell={(ri, ci, v) =>
              updateSub(si, (s) => {
                const rows = s.rows.map((r, i) => {
                  if (i !== ri) return r;
                  const next = [...r];
                  next[ci] = v;
                  return next;
                });
                return { ...s, rows };
              })
            }
            onChangeHeader={(ci, v) =>
              updateSub(si, (s) => {
                const headerKolom = [...s.headerKolom];
                headerKolom[ci] = v;
                return { ...s, headerKolom };
              })
            }
            onChangeTotal={(ci, v) =>
              updateSub(si, (s) => {
                const totalRow = [...(s.totalRow ?? [])];
                totalRow[ci] = v;
                return { ...s, totalRow };
              })
            }
            onAddRow={() =>
              updateSub(si, (s) => ({
                ...s,
                rows: [...s.rows, new Array(Math.max(s.headerKolom.length, 1)).fill(null)],
              }))
            }
            onRemoveRow={(ri) =>
              updateSub(si, (s) => ({ ...s, rows: s.rows.filter((_, i) => i !== ri) }))
            }
          />

          <EditableNotesList
            notes={sub.notes}
            isMobile={isMobile}
            onChangeNote={(ni, v) =>
              updateSub(si, (s) => {
                const notes = [...s.notes];
                notes[ni] = v;
                return { ...s, notes };
              })
            }
            onAddNote={() => updateSub(si, (s) => ({ ...s, notes: [...s.notes, ""] }))}
            onRemoveNote={(ni) => updateSub(si, (s) => ({ ...s, notes: s.notes.filter((_, i) => i !== ni) }))}
          />
        </div>
      ))}
    </div>
  );
}