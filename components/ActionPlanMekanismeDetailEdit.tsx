"use client";

import React from "react";
import type { MekanismeSheet, MekanismeSubProgram } from "@/components/ActionPlanMekanismeDetail";

const C = {
  yellow: "#FFFDE7",
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

/** Satu tabel mini editable untuk satu sub-program. */
function EditableMiniTable({
  sub,
  onChangeCell,
  onChangeHeader,
  onChangeTotal,
  onAddRow,
  onRemoveRow,
}: {
  sub: MekanismeSubProgram;
  onChangeCell: (rowIdx: number, colIdx: number, value: string) => void;
  onChangeHeader: (colIdx: number, value: string) => void;
  onChangeTotal: (colIdx: number, value: string) => void;
  onAddRow: () => void;
  onRemoveRow: (rowIdx: number) => void;
}) {
  const colCount = Math.max(sub.headerKolom.length, sub.totalRow?.length ?? 0, ...sub.rows.map((r) => r.length), 1);

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
                  <input
                    value={row[ci] ?? ""}
                    onChange={(e) => onChangeCell(ri, ci, e.target.value)}
                    style={inputStyle}
                  />
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
                  <input
                    value={sub.totalRow?.[ci] ?? ""}
                    onChange={(e) => onChangeTotal(ci, e.target.value)}
                    style={{ ...inputStyle, fontWeight: 700 }}
                  />
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
}: {
  notes: string[];
  onChangeNote: (idx: number, value: string) => void;
  onAddNote: () => void;
  onRemoveNote: (idx: number) => void;
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
            style={{ flex: 1, border: `1px dotted ${C.border}`, outline: "none", padding: "3px 6px", fontSize: 12 }}
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
 */
export default function ActionPlanMekanismeDetailEdit({
  detail,
  onChange,
}: {
  detail: MekanismeSheet | null | undefined;
  onChange: (next: MekanismeSheet) => void;
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