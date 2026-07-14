"use client"

import React, { useEffect } from "react";
import ActionPlanMekanismeDetailEdit from "@/components/ActionPlanMekanismeDetailEdit";

/**
 * Replika layout Excel "Action Plan" — grid nyambung, warna & penomoran section
 * dibuat semirip mungkin dengan sheet aslinya (bukan mengikuti tema `t` app).
 */

// ====== Palet warna persis Excel ======
const C = {
  yellow: "#FFFF99",
  yellowBorder: "#BFBF00",
  green: "#D9EAD3",
  greenBorder: "#93C47D",
  blackBar: "#000000",
  blueBar: "#1F4E78",
  orangeBar: "#B45F06",
  orangeCell: "#FFC000",
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

// ====== Helper kalkulasi grand total (SATU sumber kebenaran) ======
function computeGrandTotal(editForm: any) {
  const totalBiayaPromo = (editForm.anggaranBiaya ?? []).reduce(
    (s: number, r: any) => s + (Number(r.totalBiaya) || 0),
    0
  );
  const totalJasaPerorangan = (editForm.thl ?? []).reduce(
    (s: number, r: any) => s + (Number(r.estimasiTotal) || 0),
    0
  );
  const totalKebutuhanPosm = (editForm.barangPromo ?? []).reduce(
    (s: number, r: any) => s + (Number(r.estimasiTotal) || 0),
    0
  );
  const totalTrialTaste = (editForm.brandjln ?? []).reduce(
    (s: number, r: any) => s + (Number(r.Nominal) || 0),
    0
  );

  return {
    totalBiayaPromo,
    totalJasaPerorangan,
    totalKebutuhanPosm,
    totalTrialTaste,
    grandTotal: totalBiayaPromo + totalJasaPerorangan + totalKebutuhanPosm + totalTrialTaste,
  };
}

// ====== Helper kalkulasi analisa biaya (cost per pack & cost ratio) ======
function computeAnalisaBiaya(editForm: any) {
  const totalQtyBks = (editForm.TargetEvent ?? []).reduce(
    (s: number, r: any) => s + (Number(r.qty) || 0),
    0
  );
  const totalTargetPenjualan = (editForm.TargetEvent ?? []).reduce(
    (s: number, r: any) => s + (Number(r.TargetPenjualan) || 0),
    0
  );

  const { totalBiayaPromo, totalJasaPerorangan, totalKebutuhanPosm, totalTrialTaste, grandTotal } =
    computeGrandTotal(editForm);

  const rows = [
    { label: "BIAYA PROMOSI", total: totalBiayaPromo },
    { label: "JASA PERORANGAN", total: totalJasaPerorangan },
    { label: "KEBUTUHAN POSM", total: totalKebutuhanPosm },
    { label: "TRIAL TASTE", total: totalTrialTaste },
  ].map((r) => ({
    ...r,
    costPerPack: totalQtyBks > 0 ? r.total / totalQtyBks : 0,
    costRatio: totalTargetPenjualan > 0 ? r.total / totalTargetPenjualan : 0,
  }));

  const totalCostPerPack = totalQtyBks > 0 ? grandTotal / totalQtyBks : 0;
  const totalCostRatio = totalTargetPenjualan > 0 ? grandTotal / totalTargetPenjualan : 0;

  return { rows, totalCostPerPack, totalCostRatio };
}

function EditableCell({
  value,
  onChange,
  align = "left",
  type = "text",
  bg,
  bold,
  currency = false,
  formatRupiah
}: {
  value: string | number;
  onChange: (v: string) => void;
  align?: "left" | "right" | "center";
  type?: "text" | "number";
  bg?: string;
  bold?: boolean;
  currency?: boolean;
  formatRupiah?: (value: number) => string;
}) {
  const displayValue = currency
    ? formatRupiah?.(Number(value || 0)) ?? value
    : value;

  return (
    <td style={{ ...cellBase, background: bg, padding: 0 }}>
  {currency ? (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        padding: "0 8px",
      }}
    >
      <span
        style={{
          fontSize: 13,
          whiteSpace: "nowrap",
          marginRight: 6,
        }}
      >
        Rp
      </span>

      <input
        type="text"
        value={displayValue}
        onChange={(e) => {
          const angka = e.target.value.replace(/[^\d]/g, "");
          onChange(angka);
        }}
        style={{
          flex: 1,
          border: "none",
          outline: "none",
          background: "transparent",
          padding: "4px 0",
          fontSize: 13,
          textAlign: "right",
          fontWeight: bold ? 700 : 400,
        }}
      />
    </div>
  ) : (
    <input
      type={type}
      value={value as any}
      onChange={(e) => onChange(e.target.value)}
      style={{
        width: "100%",
        border: "none",
        outline: "none",
        background: "transparent",
        padding: "4px 8px",
        fontSize: 13,
        textAlign: align,
        fontWeight: bold ? 700 : 400,
      }}
    />
  )}
</td>
  );
}

function SectionBar({ children, bg = C.blackBar, color = C.white }: { children: React.ReactNode; bg?: string; color?: string }) {
  return (
    <div style={{ background: bg, color, fontWeight: 700, padding: "6px 10px", fontSize: 13, letterSpacing: 0.3 }}>
      {children}
    </div>
  );
}

function GreenTh({ children, minWidth }: { children: React.ReactNode; minWidth?: number }) {
  return (
    <th
      style={{
        ...cellBase,
        background: C.green,
        borderColor: C.greenBorder,
        fontWeight: 700,
        textAlign: "left",
        minWidth,
      }}
    >
      {children}
    </th>
  );
}

