"use client"

import React from "react";
import ActionPlanMekanismeDetail from "@/components/ActionPlanMekanismeDetail";

const C = {
  yellow: "#FFFF99",
  green: "#D9EAD3",
  greenBorder: "#93C47D",
  blackBar: "#000000",
  blueBar: "#1F4E78",
  orangeBar: "#B45F06",
  orangeCell: "#FFF3D6",
  totalRow: "#D9D9D9",
  border: "#000000",
  text: "#000000",
  white: "#FFFFFF",
  gray: "#666666",
  labelBg: "#F2F2F2",
};

const cellBase: React.CSSProperties = {
  border: `1px solid ${C.border}`,
  padding: "4px 8px",
  fontSize: 13,
  verticalAlign: "middle",
};

function SectionBar({ children, bg = C.blackBar, color = C.white }: { children: React.ReactNode; bg?: string; color?: string }) {
  return (
    <div style={{ background: bg, color, fontWeight: 700, padding: "6px 10px", fontSize: 13, letterSpacing: 0.3 }}>
      {children}
    </div>
  );
}

function GreenTh({ children, minWidth }: { children: React.ReactNode; minWidth?: number }) {
  return (
    <th style={{ ...cellBase, background: C.green, borderColor: C.greenBorder, fontWeight: 700, textAlign: "left", minWidth }}>
      {children}
    </th>
  );
}

function NumberedListView({ value }: { value?: string }) {
  const lines = (value ?? "").split("\n").filter((l) => l.trim() !== "");
  if (!lines.length) return <div style={{ padding: 6, fontSize: 13, color: "#888" }}>-</div>;
  return (
    <ol style={{ margin: 0, padding: "4px 0 4px 20px", fontSize: 13 }}>
      {lines.map((l, i) => (
        <li key={i} style={{ marginBottom: 2 }}>{l}</li>
      ))}
    </ol>
  );
}

// ============================================================
// Helper khusus MOBILE / TABLET (read-only). Semua tetap pakai
// <table> + cellBase supaya garis grid ala Excel tidak hilang,
// hanya disusun 2 kolom (label | value) yang ditumpuk vertikal
// per baris data, bukan tabel lebar dengan banyak kolom.
// ============================================================

function MobileSectionRow({
  no,
  label,
  children,
}: {
  no: string;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <table style={{ width: "100%", borderCollapse: "collapse" }}>
      <tbody>
        <tr>
          <td style={{ ...cellBase, width: 32, textAlign: "center", fontWeight: 700, verticalAlign: "top" }}>{no}</td>
          <td style={{ ...cellBase, fontWeight: 700, verticalAlign: "top" }}>{label}</td>
        </tr>
        <tr>
          <td style={{ ...cellBase, padding: 0 }} colSpan={2}>
            {children}
          </td>
        </tr>
      </tbody>
    </table>
  );
}

