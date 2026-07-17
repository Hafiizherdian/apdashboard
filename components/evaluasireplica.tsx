"use client";

import React from "react";
import type {
  EvaluasiSheet,
  EvaluasiEventRow,
  EvaluasiAnggaranRow,
  EvaluasiSamplingGroup,
  EvaluasiSamplingItemRow,
  EvaluasiSignature,
} from "@/lib/parseActionsPlan";
import {
  MobileCardList,
  MobileSummaryList,
  MobileTextInput,
  MobileTextArea,
  MobileNumberInput,
  MobileCurrencyInput,
  MobilePercentInput,
  MobileDateInput,
  MobileFormField,
} from "@/components/Responsivecardtable";

const C = {
  yellow: "#FFFF99",
  yellowBorder: "#BFBF00",
  green: "#D9EAD3",
  greenBorder: "#93C47D",
  blackBar: "#000000",
  totalRow: "#D9D9D9",
  border: "#000000",
  text: "#000000",
  white: "#FFFFFF",
  red: "#B3261E",
};

const cellBase: React.CSSProperties = {
  border: `1px solid ${C.border}`,
  padding: "4px 8px",
  fontSize: 13,
  verticalAlign: "middle",
};

const EMPTY_EVALUASI: EvaluasiSheet = {
  targetEvent: [],
  realisasiEvent: [],
  penjelasanTargetEvent: [],
  anggaran: [
    { label: "PENGAJUAN" },
    { label: "REALISASI" },
    { label: "DEVIASI" },
  ],
  penjelasanAnggaran: [],
  samplingGroups: [
    { label: "PENGAJUAN", items: [] },
    { label: "REALISASI", items: [] },
  ],
  samplingDeviasi: null,
  penjelasanSampling: [],
  evaluasiProgram: [],
  signatures: [
    { label: "DIBUAT OLEH :" },
    { label: "DIPERIKSA OLEH :" },
    { label: "DIKETAHUI OLEH :" },
  ],
};

function SectionBar({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ background: C.blackBar, color: C.white, fontWeight: 700, padding: "6px 10px", fontSize: 13, letterSpacing: 0.3 }}>
      {children}
    </div>
  );
}

function SubHeading({ children }: { children: React.ReactNode }) {
  return <div style={{ fontWeight: 700, fontSize: 13, padding: "6px 2px 4px" }}>{children}</div>;
}

function GreenTh({ children, minWidth, align = "left" }: { children: React.ReactNode; minWidth?: number; align?: "left" | "right" | "center" }) {
  return (
    <th style={{ ...cellBase, background: C.green, borderColor: C.greenBorder, fontWeight: 700, textAlign: align, minWidth }}>
      {children}
    </th>
  );
}

function DeleteTh() {
  return <th style={{ ...cellBase, background: C.green, borderColor: C.greenBorder, width: 28 }} />;
}