function TotalRow({ label, colSpanBefore, value }: { label: string; colSpanBefore: number; value: string }) {
  return (
    <tr>
      <td colSpan={colSpanBefore} style={{ ...cellBase, background: C.totalRow, textAlign: "right", fontWeight: 700 }}>
        {label}
      </td>
      <td style={{ ...cellBase, background: C.yellow, fontWeight: 700 }}>{value}</td>
    </tr>
  );
}

// ====== Tombol Tambah / Hapus Baris ======
function AddRowButton({ onClick, label = "+ Tambah Baris" }: { onClick: () => void; label?: string }) {
  return (
    <div style={{ padding: "6px 4px" }}>
      <button
        type="button"
        onClick={onClick}
        style={{
          padding: "4px 12px",
          fontSize: 12,
          fontWeight: 600,
          background: C.green,
          border: `1px solid ${C.greenBorder}`,
          borderRadius: 4,
          cursor: "pointer",
          color: C.text,
        }}
      >
        {label}
      </button>
    </div>
  );
}

function DeleteCell({ onClick }: { onClick: () => void }) {
  return (
    <td style={{ ...cellBase, width: 28, textAlign: "center", padding: 0 }}>
      <button
        type="button"
        onClick={onClick}
        title="Hapus baris"
        style={{
          border: "none",
          background: "transparent",
          color: C.red,
          cursor: "pointer",
          fontWeight: 700,
          fontSize: 15,
          lineHeight: 1,
          padding: "4px 6px",
        }}
      >
        ×
      </button>
    </td>
  );
}

function DeleteTh() {
  return <th style={{ ...cellBase, background: C.green, borderColor: C.greenBorder, width: 28 }} />;
}

// Nomor section di kolom kiri (01, 02, ...) + label section
function SectionRow({
  no,
  label,
  children,
  minHeight = 60,
}: {
  no: string;
  label: string;
  children: React.ReactNode;
  minHeight?: number;
}) {
  return (
    <tr>
      <td style={{ ...cellBase, width: 32, textAlign: "center", fontWeight: 700, verticalAlign: "top" }}>{no}</td>
      <td style={{ ...cellBase, width: 150, fontWeight: 700, verticalAlign: "top" }}>{label}</td>
      <td style={{ ...cellBase, minHeight, padding: 0 }} colSpan={20}>
        {children}
      </td>
    </tr>
  );
}

