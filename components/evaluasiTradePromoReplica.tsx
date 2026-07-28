"use client";

import React from "react";
import type {
  TradePromoEvaluasiSheet,
  EvaluasiPencapaianRow,
  EvaluasiSalesRow,
  EvaluasiWsRow,
  EvaluasiWsWeekValue,
  EvaluasiBiayaRow,
  EvaluasiBiayaBreakdownRow,
  EvaluasiSignature,
} from "@/lib/parseActionsPlan";
import {
  MobileCardList,
  MobileSummaryList,
  MobileTextInput,
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

export const EMPTY_TRADE_PROMO_EVALUASI: TradePromoEvaluasiSheet = {
  pencapaianProgram: [],
  pencapaianProgramTotal: undefined,
  targetPenjualanTercapaiPercent1: undefined,
  salesRows: [{ label: "PENGAJUAN" }, { label: "REALISASI SALES" }, { label: "DEVIASI" }],
  targetPenjualanTercapaiPercent2: undefined,
  wsRows: [],
  wsTotal: undefined,
  targetPenjualanTercapaiPercent3: undefined,
  biayaRows: [{ label: "PENGAJUAN" }, { label: "REALISASI" }, { label: "DEVIASI" }],
  totalBiayaTerpakaiPercent: undefined,
  biayaPromosiBreakdown: [],
  trialTasteBreakdown: [],
  evaluasiProgram: [],
  kendala: [],
  planSelanjutnya: [],
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

function PercentField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number | undefined;
  onChange: (v: number | undefined) => void;
}) {
  const display = value === undefined ? "" : String(Math.round(value * 10000) / 100);
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "4px 2px", fontSize: 13 }}>
      <span style={{ fontWeight: 700 }}>{label}:</span>
      <input
        type="text"
        value={display}
        onChange={(e) => {
          const raw = e.target.value.replace(/[^\d.]/g, "");
          onChange(raw === "" ? undefined : Number(raw) / 100);
        }}
        style={{ width: 80, border: `1px dotted ${C.border}`, outline: "none", padding: "3px 6px", fontSize: 13, textAlign: "right" }}
      />
      <span>%</span>
    </div>
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
// KOMPONEN UTAMA — VARIAN TRADE PROMO
// ============================================================
export default function TradePromoEvaluasiEditable({
  data,
  update,
  formatRupiah,
  isMobile = false,
}: {
  data: TradePromoEvaluasiSheet;
  /** Sama pola dengan updateEv di varian Activation: terima updater(currentData) -> nextData */
  update: (updater: (d: TradePromoEvaluasiSheet) => TradePromoEvaluasiSheet) => void;
  formatRupiah: (v: number) => string;
  isMobile?: boolean;
}) {
  const d = data ?? EMPTY_TRADE_PROMO_EVALUASI;

  // --------- Pencapaian Program ---------
  const updatePencapaianRow = (idx: number, key: keyof EvaluasiPencapaianRow, value: string) => {
    update((e) => ({
      ...e,
      pencapaianProgram: e.pencapaianProgram.map((r, ri) =>
        ri !== idx ? r : { ...r, [key]: key === "keterangan" ? value : value === "" ? undefined : Number(value) }
      ),
    }));
  };
  const addPencapaianRow = () =>
    update((e) => ({ ...e, pencapaianProgram: [...e.pencapaianProgram, {}] }));
  const removePencapaianRow = (idx: number) =>
    update((e) => ({ ...e, pencapaianProgram: e.pencapaianProgram.filter((_, ri) => ri !== idx) }));

  // --------- Sales Rows (section 01) ---------
  const defaultSalesLabels = ["PENGAJUAN", "REALISASI SALES", "DEVIASI"];
  const safeSalesRows = defaultSalesLabels.map(
    (lbl) => d.salesRows?.find((r) => (r.label || "").toUpperCase().includes(lbl.split(" ")[0])) || { label: lbl }
  );
  const updateSalesCell = (idx: number, key: keyof EvaluasiSalesRow, value: string) => {
    const next = [...safeSalesRows];
    next[idx] = { ...next[idx], [key]: key === "label" || key === "keterangan" ? value : value === "" ? undefined : Number(value) };
    update((e) => ({ ...e, salesRows: next }));
  };

  // --------- WS Rows (section 02, pertama) ---------
  const weekLabels = d.wsRows[0]?.weeks?.map((w) => w.label) ?? d.wsTotal?.weeks?.map((w) => w.label) ?? [];
  const emptyWeeks = (): EvaluasiWsWeekValue[] => weekLabels.map((label) => ({ label }));
  const updateWsCell = (idx: number, key: "ws" | "totalTarget" | "bonusPerBks" | "keterangan", value: string) => {
    update((e) => ({
      ...e,
      wsRows: e.wsRows.map((r, ri) =>
        ri !== idx
          ? r
          : {
              ...r,
              [key]: key === "ws" || key === "keterangan" ? value : value === "" ? undefined : Number(value),
            }
      ),
    }));
  };
  const updateWsWeekCell = (idx: number, weekIdx: number, key: "target" | "actual", value: string) => {
    update((e) => ({
      ...e,
      wsRows: e.wsRows.map((r, ri) => {
        if (ri !== idx) return r;
        const weeks = [...r.weeks];
        const w = { ...weeks[weekIdx], [key]: value === "" ? undefined : Number(value) };
        w.pencapaianPercent = w.target ? (w.actual ?? 0) / w.target : undefined;
        weeks[weekIdx] = w;
        return { ...r, weeks };
      }),
    }));
  };
  const addWsRow = () => update((e) => ({ ...e, wsRows: [...e.wsRows, { weeks: emptyWeeks() }] }));
  const removeWsRow = (idx: number) => update((e) => ({ ...e, wsRows: e.wsRows.filter((_, ri) => ri !== idx) }));

  // --------- Biaya Rows (section 02, kedua) ---------
  const defaultBiayaLabels = ["PENGAJUAN", "REALISASI", "DEVIASI"];
  const safeBiayaRows = defaultBiayaLabels.map(
    (lbl) => d.biayaRows?.find((r) => (r.label || "").toUpperCase() === lbl) || { label: lbl }
  );
  const updateBiayaCell = (idx: number, key: keyof EvaluasiBiayaRow, value: string) => {
    const next = [...safeBiayaRows];
    next[idx] = { ...next[idx], [key]: key === "label" ? value : value === "" ? undefined : Number(value) };
    update((e) => ({ ...e, biayaRows: next }));
  };

  // --------- Breakdown tables ---------
  const updateBreakdownCell = (
    field: "biayaPromosiBreakdown" | "trialTasteBreakdown",
    idx: number,
    key: keyof EvaluasiBiayaBreakdownRow,
    value: string
  ) => {
    update((e) => ({
      ...e,
      [field]: e[field].map((r, ri) =>
        ri !== idx ? r : { ...r, [key]: key === "keterangan" ? value : value === "" ? undefined : Number(value) }
      ),
    }));
  };
  const addBreakdownRow = (field: "biayaPromosiBreakdown" | "trialTasteBreakdown") =>
    update((e) => ({ ...e, [field]: [...e[field], {}] }));
  const removeBreakdownRow = (field: "biayaPromosiBreakdown" | "trialTasteBreakdown", idx: number) =>
    update((e) => ({ ...e, [field]: e[field].filter((_, ri) => ri !== idx) }));

  // --------- Tanda Tangan ---------
  const defaultSigLabels = ["DIBUAT OLEH :", "DIPERIKSA OLEH :", "DIPERIKSA OLEH :", "DIKETAHUI OLEH :"];
  const safeSignatures = defaultSigLabels.map((lbl) => {
    const keyword = lbl.split(" ")[0]; // "DIBUAT", "DIPERIKSA", "DIKETAHUI"
    return d.signatures?.find((s) => (s.label || "").toUpperCase().includes(keyword)) || { label: lbl };
  });
  const updateSignature = (idx: number, key: keyof EvaluasiSignature, value: string) => {
    const nextSigs = [...safeSignatures];
    nextSigs[idx] = { ...nextSigs[idx], [key]: value };
    update((e) => ({ ...e, signatures: nextSigs }));
  };

  const renderBreakdownTable = (field: "biayaPromosiBreakdown" | "trialTasteBreakdown", title: string) => {
    const rows = d[field] ?? [];
    if (isMobile) {
      return (
        <>
          <SubHeading>{title}</SubHeading>
          <MobileCardList
            rows={rows}
            onRemove={(i) => removeBreakdownRow(field, i)}
            cardTitle={(row, i) => row.keterangan || `Baris ${i + 1}`}
            getFields={(row, i) => [
              { label: "Keterangan", render: () => <MobileTextInput value={row.keterangan ?? ""} onChange={(v) => updateBreakdownCell(field, i, "keterangan", v)} /> },
              { label: "Budget (Rp)", render: () => <MobileCurrencyInput value={row.budget ?? ""} formatRupiah={formatRupiah} onChange={(v) => updateBreakdownCell(field, i, "budget", v)} /> },
              { label: "Actual (Rp)", render: () => <MobileCurrencyInput value={row.actual ?? ""} formatRupiah={formatRupiah} onChange={(v) => updateBreakdownCell(field, i, "actual", v)} /> },
              { label: "%", render: () => <MobilePercentInput value={row.persen ?? ""} onChange={(v) => updateBreakdownCell(field, i, "persen", v === "" ? "" : String(v))} /> },
            ]}
          />
          <AddRowButton onClick={() => addBreakdownRow(field)} />
        </>
      );
    }
    return (
      <>
        <SubHeading>{title}</SubHeading>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr>
              <GreenTh minWidth={200}>Keterangan</GreenTh>
              <GreenTh minWidth={130} align="right">Budget (Rp)</GreenTh>
              <GreenTh minWidth={130} align="right">Actual (Rp)</GreenTh>
              <GreenTh minWidth={80} align="right">%</GreenTh>
              <DeleteTh />
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => (
              <tr key={i}>
                <EditableCell value={row.keterangan ?? ""} onChange={(v) => updateBreakdownCell(field, i, "keterangan", v)} />
                <EditableCell value={row.budget ?? ""} currency formatRupiah={formatRupiah} align="right" onChange={(v) => updateBreakdownCell(field, i, "budget", v)} />
                <EditableCell value={row.actual ?? ""} currency formatRupiah={formatRupiah} align="right" onChange={(v) => updateBreakdownCell(field, i, "actual", v)} />
                <EditableCell value={row.persen ?? ""} percent align="right" onChange={(v) => updateBreakdownCell(field, i, "persen", v)} />
                <DeleteCell onClick={() => removeBreakdownRow(field, i)} />
              </tr>
            ))}
          </tbody>
        </table>
        <AddRowButton onClick={() => addBreakdownRow(field)} />
      </>
    );
  };

  return (
    <div style={{ background: C.white, fontFamily: "Calibri, Arial, sans-serif", color: C.text }}>
      {/* ============ TOTAL PENCAPAIAN PROGRAM ============ */}
      <SectionBar>TOTAL PENCAPAIAN PROGRAM</SectionBar>
      <div style={{ padding: "6px 4px" }}>
        {isMobile ? (
          <MobileCardList
            rows={d.pencapaianProgram}
            onRemove={removePencapaianRow}
            cardTitle={(row, i) => row.keterangan || `Baris ${i + 1}`}
            getFields={(row, i) => [
              { label: "Keterangan", render: () => <MobileTextInput value={row.keterangan ?? ""} onChange={(v) => updatePencapaianRow(i, "keterangan", v)} /> },
              { label: "Total Target", render: () => <MobileNumberInput value={row.totalTarget ?? ""} onChange={(v) => updatePencapaianRow(i, "totalTarget", String(v))} /> },
              { label: "Actual Tercapai", render: () => <MobileNumberInput value={row.actualTercapai ?? ""} onChange={(v) => updatePencapaianRow(i, "actualTercapai", String(v))} /> },
              { label: "Pencapaian", render: () => <MobilePercentInput value={row.pencapaianPercent ?? ""} onChange={(v) => updatePencapaianRow(i, "pencapaianPercent", v === "" ? "" : String(v))} /> },
            ]}
          />
        ) : (
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr>
                <GreenTh minWidth={160}>Keterangan</GreenTh>
                <GreenTh minWidth={110} align="right">Total Target</GreenTh>
                <GreenTh minWidth={110} align="right">Actual Tercapai</GreenTh>
                <GreenTh minWidth={90} align="right">Pencapaian</GreenTh>
                <DeleteTh />
              </tr>
            </thead>
            <tbody>
              {d.pencapaianProgram.map((row, i) => (
                <tr key={i}>
                  <EditableCell value={row.keterangan ?? ""} onChange={(v) => updatePencapaianRow(i, "keterangan", v)} />
                  <EditableCell value={row.totalTarget ?? ""} type="number" align="right" onChange={(v) => updatePencapaianRow(i, "totalTarget", v)} />
                  <EditableCell value={row.actualTercapai ?? ""} type="number" align="right" onChange={(v) => updatePencapaianRow(i, "actualTercapai", v)} />
                  <EditableCell value={row.pencapaianPercent ?? ""} percent align="right" onChange={(v) => updatePencapaianRow(i, "pencapaianPercent", v)} />
                  <DeleteCell onClick={() => removePencapaianRow(i)} />
                </tr>
              ))}
              {d.pencapaianProgramTotal && (
                <tr>
                  <td style={{ ...cellBase, background: C.totalRow, fontWeight: 700 }}>TOTAL</td>
                  <td style={{ ...cellBase, background: C.totalRow, textAlign: "right", fontWeight: 700 }}>{d.pencapaianProgramTotal.totalTarget ?? "-"}</td>
                  <td style={{ ...cellBase, background: C.totalRow, textAlign: "right", fontWeight: 700 }}>{d.pencapaianProgramTotal.actualTercapai ?? "-"}</td>
                  <td style={{ ...cellBase, background: C.yellow, textAlign: "right", fontWeight: 700 }}>
                    {d.pencapaianProgramTotal.pencapaianPercent !== undefined
                      ? `${Math.round(d.pencapaianProgramTotal.pencapaianPercent * 10000) / 100}%`
                      : "-"}
                  </td>
                  <td style={{ ...cellBase, background: C.totalRow }} />
                </tr>
              )}
            </tbody>
          </table>
        )}
        <AddRowButton onClick={addPencapaianRow} />
        <PercentField
          label="Target penjualan tercapai"
          value={d.targetPenjualanTercapaiPercent1}
          onChange={(v) => update((e) => ({ ...e, targetPenjualanTercapaiPercent1: v }))}
        />
      </div>

      {/* ============ 01. SALES (Target Sales / Realisasi / Deviasi) ============ */}
      <SectionBar>01. TARGET SALES / REALISASI / DEVIASI</SectionBar>
      <div style={{ padding: "6px 4px" }}>
        {isMobile ? (
          <MobileCardList
            rows={safeSalesRows}
            cardTitle={(row) => row.label}
            getFields={(row, i) => [
              { label: "Target Sales (Bks)", render: () => <MobileNumberInput value={row.targetSalesBks ?? ""} onChange={(v) => updateSalesCell(i, "targetSalesBks", String(v))} /> },
              { label: "Potongan / Bks", render: () => <MobileCurrencyInput value={row.potonganPerBks ?? ""} formatRupiah={formatRupiah} onChange={(v) => updateSalesCell(i, "potonganPerBks", v)} /> },
              { label: "Nominal", render: () => <MobileCurrencyInput value={row.nominal ?? ""} formatRupiah={formatRupiah} onChange={(v) => updateSalesCell(i, "nominal", v)} /> },
            ]}
          />
        ) : (
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr>
                <GreenTh minWidth={160}>Keterangan</GreenTh>
                <GreenTh minWidth={120} align="right">Target Sales (Bks)</GreenTh>
                <GreenTh minWidth={130} align="right">Potongan / Bks</GreenTh>
                <GreenTh minWidth={140} align="right">Nominal</GreenTh>
              </tr>
            </thead>
            <tbody>
              {safeSalesRows.map((row, i) => (
                <tr key={i}>
                  <td style={{ ...cellBase, fontWeight: 700 }}>{row.label}</td>
                  <EditableCell value={row.targetSalesBks ?? ""} type="number" align="right" onChange={(v) => updateSalesCell(i, "targetSalesBks", v)} />
                  <EditableCell value={row.potonganPerBks ?? ""} currency formatRupiah={formatRupiah} align="right" onChange={(v) => updateSalesCell(i, "potonganPerBks", v)} />
                  <EditableCell value={row.nominal ?? ""} currency formatRupiah={formatRupiah} align="right" bg={C.yellow} bold onChange={(v) => updateSalesCell(i, "nominal", v)} />
                </tr>
              ))}
            </tbody>
          </table>
        )}
        <PercentField
          label="Target penjualan tercapai"
          value={d.targetPenjualanTercapaiPercent2}
          onChange={(v) => update((e) => ({ ...e, targetPenjualanTercapaiPercent2: v }))}
        />
      </div>

      {/* ============ 02. WS MINGGUAN ============ */}
      <SectionBar>02. TOTAL PENCAPAIAN PROGRAM (WS MINGGUAN)</SectionBar>
      <div style={{ padding: "6px 4px" }}>
        {!weekLabels.length && (
          <div style={{ fontSize: 12, color: "#888", padding: "4px 2px" }}>
            (Belum ada data minggu terdeteksi — tambah baris untuk mulai isi manual)
          </div>
        )}
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr>
              <GreenTh minWidth={80}>WS</GreenTh>
              {weekLabels.map((label, wi) => (
                <React.Fragment key={wi}>
                  <GreenTh minWidth={90} align="right">{`Target ${label}`}</GreenTh>
                  <GreenTh minWidth={90} align="right">{`Actual ${label}`}</GreenTh>
                </React.Fragment>
              ))}
              <GreenTh minWidth={100} align="right">Total Target</GreenTh>
              <GreenTh minWidth={100} align="right">Bonus/Bks</GreenTh>
              <GreenTh minWidth={140}>KET</GreenTh>
              <DeleteTh />
            </tr>
          </thead>
          <tbody>
            {d.wsRows.map((row, i) => (
              <tr key={i}>
                <EditableCell value={row.ws ?? ""} onChange={(v) => updateWsCell(i, "ws", v)} />
                {weekLabels.map((_, wi) => (
                  <React.Fragment key={wi}>
                    <EditableCell
                      value={row.weeks?.[wi]?.target ?? ""}
                      type="number"
                      align="right"
                      onChange={(v) => updateWsWeekCell(i, wi, "target", v)}
                    />
                    <EditableCell
                      value={row.weeks?.[wi]?.actual ?? ""}
                      type="number"
                      align="right"
                      onChange={(v) => updateWsWeekCell(i, wi, "actual", v)}
                    />
                  </React.Fragment>
                ))}
                <EditableCell value={row.totalTarget ?? ""} currency formatRupiah={formatRupiah} align="right" onChange={(v) => updateWsCell(i, "totalTarget", v)} />
                <EditableCell value={row.bonusPerBks ?? ""} currency formatRupiah={formatRupiah} align="right" onChange={(v) => updateWsCell(i, "bonusPerBks", v)} />
                <EditableCell value={row.keterangan ?? ""} onChange={(v) => updateWsCell(i, "keterangan", v)} />
                <DeleteCell onClick={() => removeWsRow(i)} />
              </tr>
            ))}
            {d.wsTotal && (
              <tr>
                <td style={{ ...cellBase, background: C.totalRow, fontWeight: 700 }}>TOTAL</td>
                {weekLabels.map((_, wi) => (
                  <React.Fragment key={wi}>
                    <td style={{ ...cellBase, background: C.totalRow, textAlign: "right" }}>{d.wsTotal!.weeks?.[wi]?.target ?? "-"}</td>
                    <td style={{ ...cellBase, background: C.totalRow, textAlign: "right" }}>{d.wsTotal!.weeks?.[wi]?.actual ?? "-"}</td>
                  </React.Fragment>
                ))}
                <td style={{ ...cellBase, background: C.totalRow, textAlign: "right", fontWeight: 700 }}>
                  {d.wsTotal.totalTarget !== undefined ? formatRupiah(d.wsTotal.totalTarget) : "-"}
                </td>
                <td style={{ ...cellBase, background: C.totalRow, textAlign: "right" }}>
                  {d.wsTotal.bonusPerBks !== undefined ? formatRupiah(d.wsTotal.bonusPerBks) : "-"}
                </td>
                <td style={{ ...cellBase, background: C.totalRow }}>{d.wsTotal.keterangan ?? "-"}</td>
                <td style={{ ...cellBase, background: C.totalRow }} />
              </tr>
            )}
          </tbody>
        </table>
        <AddRowButton onClick={addWsRow} />
        <PercentField
          label="Target penjualan tercapai"
          value={d.targetPenjualanTercapaiPercent3}
          onChange={(v) => update((e) => ({ ...e, targetPenjualanTercapaiPercent3: v }))}
        />
      </div>

      {/* ============ 02. BIAYA (Pengajuan / Realisasi / Deviasi) ============ */}
      <SectionBar>02. BIAYA PENGAJUAN / REALISASI / DEVIASI</SectionBar>
      <div style={{ padding: "6px 4px" }}>
        {isMobile ? (
          <MobileCardList
            rows={safeBiayaRows}
            cardTitle={(row) => row.label}
            getFields={(row, i) => [
              { label: "Biaya Promosi", render: () => <MobileCurrencyInput value={row.biayaPromosi ?? ""} formatRupiah={formatRupiah} onChange={(v) => updateBiayaCell(i, "biayaPromosi", v)} /> },
              { label: "Jasa Perorangan", render: () => <MobileCurrencyInput value={row.jasaPerorangan ?? ""} formatRupiah={formatRupiah} onChange={(v) => updateBiayaCell(i, "jasaPerorangan", v)} /> },
              { label: "Biaya POSM", render: () => <MobileCurrencyInput value={row.biayaPosm ?? ""} formatRupiah={formatRupiah} onChange={(v) => updateBiayaCell(i, "biayaPosm", v)} /> },
              { label: "Trial Taste", render: () => <MobileCurrencyInput value={row.trialTaste ?? ""} formatRupiah={formatRupiah} onChange={(v) => updateBiayaCell(i, "trialTaste", v)} /> },
              { label: "Total Biaya", render: () => <MobileCurrencyInput value={row.totalBiaya ?? ""} formatRupiah={formatRupiah} onChange={(v) => updateBiayaCell(i, "totalBiaya", v)} /> },
            ]}
          />
        ) : (
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr>
                <GreenTh minWidth={140}>Keterangan</GreenTh>
                <GreenTh minWidth={130} align="right">Biaya Promosi</GreenTh>
                <GreenTh minWidth={130} align="right">Jasa Perorangan</GreenTh>
                <GreenTh minWidth={120} align="right">Biaya POSM</GreenTh>
                <GreenTh minWidth={110} align="right">Trial Taste</GreenTh>
                <GreenTh minWidth={130} align="right">Total Biaya</GreenTh>
              </tr>
            </thead>
            <tbody>
              {safeBiayaRows.map((row, i) => (
                <tr key={i}>
                  <td style={{ ...cellBase, fontWeight: 700 }}>{row.label}</td>
                  <EditableCell value={row.biayaPromosi ?? ""} currency formatRupiah={formatRupiah} align="right" onChange={(v) => updateBiayaCell(i, "biayaPromosi", v)} />
                  <EditableCell value={row.jasaPerorangan ?? ""} currency formatRupiah={formatRupiah} align="right" onChange={(v) => updateBiayaCell(i, "jasaPerorangan", v)} />
                  <EditableCell value={row.biayaPosm ?? ""} currency formatRupiah={formatRupiah} align="right" onChange={(v) => updateBiayaCell(i, "biayaPosm", v)} />
                  <EditableCell value={row.trialTaste ?? ""} currency formatRupiah={formatRupiah} align="right" onChange={(v) => updateBiayaCell(i, "trialTaste", v)} />
                  <EditableCell value={row.totalBiaya ?? ""} currency formatRupiah={formatRupiah} align="right" bg={C.yellow} bold onChange={(v) => updateBiayaCell(i, "totalBiaya", v)} />
                </tr>
              ))}
            </tbody>
          </table>
        )}
        <PercentField
          label="Total Biaya terpakai"
          value={d.totalBiayaTerpakaiPercent}
          onChange={(v) => update((e) => ({ ...e, totalBiayaTerpakaiPercent: v }))}
        />
      </div>

      {/* ============ BREAKDOWN BIAYA ============ */}
      <SectionBar>BREAKDOWN BIAYA</SectionBar>
      <div style={{ padding: "6px 4px" }}>
        {renderBreakdownTable("biayaPromosiBreakdown", "Biaya Promosi terdiri atas")}
        <div style={{ height: 12 }} />
        {renderBreakdownTable("trialTasteBreakdown", "Trial Taste terdiri atas")}
      </div>

      {/* ============ 03. EVALUASI PROGRAM / KENDALA / PLAN SELANJUTNYA ============ */}
      <SectionBar>03. EVALUASI PROGRAM</SectionBar>
      <EditableNumberedList items={d.evaluasiProgram} onChange={(next) => update((e) => ({ ...e, evaluasiProgram: next }))} />

      <SectionBar>KENDALA</SectionBar>
      <EditableNumberedList items={d.kendala} onChange={(next) => update((e) => ({ ...e, kendala: next }))} />

      <SectionBar>PLAN SELANJUTNYA</SectionBar>
      <EditableNumberedList items={d.planSelanjutnya} onChange={(next) => update((e) => ({ ...e, planSelanjutnya: next }))} />

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