function MobileFormFieldsTable({ rows }: { rows: { label: string; value: React.ReactNode }[] }) {
  return (
    <table style={{ width: "100%", borderCollapse: "collapse" }}>
      <tbody>
        {rows.map((r, i) => (
          <tr key={i}>
            <td style={{ ...cellBase, width: 130, fontWeight: 700, background: C.labelBg }}>{r.label}</td>
            <td style={{ ...cellBase, background: C.yellow }}>{r.value ?? "-"}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function EmptyState({ text = "Tidak ada data" }: { text?: string }) {
  return (
    <table style={{ width: "100%", borderCollapse: "collapse" }}>
      <tbody>
        <tr>
          <td style={{ ...cellBase, textAlign: "center", color: "#888", fontStyle: "italic" }}>{text}</td>
        </tr>
      </tbody>
    </table>
  );
}

function MobileCardListView({
  rows,
  cardTitle,
  fields,
}: {
  rows: any[];
  cardTitle: (row: any, i: number) => React.ReactNode;
  fields: (row: any, i: number) => { label: string; value: React.ReactNode }[];
}) {
  if (!rows || !rows.length) return <EmptyState />;
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      {rows.map((row, i) => (
        <table key={row.id ?? i} style={{ width: "100%", borderCollapse: "collapse" }}>
          <tbody>
            <tr>
              <td colSpan={2} style={{ ...cellBase, background: C.green, borderColor: C.greenBorder, fontWeight: 700 }}>
                {cardTitle(row, i)}
              </td>
            </tr>
            {fields(row, i).map((f, fi) => (
              <tr key={fi}>
                <td style={{ ...cellBase, width: "40%", fontWeight: 700, background: C.labelBg }}>{f.label}</td>
                <td style={{ ...cellBase, textAlign: "right" }}>{f.value ?? "-"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      ))}
    </div>
  );
}

function MobileSummaryListView({
  rows,
  bold,
}: {
  rows: { label: string; value: React.ReactNode }[];
  bold?: boolean;
}) {
  return (
    <table style={{ width: "100%", borderCollapse: "collapse" }}>
      <tbody>
        {rows.map((r, i) => (
          <tr key={i}>
            <td
              style={{
                ...cellBase,
                textAlign: "right",
                fontWeight: bold ? 700 : 400,
                background: bold ? C.totalRow : C.white,
              }}
            >
              {r.label}
            </td>
            <td
              style={{
                ...cellBase,
                textAlign: "right",
                fontWeight: bold ? 700 : 400,
                background: bold ? C.yellow : C.white,
              }}
            >
              {r.value}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function MobileCheckList({ items }: { items: [string, boolean][] }) {
  return (
    <table style={{ width: "100%", borderCollapse: "collapse" }}>
      <tbody>
        <tr>
          <td style={{ ...cellBase, padding: 8 }}>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 12, fontSize: 13 }}>
              {items.map(([label, checked]) => (
                <span key={label}>
                  {checked ? "☑" : "☐"} {label}
                </span>
              ))}
            </div>
          </td>
        </tr>
      </tbody>
    </table>
  );
}

// ============================================================
// KOMPONEN UTAMA
// ============================================================
export default function ActionPlanDetailView({
  detail,
  formatRupiah,
  isMobile = false,
}: {
  detail: any;
  formatRupiah: (v: number) => string;
  isMobile?: boolean;
}) {
  const formatDate = (date?: string | null) => {
    if (!date) return "-";
    return new Intl.DateTimeFormat("id-ID", {
      day: "2-digit",
      month: "long",
      year: "2-digit",
      timeZone: "Asia/Jakarta",
    }).format(new Date(date));
  };

  // Hitung selisih hari dari tgl_mulai & tgl_selesai sebagai fallback
  const computeLamaProgram = (mulai: any, selesai: any): number | null => {
    if (!mulai || !selesai) return null;
    const start = new Date(mulai);
    const end = new Date(selesai);
    if (isNaN(start.getTime()) || isNaN(end.getTime())) return null;
    const diffMs = end.getTime() - start.getTime();
    const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24)) + 1; // +1 kalau inklusif hari mulai & selesai
    return diffDays >= 0 ? diffDays : null;
  };

  const lamaProgram = detail.lama_program_hari ?? computeLamaProgram(detail.tgl_mulai, detail.tgl_selesai);

  const totalBiayaPromo = (detail.anggaranBiaya ?? []).reduce((s: number, r: any) => s + (Number(r.totalBiaya) || 0), 0);
  const totalJasaPerorangan = (detail.thl ?? []).reduce((s: number, r: any) => s + (Number(r.estimasiTotal) || 0), 0);
  const totalKebutuhanPosm = (detail.barangPromo ?? []).reduce((s: number, r: any) => s + (Number(r.estimasiTotal) || 0), 0);
  const totalTrialTaste = (detail.brandjln ?? []).reduce((s: number, r: any) => s + (Number(r.Nominal) || 0), 0);
  const grandTotal = totalBiayaPromo + totalJasaPerorangan + totalKebutuhanPosm + totalTrialTaste;

  const totalQtyBks = (detail.TargetEvent ?? []).reduce((s: number, r: any) => s + (Number(r.qty) || 0), 0);
  const totalTargetPenjualan = (detail.TargetEvent ?? []).reduce((s: number, r: any) => s + (Number(r.TargetPenjualan) || 0), 0);
  const totalCostPerPack = totalQtyBks > 0 ? grandTotal / totalQtyBks : 0;
  const totalCostRatio = totalTargetPenjualan > 0 ? grandTotal / totalTargetPenjualan : 0;
  const pct = (v: number) => new Intl.NumberFormat("id-ID", { style: "percent", minimumFractionDigits: 1 }).format(v);

  return (
    <div
      className="flex-1 overflow-y-auto"
      style={{ background: C.white, fontFamily: "Calibri, Arial, sans-serif", color: C.text }}
    >
      {/* ============ HEADER INFO + LOGO ============ */}
      {isMobile ? (
        <div style={{ padding: "10px 12px", borderBottom: `4px solid ${C.blackBar}` }}>
          <div style={{ display: "flex", justifyContent: "center", marginBottom: 8 }}>
            <img src="/logo-cgkn.png" alt="CGKN" width={72} height={72} />
          </div>
          <MobileFormFieldsTable
            rows={[
              { label: "NO. ACTION PLAN", value: detail.no_action_plan },
              { label: "PERWAKILAN/AGEN", value: detail.perwakilan_agen },
              { label: "BRAND", value: detail.brand },
              { label: "NAMA PROGRAM", value: detail.nama_program },
              { label: "JENIS PROGRAM", value: detail.jenis_program },
              { label: "LOKASI PROGRAM", value: detail.lokasi_program },
              { label: "TGL. PELAKSANAAN", value: `${formatDate(detail.tgl_mulai)} s/d ${formatDate(detail.tgl_selesai)}` },
              { label: "DITUJUKAN KPD.", value: detail.ditujukan_kepada },
              { label: "TEMBUSAN / Cc.", value: detail.tembusan },
            ]}
          />
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <tbody>
              <tr>
                <td style={{ ...cellBase, width: 80, background: C.yellow, textAlign: "center", fontWeight: 700 }}>
                  {lamaProgram ?? "-"}
                </td>
                <td style={{ ...cellBase, fontWeight: 700 }}>Hari</td>
              </tr>
              <tr>
                <td style={{ ...cellBase, fontWeight: 700, textAlign: "center" }}>TOTAL BIAYA</td>
                <td style={{ ...cellBase, background: C.yellow, fontWeight: 700, textAlign: "right" }}>
                  {formatRupiah(detail.total_biaya ?? grandTotal)}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      ) : (
        <>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <tbody>
              <tr>
                <td style={{ ...cellBase, fontWeight: 700, width: 180 }}>NO. ACTION PLAN</td>
                <td style={{ ...cellBase, background: C.yellow }}>{detail.no_action_plan ?? "-"}</td>
                <td rowSpan={9} style={{ ...cellBase, width: 520, verticalAlign: "top", textAlign: "center" }}>
                  <div style={{ height: 200, display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <img src="/logo-cgkn.png" alt="CGKN" width={140} height={140} />
                  </div>
                </td>
              </tr>
              <tr>
                <td style={{ ...cellBase, fontWeight: 700 }}>PERWAKILAN/AGEN</td>
                <td style={{ ...cellBase, background: C.yellow }}>{detail.perwakilan_agen ?? "-"}</td>
              </tr>
              <tr>
                <td style={{ ...cellBase, fontWeight: 700 }}>BRAND</td>
                <td style={{ ...cellBase, background: C.yellow }}>{detail.brand ?? "-"}</td>
              </tr>
              <tr>
                <td style={{ ...cellBase, fontWeight: 700 }}>NAMA PROGRAM</td>
                <td style={{ ...cellBase, background: C.yellow }}>{detail.nama_program ?? "-"}</td>
              </tr>
              <tr>
                <td style={{ ...cellBase, fontWeight: 700 }}>JENIS PROGRAM</td>
                <td style={{ ...cellBase, background: C.yellow }}>{detail.jenis_program ?? "-"}</td>
              </tr>
              <tr>
                <td style={{ ...cellBase, fontWeight: 700 }}>LOKASI PROGRAM</td>
                <td style={{ ...cellBase, background: C.yellow }}>{detail.lokasi_program ?? "-"}</td>
              </tr>
              <tr>
                <td style={{ ...cellBase, fontWeight: 700 }}>TGL. PELAKSANAAN</td>
                <td style={{ ...cellBase, background: C.yellow }}>
                  {formatDate(detail.tgl_mulai)} s/d {formatDate(detail.tgl_selesai) || "-"}
                </td>
              </tr>
              <tr>
                <td style={{ ...cellBase, fontWeight: 700 }}>DITUJUKAN KPD.</td>
                <td style={{ ...cellBase, background: C.yellow }}>{detail.ditujukan_kepada ?? "-"}</td>
              </tr>
              <tr>
                <td style={{ ...cellBase, fontWeight: 700 }}>TEMBUSAN / Cc.</td>
                <td style={{ ...cellBase, background: C.yellow }}>{detail.tembusan ?? "-"}</td>
              </tr>
              <tr>
                <td style={{ ...cellBase }} colSpan={2}></td>
              </tr>
            </tbody>
          </table>

          {/* LAMA PROGRAM + TOTAL BIAYA */}
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <tbody>
              <tr>
                <td style={{ ...cellBase, width: 80, background: C.yellow, textAlign: "center", fontWeight: 700 }}>
                  {lamaProgram ?? "-"}
                </td>
                <td style={{ ...cellBase, fontWeight: 700 }}>Hari</td>
                <td style={{ ...cellBase, fontWeight: 700, textAlign: "center" }}>TOTAL BIAYA</td>
                <td style={{ ...cellBase, background: C.yellow, fontWeight: 700, textAlign: "right" }}>
                  {formatRupiah(detail.total_biaya ?? grandTotal)}
                </td>
              </tr>
            </tbody>
          </table>
        </>
      )}

      {/* ============ DESKRIPSI PROGRAM PROMOSI ============ */}
      <SectionBar>DESKRIPSI PROGRAM PROMOSI</SectionBar>

      {isMobile ? (
        <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          <MobileSectionRow no="01" label="LATAR BELAKANG PROGRAM">
            <NumberedListView value={detail.LatarBelakang} />
          </MobileSectionRow>

          <MobileSectionRow no="02" label="OBJEKTIF PROGRAM">
            <NumberedListView value={detail.Objektif} />
          </MobileSectionRow>

          {/* 03 TARGET PROGRAM */}
          <MobileSectionRow no="03" label="TARGET PROGRAM">
            {detail.uraian && (
              <div style={{ padding: 8, whiteSpace: "pre-wrap", fontSize: 13, borderBottom: `1px dashed ${C.border}` }}>
                {detail.uraian}
              </div>
            )}
            <div style={{ padding: 6 }}>
              <MobileCardListView
                rows={detail.TargetProgram ?? []}
                cardTitle={(row) => row.brand || "-"}
                fields={(row) => [
                  { label: "WBP", value: formatRupiah(row.wbp ?? 0) },
                  { label: "RBP", value: formatRupiah(row.rbp ?? 0) },
                  { label: "CBP", value: formatRupiah(row.cbp ?? 0) },
                  { label: "Estimasi Sales / week", value: row.estimasiSales ?? "-" },
                ]}
              />
            </div>
          </MobileSectionRow>

          {/* 04 TARGET EVENT */}
          <MobileSectionRow no="04" label="TARGET EVENT ATAU SEJENISNYA">
            <div style={{ padding: 6 }}>
              <MobileCardListView
                rows={detail.TargetEvent ?? []}
                cardTitle={(row) => row.brand || row.JenisProgram || "-"}
                fields={(row) => [
                  { label: "Jenis Program", value: row.JenisProgram ?? "-" },
                  { label: "Target", value: row.target ?? "-" },
                  { label: "QTY (Bks)", value: row.qty ?? "-" },
                  { label: "Harga / Bks", value: formatRupiah(row.harga ?? 0) },
                  { label: "Target Penjualan", value: formatRupiah(row.TargetPenjualan ?? 0) },
                ]}
              />
              {!!(detail.TargetEvent ?? []).length && (
                <div style={{ marginTop: 8 }}>
                  <MobileSummaryListView
                    bold
                    rows={[
                      {
                        label: "Total Target Penjualan",
                        value: formatRupiah(detail.TargetEvent.reduce((s: number, r: any) => s + (r.TargetPenjualan || 0), 0)),
                      },
                    ]}
                  />
                </div>
              )}
            </div>
          </MobileSectionRow>

          {/* 05 DATA DISTRIBUSI */}
          <MobileSectionRow no="05" label="DATA DISTRIBUSI">
            <div style={{ padding: 6 }}>
              <MobileCardListView
                rows={detail.DataDistribusi ?? []}
                cardTitle={(row) => row.wilayah || "-"}
                fields={(row) => [
                  { label: "Outlet", value: row.outlet ?? "-" },
                  { label: "Availability", value: row.avaibility ?? "-" },
                  { label: "Visibility", value: row.visibility ?? "-" },
                  { label: "Avg", value: row.avg ?? "-" },
                  { label: "Status", value: row.status ?? "-" },
                  { label: "Keterangan", value: row.keterangan ?? "-" },
                ]}
              />
            </div>
          </MobileSectionRow>

          {/* 06 MEKANISME PROGRAM */}
          <MobileSectionRow no="06" label="MEKANISME PROGRAM">
            <div style={{ padding: 6 }}>
              <NumberedListView value={detail.Mekanisme} />
              <div style={{ marginTop: 8, borderTop: `1px dashed ${C.border}`, paddingTop: 8, overflowX: "auto" }}>
                <ActionPlanMekanismeDetail detail={detail.mekanismeDetail} formatRupiah={formatRupiah} />
              </div>
            </div>
          </MobileSectionRow>

          {/* 07 PELAKSANA PROGRAM */}
          <MobileSectionRow no="07" label="PELAKSANA PROGRAM">
            <MobileCheckList
              items={[
                ["Tim Promosi", !!detail.pelaksana_tim_promosi],
                ["EO", !!detail.pelaksana_eo],
                ["Tim Distribusi", !!detail.pelaksana_tim_distribusi],
                ["Lain2", !!detail.pelaksana_lain],
              ]}
            />
          </MobileSectionRow>
        </div>
      ) : (
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <tbody>
            <tr>
              <td style={{ ...cellBase, width: 32, textAlign: "center", fontWeight: 700, verticalAlign: "top" }}>01</td>
              <td style={{ ...cellBase, width: 150, fontWeight: 700, verticalAlign: "top" }}>LATAR BELAKANG PROGRAM</td>
              <td style={{ ...cellBase, padding: 0 }} colSpan={20}>
                <NumberedListView value={detail.LatarBelakang} />
              </td>
            </tr>
            <tr>
              <td style={{ ...cellBase, textAlign: "center", fontWeight: 700, verticalAlign: "top" }}>02</td>
              <td style={{ ...cellBase, fontWeight: 700, verticalAlign: "top" }}>OBJEKTIF PROGRAM</td>
              <td style={{ ...cellBase, padding: 0 }} colSpan={20}>
                <NumberedListView value={detail.Objektif} />
              </td>
            </tr>

            {/* 03 TARGET PROGRAM */}
            <tr>
              <td style={{ ...cellBase, textAlign: "center", fontWeight: 700, verticalAlign: "top" }}>03</td>
              <td style={{ ...cellBase, fontWeight: 700, verticalAlign: "top" }}>TARGET PROGRAM</td>
              <td style={{ ...cellBase, padding: 8 }} colSpan={20}>
                {detail.uraian && (
                  <div style={{ marginBottom: 8, whiteSpace: "pre-wrap", fontSize: 13 }}>{detail.uraian}</div>
                )}
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead>
                    <tr>
                      <GreenTh minWidth={140}>BRAND</GreenTh>
                      <GreenTh minWidth={100}>WBP</GreenTh>
                      <GreenTh minWidth={100}>RBP</GreenTh>
                      <GreenTh minWidth={100}>CBP</GreenTh>
                      <GreenTh minWidth={120}>Estimasi Sales / week</GreenTh>
                    </tr>
                  </thead>
                  <tbody>
                    {(detail.TargetProgram ?? []).map((row: any, i: number) => (
                      <tr key={row.id ?? i}>
                        <td style={cellBase}>{row.brand ?? "-"}</td>
                        <td style={{ ...cellBase, textAlign: "right" }}>{formatRupiah(row.wbp ?? 0)}</td>
                        <td style={{ ...cellBase, textAlign: "right" }}>{formatRupiah(row.rbp ?? 0)}</td>
                        <td style={{ ...cellBase, textAlign: "right" }}>{formatRupiah(row.cbp ?? 0)}</td>
                        <td style={{ ...cellBase, textAlign: "right" }}>{row.estimasiSales ?? "-"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
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
                    </tr>
                  </thead>
                  <tbody>
                    {(detail.TargetEvent ?? []).map((row: any, i: number) => (
                      <tr key={row.id ?? i}>
                        <td style={cellBase}>{row.JenisProgram ?? "-"}</td>
                        <td style={cellBase}>{row.target ?? "-"}</td>
                        <td style={cellBase}>{row.brand ?? "-"}</td>
                        <td style={{ ...cellBase, textAlign: "right" }}>{row.qty ?? "-"}</td>
                        <td style={{ ...cellBase, textAlign: "right" }}>{formatRupiah(row.harga ?? 0)}</td>
                        <td style={{ ...cellBase, textAlign: "right" }}>{formatRupiah(row.TargetPenjualan ?? 0)}</td>
                      </tr>
                    ))}
                  </tbody>
                  {!!(detail.TargetEvent ?? []).length && (
                    <tfoot>
                      <tr>
                        <td colSpan={5} style={{ ...cellBase, textAlign: "center", fontWeight: 700 }}>Total</td>
                        <td style={{ ...cellBase, textAlign: "right", fontWeight: 700 }}>
                          {formatRupiah(detail.TargetEvent.reduce((s: number, r: any) => s + (r.TargetPenjualan || 0), 0))}
                        </td>
                      </tr>
                    </tfoot>
                  )}
                </table>
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
                      <GreenTh minWidth={160}>AREA / DISTRIK</GreenTh>
                      <GreenTh minWidth={80}>OUTLET</GreenTh>
                      <GreenTh minWidth={100}>AVAILABILITY</GreenTh>
                      <GreenTh minWidth={90}>VISIBILITY</GreenTh>
                      <GreenTh minWidth={70}>AVG</GreenTh>
                      <GreenTh minWidth={100}>STATUS</GreenTh>
                      <GreenTh minWidth={140}>KETERANGAN</GreenTh>
                    </tr>
                  </thead>
                  <tbody>
                    {(detail.DataDistribusi ?? []).map((row: any, i: number) => (
                      <tr key={row.id ?? i}>
                        <td style={cellBase}>{row.wilayah ?? "-"}</td>
                        <td style={{ ...cellBase, textAlign: "right" }}>{row.outlet ?? "-"}</td>
                        <td style={{ ...cellBase, textAlign: "right" }}>{row.avaibility ?? "-"}</td>
                        <td style={{ ...cellBase, textAlign: "right" }}>{row.visibility ?? "-"}</td>
                        <td style={{ ...cellBase, textAlign: "right" }}>{row.avg ?? "-"}</td>
                        <td style={{ ...cellBase, background: C.orangeCell }}>{row.status ?? "-"}</td>
                        <td style={cellBase}>{row.keterangan ?? "-"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </td>
            </tr>

            {/* 06 MEKANISME PROGRAM */}
            <tr>
              <td style={{ ...cellBase, textAlign: "center", fontWeight: 700, verticalAlign: "top" }}>06</td>
              <td style={{ ...cellBase, fontWeight: 700, verticalAlign: "top" }}>MEKANISME PROGRAM</td>
              <td style={{ ...cellBase, padding: 0 }} colSpan={20}>
                <NumberedListView value={detail.Mekanisme} />
                <ActionPlanMekanismeDetail detail={detail.mekanismeDetail} formatRupiah={formatRupiah} />
              </td>
            </tr>

            {/* 07 PELAKSANA PROGRAM */}
            <tr>
              <td style={{ ...cellBase, textAlign: "center", fontWeight: 700 }}>07</td>
              <td style={{ ...cellBase, fontWeight: 700 }}>PELAKSANA PROGRAM</td>
              <td style={{ ...cellBase, padding: 8 }} colSpan={20}>
                <div style={{ fontSize: 13, display: "flex", flexWrap: "wrap", gap: 16 }}>
                  {[
                    ["Tim Promosi", detail.pelaksana_tim_promosi],
                    ["EO", detail.pelaksana_eo],
                    ["Tim Distribusi", detail.pelaksana_tim_distribusi],
                    ["Lain2", detail.pelaksana_lain],
                  ].map(([label, checked]) => (
                    <span key={label as string}>
                      {checked ? "☑" : "☐"} {label}
                    </span>
                  ))}
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      )}

      {/* ============ ANGGARAN BIAYA PROMOSI ============ */}
      <SectionBar>ANGGARAN BIAYA PROMOSI YANG DIAJUKAN</SectionBar>
      {isMobile ? (
        <div style={{ padding: "4px 6px" }}>
          <MobileCardListView
            rows={detail.anggaranBiaya ?? []}
            cardTitle={(row, i) => row.uraian || `Item ${i + 1}`}
            fields={(row) => [
              { label: "QTY", value: row.qty ?? "-" },
              { label: "Satuan", value: row.satuan ?? "-" },
              { label: "Harga / Unit", value: formatRupiah(row.hargaUnit ?? 0) },
              { label: "Total Biaya", value: formatRupiah(row.totalBiaya ?? 0) },
            ]}
          />
          {!!(detail.anggaranBiaya ?? []).length && (
            <div style={{ marginTop: 8 }}>
              <MobileSummaryListView bold rows={[{ label: "TOTAL BIAYA PROMOSI", value: formatRupiah(totalBiayaPromo) }]} />
            </div>
          )}
        </div>
      ) : (
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr>
              <GreenTh minWidth={30}>No.</GreenTh>
              <GreenTh minWidth={220}>URAIAN</GreenTh>
              <GreenTh minWidth={70}>QTY</GreenTh>
              <GreenTh minWidth={90}>SATUAN</GreenTh>
              <GreenTh minWidth={110}>Harga / Unit</GreenTh>
              <GreenTh minWidth={110}>TOTAL BIAYA</GreenTh>
            </tr>
          </thead>
          <tbody>
            {(detail.anggaranBiaya ?? []).map((row: any, i: number) => (
              <tr key={row.id ?? i}>
                <td style={{ ...cellBase, textAlign: "center" }}>{i + 1}</td>
                <td style={cellBase}>{row.uraian ?? "-"}</td>
                <td style={{ ...cellBase, textAlign: "right" }}>{row.qty ?? "-"}</td>
                <td style={cellBase}>{row.satuan ?? "-"}</td>
                <td style={{ ...cellBase, textAlign: "right" }}>{formatRupiah(row.hargaUnit ?? 0)}</td>
                <td style={{ ...cellBase, textAlign: "right" }}>{formatRupiah(row.totalBiaya ?? 0)}</td>
              </tr>
            ))}
          </tbody>
          {!!(detail.anggaranBiaya ?? []).length && (
            <tfoot>
              <tr>
                <td colSpan={5} style={{ ...cellBase, background: C.totalRow, textAlign: "right", fontWeight: 700 }}>
                  TOTAL BIAYA PROMOSI
                </td>
                <td style={{ ...cellBase, background: C.yellow, fontWeight: 700, textAlign: "right" }}>
                  {formatRupiah(totalBiayaPromo)}
                </td>
              </tr>
            </tfoot>
          )}
        </table>
      )}

      {/* ============ TENAGA KERJA LEPAS ============ */}
      <SectionBar bg={C.blueBar}>
        Tenaga Kerja Lepas (Jasa Perorangan yang direkrut/dipekerjakan secara langsung TANPA melalui pihak ketiga)
      </SectionBar>
      {isMobile ? (
        <div style={{ padding: "4px 6px" }}>
          <MobileCardListView
            rows={detail.thl ?? []}
            cardTitle={(row, i) => row.jasaperorg || `Tenaga ${i + 1}`}
            fields={(row) => [
              { label: "Jumlah Tenaga", value: row.jumlahtng ?? "-" },
              { label: "Hari Kerja", value: row.harikerja ?? "-" },
              { label: "Imbalan / Hari", value: formatRupiah(row.imbalanperhari ?? 0) },
              { label: "Total Imbalan", value: formatRupiah(row.estimasiTotal ?? 0) },
            ]}
          />
          {!!(detail.thl ?? []).length && (
            <div style={{ marginTop: 8 }}>
              <MobileSummaryListView bold rows={[{ label: "TOTAL BIAYA JASA PERORANGAN", value: formatRupiah(totalJasaPerorangan) }]} />
            </div>
          )}
        </div>
      ) : (
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr>
              <GreenTh minWidth={30}>No.</GreenTh>
              <GreenTh minWidth={200}>JASA PERORANGAN</GreenTh>
              <GreenTh minWidth={110}>JUMLAH TENAGA</GreenTh>
              <GreenTh minWidth={90}>HARI KERJA</GreenTh>
              <GreenTh minWidth={110}>IMBALAN / HARI</GreenTh>
              <GreenTh minWidth={120}>TOTAL IMBALAN</GreenTh>
            </tr>
          </thead>
          <tbody>
            {(detail.thl ?? []).map((row: any, i: number) => (
              <tr key={row.id ?? i}>
                <td style={{ ...cellBase, textAlign: "center" }}>{i + 1}</td>
                <td style={cellBase}>{row.jasaperorg ?? "-"}</td>
                <td style={{ ...cellBase, textAlign: "right" }}>{row.jumlahtng ?? "-"}</td>
                <td style={{ ...cellBase, textAlign: "right" }}>{row.harikerja ?? "-"}</td>
                <td style={{ ...cellBase, textAlign: "right" }}>{formatRupiah(row.imbalanperhari ?? 0)}</td>
                <td style={{ ...cellBase, textAlign: "right" }}>{formatRupiah(row.estimasiTotal ?? 0)}</td>
              </tr>
            ))}
          </tbody>
          {!!(detail.thl ?? []).length && (
            <tfoot>
              <tr>
                <td colSpan={5} style={{ ...cellBase, background: C.totalRow, textAlign: "right", fontWeight: 700 }}>
                  TOTAL BIAYA JASA PERORANGAN
                </td>
                <td style={{ ...cellBase, background: C.yellow, fontWeight: 700, textAlign: "right" }}>
                  {formatRupiah(totalJasaPerorangan)}
                </td>
              </tr>
            </tfoot>
          )}
        </table>
      )}

      {/* ============ KEBUTUHAN BARANG PROMOSI ============ */}
      <SectionBar>KEBUTUHAN BARANG PROMOSI YANG DIAJUKAN</SectionBar>
      {isMobile ? (
        <div style={{ padding: "4px 6px" }}>
          <MobileCardListView
            rows={detail.barangPromo ?? []}
            cardTitle={(row, i) => row.namaBarang || `Barang ${i + 1}`}
            fields={(row) => [
              { label: "Satuan", value: row.satuan ?? "-" },
              { label: "QTY", value: row.qty ?? "-" },
              { label: "Harga / Unit", value: formatRupiah(row.hargaUnit ?? 0) },
              { label: "Estimasi Total", value: formatRupiah(row.estimasiTotal ?? 0) },
            ]}
          />
          {!!(detail.barangPromo ?? []).length && (
            <div style={{ marginTop: 8 }}>
              <MobileSummaryListView bold rows={[{ label: "TOTAL BIAYA BARANG PROMOSI", value: formatRupiah(totalKebutuhanPosm) }]} />
            </div>
          )}
        </div>
      ) : (
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr>
              <GreenTh minWidth={30}>No.</GreenTh>
              <GreenTh minWidth={220}>NAMA BARANG</GreenTh>
              <GreenTh minWidth={90}>SATUAN</GreenTh>
              <GreenTh minWidth={70}>QTY</GreenTh>
              <GreenTh minWidth={110}>HARGA / UNIT</GreenTh>
              <GreenTh minWidth={120}>ESTIMASI TOTAL</GreenTh>
            </tr>
          </thead>
          <tbody>
            {(detail.barangPromo ?? []).map((row: any, i: number) => (
              <tr key={row.id ?? i}>
                <td style={{ ...cellBase, textAlign: "center" }}>{i + 1}</td>
                <td style={cellBase}>{row.namaBarang ?? "-"}</td>
                <td style={cellBase}>{row.satuan ?? "-"}</td>
                <td style={{ ...cellBase, textAlign: "right" }}>{row.qty ?? "-"}</td>
                <td style={{ ...cellBase, textAlign: "right" }}>{formatRupiah(row.hargaUnit ?? 0)}</td>
                <td style={{ ...cellBase, textAlign: "right" }}>{formatRupiah(row.estimasiTotal ?? 0)}</td>
              </tr>
            ))}
          </tbody>
          {!!(detail.barangPromo ?? []).length && (
            <tfoot>
              <tr>
                <td colSpan={5} style={{ ...cellBase, background: C.totalRow, textAlign: "right", fontWeight: 700 }}>
                  TOTAL BIAYA BARANG PROMOSI
                </td>
                <td style={{ ...cellBase, background: C.yellow, fontWeight: 700, textAlign: "right" }}>
                  {formatRupiah(totalKebutuhanPosm)}
                </td>
              </tr>
            </tfoot>
          )}
        </table>
      )}

      {/* ============ MIXED BRAND + TOTAL BIAYA DIBUTUHKAN ============ */}
      <SectionBar>Mixed Brand</SectionBar>
      {isMobile ? (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <div style={{ padding: "4px 6px" }}>
            <MobileCardListView
              rows={detail.brandjln ?? []}
              cardTitle={(row, i) => row.Programjln || `Program ${i + 1}`}
              fields={(row) => [
                { label: "QTY (Bks)", value: row.qtybks ?? "-" },
                { label: "Harga / Bks", value: formatRupiah(row.hrgbks ?? 0) },
                { label: "Total Nominal", value: formatRupiah(row.Nominal ?? 0) },
              ]}
            />
            {!!(detail.brandjln ?? []).length && (
              <div style={{ marginTop: 8 }}>
                <MobileSummaryListView bold rows={[{ label: "TOTAL", value: formatRupiah(totalTrialTaste) }]} />
              </div>
            )}
          </div>

          <div style={{ padding: "4px 6px" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr>
                  <td colSpan={2} style={{ ...cellBase, background: C.blackBar, color: C.white, fontWeight: 700, textAlign: "center" }}>
                    TOTAL BIAYA YANG DIBUTUHKAN
                  </td>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td style={{ ...cellBase, fontWeight: 700 }}>BIAYA PROMOSI</td>
                  <td style={{ ...cellBase, textAlign: "right" }}>{formatRupiah(totalBiayaPromo)}</td>
                </tr>
                <tr>
                  <td style={{ ...cellBase, fontWeight: 700 }}>JASA PERORANGAN</td>
                  <td style={{ ...cellBase, textAlign: "right" }}>{formatRupiah(totalJasaPerorangan)}</td>
                </tr>
                <tr>
                  <td style={{ ...cellBase, fontWeight: 700 }}>KEBUTUHAN POSM</td>
                  <td style={{ ...cellBase, textAlign: "right" }}>{formatRupiah(totalKebutuhanPosm)}</td>
                </tr>
                <tr>
                  <td style={{ ...cellBase, fontWeight: 700 }}>TRIAL TASTE</td>
                  <td style={{ ...cellBase, textAlign: "right" }}>{formatRupiah(totalTrialTaste)}</td>
                </tr>
              </tbody>
              <tfoot>
                <tr>
                  <td style={{ ...cellBase, background: C.totalRow, fontWeight: 700, textAlign: "right" }}>TOTAL BIAYA</td>
                  <td style={{ ...cellBase, background: C.yellow, fontWeight: 700, textAlign: "right" }}>{formatRupiah(grandTotal)}</td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      ) : (
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
                    </tr>
                  </thead>
                  <tbody>
                    {(detail.brandjln ?? []).map((row: any, i: number) => (
                      <tr key={row.id ?? i}>
                        <td style={{ ...cellBase, textAlign: "center" }}>{i + 1}</td>
                        <td style={cellBase}>{row.Programjln ?? "-"}</td>
                        <td style={{ ...cellBase, textAlign: "right" }}>{row.qtybks ?? "-"}</td>
                        <td style={{ ...cellBase, textAlign: "right" }}>{formatRupiah(row.hrgbks ?? 0)}</td>
                        <td style={{ ...cellBase, textAlign: "right" }}>{formatRupiah(row.Nominal ?? 0)}</td>
                      </tr>
                    ))}
                  </tbody>
                  {!!(detail.brandjln ?? []).length && (
                    <tfoot>
                      <tr>
                        <td colSpan={4} style={{ ...cellBase, background: C.totalRow, textAlign: "right", fontWeight: 700 }}>TOTAL</td>
                        <td style={{ ...cellBase, background: C.yellow, fontWeight: 700, textAlign: "right" }}>
                          {formatRupiah(totalTrialTaste)}
                        </td>
                      </tr>
                    </tfoot>
                  )}
                </table>
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
                    {[
                      { label: "BIAYA PROMOSI", value: totalBiayaPromo },
                      { label: "JASA PERORANGAN", value: totalJasaPerorangan },
                      { label: "KEBUTUHAN POSM", value: totalKebutuhanPosm },
                      { label: "TRIAL TASTE", value: totalTrialTaste },
                    ].map((r, i) => (
                      <tr key={i}>
                        <td style={{ ...cellBase, width: 30, textAlign: "center" }}>{i + 1}</td>
                        <td style={cellBase}>{r.label}</td>
                        <td style={{ ...cellBase, textAlign: "right" }}>{formatRupiah(r.value)}</td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr>
                      <td colSpan={2} style={{ ...cellBase, background: C.totalRow, textAlign: "right", fontWeight: 700 }}>TOTAL BIAYA</td>
                      <td style={{ ...cellBase, background: C.yellow, fontWeight: 700, textAlign: "right" }}>{formatRupiah(grandTotal)}</td>
                    </tr>
                  </tfoot>
                </table>
              </td>
            </tr>
          </tbody>
        </table>
      )}

      {/* ============ PERMINTAAN TRANSFER + ANALISA BIAYA ============ */}
      {isMobile ? (
        <div style={{ display: "flex", flexDirection: "column", gap: 12, marginTop: 4 }}>
          <div>
            <SectionBar bg={C.orangeBar}>PERMINTAAN TRANSFER BIAYA PROGRAM PROMOSI</SectionBar>
            <div style={{ padding: "4px 6px" }}>
              <MobileCardListView
                rows={detail.transfer ?? []}
                cardTitle={(row, i) => row.jenis || `Transfer ${i + 1}`}
                fields={(row) => [
                  { label: "Tanggal Transfer", value: row.tanggal ?? "-" },
                  { label: "Jumlah Transfer", value: row.jumlah ?? "-" },
                ]}
              />
            </div>
          </div>

          <div>
            <SectionBar bg={C.orangeBar}>Analisa Biaya</SectionBar>
            <div style={{ padding: "4px 6px" }}>
              <MobileCardListView
                rows={[
                  { label: "BIAYA PROMOSI", total: totalBiayaPromo },
                  { label: "JASA PERORANGAN", total: totalJasaPerorangan },
                  { label: "KEBUTUHAN POSM", total: totalKebutuhanPosm },
                  { label: "TRIAL TASTE", total: totalTrialTaste },
                ]}
                cardTitle={(r) => r.label}
                fields={(r) => {
                  const costPerPack = totalQtyBks > 0 ? r.total / totalQtyBks : 0;
                  const costRatio = totalTargetPenjualan > 0 ? r.total / totalTargetPenjualan : 0;
                  return [
                    { label: "Cost Per Pack", value: formatRupiah(costPerPack) },
                    { label: "Cost Ratio", value: pct(costRatio) },
                  ];
                }}
              />
              <div style={{ marginTop: 8 }}>
                <MobileSummaryListView
                  bold
                  rows={[
                    { label: "Total Biaya (Cost/Pack)", value: formatRupiah(totalCostPerPack) },
                    { label: "Total Biaya (Cost Ratio)", value: pct(totalCostRatio) },
                  ]}
                />
              </div>
            </div>
          </div>
        </div>
      ) : (
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
                    </tr>
                  </thead>
                  <tbody>
                    {(detail.transfer ?? []).map((row: any, i: number) => (
                      <tr key={row.id ?? i}>
                        <td style={{ ...cellBase, background: C.orangeCell, textAlign: "center" }}>{row.jenis ?? "-"}</td>
                        <td style={{ ...cellBase, background: C.orangeCell, textAlign: "center" }}>{row.tanggal ?? "-"}</td>
                        <td style={{ ...cellBase, background: C.orangeCell, textAlign: "center" }}>{row.jumlah ?? "-"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
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
                    {[
                      { label: "BIAYA PROMOSI", total: totalBiayaPromo },
                      { label: "JASA PERORANGAN", total: totalJasaPerorangan },
                      { label: "KEBUTUHAN POSM", total: totalKebutuhanPosm },
                      { label: "TRIAL TASTE", total: totalTrialTaste },
                    ].map((r, i) => {
                      const costPerPack = totalQtyBks > 0 ? r.total / totalQtyBks : 0;
                      const costRatio = totalTargetPenjualan > 0 ? r.total / totalTargetPenjualan : 0;
                      return (
                        <tr key={i}>
                          <td style={{ ...cellBase, textAlign: "center" }}>{i + 1}</td>
                          <td style={cellBase}>{r.label}</td>
                          <td style={{ ...cellBase, textAlign: "right" }}>{formatRupiah(costPerPack)}</td>
                          <td style={{ ...cellBase, textAlign: "right" }}>{pct(costRatio)}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                  <tfoot>
                    <tr>
                      <td colSpan={2} style={{ ...cellBase, background: C.totalRow, fontWeight: 700, textAlign: "right" }}>Total Biaya</td>
                      <td style={{ ...cellBase, background: C.yellow, fontWeight: 700, textAlign: "right" }}>{formatRupiah(totalCostPerPack)}</td>
                      <td style={{ ...cellBase, background: C.yellow, fontWeight: 700, textAlign: "right" }}>{pct(totalCostRatio)}</td>
                    </tr>
                  </tfoot>
                </table>
              </td>
            </tr>
          </tbody>
        </table>
      )}

      <div style={{ height: 24 }} />
    </div>
  );
}