function DeleteCell({ onClick }: { onClick: () => void }) {
  return (
    <td style={{ ...cellBase, width: 28, textAlign: "center", padding: 0 }}>
      <button
        type="button"
        onClick={onClick}
        title="Hapus baris"
        style={{ border: "none", background: "transparent", color: C.red, cursor: "pointer", fontWeight: 700, fontSize: 15, lineHeight: 1, padding: "4px 6px" }}
      >
        ×
      </button>
    </td>
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

function EditableCell({
  value,
  onChange,
  align = "left",
  type = "text",
  bg,
  bold,
  currency = false,
  percent = false,
  formatRupiah,
}: {
  value: string | number | null | undefined;
  onChange: (v: string) => void;
  align?: "left" | "right" | "center";
  type?: "text" | "number";
  bg?: string;
  bold?: boolean;
  currency?: boolean;
  percent?: boolean;
  formatRupiah?: (value: number) => string;
}) {
  if (currency) {
    const display = formatRupiah ? formatRupiah(Number(value || 0)).replace(/^Rp\s?/, "") : String(value ?? "");
    return (
      <td style={{ ...cellBase, background: bg, padding: 0 }}>
        <div style={{ display: "flex", alignItems: "center", padding: "0 8px" }}>
          <span style={{ fontSize: 13, whiteSpace: "nowrap", marginRight: 6 }}>Rp</span>
          <input
            type="text"
            value={display}
            onChange={(e) => onChange(e.target.value.replace(/[^\d]/g, ""))}
            style={{ flex: 1, border: "none", outline: "none", background: "transparent", padding: "4px 0", fontSize: 13, textAlign: "right", fontWeight: bold ? 700 : 400 }}
          />
        </div>
      </td>
    );
  }

  if (percent) {
    const display = value === null || value === undefined || value === "" ? "" : String(Math.round(Number(value) * 10000) / 100);
    return (
      <td style={{ ...cellBase, background: bg, padding: 0 }}>
        <div style={{ display: "flex", alignItems: "center", padding: "0 8px" }}>
          <input
            type="text"
            value={display}
            onChange={(e) => {
              const raw = e.target.value.replace(/[^\d.]/g, "");
              onChange(raw === "" ? "" : String(Number(raw) / 100));
            }}
            style={{ flex: 1, border: "none", outline: "none", background: "transparent", padding: "4px 0", fontSize: 13, textAlign: "right", fontWeight: bold ? 700 : 400 }}
          />
          <span style={{ fontSize: 13, marginLeft: 4 }}>%</span>
        </div>
      </td>
    );
  }

  return (
    <td style={{ ...cellBase, background: bg, padding: 0 }}>
      <input
        type={type}
        value={(value as any) ?? ""}
        onChange={(e) => onChange(e.target.value)}
        style={{ width: "100%", border: "none", outline: "none", background: "transparent", padding: "4px 8px", fontSize: 13, textAlign: align, fontWeight: bold ? 700 : 400 }}
      />
    </td>
  );
}

function EditableNumberedList({ items, onChange }: { items: string[]; onChange: (next: string[]) => void }) {
  const setLine = (idx: number, v: string) => {
    const next = [...items];
    next[idx] = v;
    onChange(next);
  };
  const addLine = () => onChange([...items, ""]);
  const removeLine = (idx: number) => onChange(items.filter((_, i) => i !== idx));

  return (
    <div style={{ padding: "4px 2px" }}>
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <tbody>
          {items.map((line, i) => (
            <tr key={i}>
              <td style={{ width: 24, padding: "2px 6px", fontSize: 13, verticalAlign: "top" }}>{i + 1}.</td>
              <td style={{ padding: 0 }}>
                <textarea
                  value={line}
                  onChange={(e) => setLine(i, e.target.value)}
                  rows={2}
                  style={{ width: "100%", border: `1px dotted ${C.border}`, outline: "none", padding: "4px 6px", fontSize: 13, resize: "vertical" }}
                />
              </td>
              <td style={{ width: 28, textAlign: "center", padding: 0, verticalAlign: "top" }}>
                <button
                  type="button"
                  onClick={() => removeLine(i)}
                  title="Hapus baris"
                  style={{ border: "none", background: "transparent", color: C.red, cursor: "pointer", fontWeight: 700, fontSize: 14 }}
                >
                  ×
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <AddRowButton onClick={addLine} label="+ Tambah Poin" />
    </div>
  );
}

// ============================================================
// KOMPONEN UTAMA
// ============================================================
export default function EvaluasiReplicaBody({
  loadingDetail,
  detail,
  editForm,
  setEditForm,
  formatRupiah,
  modalScrollRef,
  isMobile = false,
}: any) {
  if (loadingDetail || !detail) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center gap-3 py-16">
        <p className="text-sm">Memuat detail dokumen...</p>
      </div>
    );
  }

  const ev: EvaluasiSheet = editForm.evaluasiDetail ?? EMPTY_EVALUASI;

  const updateEv = (updater: (e: EvaluasiSheet) => EvaluasiSheet) => {
    setEditForm((f: any) => ({ ...f, evaluasiDetail: updater(f.evaluasiDetail ?? EMPTY_EVALUASI) }));
  };

  // --- 1. FILTER & SANITIZER (Mencegah Bug Tampilan Akibat Data Gagal Parsing) ---
  const defaultAnggaranLabels = ["PENGAJUAN", "REALISASI", "DEVIASI"];
  const safeAnggaran = defaultAnggaranLabels.map((lbl) => {
    return ev.anggaran?.find((a) => (a.label || "").toUpperCase() === lbl) || { label: lbl };
  });

  const defaultSamplingLabels = ["PENGAJUAN", "REALISASI"];
  const safeSamplingGroups = defaultSamplingLabels.map((lbl) => {
    return ev.samplingGroups?.find((g) => (g.label || "").toUpperCase() === lbl) || { label: lbl, items: [] };
  });

  const defaultSigLabels = ["DIBUAT OLEH :", "DIPERIKSA OLEH :", "DIKETAHUI OLEH :"];
  const safeSignatures = defaultSigLabels.map((lbl) => {
    const keyword = lbl.split(" ")[0]; // "DIBUAT", "DIPERIKSA", "DIKETAHUI"
    return ev.signatures?.find((s) => (s.label || "").toUpperCase().includes(keyword)) || { label: lbl };
  });
  // --------------------------------------------------------------------------------

  const newRow = (withJenisTarget: boolean): EvaluasiEventRow => ({
    jenisProgram: withJenisTarget ? "" : undefined,
    target: withJenisTarget ? "" : undefined,
    brand: "",
    qty: 0,
    hargaBks: 0,
    persen: 0,
    totalTargetPenjualan: 0,
  });

  const renderEventTable = (
    field: "targetEvent" | "realisasiEvent",
    rows: EvaluasiEventRow[],
    withJenisTarget: boolean
  ) => {
    if (isMobile) {
      return (
        <>
          <MobileCardList
            rows={rows}
            onRemove={(i) => updateEv((e) => ({ ...e, [field]: e[field].filter((_, ri) => ri !== i) }))}
            cardTitle={(row, i) => row.brand || `Baris ${i + 1}`}
            getFields={(row, i) => {
              const fields: any[] = [];
              if (withJenisTarget) {
                fields.push({ label: "Jenis Program", render: () => <MobileTextInput value={row.jenisProgram ?? ""} onChange={(v) => updateEv((e) => ({ ...e, [field]: e[field].map((r, ri) => (ri === i ? { ...r, jenisProgram: v } : r)) }))} /> });
                fields.push({ label: "Target", render: () => <MobileTextInput value={row.target ?? ""} onChange={(v) => updateEv((e) => ({ ...e, [field]: e[field].map((r, ri) => (ri === i ? { ...r, target: v } : r)) }))} /> });
              }
              fields.push({ label: "Brand", render: () => <MobileTextInput value={row.brand ?? ""} onChange={(v) => updateEv((e) => ({ ...e, [field]: e[field].map((r, ri) => (ri === i ? { ...r, brand: v } : r)) }))} /> });
              fields.push({ label: "QTY (Bks)", render: () => <MobileNumberInput value={row.qty ?? ""} onChange={(v) => updateEv((e) => ({ ...e, [field]: e[field].map((r, ri) => (ri === i ? { ...r, qty: v === "" ? undefined : Number(v) } : r)) }))} /> });
              fields.push({ label: "Harga / Bks (CBP)", render: () => <MobileCurrencyInput value={row.hargaBks ?? ""} formatRupiah={formatRupiah} onChange={(v) => updateEv((e) => ({ ...e, [field]: e[field].map((r, ri) => (ri === i ? { ...r, hargaBks: v === "" ? undefined : Number(v) } : r)) }))} /> });
              fields.push({ label: "%", render: () => <MobilePercentInput value={row.persen ?? ""} onChange={(v) => updateEv((e) => ({ ...e, [field]: e[field].map((r, ri) => (ri === i ? { ...r, persen: v === "" ? 0 : Number(v) } : r)) }))} /> });
              fields.push({ label: "Total Target Penjualan", render: () => <MobileCurrencyInput value={row.totalTargetPenjualan ?? ""} formatRupiah={formatRupiah} onChange={(v) => updateEv((e) => ({ ...e, [field]: e[field].map((r, ri) => (ri === i ? { ...r, totalTargetPenjualan: v === "" ? undefined : Number(v) } : r)) }))} /> });
              return fields;
            }}
          />
          {!!rows.length && (
            <MobileSummaryList bold rows={[{ label: "Total", value: formatRupiah ? formatRupiah(rows.reduce((s, r) => s + (r.totalTargetPenjualan || 0), 0)) : "-" }]} />
          )}
          <AddRowButton onClick={() => updateEv((e) => ({ ...e, [field]: [...e[field], newRow(withJenisTarget)] }))} />
        </>
      );
    }

    return (
      <>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr>
              {withJenisTarget && <GreenTh minWidth={110}>Jenis Program</GreenTh>}
              {withJenisTarget && <GreenTh minWidth={90}>Target</GreenTh>}
              <GreenTh minWidth={170}>Brand</GreenTh>
              <GreenTh minWidth={80} align="right">QTY (Bks)</GreenTh>
              <GreenTh minWidth={120} align="right">Harga / Bks (CBP)</GreenTh>
              <GreenTh minWidth={70} align="right">%</GreenTh>
              <GreenTh minWidth={140} align="right">Total Target Penjualan</GreenTh>
              <DeleteTh />
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => (
              <tr key={i}>
                {withJenisTarget && (
                  <EditableCell
                    value={row.jenisProgram ?? ""}
                    onChange={(v) => updateEv((e) => ({ ...e, [field]: e[field].map((r, ri) => (ri === i ? { ...r, jenisProgram: v } : r)) }))}
                  />
                )}
                {withJenisTarget && (
                  <EditableCell
                    value={row.target ?? ""}
                    onChange={(v) => updateEv((e) => ({ ...e, [field]: e[field].map((r, ri) => (ri === i ? { ...r, target: v } : r)) }))}
                  />
                )}
                <EditableCell
                  value={row.brand ?? ""}
                  onChange={(v) => updateEv((e) => ({ ...e, [field]: e[field].map((r, ri) => (ri === i ? { ...r, brand: v } : r)) }))}
                />
                <EditableCell
                  value={row.qty ?? ""}
                  type="number"
                  align="right"
                  onChange={(v) => updateEv((e) => ({ ...e, [field]: e[field].map((r, ri) => (ri === i ? { ...r, qty: v === "" ? undefined : Number(v) } : r)) }))}
                />
                <EditableCell
                  value={row.hargaBks ?? ""}
                  currency
                  formatRupiah={formatRupiah}
                  align="right"
                  onChange={(v) => updateEv((e) => ({ ...e, [field]: e[field].map((r, ri) => (ri === i ? { ...r, hargaBks: v === "" ? undefined : Number(v) } : r)) }))}
                />
                <EditableCell
                  value={row.persen ?? ""}
                  percent
                  align="right"
                  onChange={(v) => updateEv((e) => ({ ...e, [field]: e[field].map((r, ri) => (ri === i ? { ...r, persen: v === "" ? 0 : Number(v) } : r)) }))}
                />
                <EditableCell
                  value={row.totalTargetPenjualan ?? ""}
                  currency
                  formatRupiah={formatRupiah}
                  align="right"
                  onChange={(v) => updateEv((e) => ({ ...e, [field]: e[field].map((r, ri) => (ri === i ? { ...r, totalTargetPenjualan: v === "" ? undefined : Number(v) } : r)) }))}
                />
                <DeleteCell onClick={() => updateEv((e) => ({ ...e, [field]: e[field].filter((_, ri) => ri !== i) }))} />
              </tr>
            ))}
          </tbody>
          {!!rows.length && (
            <tfoot>
              <tr>
                <td colSpan={withJenisTarget ? 6 : 4} style={{ ...cellBase, background: C.totalRow, textAlign: "right", fontWeight: 700 }}>
                  Total
                </td>
                <td style={{ ...cellBase, background: C.yellow, fontWeight: 700, textAlign: "right" }}>
                  {formatRupiah ? formatRupiah(rows.reduce((s, r) => s + (r.totalTargetPenjualan || 0), 0)) : "-"}
                </td>
                <td style={{ ...cellBase, background: C.totalRow }} />
              </tr>
            </tfoot>
          )}
        </table>
        <AddRowButton onClick={() => updateEv((e) => ({ ...e, [field]: [...e[field], newRow(withJenisTarget)] }))} />
      </>
    );
  };

  const updateAnggaranCell = (idx: number, key: keyof EvaluasiAnggaranRow, value: string) => {
    const nextAnggaran = [...safeAnggaran];
    nextAnggaran[idx] = { ...nextAnggaran[idx], [key]: key === "label" ? value : (value === "" ? undefined : Number(value)) };
    updateEv((e) => ({ ...e, anggaran: nextAnggaran }));
  };

  const updateSamplingItem = (groupIdx: number, itemIdx: number, key: keyof EvaluasiSamplingItemRow, value: string) => {
    const nextGroups = safeSamplingGroups.map((g, gi) => {
      if (gi !== groupIdx) return g;
      return {
        ...g,
        items: g.items.map((it, ii) => (ii !== itemIdx ? it : { ...it, [key]: key === "brand" ? value : (value === "" ? undefined : Number(value)) }))
      };
    });
    updateEv((e) => ({ ...e, samplingGroups: nextGroups }));
  };

  const addSamplingItem = (groupIdx: number) => {
    const nextGroups = [...safeSamplingGroups];
    nextGroups[groupIdx] = { ...nextGroups[groupIdx], items: [...nextGroups[groupIdx].items, { brand: "", kebutuhan: 0, hargaBks: 0, nominal: 0 }] };
    updateEv((e) => ({ ...e, samplingGroups: nextGroups }));
  };

  const removeSamplingItem = (groupIdx: number, itemIdx: number) => {
    const nextGroups = [...safeSamplingGroups];
    nextGroups[groupIdx] = { ...nextGroups[groupIdx], items: nextGroups[groupIdx].items.filter((_, ii) => ii !== itemIdx) };
    updateEv((e) => ({ ...e, samplingGroups: nextGroups }));
  };

  const deviasi: EvaluasiSamplingItemRow = ev.samplingDeviasi ?? { brand: "-", kebutuhan: "-", hargaBks: 0, nominal: 0 };

  const updateSignature = (idx: number, key: keyof EvaluasiSignature, value: string) => {
    const nextSigs = [...safeSignatures];
    nextSigs[idx] = { ...nextSigs[idx], [key]: value };
    updateEv((e) => ({ ...e, signatures: nextSigs }));
  };

  return (
    <div ref={modalScrollRef} className="flex-1 overflow-y-auto" style={{ background: C.white, fontFamily: "Calibri, Arial, sans-serif", color: C.text }}>
      <div style={{ padding: "10px 12px 0", fontSize: 13, color: "#555" }}>
        Evaluasi untuk: <strong>{detail.nama_program || editForm.nama_program || "-"}</strong> ({detail.no_action_plan || editForm.no_action_plan || "-"})
      </div>

      {/* ============ 01. TARGET DAN REALISASI EVENT ============ */}
      <SectionBar>01. TARGET DAN REALISASI EVENT</SectionBar>
      <div style={{ padding: "6px 4px" }}>
        <SubHeading>Target untuk Event atau Sejenisnya</SubHeading>
        {renderEventTable("targetEvent", ev.targetEvent, true)}

        <div style={{ height: 10 }} />

        <SubHeading>Realisasi Target untuk Event</SubHeading>
        {renderEventTable("realisasiEvent", ev.realisasiEvent, false)}

        <SubHeading>Penjelasan Deviasi (Target vs Realisasi)</SubHeading>
        <EditableNumberedList
          items={ev.penjelasanTargetEvent}
          onChange={(next) => updateEv((e) => ({ ...e, penjelasanTargetEvent: next }))}
        />
      </div>

      {/* ============ 02. ANGGARAN BIAYA PROMOSI ============ */}
      <SectionBar>02. ANGGARAN BIAYA PROMOSI</SectionBar>
      <div style={{ padding: "6px 4px" }}>
        {isMobile ? (
          <MobileCardList
            rows={safeAnggaran}
            cardTitle={(row) => row.label}
            getFields={(row, i) => [
              { label: "Biaya Promosi", render: () => <MobileCurrencyInput value={row.biayaPromosi ?? ""} formatRupiah={formatRupiah} onChange={(v) => updateAnggaranCell(i, "biayaPromosi", v)} /> },
              { label: "Biaya POSM", render: () => <MobileCurrencyInput value={row.biayaPosm ?? ""} formatRupiah={formatRupiah} onChange={(v) => updateAnggaranCell(i, "biayaPosm", v)} /> },
              { label: "Biaya Sampling", render: () => <MobileCurrencyInput value={row.biayaSampling ?? ""} formatRupiah={formatRupiah} onChange={(v) => updateAnggaranCell(i, "biayaSampling", v)} /> },
              { label: "Total Biaya", render: () => <MobileCurrencyInput value={row.totalBiaya ?? ""} formatRupiah={formatRupiah} onChange={(v) => updateAnggaranCell(i, "totalBiaya", v)} /> },
            ]}
          />
        ) : (
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr>
                <GreenTh minWidth={180}>ANGGARAN BIAYA PROMOSI</GreenTh>
                <GreenTh minWidth={140} align="right">Biaya Promosi</GreenTh>
                <GreenTh minWidth={140} align="right">Biaya POSM</GreenTh>
                <GreenTh minWidth={140} align="right">Biaya Sampling</GreenTh>
                <GreenTh minWidth={140} align="right">Total Biaya</GreenTh>
              </tr>
            </thead>
            <tbody>
              {safeAnggaran.map((row, i) => (
                <tr key={i}>
                  <td style={{ ...cellBase, fontWeight: 700 }}>{row.label}</td>
                  <EditableCell value={row.biayaPromosi ?? ""} currency formatRupiah={formatRupiah} align="right" onChange={(v) => updateAnggaranCell(i, "biayaPromosi", v)} />
                  <EditableCell value={row.biayaPosm ?? ""} currency formatRupiah={formatRupiah} align="right" onChange={(v) => updateAnggaranCell(i, "biayaPosm", v)} />
                  <EditableCell value={row.biayaSampling ?? ""} currency formatRupiah={formatRupiah} align="right" onChange={(v) => updateAnggaranCell(i, "biayaSampling", v)} />
                  <EditableCell value={row.totalBiaya ?? ""} currency formatRupiah={formatRupiah} align="right" bg={C.yellow} bold onChange={(v) => updateAnggaranCell(i, "totalBiaya", v)} />
                </tr>
              ))}
            </tbody>
          </table>
        )}

        <SubHeading>Penjelasan Deviasi Anggaran</SubHeading>
        <EditableNumberedList items={ev.penjelasanAnggaran} onChange={(next) => updateEv((e) => ({ ...e, penjelasanAnggaran: next }))} />
      </div>

      {/* ============ 03. SAMPLING ============ */}
      <SectionBar>03. SAMPLING</SectionBar>
      <div style={{ padding: "6px 4px" }}>
        {safeSamplingGroups.map((group, gi) => (
          <div key={gi} style={{ marginBottom: 10 }}>
            <SubHeading>{group.label}</SubHeading>
            {isMobile ? (
              <MobileCardList
                rows={group.items}
                onRemove={(ii) => removeSamplingItem(gi, ii)}
                cardTitle={(row, ii) => row.brand || `Item ${ii + 1}`}
                getFields={(row, ii) => [
                  { label: "Brand", render: () => <MobileTextInput value={row.brand ?? ""} onChange={(v) => updateSamplingItem(gi, ii, "brand", v)} /> },
                  { label: "Kebutuhan", render: () => <MobileNumberInput value={row.kebutuhan ?? ""} onChange={(v) => updateSamplingItem(gi, ii, "kebutuhan", v)} /> },
                  { label: "Harga / Bks", render: () => <MobileCurrencyInput value={row.hargaBks ?? ""} formatRupiah={formatRupiah} onChange={(v) => updateSamplingItem(gi, ii, "hargaBks", v)} /> },
                  { label: "Nominal", render: () => <MobileCurrencyInput value={row.nominal ?? ""} formatRupiah={formatRupiah} onChange={(v) => updateSamplingItem(gi, ii, "nominal", v)} /> },
                ]}
              />
            ) : (
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr>
                    <GreenTh minWidth={180}>Brand</GreenTh>
                    <GreenTh minWidth={100} align="right">Kebutuhan</GreenTh>
                    <GreenTh minWidth={120} align="right">Harga / Bks</GreenTh>
                    <GreenTh minWidth={120} align="right">Nominal</GreenTh>
                    <DeleteTh />
                  </tr>
                </thead>
                <tbody>
                  {group.items.map((row, ii) => (
                    <tr key={ii}>
                      <EditableCell value={row.brand ?? ""} onChange={(v) => updateSamplingItem(gi, ii, "brand", v)} />
                      <EditableCell value={row.kebutuhan ?? ""} type="number" align="right" onChange={(v) => updateSamplingItem(gi, ii, "kebutuhan", v)} />
                      <EditableCell value={row.hargaBks ?? ""} currency formatRupiah={formatRupiah} align="right" onChange={(v) => updateSamplingItem(gi, ii, "hargaBks", v)} />
                      <EditableCell value={row.nominal ?? ""} currency formatRupiah={formatRupiah} align="right" onChange={(v) => updateSamplingItem(gi, ii, "nominal", v)} />
                      <DeleteCell onClick={() => removeSamplingItem(gi, ii)} />
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
            <AddRowButton onClick={() => addSamplingItem(gi)} />
          </div>
        ))}

        <SubHeading>Deviasi</SubHeading>
        {isMobile ? (
          <div style={{ display: "flex", flexDirection: "column", gap: 8, padding: "4px 2px" }}>
            <MobileFormField label="Brand">
              <MobileTextInput value={deviasi.brand ?? ""} onChange={(v) => updateEv((e) => ({ ...e, samplingDeviasi: { ...deviasi, brand: v } }))} />
            </MobileFormField>
            <MobileFormField label="Kebutuhan">
              <MobileTextInput value={deviasi.kebutuhan ?? ""} onChange={(v) => updateEv((e) => ({ ...e, samplingDeviasi: { ...deviasi, kebutuhan: v } }))} />
            </MobileFormField>
            <MobileFormField label="Harga / Bks">
              <MobileCurrencyInput value={deviasi.hargaBks ?? ""} formatRupiah={formatRupiah} onChange={(v) => updateEv((e) => ({ ...e, samplingDeviasi: { ...deviasi, hargaBks: v === "" ? undefined : Number(v) } }))} />
            </MobileFormField>
            <MobileFormField label="Nominal">
              <MobileCurrencyInput value={deviasi.nominal ?? ""} formatRupiah={formatRupiah} onChange={(v) => updateEv((e) => ({ ...e, samplingDeviasi: { ...deviasi, nominal: v === "" ? undefined : Number(v) } }))} />
            </MobileFormField>
          </div>
        ) : (
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <tbody>
              <tr>
                <EditableCell value={deviasi.brand ?? ""} onChange={(v) => updateEv((e) => ({ ...e, samplingDeviasi: { ...deviasi, brand: v } }))} />
                <EditableCell value={deviasi.kebutuhan ?? ""} align="right" onChange={(v) => updateEv((e) => ({ ...e, samplingDeviasi: { ...deviasi, kebutuhan: v } }))} />
                <EditableCell value={deviasi.hargaBks ?? ""} currency formatRupiah={formatRupiah} align="right" onChange={(v) => updateEv((e) => ({ ...e, samplingDeviasi: { ...deviasi, hargaBks: v === "" ? undefined : Number(v) } }))} />
                <EditableCell value={deviasi.nominal ?? ""} currency formatRupiah={formatRupiah} align="right" bg={C.yellow} bold onChange={(v) => updateEv((e) => ({ ...e, samplingDeviasi: { ...deviasi, nominal: v === "" ? undefined : Number(v) } }))} />
              </tr>
            </tbody>
          </table>
        )}

        <SubHeading>Penjelasan Deviasi Sampling</SubHeading>
        <EditableNumberedList items={ev.penjelasanSampling} onChange={(next) => updateEv((e) => ({ ...e, penjelasanSampling: next }))} />
      </div>

      {/* ============ EVALUASI PROGRAM ============ */}
      <SectionBar>EVALUASI PROGRAM</SectionBar>
      <EditableNumberedList items={ev.evaluasiProgram} onChange={(next) => updateEv((e) => ({ ...e, evaluasiProgram: next }))} />

      {/* ============ TANDA TANGAN ============ */}
      <SectionBar>TANDA TANGAN</SectionBar>
      {isMobile ? (
        <div style={{ display: "flex", flexDirection: "column", gap: 10, padding: "8px" }}>
          {safeSignatures.map((sig, i) => (
            <div key={i} style={{ border: `1px solid ${C.border}`, borderRadius: 8, padding: "8px 10px" }}>
              <div style={{ fontWeight: 700, marginBottom: 6, fontSize: 13 }}>{sig.label}</div>
              <MobileFormField label="Tanggal">
                <MobileDateInput value={sig.tanggal ? String(sig.tanggal).slice(0, 10) : ""} onChange={(v) => updateSignature(i, "tanggal", v)} />
              </MobileFormField>
              <MobileFormField label="Nama">
                <MobileTextInput value={sig.nama ?? ""} onChange={(v) => updateSignature(i, "nama", v)} />
              </MobileFormField>
              <MobileFormField label="Jabatan">
                <MobileTextInput value={sig.jabatan ?? ""} onChange={(v) => updateSignature(i, "jabatan", v)} />
              </MobileFormField>
            </div>
          ))}
        </div>
      ) : (
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <tbody>
            <tr>
              {safeSignatures.map((sig, i) => (
                <td key={i} style={{ ...cellBase, verticalAlign: "top", width: `${100 / safeSignatures.length}%` }}>
                  <div style={{ fontWeight: 700, marginBottom: 6 }}>{sig.label}</div>
                  <label style={{ fontSize: 11, color: "#555", display: "block", marginBottom: 2 }}>Tanggal</label>
                  <input
                    type="date"
                    value={sig.tanggal ? String(sig.tanggal).slice(0, 10) : ""}
                    onChange={(e) => updateSignature(i, "tanggal", e.target.value)}
                    style={{ width: "100%", border: `1px dotted ${C.border}`, outline: "none", padding: "4px 6px", fontSize: 13, marginBottom: 8 }}
                  />
                  <label style={{ fontSize: 11, color: "#555", display: "block", marginBottom: 2 }}>Nama</label>
                  <input
                    value={sig.nama ?? ""}
                    onChange={(e) => updateSignature(i, "nama", e.target.value)}
                    style={{ width: "100%", border: `1px dotted ${C.border}`, outline: "none", padding: "4px 6px", fontSize: 13, marginBottom: 8 }}
                  />
                  <label style={{ fontSize: 11, color: "#555", display: "block", marginBottom: 2 }}>Jabatan</label>
                  <input
                    value={sig.jabatan ?? ""}
                    onChange={(e) => updateSignature(i, "jabatan", e.target.value)}
                    style={{ width: "100%", border: `1px dotted ${C.border}`, outline: "none", padding: "4px 6px", fontSize: 13 }}
                  />
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      )}

      <div style={{ height: 24 }} />
    </div>
  );
}