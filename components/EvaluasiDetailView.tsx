"use client";

import React from "react";
import type { EvaluasiSheet } from "@/lib/parseActionsPlan";

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
  if (v === null || v === undefined || v === 0) return "-";
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

// ---- Mobile helpers (card per baris, biar konsisten dengan ActionPlanDetailView) ----
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
    return (
      <div style={{ padding: "10px", textAlign: "center", fontSize: 13, color: "#888" }}>Tidak ada data</div>
    );
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

function MobileSummaryListView({ rows }: { rows: { label: string; value: React.ReactNode }[] }) {
  return (
    <table style={{ width: "100%", borderCollapse: "collapse" }}>
      <tbody>
        {rows.map((r, i) => (
          <tr key={i}>
            <td style={{ ...cellBase, textAlign: "right", fontWeight: 700, background: C.totalRow }}>{r.label}</td>
            <td style={{ ...cellBase, textAlign: "right", fontWeight: 700, background: C.yellow }}>{r.value}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

/**
 * Versi READ-ONLY dari evaluasireplica.tsx (yang editable, dipakai di EntriAP).
 * Dipakai di halaman Data / Detail View — supaya evaluasi (sheet ke-3) ikut
 * tampil, bukan cuma bisa dilihat pas edit di menu Entri.
 */
export default function EvaluasiDetailView({
  evaluasi,
  formatRupiah,
  isMobile = false,
}: {
  evaluasi: EvaluasiSheet | null | undefined;
  formatRupiah: (v: number) => string;
  isMobile?: boolean;
}) {
  if (!evaluasi) {
    return (
      <div>
        <SectionBar>EVALUASI ACTION PLAN</SectionBar>
        <div style={{ padding: 14, fontSize: 13, color: "#888" }}>
          Belum ada data evaluasi untuk action plan ini.
        </div>
      </div>
    );
  }

  const ev = evaluasi;
  const totalTargetEvent = (ev.targetEvent ?? []).reduce((s, r) => s + (r.totalTargetPenjualan || 0), 0);
  const totalRealisasiEvent = (ev.realisasiEvent ?? []).reduce((s, r) => s + (r.totalTargetPenjualan || 0), 0);

  const renderEventTable = (rows: typeof ev.targetEvent, withJenisTarget: boolean, total: number) => {
    if (isMobile) {
      return (
        <>
          <MobileCardListView
            rows={rows ?? []}
            cardTitle={(row) => row.brand || "-"}
            fields={(row) => {
              const f = [] as { label: string; value: React.ReactNode }[];
              if (withJenisTarget) {
                f.push({ label: "Jenis Program", value: fmtCell(row.jenisProgram) });
                f.push({ label: "Target", value: fmtCell(row.target) });
              }
              f.push({ label: "QTY (Bks)", value: fmtCell(row.qty) });
              f.push({ label: "Harga / Bks (CBP)", value: formatRupiah(row.hargaBks ?? 0) });
              f.push({ label: "%", value: fmtPercent(row.persen) });
              f.push({ label: "Total Target Penjualan", value: formatRupiah(row.totalTargetPenjualan ?? 0) });
              return f;
            }}
          />
          {!!(rows ?? []).length && (
            <div style={{ marginTop: 8 }}>
              <MobileSummaryListView rows={[{ label: "Total", value: formatRupiah(total) }]} />
            </div>
          )}
        </>
      );
    }
    return (
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
          </tr>
        </thead>
        <tbody>
          {(rows ?? []).map((row, i) => (
            <tr key={i}>
              {withJenisTarget && <td style={cellBase}>{fmtCell(row.jenisProgram)}</td>}
              {withJenisTarget && <td style={cellBase}>{fmtCell(row.target)}</td>}
              <td style={cellBase}>{fmtCell(row.brand)}</td>
              <td style={{ ...cellBase, textAlign: "right" }}>{fmtCell(row.qty)}</td>
              <td style={{ ...cellBase, textAlign: "right" }}>{formatRupiah(row.hargaBks ?? 0)}</td>
              <td style={{ ...cellBase, textAlign: "right" }}>{fmtPercent(row.persen)}</td>
              <td style={{ ...cellBase, textAlign: "right" }}>{formatRupiah(row.totalTargetPenjualan ?? 0)}</td>
            </tr>
          ))}
        </tbody>
        {!!(rows ?? []).length && (
          <tfoot>
            <tr>
              <td colSpan={withJenisTarget ? 6 : 4} style={{ ...cellBase, background: C.totalRow, textAlign: "right", fontWeight: 700 }}>
                Total
              </td>
              <td style={{ ...cellBase, background: C.yellow, fontWeight: 700, textAlign: "right" }}>
                {formatRupiah(total)}
              </td>
            </tr>
          </tfoot>
        )}
      </table>
    );
  };

  return (
    <div style={{ background: C.white, fontFamily: "Calibri, Arial, sans-serif", color: C.text }}>
      {/* ===== 01. TARGET & REALISASI EVENT ===== */}
      <SectionBar>01. TARGET DAN REALISASI EVENT</SectionBar>
      <div style={{ padding: "6px 4px" }}>
        <SubHeading>Target untuk Event atau Sejenisnya</SubHeading>
        {renderEventTable(ev.targetEvent, true, totalTargetEvent)}

        <div style={{ height: 10 }} />

        <SubHeading>Realisasi Target untuk Event</SubHeading>
        {renderEventTable(ev.realisasiEvent, false, totalRealisasiEvent)}

        <SubHeading>Penjelasan Deviasi (Target vs Realisasi)</SubHeading>
        <NumberedListView items={ev.penjelasanTargetEvent} />
      </div>

      {/* ===== 02. ANGGARAN BIAYA PROMOSI ===== */}
      <SectionBar>02. ANGGARAN BIAYA PROMOSI</SectionBar>
      <div style={{ padding: "6px 4px" }}>
        {isMobile ? (
          <MobileCardListView
            rows={ev.anggaran ?? []}
            cardTitle={(row) => row.label}
            fields={(row) => [
              { label: "Biaya Promosi", value: formatRupiah(row.biayaPromosi ?? 0) },
              { label: "Biaya POSM", value: formatRupiah(row.biayaPosm ?? 0) },
              { label: "Biaya Sampling", value: formatRupiah(row.biayaSampling ?? 0) },
              { label: "Total Biaya", value: formatRupiah(row.totalBiaya ?? 0) },
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
              {(ev.anggaran ?? []).map((row, i) => (
                <tr key={i}>
                  <td style={{ ...cellBase, fontWeight: 700 }}>{row.label}</td>
                  <td style={{ ...cellBase, textAlign: "right" }}>{formatRupiah(row.biayaPromosi ?? 0)}</td>
                  <td style={{ ...cellBase, textAlign: "right" }}>{formatRupiah(row.biayaPosm ?? 0)}</td>
                  <td style={{ ...cellBase, textAlign: "right" }}>{formatRupiah(row.biayaSampling ?? 0)}</td>
                  <td style={{ ...cellBase, textAlign: "right", background: C.yellow, fontWeight: 700 }}>{formatRupiah(row.totalBiaya ?? 0)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        <SubHeading>Penjelasan Deviasi Anggaran</SubHeading>
        <NumberedListView items={ev.penjelasanAnggaran} />
      </div>

      {/* ===== 03. SAMPLING ===== */}
      <SectionBar>03. SAMPLING</SectionBar>
      <div style={{ padding: "6px 4px" }}>
        {(ev.samplingGroups ?? []).map((group, gi) => (
          <div key={gi} style={{ marginBottom: 10 }}>
            <SubHeading>{group.label}</SubHeading>
            {isMobile ? (
              <MobileCardListView
                rows={group.items ?? []}
                cardTitle={(row) => row.brand || "-"}
                fields={(row) => [
                  { label: "Kebutuhan", value: fmtCell(row.kebutuhan) },
                  { label: "Harga / Bks", value: formatRupiah(row.hargaBks ?? 0) },
                  { label: "Nominal", value: formatRupiah(row.nominal ?? 0) },
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
                  </tr>
                </thead>
                <tbody>
                  {(group.items ?? []).map((row, ii) => (
                    <tr key={ii}>
                      <td style={cellBase}>{fmtCell(row.brand)}</td>
                      <td style={{ ...cellBase, textAlign: "right" }}>{fmtCell(row.kebutuhan)}</td>
                      <td style={{ ...cellBase, textAlign: "right" }}>{formatRupiah(row.hargaBks ?? 0)}</td>
                      <td style={{ ...cellBase, textAlign: "right" }}>{formatRupiah(row.nominal ?? 0)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        ))}

        {ev.samplingDeviasi && (
          <>
            <SubHeading>Deviasi</SubHeading>
            {isMobile ? (
              <MobileSummaryListView
                rows={[
                  { label: "Brand", value: fmtCell(ev.samplingDeviasi.brand) },
                  { label: "Kebutuhan", value: fmtCell(ev.samplingDeviasi.kebutuhan) },
                  { label: "Harga / Bks", value: formatRupiah(ev.samplingDeviasi.hargaBks ?? 0) },
                  { label: "Nominal", value: formatRupiah(ev.samplingDeviasi.nominal ?? 0) },
                ]}
              />
            ) : (
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <tbody>
                  <tr>
                    <td style={cellBase}>{fmtCell(ev.samplingDeviasi.brand)}</td>
                    <td style={{ ...cellBase, textAlign: "right" }}>{fmtCell(ev.samplingDeviasi.kebutuhan)}</td>
                    <td style={{ ...cellBase, textAlign: "right" }}>{formatRupiah(ev.samplingDeviasi.hargaBks ?? 0)}</td>
                    <td style={{ ...cellBase, textAlign: "right", background: C.yellow, fontWeight: 700 }}>{formatRupiah(ev.samplingDeviasi.nominal ?? 0)}</td>
                  </tr>
                </tbody>
              </table>
            )}
          </>
        )}

        <SubHeading>Penjelasan Deviasi Sampling</SubHeading>
        <NumberedListView items={ev.penjelasanSampling} />
      </div>

      {/* ===== EVALUASI PROGRAM ===== */}
      <SectionBar>EVALUASI PROGRAM</SectionBar>
      <NumberedListView items={ev.evaluasiProgram} />

      {/* ===== TANDA TANGAN ===== */}
      <SectionBar>TANDA TANGAN</SectionBar>
      {isMobile ? (
        <div style={{ display: "flex", flexDirection: "column", gap: 10, padding: 8 }}>
          {(ev.signatures ?? []).map((sig, i) => (
            <div key={i} style={{ border: `1px solid ${C.border}`, borderRadius: 8, padding: "8px 10px" }}>
              <div style={{ fontWeight: 700, marginBottom: 6, fontSize: 13 }}>{sig.label}</div>
              <div style={{ fontSize: 12 }}>Tanggal: {sig.tanggal ? String(sig.tanggal).slice(0, 10) : "-"}</div>
              <div style={{ fontSize: 12 }}>Nama: {fmtCell(sig.nama)}</div>
              <div style={{ fontSize: 12 }}>Jabatan: {fmtCell(sig.jabatan)}</div>
            </div>
          ))}
        </div>
      ) : (
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <tbody>
            <tr>
              {(ev.signatures ?? []).map((sig, i) => (
                <td key={i} style={{ ...cellBase, verticalAlign: "top", width: `${100 / (ev.signatures?.length || 1)}%` }}>
                  <div style={{ fontWeight: 700, marginBottom: 6 }}>{sig.label}</div>
                  <div style={{ fontSize: 12, marginBottom: 4 }}>Tanggal: {sig.tanggal ? String(sig.tanggal).slice(0, 10) : "-"}</div>
                  <div style={{ fontSize: 12, marginBottom: 4 }}>Nama: {fmtCell(sig.nama)}</div>
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