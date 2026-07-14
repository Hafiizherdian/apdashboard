"use client"

import React from "react";
import ActionPlanMekanismeDetail from "@/components/ActionPlanMekanismeDetail";

const C = {
  yellow: "#FFFDE7",
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

function InfoRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <tr>
      <td style={{ ...cellBase, fontWeight: 700, width: 180 }}>{label}</td>
      <td style={{ ...cellBase, background: C.yellow }}>{value ?? "-"}</td>
    </tr>
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

export default function ActionPlanDetailView({
  detail,
  formatRupiah,
}: {
  detail: any;
  formatRupiah: (v: number) => string;
}) {
  const fmtDate = (d: any) => {
    if (!d) return "-";
    const date = new Date(d);
    if (isNaN(date.getTime())) return String(d);
    return date.toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" });
  };
  const formatDate = (date?: string | null) => {
  if (!date) return "-";

  console.log("DATE:", date);

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

  return (
    <div
      className="flex-1 overflow-y-auto"
      style={{ background: C.white, fontFamily: "Calibri, Arial, sans-serif", color: C.text }}
    >
      {/* ============ HEADER INFO + LOGO ============ */}
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <tbody>
          <tr>
            <td style={{ ...cellBase, fontWeight: 700, width: 180 }}>NO. ACTION PLAN</td>
            <td style={{ ...cellBase, background: C.yellow }}>{detail.no_action_plan ?? "-"}</td>
            <td
              rowSpan={9}
              style={{ ...cellBase, width: 520, verticalAlign: "top", textAlign: "center" }}
            >
              <div
                style={{
                  height: 200,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
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

      {/* LAMA PROGRAM + TOTAL BIAYA — baris terpisah, sejajar dengan pola Entri */}
      <table style={{ width: "100%", borderCollapse: "collapse", }}>
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

      {/* ============ DESKRIPSI PROGRAM PROMOSI ============ */}
      <SectionBar>DESKRIPSI PROGRAM PROMOSI</SectionBar>
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
              {/* Detail sub-program dari sheet ke-2 (POSM, Trial Taste, Target Sales, dll) */}
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
                  ["Lain²", detail.pelaksana_lain],
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

      {/* ============ TENAGA KERJA LEPAS ============ */}
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

      {/* ============ MIXED BRAND + TOTAL BIAYA DIBUTUHKAN ============ */}
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

      {/* ============ PERMINTAAN TRANSFER + ANALISA BIAYA ============ */}
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
                  {(() => {
                    const totalQtyBks = (detail.TargetEvent ?? []).reduce((s: number, r: any) => s + (Number(r.qty) || 0), 0);
                    const totalTargetPenjualan = (detail.TargetEvent ?? []).reduce((s: number, r: any) => s + (Number(r.TargetPenjualan) || 0), 0);
                    const rows = [
                      { label: "BIAYA PROMOSI", total: totalBiayaPromo },
                      { label: "JASA PERORANGAN", total: totalJasaPerorangan },
                      { label: "KEBUTUHAN POSM", total: totalKebutuhanPosm },
                      { label: "TRIAL TASTE", total: totalTrialTaste },
                    ];
                    return rows.map((r, i) => {
                      const costPerPack = totalQtyBks > 0 ? r.total / totalQtyBks : 0;
                      const costRatio = totalTargetPenjualan > 0 ? r.total / totalTargetPenjualan : 0;
                      return (
                        <tr key={i}>
                          <td style={{ ...cellBase, textAlign: "center" }}>{i + 1}</td>
                          <td style={cellBase}>{r.label}</td>
                          <td style={{ ...cellBase, textAlign: "right" }}>{formatRupiah(costPerPack)}</td>
                          <td style={{ ...cellBase, textAlign: "right" }}>
                            {new Intl.NumberFormat("id-ID", { style: "percent", minimumFractionDigits: 1 }).format(costRatio)}
                          </td>
                        </tr>
                      );
                    });
                  })()}
                </tbody>
                <tfoot>
                  {(() => {
                    const totalQtyBks = (detail.TargetEvent ?? []).reduce((s: number, r: any) => s + (Number(r.qty) || 0), 0);
                    const totalTargetPenjualan = (detail.TargetEvent ?? []).reduce((s: number, r: any) => s + (Number(r.TargetPenjualan) || 0), 0);
                    const totalCostPerPack = totalQtyBks > 0 ? grandTotal / totalQtyBks : 0;
                    const totalCostRatio = totalTargetPenjualan > 0 ? grandTotal / totalTargetPenjualan : 0;
                    return (
                      <tr>
                        <td colSpan={2} style={{ ...cellBase, background: C.totalRow, fontWeight: 700, textAlign: "right" }}>Total Biaya</td>
                        <td style={{ ...cellBase, background: C.yellow, fontWeight: 700, textAlign: "right" }}>{formatRupiah(totalCostPerPack)}</td>
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