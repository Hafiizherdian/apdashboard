"use client";

import React from "react";
import type { TradePromoEvaluasiSheet } from "@/lib/parseActionsPlan";

const C = {
  yellow: "#FFFF99",
  green: "#D9EAD3",
  greenBorder: "#93C47D",
  blackBar: "#000000",
  totalRow: "#D9D9D9",
  border: "#000000",
  text: "#000000",
  white: "#FFFFFF",
};

const cellBase: React.CSSProperties = {
  border: `1px solid ${C.border}`,
  padding: "4px 8px",
  fontSize: 13,
  verticalAlign: "middle",
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

function fmtCell(v: string | number | null | undefined): string {
  if (v === null || v === undefined || v === "") return "-";
  return String(v);
}

function fmtPercent(v: number | null | undefined) {
  if (v === null || v === undefined) return "-";
  return new Intl.NumberFormat("id-ID", { style: "percent", minimumFractionDigits: 1 }).format(v);
}

function NumberedListView({ items }: { items?: string[] }) {
  const lines = (items ?? []).filter((l) => (l ?? "").trim() !== "");
  if (!lines.length) return <div style={{ padding: 6, fontSize: 13, color: "#888" }}>-</div>;
  return (
    <ol style={{ margin: 0, padding: "4px 0 4px 20px", fontSize: 13 }}>
      {lines.map((l, i) => (
        <li key={i} style={{ marginBottom: 2 }}>{l}</li>
      ))}
    </ol>
  );
}

function MobileCardListView<T>({
  rows,
  cardTitle,
  fields,
}: {
  rows: T[];
  cardTitle: (row: T, i: number) => React.ReactNode;
  fields: (row: T, i: number) => { label: string; value: React.ReactNode }[];
}) {
  if (!rows || !rows.length) {
    return <div style={{ padding: "10px", textAlign: "center", fontSize: 13, color: "#888" }}>Tidak ada data</div>;
  }
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      {rows.map((row, i) => (
        <table key={i} style={{ width: "100%", borderCollapse: "collapse" }}>
          <tbody>
            <tr>
              <td colSpan={2} style={{ ...cellBase, background: C.green, borderColor: C.greenBorder, fontWeight: 700 }}>
                {cardTitle(row, i)}
              </td>
            </tr>
            {fields(row, i).map((f, fi) => (
              <tr key={fi}>
                <td style={{ ...cellBase, width: "40%", fontWeight: 700, background: "#F2F2F2" }}>{f.label}</td>
                <td style={{ ...cellBase, textAlign: "right" }}>{f.value ?? "-"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      ))}
    </div>
  );
}

function PercentDisplay({ label, value }: { label: string; value: number | undefined }) {
  return (
    <div style={{ padding: "4px 2px", fontSize: 13 }}>
      <span style={{ fontWeight: 700 }}>{label}:</span> {fmtPercent(value)}
    </div>
  );
}

/**
 * Versi READ-ONLY untuk varian Trade Promo, dipasangkan dengan EvaluasiDetailView
 * yang menangani varian Activation. Dipakai lewat dispatcher berdasarkan
 * evaluasi.kind ("activation" | "trade_promo").
 */
export default function EvaluasiTradePromoDetailView({
  data,
  formatRupiah,
  isMobile = false,
}: {
  data: TradePromoEvaluasiSheet;
  formatRupiah: (v: number) => string;
  isMobile?: boolean;
}) {
  const d = data ?? {
    pencapaianProgram: [],
    salesRows: [],
    wsRows: [],
    biayaRows: [],
    biayaPromosiBreakdown: [],
    trialTasteBreakdown: [],
    evaluasiProgram: [],
    kendala: [],
    planSelanjutnya: [],
    signatures: [],
  };
  const weekLabels = d.wsRows[0]?.weeks?.map((w) => w.label) ?? d.wsTotal?.weeks?.map((w) => w.label) ?? [];

  const renderBreakdownTable = (rows: TradePromoEvaluasiSheet["biayaPromosiBreakdown"], title: string) => (
    <>
      <SubHeading>{title}</SubHeading>
      {isMobile ? (
        <MobileCardListView
          rows={rows ?? []}
          cardTitle={(row) => row.keterangan || "-"}
          fields={(row) => [
            { label: "Budget (Rp)", value: formatRupiah(row.budget ?? 0) },
            { label: "Actual (Rp)", value: formatRupiah(row.actual ?? 0) },
            { label: "%", value: fmtPercent(row.persen) },
          ]}
        />
      ) : (
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr>
              <GreenTh minWidth={200}>Keterangan</GreenTh>
              <GreenTh minWidth={130} align="right">Budget (Rp)</GreenTh>
              <GreenTh minWidth={130} align="right">Actual (Rp)</GreenTh>
              <GreenTh minWidth={80} align="right">%</GreenTh>
            </tr>
          </thead>
          <tbody>
            {(rows ?? []).map((row, i) => (
              <tr key={i}>
                <td style={cellBase}>{fmtCell(row.keterangan)}</td>
                <td style={{ ...cellBase, textAlign: "right" }}>{formatRupiah(row.budget ?? 0)}</td>
                <td style={{ ...cellBase, textAlign: "right" }}>{formatRupiah(row.actual ?? 0)}</td>
                <td style={{ ...cellBase, textAlign: "right" }}>{fmtPercent(row.persen)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </>
  );

  return (
    <div style={{ background: C.white, fontFamily: "Calibri, Arial, sans-serif", color: C.text }}>
      {/* ===== TOTAL PENCAPAIAN PROGRAM ===== */}
      <SectionBar>TOTAL PENCAPAIAN PROGRAM</SectionBar>
      <div style={{ padding: "6px 4px" }}>
        {isMobile ? (
          <MobileCardListView
            rows={d.pencapaianProgram}
            cardTitle={(row) => row.keterangan || "-"}
            fields={(row) => [
              { label: "Total Target", value: fmtCell(row.totalTarget) },
              { label: "Actual Tercapai", value: fmtCell(row.actualTercapai) },
              { label: "Pencapaian", value: fmtPercent(row.pencapaianPercent) },
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
              </tr>
            </thead>
            <tbody>
              {d.pencapaianProgram.map((row, i) => (
                <tr key={i}>
                  <td style={cellBase}>{fmtCell(row.keterangan)}</td>
                  <td style={{ ...cellBase, textAlign: "right" }}>{fmtCell(row.totalTarget)}</td>
                  <td style={{ ...cellBase, textAlign: "right" }}>{fmtCell(row.actualTercapai)}</td>
                  <td style={{ ...cellBase, textAlign: "right" }}>{fmtPercent(row.pencapaianPercent)}</td>
                </tr>
              ))}
            </tbody>
            {d.pencapaianProgramTotal && (
              <tfoot>
                <tr>
                  <td style={{ ...cellBase, background: C.totalRow, fontWeight: 700 }}>TOTAL</td>
                  <td style={{ ...cellBase, background: C.totalRow, textAlign: "right", fontWeight: 700 }}>{fmtCell(d.pencapaianProgramTotal.totalTarget)}</td>
                  <td style={{ ...cellBase, background: C.totalRow, textAlign: "right", fontWeight: 700 }}>{fmtCell(d.pencapaianProgramTotal.actualTercapai)}</td>
                  <td style={{ ...cellBase, background: C.yellow, textAlign: "right", fontWeight: 700 }}>{fmtPercent(d.pencapaianProgramTotal.pencapaianPercent)}</td>
                </tr>
              </tfoot>
            )}
          </table>
        )}
        <PercentDisplay label="Target penjualan tercapai" value={d.targetPenjualanTercapaiPercent1} />
      </div>

      {/* ===== 01. SALES ===== */}
      <SectionBar>01. TARGET SALES / REALISASI / DEVIASI</SectionBar>
      <div style={{ padding: "6px 4px" }}>
        {isMobile ? (
          <MobileCardListView
            rows={d.salesRows}
            cardTitle={(row) => row.label}
            fields={(row) => [
              { label: "Target Sales (Bks)", value: fmtCell(row.targetSalesBks) },
              { label: "Potongan / Bks", value: formatRupiah(row.potonganPerBks ?? 0) },
              { label: "Nominal", value: formatRupiah(row.nominal ?? 0) },
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
              {d.salesRows.map((row, i) => (
                <tr key={i}>
                  <td style={{ ...cellBase, fontWeight: 700 }}>{row.label}</td>
                  <td style={{ ...cellBase, textAlign: "right" }}>{fmtCell(row.targetSalesBks)}</td>
                  <td style={{ ...cellBase, textAlign: "right" }}>{formatRupiah(row.potonganPerBks ?? 0)}</td>
                  <td style={{ ...cellBase, textAlign: "right", background: C.yellow, fontWeight: 700 }}>{formatRupiah(row.nominal ?? 0)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        <PercentDisplay label="Target penjualan tercapai" value={d.targetPenjualanTercapaiPercent2} />
      </div>

      {/* ===== 02. WS MINGGUAN ===== */}
      <SectionBar>02. TOTAL PENCAPAIAN PROGRAM (WS MINGGUAN)</SectionBar>
      <div style={{ padding: "6px 4px" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr>
              <GreenTh minWidth={80}>WS</GreenTh>
              {weekLabels.map((label, wi) => (
                <React.Fragment key={wi}>
                  <GreenTh minWidth={90} align="right">{`Target ${label}`}</GreenTh>
                  <GreenTh minWidth={90} align="right">{`Actual ${label}`}</GreenTh>
                  <GreenTh minWidth={80} align="right">{`Pencapaian ${label}`}</GreenTh>
                </React.Fragment>
              ))}
              <GreenTh minWidth={100} align="right">Total Target</GreenTh>
              <GreenTh minWidth={100} align="right">Bonus/Bks</GreenTh>
              <GreenTh minWidth={140}>KET</GreenTh>
            </tr>
          </thead>
          <tbody>
            {d.wsRows.map((row, i) => (
              <tr key={i}>
                <td style={cellBase}>{fmtCell(row.ws)}</td>
                {weekLabels.map((_, wi) => (
                  <React.Fragment key={wi}>
                    <td style={{ ...cellBase, textAlign: "right" }}>{fmtCell(row.weeks?.[wi]?.target)}</td>
                    <td style={{ ...cellBase, textAlign: "right" }}>{fmtCell(row.weeks?.[wi]?.actual)}</td>
                    <td style={{ ...cellBase, textAlign: "right" }}>{fmtPercent(row.weeks?.[wi]?.pencapaianPercent)}</td>
                  </React.Fragment>
                ))}
                <td style={{ ...cellBase, textAlign: "right" }}>{formatRupiah(row.totalTarget ?? 0)}</td>
                <td style={{ ...cellBase, textAlign: "right" }}>{formatRupiah(row.bonusPerBks ?? 0)}</td>
                <td style={cellBase}>{fmtCell(row.keterangan)}</td>
              </tr>
            ))}
          </tbody>
          {d.wsTotal && (
            <tfoot>
              <tr>
                <td style={{ ...cellBase, background: C.totalRow, fontWeight: 700 }}>TOTAL</td>
                {weekLabels.map((_, wi) => (
                  <React.Fragment key={wi}>
                    <td style={{ ...cellBase, background: C.totalRow, textAlign: "right" }}>{fmtCell(d.wsTotal!.weeks?.[wi]?.target)}</td>
                    <td style={{ ...cellBase, background: C.totalRow, textAlign: "right" }}>{fmtCell(d.wsTotal!.weeks?.[wi]?.actual)}</td>
                    <td style={{ ...cellBase, background: C.totalRow, textAlign: "right" }}>{fmtPercent(d.wsTotal!.weeks?.[wi]?.pencapaianPercent)}</td>
                  </React.Fragment>
                ))}
                <td style={{ ...cellBase, background: C.totalRow, textAlign: "right", fontWeight: 700 }}>{formatRupiah(d.wsTotal.totalTarget ?? 0)}</td>
                <td style={{ ...cellBase, background: C.totalRow, textAlign: "right" }}>{formatRupiah(d.wsTotal.bonusPerBks ?? 0)}</td>
                <td style={{ ...cellBase, background: C.totalRow }}>{fmtCell(d.wsTotal.keterangan)}</td>
              </tr>
            </tfoot>
          )}
        </table>
        <PercentDisplay label="Target penjualan tercapai" value={d.targetPenjualanTercapaiPercent3} />
      </div>

      {/* ===== 02. BIAYA ===== */}
      <SectionBar>02. BIAYA PENGAJUAN / REALISASI / DEVIASI</SectionBar>
      <div style={{ padding: "6px 4px" }}>
        {isMobile ? (
          <MobileCardListView
            rows={d.biayaRows}
            cardTitle={(row) => row.label}
            fields={(row) => [
              { label: "Biaya Promosi", value: formatRupiah(row.biayaPromosi ?? 0) },
              { label: "Jasa Perorangan", value: formatRupiah(row.jasaPerorangan ?? 0) },
              { label: "Biaya POSM", value: formatRupiah(row.biayaPosm ?? 0) },
              { label: "Trial Taste", value: formatRupiah(row.trialTaste ?? 0) },
              { label: "Total Biaya", value: formatRupiah(row.totalBiaya ?? 0) },
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
              {d.biayaRows.map((row, i) => (
                <tr key={i}>
                  <td style={{ ...cellBase, fontWeight: 700 }}>{row.label}</td>
                  <td style={{ ...cellBase, textAlign: "right" }}>{formatRupiah(row.biayaPromosi ?? 0)}</td>
                  <td style={{ ...cellBase, textAlign: "right" }}>{formatRupiah(row.jasaPerorangan ?? 0)}</td>
                  <td style={{ ...cellBase, textAlign: "right" }}>{formatRupiah(row.biayaPosm ?? 0)}</td>
                  <td style={{ ...cellBase, textAlign: "right" }}>{formatRupiah(row.trialTaste ?? 0)}</td>
                  <td style={{ ...cellBase, textAlign: "right", background: C.yellow, fontWeight: 700 }}>{formatRupiah(row.totalBiaya ?? 0)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        <PercentDisplay label="Total Biaya terpakai" value={d.totalBiayaTerpakaiPercent} />
      </div>

      {/* ===== BREAKDOWN BIAYA ===== */}
      <SectionBar>BREAKDOWN BIAYA</SectionBar>
      <div style={{ padding: "6px 4px" }}>
        {renderBreakdownTable(d.biayaPromosiBreakdown, "Biaya Promosi terdiri atas")}
        <div style={{ height: 12 }} />
        {renderBreakdownTable(d.trialTasteBreakdown, "Trial Taste terdiri atas")}
      </div>

      {/* ===== 03. EVALUASI PROGRAM / KENDALA / PLAN SELANJUTNYA ===== */}
      <SectionBar>03. EVALUASI PROGRAM</SectionBar>
      <NumberedListView items={d.evaluasiProgram} />

      <SectionBar>KENDALA</SectionBar>
      <NumberedListView items={d.kendala} />

      <SectionBar>PLAN SELANJUTNYA</SectionBar>
      <NumberedListView items={d.planSelanjutnya} />

      {/* ===== TANDA TANGAN ===== */}
      <SectionBar>TANDA TANGAN</SectionBar>
      {isMobile ? (
        <div style={{ display: "flex", flexDirection: "column", gap: 10, padding: "8px" }}>
          {(d.signatures ?? []).map((sig, i) => (
            <div key={i} style={{ border: `1px solid ${C.border}`, borderRadius: 8, padding: "8px 10px" }}>
              <div style={{ fontWeight: 700, marginBottom: 6, fontSize: 13 }}>{sig.label}</div>
              <div style={{ fontSize: 12, color: "#555" }}>Tanggal: {fmtCell(sig.tanggal)}</div>
              <div style={{ fontSize: 12, color: "#555" }}>Nama: {fmtCell(sig.nama)}</div>
              <div style={{ fontSize: 12, color: "#555" }}>Jabatan: {fmtCell(sig.jabatan)}</div>
            </div>
          ))}
        </div>
      ) : (
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <tbody>
            <tr>
              {(d.signatures ?? []).map((sig, i) => (
                <td key={i} style={{ ...cellBase, verticalAlign: "top", width: `${100 / (d.signatures?.length || 1)}%` }}>
                  <div style={{ fontWeight: 700, marginBottom: 6 }}>{sig.label}</div>
                  <div style={{ fontSize: 12 }}>Tanggal: {fmtCell(sig.tanggal)}</div>
                  <div style={{ fontSize: 12 }}>Nama: {fmtCell(sig.nama)}</div>
                  <div style={{ fontSize: 12 }}>Jabatan: {fmtCell(sig.jabatan)}</div>
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