// List bernomor 1/2/3 editable per baris + tambah/hapus baris (Latar Belakang, Objektif, Mekanisme)
function NumberedList({
  value,
  onChange,
  minRows = 1,
}: {
  value: string;
  onChange: (v: string) => void;
  minRows?: number;
}) {
  const lines = (value ?? "").split("\n");
  while (lines.length < minRows) lines.push("");

  const setLine = (idx: number, v: string) => {
    const next = [...lines];
    next[idx] = v;
    onChange(next.join("\n"));
  };

  const addLine = () => {
    onChange([...lines, ""].join("\n"));
  };

  const removeLine = (idx: number) => {
    const next = lines.filter((_, i) => i !== idx);
    onChange(next.join("\n"));
  };

  return (
    <div>
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <tbody>
          {lines.map((line, i) => (
            <tr key={i}>
              <td style={{ width: 24, padding: "2px 6px", fontSize: 13, verticalAlign: "top", color: C.text }}>{i + 1}</td>
              <td style={{ padding: 0 }}>
                <input
                  value={line}
                  onChange={(e) => setLine(i, e.target.value)}
                  style={{
                    width: "100%",
                    border: "none",
                    outline: "none",
                    borderBottom: `1px dotted ${C.border}`,
                    padding: "3px 4px",
                    fontSize: 13,
                  }}
                />
              </td>
              <td style={{ width: 28, textAlign: "center", padding: 0 }}>
                {lines.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeLine(i)}
                    title="Hapus baris"
                    style={{ border: "none", background: "transparent", color: C.red, cursor: "pointer", fontWeight: 700, fontSize: 14 }}
                  >
                    ×
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <AddRowButton onClick={addLine} label="+ Tambah Baris" />
    </div>
  );
}

// ============================================================
// KOMPONEN UTAMA
// ============================================================
export default function ExcelReplicaBody({
  loadingDetail,
  detail,
  saveError,
  editForm,
  setEditForm,
  handleTableChange,
  formatRupiah,
  modalScrollRef,
}: any) {
  if (loadingDetail || !detail) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center gap-3 py-16">
        <p className="text-sm">Memuat detail dokumen...</p>
      </div>
    );
  }

  const set = (key: string) => (v: string) => setEditForm((f: any) => ({ ...f, [key]: v }));

  const newId = () => `new-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

  const addRow = (tableName: string, template: Record<string, any>) => {
    setEditForm((f: any) => ({
      ...f,
      [tableName]: [...((f[tableName] as any[]) ?? []), { id: newId(), ...template }],
    }));
  };

  const removeRow = (tableName: string, index: number) => {
    setEditForm((f: any) => {
      const arr = [...((f[tableName] as any[]) ?? [])];
      arr.splice(index, 1);
      return { ...f, [tableName]: arr };
    });
  };

  // ---- Sinkronkan total_biaya (header) dengan grand total live dari 4 tabel biaya ----
  useEffect(() => {
    const { grandTotal } = computeGrandTotal(editForm);
    if (grandTotal !== editForm.total_biaya) {
      setEditForm((f: any) => ({ ...f, total_biaya: grandTotal }));
    }
  }, [editForm.anggaranBiaya, editForm.thl, editForm.barangPromo, editForm.brandjln]);

  useEffect(() => {
    if (!editForm.tgl_mulai || !editForm.tgl_selesai) return;
    const start = new Date(editForm.tgl_mulai);
    const end = new Date(editForm.tgl_selesai);
    if (isNaN(start.getTime()) || isNaN(end.getTime())) return;

    const diffMs = end.getTime() - start.getTime();
    const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24)) + 1; // +1 kalau inklusif tgl mulai & selesai

    if (diffDays >= 0 && diffDays !== editForm.lama_program_hari) {
      setEditForm((f: any) => ({ ...f, lama_program_hari: diffDays }));
    }
  }, [editForm.tgl_mulai, editForm.tgl_selesai]);

  const toInputDate = (dateString: any): string => {
    if (!dateString) return "";
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "";
    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, "0");
    const dd = String(date.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
  };

  const formatDateIndo = (dateString: any): string => {
    if (!dateString) return "";
    const date = new Date(dateString);

    if (isNaN(date.getTime())) return dateString;

    return date.toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  return (
    <div
      ref={modalScrollRef}
      className="flex-1 overflow-y-auto"
      style={{ background: C.white, fontFamily: "Calibri, Arial, sans-serif", color: C.text }}
    >
      {saveError && (
        <div style={{ margin: 8, padding: 8, background: "#FCE8E6", color: "#B3261E", border: "1px solid #B3261E", fontSize: 13 }}>
          {saveError}
        </div>
      )}

      {/* ============ HEADER INFO + LOGO/TOTAL BLOCK ============ */}
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <tbody>
          <tr>
            <td style={{ ...cellBase, width: 160, fontWeight: 700 }}>NO. ACTION PLAN</td>
            <EditableCell value={editForm.no_action_plan ?? ""} onChange={set("no_action_plan")} bg={C.yellow} bold />
            <td rowSpan={9} style={{ ...cellBase, width: 820, verticalAlign: "top", textAlign: "center" }}>
              <div style={{ height: 200, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <img src="/logo-cgkn.png" alt="CGKN" width={140} height={140} />
              </div>
            </td>
          </tr>
          <tr>
            <td style={{ ...cellBase, fontWeight: 700 }}>PERWAKILAN/AGEN</td>
            <EditableCell value={editForm.perwakilan_agen ?? ""} onChange={set("perwakilan_agen")} bg={C.yellow} bold />
          </tr>
          <tr>
            <td style={{ ...cellBase, fontWeight: 700 }}>BRAND</td>
            <EditableCell value={editForm.brand ?? ""} onChange={set("brand")} bg={C.yellow} bold />
          </tr>
          <tr>
            <td style={{ ...cellBase, fontWeight: 700 }}>NAMA PROGRAM</td>
            <EditableCell value={editForm.nama_program ?? ""} onChange={set("nama_program")} bg={C.yellow} bold />
          </tr>
          <tr>
            <td style={{ ...cellBase, fontWeight: 700 }}>JENIS PROGRAM</td>
            <EditableCell value={editForm.jenis_program ?? ""} onChange={set("jenis_program")} bg={C.yellow} bold />
          </tr>
          <tr>
            <td style={{ ...cellBase, fontWeight: 700 }}>LOKASI PROGRAM</td>
            <EditableCell value={editForm.lokasi_program ?? ""} onChange={set("lokasi_program")} bg={C.yellow} bold />
          </tr>
          <tr>
            <td style={{ ...cellBase, fontWeight: 700 }}>TGL. PELAKSANAAN</td>
            <td style={{ ...cellBase, background: C.yellow, padding: 0 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <input
                  type="date"
                  value={toInputDate(editForm.tgl_mulai)}
                  onChange={(e) => set("tgl_mulai")(e.target.value)}
                  style={{ flex: 1, border: "none", outline: "none", background: "transparent", padding: "4px 8px", fontWeight: 700, fontSize: 13 }}
                />
                <span style={{ fontSize: 12 }}>sd</span>
                <input
                  type="date"
                  value={toInputDate(editForm.tgl_selesai)}
                  onChange={(e) => set("tgl_selesai")(e.target.value)}
                  style={{ flex: 1, border: "none", outline: "none", background: "transparent", padding: "4px 8px", fontWeight: 700, fontSize: 13 }}
                />
              </div>
            </td>
          </tr>
          <tr>
            <td style={{ ...cellBase, fontWeight: 700 }}>DITUJUKAN KPD.</td>
            <EditableCell value={editForm.ditujukan_kepada ?? ""} onChange={set("ditujukan_kepada")} bg={C.yellow} bold />
          </tr>
          <tr>
            <td style={{ ...cellBase, fontWeight: 700 }}>TEMBUSAN / Cc.</td>
            <EditableCell value={editForm.tembusan ?? ""} onChange={set("tembusan")} bg={C.yellow} bold />
          </tr>
          <tr>
            <td style={{ ...cellBase }} colSpan={2}></td>
            <td style={{ ...cellBase, padding: 0 }}>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <tbody>
                  <tr>
                    <td style={{ ...cellBase, width: 80, background: C.yellow, textAlign: "center", fontWeight: 700 }}>
                      <input
                        value={editForm.lama_program_hari ?? ""}
                        onChange={(e) => setEditForm((f: any) => ({ ...f, lama_program_hari: e.target.value ? Number(e.target.value) : null }))}
                        style={{ width: "100%", border: "none", outline: "none", background: "transparent", textAlign: "center", fontWeight: 700, fontSize: 13 }}
                      />
                    </td>
                    <td style={{ ...cellBase, fontWeight: 700 }}>Hari</td>
                    <td style={{ ...cellBase, fontWeight: 700, textAlign: "center" }}>TOTAL BIAYA</td>
                    <td style={{ ...cellBase, background: C.yellow, fontWeight: 700, textAlign: "right" }}>
                      {formatRupiah ? formatRupiah(editForm.total_biaya ?? 0) : `Rp ${editForm.total_biaya ?? 0}`}
                    </td>
                  </tr>
                </tbody>
              </table>
            </td>
          </tr>
        </tbody>
      </table>

      {/* ============ DESKRIPSI PROGRAM PROMOSI ============ */}
      <SectionBar>DESKRIPSI PROGRAM PROMOSI</SectionBar>
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <tbody>
          <SectionRow no="01" label="LATAR BELAKANG PROGRAM">
            <NumberedList value={editForm.LatarBelakang ?? ""} onChange={set("LatarBelakang")} minRows={1} />
          </SectionRow>

          <SectionRow no="02" label="OBJEKTIF PROGRAM">
            <NumberedList value={editForm.Objektif ?? ""} onChange={set("Objektif")} minRows={1} />
          </SectionRow>

          {/* 03 TARGET PROGRAM */}
          <tr>
            <td style={{ ...cellBase, textAlign: "center", fontWeight: 700, verticalAlign: "top" }}>03</td>
            <td style={{ ...cellBase, fontWeight: 700, verticalAlign: "top" }}>TARGET PROGRAM</td>
            <td style={{ ...cellBase, padding: 8 }} colSpan={20}>
              <textarea
                value={editForm.uraian ?? ""}
                onChange={(e) => set("uraian")(e.target.value)}
                rows={5}
                style={{ width: "100%", border: `1px dotted ${C.border}`, outline: "none", padding: 4, fontSize: 13, marginBottom: 8 }}
                placeholder="Uraian program..."
              />
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr>
                    <GreenTh minWidth={140}>BRAND</GreenTh>
                    <GreenTh minWidth={100}>WBP</GreenTh>
                    <GreenTh minWidth={100}>RBP</GreenTh>
                    <GreenTh minWidth={100}>CBP</GreenTh>
                    <GreenTh minWidth={120}>Estimasi Sales / week</GreenTh>
                    <DeleteTh />
                  </tr>
                </thead>
                <tbody>
                  {(editForm.TargetProgram ?? []).map((row: any, i: number) => (
                    <tr key={row.id ?? i}>
                      <EditableCell value={row.brand ?? ""} onChange={(v) => handleTableChange("TargetProgram", i, "brand", v)} />
                      <EditableCell value={row.wbp ?? ""} onChange={(v) => handleTableChange("TargetProgram", i, "wbp", Number(v))} currency formatRupiah={formatRupiah} align="right" />
                      <EditableCell value={row.rbp ?? ""} onChange={(v) => handleTableChange("TargetProgram", i, "rbp", Number(v))} currency formatRupiah={formatRupiah} align="right" />
                      <EditableCell value={row.cbp ?? ""} onChange={(v) => handleTableChange("TargetProgram", i, "cbp", Number(v))} currency formatRupiah={formatRupiah} align="right" />
                      <EditableCell value={row.estimasiSales ?? ""} onChange={(v) => handleTableChange("TargetProgram", i, "estimasiSales", Number(v))} type="number" align="right" />
                      <DeleteCell onClick={() => removeRow("TargetProgram", i)} />
                    </tr>
                  ))}
                </tbody>
              </table>
              <AddRowButton
                onClick={() =>
                  addRow("TargetProgram", { brand: "", wbp: 0, rbp: 0, cbp: 0, estimasiSales: 0 })
                }
              />
            </td>
          </tr>

          {/* 04 TARGET EVENT */}
          <tr>
            <td style={{ ...cellBase, textAlign: "center", fontWeight: 700, verticalAlign: "top" }}>04</td>
            <td style={{ ...cellBase, fontWeight: 700, verticalAlign: "top" }}>TARGET EVENT ATAU SEJENISNYA</td>
            <td style={{ ...cellBase, padding: 0 }} colSpan={20}>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr>
                    <GreenTh minWidth={110}>Jenis Program</GreenTh>
                    <GreenTh minWidth={100}>Target</GreenTh>
                    <GreenTh minWidth={100}>Brand</GreenTh>
                    <GreenTh minWidth={90}>QTY (Bks)</GreenTh>
                    <GreenTh minWidth={100}>Harga / Bks</GreenTh>
                    <GreenTh minWidth={120}>Target Penjualan</GreenTh>
                    <DeleteTh />
                  </tr>
                </thead>
                <tbody>
                  {(editForm.TargetEvent ?? []).map((row: any, i: number) => (
                    <tr key={row.id ?? i}>
                      <EditableCell value={row.JenisProgram ?? ""} onChange={(v) => handleTableChange("TargetEvent", i, "JenisProgram", v)} />
                      <EditableCell value={row.target ?? ""} onChange={(v) => handleTableChange("TargetEvent", i, "target", v)} />
                      <EditableCell value={row.brand ?? ""} onChange={(v) => handleTableChange("TargetEvent", i, "brand", v)} />
                      <EditableCell value={row.qty ?? ""} onChange={(v) => handleTableChange("TargetEvent", i, "qty", Number(v))} type="number" align="right" />
                      <EditableCell value={row.harga ?? ""} onChange={(v) => handleTableChange("TargetEvent", i, "harga", Number(v))} currency formatRupiah={formatRupiah} align="right" />
                      <EditableCell value={row.TargetPenjualan ?? ""} onChange={(v) => handleTableChange("TargetEvent", i, "targetPenjualan", Number(v))} currency formatRupiah={formatRupiah} align="right"
                      />
                      <DeleteCell onClick={() => removeRow("TargetEvent", i)} />
                    </tr>
                  ))}
                </tbody>
                {!!(editForm.TargetEvent ?? []).length && (
                  <tfoot>
                    <tr>
                      <td colSpan={5} style={{ ...cellBase, textAlign: "center", fontWeight: 700 }}>
                        Total
                      </td>
                      <td style={{ ...cellBase, textAlign: "right", fontWeight: 700 }}>
                        {formatRupiah
                          ? formatRupiah(editForm.TargetEvent.reduce((s: number, r: any) => s + (r.TargetPenjualan || 0), 0))
                          : editForm.TargetEvent.reduce((s: number, r: any) => s + (r.TargetPenjualan || 0), 0)}
                      </td>
                      <td style={cellBase}></td>
                    </tr>
                  </tfoot>
                )}
              </table>
              <AddRowButton
                onClick={() =>
                  addRow("TargetEvent", { JenisProgram: "", target: "", brand: "", qty: 0, harga: 0, TargetPenjualan: 0 })
                }
              />
            </td>
          </tr>

          {/* 05 DATA DISTRIBUSI */}
          <tr>
            <td style={{ ...cellBase, textAlign: "center", fontWeight: 700, verticalAlign: "top" }}>05</td>
            <td style={{ ...cellBase, fontWeight: 700, verticalAlign: "top" }}>DATA DISTRIBUSI</td>
            <td style={{ ...cellBase, padding: 0 }} colSpan={20}>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr>
                    <GreenTh minWidth={160}>AREA / DISTRIK YANG DIADAKAN PROGRAM</GreenTh>
                    <GreenTh minWidth={80}>OUTLET</GreenTh>
                    <GreenTh minWidth={100}>AVAILABILITY</GreenTh>
                    <GreenTh minWidth={90}>VISIBILITY</GreenTh>
                    <GreenTh minWidth={70}>AVG</GreenTh>
                    <GreenTh minWidth={100}>STATUS</GreenTh>
                    <GreenTh minWidth={140}>KETERANGAN</GreenTh>
                    <DeleteTh />
                  </tr>
                </thead>
                <tbody>
                  {(editForm.DataDistribusi ?? []).map((row: any, i: number) => (
                    <tr key={row.id ?? i}>
                      <EditableCell value={row.wilayah ?? ""} onChange={(v) => handleTableChange("DataDistribusi", i, "wilayah", v)} />
                      <EditableCell value={row.outlet ?? ""} onChange={(v) => handleTableChange("DataDistribusi", i, "outlet", Number(v))} type="number" align="right" />
                      <EditableCell value={row.avaibility ?? ""} onChange={(v) => handleTableChange("DataDistribusi", i, "avaibility", Number(v))} type="number" align="right" />
                      <EditableCell value={row.visibility ?? ""} onChange={(v) => handleTableChange("DataDistribusi", i, "visibility", Number(v))} type="number" align="right" />
                      <EditableCell value={row.avg ?? ""} onChange={(v) => handleTableChange("DataDistribusi", i, "avg", Number(v))} type="number" align="right" />
                      <EditableCell value={row.status ?? ""} onChange={(v) => handleTableChange("DataDistribusi", i, "status", v)} bg={C.orangeCell} />
                      <EditableCell value={row.keterangan ?? ""} onChange={(v) => handleTableChange("DataDistribusi", i, "keterangan", v)} />
                      <DeleteCell onClick={() => removeRow("DataDistribusi", i)} />
                    </tr>
                  ))}
                </tbody>
              </table>
              <AddRowButton
                onClick={() =>
                  addRow("DataDistribusi", { wilayah: "", outlet: 0, avaibility: 0, visibility: 0, avg: 0, status: "", keterangan: "" })
                }
              />
            </td>
          </tr>

          {/* 06 MEKANISME PROGRAM */}
          <SectionRow no="06" label="MEKANISME PROGRAM">
            <NumberedList value={editForm.Mekanisme ?? ""} onChange={set("Mekanisme")} minRows={1} />
            <div style={{ marginTop: 8, borderTop: `1px dashed ${C.border}`, paddingTop: 8 }}>
              <ActionPlanMekanismeDetailEdit detail={editForm.mekanismeDetail ?? detail?.mekanismeDetail} onChange={(next) => setEditForm((f: any) => ({ ...f, mekanismeDetail: next }))}formatRupiah={formatRupiah}/>
            </div>
          </SectionRow>

          {/* 07 PELAKSANA PROGRAM */}
          <tr>
            <td style={{ ...cellBase, textAlign: "center", fontWeight: 700 }}>07</td>
            <td style={{ ...cellBase, fontWeight: 700 }}>PELAKSANA PROGRAM</td>
            <td style={{ ...cellBase, padding: 0 }} colSpan={20}>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <tbody>
                  <tr>
                    <td style={{ ...cellBase, width: 30, textAlign: "center" }}>
                      <input
                        type="checkbox"
                        checked={!!editForm.pelaksana_tim_promosi}
                        onChange={(e) => setEditForm((f: any) => ({ ...f, pelaksana_tim_promosi: e.target.checked }))}
                      />
                    </td>
                    <td style={cellBase}>Tim Promosi</td>

                    <td style={{ ...cellBase, width: 30, textAlign: "center" }}>
                      <input
                        type="checkbox"
                        checked={!!editForm.pelaksana_eo}
                        onChange={(e) => setEditForm((f: any) => ({ ...f, pelaksana_eo: e.target.checked }))}
                      />
                    </td>
                    <td style={cellBase}>EO</td>
                  </tr>
                  <tr>
                    <td style={{ ...cellBase, textAlign: "center" }}>
                      <input
                        type="checkbox"
                        checked={!!editForm.pelaksana_tim_distribusi}
                        onChange={(e) => setEditForm((f: any) => ({ ...f, pelaksana_tim_distribusi: e.target.checked }))}
                      />
                    </td>
                    <td style={cellBase}>Tim Distribusi</td>

                    <td style={{ ...cellBase, width: 30, textAlign: "center" }}>
                      <input
                        type="checkbox"
                        checked={!!editForm.pelaksana_lain}
                        onChange={(e) => setEditForm((f: any) => ({ ...f, pelaksana_lain: e.target.checked }))}
                      />
                    </td>
                    <td style={cellBase}>Lain²</td>
                  </tr>
                </tbody>
              </table>
            </td>
          </tr>
        </tbody>
      </table>

      {/* ============ ANGGARAN BIAYA PROMOSI ============ */}
      <SectionBar>ANGGARAN BIAYA PROMOSI YANG DIAJUKAN</SectionBar>
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr>
            <GreenTh minWidth={30}>No.</GreenTh>
            <GreenTh minWidth={220}>URAIAN</GreenTh>
            <GreenTh minWidth={70}>QTY</GreenTh>
            <GreenTh minWidth={90}>SATUAN</GreenTh>
            <GreenTh minWidth={110}>Harga / Unit</GreenTh>
            <GreenTh minWidth={110}>TOTAL BIAYA</GreenTh>
            <DeleteTh />
          </tr>
        </thead>
        <tbody>
          {(editForm.anggaranBiaya ?? []).map((row: any, i: number) => (
            <tr key={row.id ?? i}>
              <td style={{ ...cellBase, textAlign: "center" }}>{i + 1}</td>
              <EditableCell value={row.uraian ?? ""} onChange={(v) => handleTableChange("anggaranBiaya", i, "uraian", v)} />
              <EditableCell value={row.qty ?? ""} onChange={(v) => handleTableChange("anggaranBiaya", i, "qty", Number(v))} type="number" align="right" />
              <EditableCell value={row.satuan ?? ""} onChange={(v) => handleTableChange("anggaranBiaya", i, "satuan", v)} />
              <EditableCell value={row.hargaUnit ?? ""} onChange={(v) => handleTableChange("anggaranBiaya", i, "hargaUnit", Number(v))} currency formatRupiah={formatRupiah} align="right" />
              <EditableCell value={row.totalBiaya ?? ""} onChange={(v) => handleTableChange("anggaranBiaya", i, "totalBiaya", Number(v))} currency formatRupiah={formatRupiah} align="right" />
              <DeleteCell onClick={() => removeRow("anggaranBiaya", i)} />
            </tr>
          ))}
        </tbody>
        {!!(editForm.anggaranBiaya ?? []).length && (
          <tfoot>
            <TotalRow
              label="TOTAL BIAYA PROMOSI"
              colSpanBefore={5}
              value={formatRupiah ? formatRupiah(editForm.anggaranBiaya.reduce((s: number, r: any) => s + (r.totalBiaya || 0), 0)) : ""}
            />
          </tfoot>
        )}
      </table>
      <AddRowButton
        onClick={() => addRow("anggaranBiaya", { uraian: "", qty: 0, satuan: "", hargaUnit: 0, totalBiaya: 0 })}
      />

      {/* ============ TENAGA HARIAN LEPAS ============ */}
      <SectionBar bg={C.blueBar}>
        Tenaga Kerja Lepas (Jasa Perorangan yang direkrut/dipekerjakan secara langsung TANPA melalui pihak ketiga)
      </SectionBar>
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr>
            <GreenTh minWidth={30}>No.</GreenTh>
            <GreenTh minWidth={200}>JASA PERORANGAN</GreenTh>
            <GreenTh minWidth={110}>JUMLAH TENAGA</GreenTh>
            <GreenTh minWidth={90}>HARI KERJA</GreenTh>
            <GreenTh minWidth={110}>IMBALAN / HARI</GreenTh>
            <GreenTh minWidth={120}>TOTAL IMBALAN</GreenTh>
            <DeleteTh />
          </tr>
        </thead>
        <tbody>
          {(editForm.thl ?? []).map((row: any, i: number) => (
            <tr key={row.id ?? i}>
              <td style={{ ...cellBase, textAlign: "center" }}>{i + 1}</td>
              <EditableCell value={row.jasaperorg ?? ""} onChange={(v) => handleTableChange("thl", i, "jasaperorg", v)} />
              <EditableCell value={row.jumlahtng ?? ""} onChange={(v) => handleTableChange("thl", i, "jumlahtng", Number(v))} type="number" align="right" />
              <EditableCell value={row.harikerja ?? ""} onChange={(v) => handleTableChange("thl", i, "harikerja", Number(v))} type="number" align="right" />
              <EditableCell value={row.imbalanperhari ?? ""} onChange={(v) => handleTableChange("thl", i, "imbalanperhari", Number(v))} currency formatRupiah={formatRupiah} align="right" />
              <EditableCell value={row.estimasiTotal ?? ""} onChange={(v) => handleTableChange("thl", i, "estimasiTotal", Number(v))} currency formatRupiah={formatRupiah} align="right" />
              <DeleteCell onClick={() => removeRow("thl", i)} />
            </tr>
          ))}
        </tbody>
        {!!(editForm.thl ?? []).length && (
          <tfoot>
            <TotalRow
              label="TOTAL BIAYA JASA PERORANGAN"
              colSpanBefore={5}
              value={formatRupiah ? formatRupiah(editForm.thl.reduce((s: number, r: any) => s + (r.estimasiTotal || 0), 0)) : ""}
            />
          </tfoot>
        )}
      </table>
      <AddRowButton
        onClick={() => addRow("thl", { jasaperorg: "", jumlahtng: 0, harikerja: 0, imbalanperhari: 0, estimasiTotal: 0 })}
      />

      {/* ============ KEBUTUHAN BARANG PROMOSI ============ */}
      <SectionBar>KEBUTUHAN BARANG PROMOSI YANG DIAJUKAN</SectionBar>
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr>
            <GreenTh minWidth={30}>No.</GreenTh>
            <GreenTh minWidth={220}>NAMA BARANG</GreenTh>
            <GreenTh minWidth={90}>SATUAN</GreenTh>
            <GreenTh minWidth={70}>QTY</GreenTh>
            <GreenTh minWidth={110}>HARGA / UNIT</GreenTh>
            <GreenTh minWidth={120}>ESTIMASI TOTAL</GreenTh>
            <DeleteTh />
          </tr>
        </thead>
        <tbody>
          {(editForm.barangPromo ?? []).map((row: any, i: number) => (
            <tr key={row.id ?? i}>
              <td style={{ ...cellBase, textAlign: "center" }}>{i + 1}</td>
              <EditableCell value={row.namaBarang ?? ""} onChange={(v) => handleTableChange("barangPromo", i, "namaBarang", v)} />
              <EditableCell value={row.satuan ?? ""} onChange={(v) => handleTableChange("barangPromo", i, "satuan", v)} />
              <EditableCell value={row.qty ?? ""} onChange={(v) => handleTableChange("barangPromo", i, "qty", Number(v))} type="number" align="right" />
              <EditableCell value={row.hargaUnit ?? ""} onChange={(v) => handleTableChange("barangPromo", i, "hargaUnit", Number(v))} currency formatRupiah={formatRupiah} align="right" />
              <EditableCell value={row.estimasiTotal ?? ""} onChange={(v) => handleTableChange("barangPromo", i, "estimasiTotal", Number(v))} type="number" align="right" />
              <DeleteCell onClick={() => removeRow("barangPromo", i)} />
            </tr>
          ))}
        </tbody>
        {!!(editForm.barangPromo ?? []).length && (
          <tfoot>
            <TotalRow
              label="TOTAL BIAYA BARANG PROMOSI"
              colSpanBefore={5}
              value={formatRupiah ? formatRupiah(editForm.barangPromo.reduce((s: number, r: any) => s + (r.estimasiTotal || 0), 0)) : ""}
            />
          </tfoot>
        )}
      </table>
      <AddRowButton
        onClick={() => addRow("barangPromo", { namaBarang: "", satuan: "", qty: 0, hargaUnit: 0, estimasiTotal: 0 })}
      />

      {/* ============ MIXED BRAND + TOTAL BIAYA DIBUTUHKAN (2 kolom) ============ */}
      <SectionBar>Mixed Brand</SectionBar>
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <tbody>
          <tr>
            <td style={{ padding: 0, verticalAlign: "top", width: "55%" }}>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr>
                    <GreenTh minWidth={30}>No.</GreenTh>
                    <GreenTh minWidth={200}>PROGRAM YANG DIJALANKAN</GreenTh>
                    <GreenTh minWidth={70}>QTY (BKS)</GreenTh>
                    <GreenTh minWidth={90}>HARGA / BKS</GreenTh>
                    <GreenTh minWidth={110}>TOTAL NOMINAL</GreenTh>
                    <DeleteTh />
                  </tr>
                </thead>
                <tbody>
                  {(editForm.brandjln ?? []).map((row: any, i: number) => (
                    <tr key={row.id ?? i}>
                      <td style={{ ...cellBase, textAlign: "center" }}>{i + 1}</td>
                      <EditableCell value={row.Programjln ?? ""} onChange={(v) => handleTableChange("brandjln", i, "Programjln", v)} />
                      <EditableCell value={row.qtybks ?? ""} onChange={(v) => handleTableChange("brandjln", i, "qtybks", v)} align="right" />
                      <EditableCell value={row.hrgbks ?? ""} onChange={(v) => handleTableChange("brandjln", i, "hrgbks", v)} currency formatRupiah={formatRupiah} align="right" />
                      <EditableCell value={row.Nominal ?? ""} onChange={(v) => handleTableChange("brandjln", i, "Nominal", Number(v))} currency formatRupiah={formatRupiah} align="right" />
                      <DeleteCell onClick={() => removeRow("brandjln", i)} />
                    </tr>
                  ))}
                </tbody>
                {!!(editForm.brandjln ?? []).length && (
                  <tfoot>
                    <TotalRow
                      label="TOTAL"
                      colSpanBefore={4}
                      value={formatRupiah ? formatRupiah(editForm.brandjln.reduce((s: number, r: any) => s + (r.Nominal || 0), 0)) : ""}
                    />
                  </tfoot>
                )}
              </table>
              <AddRowButton
                onClick={() => addRow("brandjln", { Programjln: "", qtybks: 0, hrgbks: 0, Nominal: 0 })}
              />
            </td>
            <td style={{ padding: 0, verticalAlign: "top", width: "45%" }}>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr>
                    <td colSpan={3} style={{ ...cellBase, background: C.blackBar, color: C.white, fontWeight: 700, textAlign: "center" }}>
                      TOTAL BIAYA YANG DIBUTUHKAN
                    </td>
                  </tr>
                </thead>
                <tbody>
                  {(() => {
                    const { totalBiayaPromo, totalJasaPerorangan, totalKebutuhanPosm, totalTrialTaste } =
                      computeGrandTotal(editForm);

                    const rows = [
                      { label: "BIAYA PROMOSI", value: totalBiayaPromo },
                      { label: "JASA PERORANGAN", value: totalJasaPerorangan },
                      { label: "KEBUTUHAN POSM", value: totalKebutuhanPosm },
                      { label: "TRIAL TASTE", value: totalTrialTaste },
                    ];

                    return rows.map((r, i) => (
                      <tr key={i}>
                        <td style={{ ...cellBase, width: 30, textAlign: "center" }}>{i + 1}</td>
                        <td style={cellBase}>{r.label}</td>
                        <td style={{ ...cellBase, textAlign: "right" }}>
                          {formatRupiah ? formatRupiah(r.value) : r.value}
                        </td>
                      </tr>
                    ));
                  })()}
                </tbody>
                <tfoot>
                  {(() => {
                    const { grandTotal } = computeGrandTotal(editForm);

                    return (
                      <tr>
                        <td colSpan={2} style={{ ...cellBase, background: C.totalRow, textAlign: "right", fontWeight: 700 }}>
                          TOTAL BIAYA
                        </td>
                        <td style={{ ...cellBase, background: C.yellow, fontWeight: 700, textAlign: "right" }}>
                          {formatRupiah ? formatRupiah(grandTotal) : grandTotal}
                        </td>
                      </tr>
                    );
                  })()}
                </tfoot>
              </table>
            </td>
          </tr>
        </tbody>
      </table>

      {/* ============ PERMINTAAN TRANSFER + ANALISA BIAYA (2 kolom) ============ */}
      <table style={{ width: "100%", borderCollapse: "collapse", marginTop: 4 }}>
        <tbody>
          <tr>
            <td style={{ padding: 0, verticalAlign: "top", width: "50%" }}>
              <SectionBar bg={C.orangeBar}>PERMINTAAN TRANSFER BIAYA PROGRAM PROMOSI</SectionBar>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr>
                    <th style={{ ...cellBase, background: C.orangeCell, fontWeight: 700 }}>Jenis Transfer</th>
                    <th style={{ ...cellBase, background: C.orangeCell, fontWeight: 700 }}>Tanggal Transfer</th>
                    <th style={{ ...cellBase, background: C.orangeCell, fontWeight: 700 }}>Jumlah Transfer</th>
                    <th style={{ ...cellBase, background: C.orangeCell, width: 28 }} />
                  </tr>
                </thead>
                <tbody>
                  {(editForm.transfer ?? []).map((row: any, i: number) => (
                    <tr key={row.id ?? i}>
                      <EditableCell value={row.jenis ?? ""} onChange={(v) => handleTableChange("transfer", i, "jenis", v)} bg={C.orangeCell} align="center" />
                      <EditableCell value={row.tanggal ?? ""} onChange={(v) => handleTableChange("transfer", i, "tanggal", v)} bg={C.orangeCell} align="center" />
                      <EditableCell
                        value={row.jumlah ?? ""}
                        onChange={(v) => handleTableChange("transfer", i, "jumlah", Number(v))}
                        type="number"
                        bg={C.orangeCell}
                        align="center"
                      />
                      <DeleteCell onClick={() => removeRow("transfer", i)} />
                    </tr>
                  ))}
                </tbody>
              </table>
              <AddRowButton onClick={() => addRow("transfer", { jenis: "", tanggal: "", jumlah: 0 })} />
            </td>
            <td style={{ padding: 0, verticalAlign: "top", width: "50%" }}>
              <SectionBar bg={C.orangeBar}>Analisa Biaya</SectionBar>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr>
                    <th style={{ ...cellBase, background: C.orangeCell, fontWeight: 700, textAlign: "center" }}>No</th>
                    <th style={{ ...cellBase, background: C.orangeCell, fontWeight: 700 }}>Analisa Biaya</th>
                    <th style={{ ...cellBase, background: C.orangeCell, fontWeight: 700 }}>Cost Per Pack</th>
                    <th style={{ ...cellBase, background: C.orangeCell, fontWeight: 700 }}>Cost Ratio</th>
                  </tr>
                </thead>
                <tbody>
                  {(() => {
                    const { rows } = computeAnalisaBiaya(editForm);

                    return rows.map((r, i) => (
                      <tr key={i}>
                        <td style={{ ...cellBase, textAlign: "center" }}>{i + 1}</td>
                        <td style={cellBase}>{r.label}</td>
                        <td style={{ ...cellBase, textAlign: "right" }}>
                          {formatRupiah ? formatRupiah(r.costPerPack) : r.costPerPack}
                        </td>
                        <td style={{ ...cellBase, textAlign: "right" }}>
                          {new Intl.NumberFormat("id-ID", { style: "percent", minimumFractionDigits: 1 }).format(r.costRatio)}
                        </td>
                      </tr>
                    ));
                  })()}
                </tbody>
                <tfoot>
                  {(() => {
                    const { totalCostPerPack, totalCostRatio } = computeAnalisaBiaya(editForm);

                    return (
                      <tr>
                        <td colSpan={2} style={{ ...cellBase, background: C.totalRow, fontWeight: 700, textAlign: "right" }}>
                          Total Biaya
                        </td>
                        <td style={{ ...cellBase, background: C.yellow, fontWeight: 700, textAlign: "right" }}>
                          {formatRupiah ? formatRupiah(totalCostPerPack) : totalCostPerPack}
                        </td>
                        <td style={{ ...cellBase, background: C.yellow, fontWeight: 700, textAlign: "right" }}>
                          {new Intl.NumberFormat("id-ID", { style: "percent", minimumFractionDigits: 1 }).format(totalCostRatio)}
                        </td>
                      </tr>
                    );
                  })()}
                </tfoot>
              </table>
            </td>
          </tr>
        </tbody>
      </table>

      <div style={{ height: 24 }} />
    </div>
  );
}