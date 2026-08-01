'use client';

import { useState, useEffect, useCallback } from "react";
import { tk, Theme } from "@/components/share";
import { KpiMini } from "@/components/KpiMini";
import { Card } from "@/components/Card";
import { Files, FileSearchCorner } from 'lucide-react';
import {
  ActionPlanFilterBar,
  DEFAULT_AP_FILTER_STATE,
  EMPTY_AP_FILTER_OPTIONS,
  ActionPlanFilterState,
  ActionPlanFilterOptions,
  filterStateToParams,
} from "@/components/Filter";

const GAP = 8;

interface SummaryData {
  totalActionPlan: number;
  totalClosed: number;
  totalRunning: number;
  totalDiperpanjang: number;
  totalDibatalkan: number; // sebelumnya salah nama "totalCanceled" -> gak match response API, selalu 0
  totalBiaya: number;
}

interface KategoriPoint {
  kategori: string;
  total: number;
}

function formatRupiah(n: number) {
  return n.toLocaleString('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 });
}

function truncateLabel(s: string, max = 12) {
  if (s.length <= max) return s;
  return s.slice(0, max - 1) + '…';
}

// ============================================================
// CHART: Jumlah Action Plan per Kategori (bar chart, data asli)
// ============================================================
function KategoriBarChart({ theme, data, loading }: { theme: Theme; data: KategoriPoint[]; loading: boolean }) {
  const t = tk[theme];
  const CHART_H = 260;
  const [hoverIdx, setHoverIdx] = useState<number | null>(null);

  // Palet solid, diambil dari token tema
  const palette = [t.card1accent];

  if (loading) {
    return (
      <div style={{ height: 320, display: 'flex', alignItems: 'center', justifyContent: 'center', border: `1px dashed ${t.border}`, borderRadius: 10, background: t.cardbg }}>
        <span style={{ fontSize: 12, color: t.textMuted, fontFamily: 'IBM Plex Mono, monospace' }}>Memuat data...</span>
      </div>
    );
  }

  if (!data.length) {
    return (
      <div style={{ height: 320, display: 'flex', alignItems: 'center', justifyContent: 'center', border: `1px dashed ${t.border}`, borderRadius: 10, background: t.cardbg }}>
        <span style={{ fontSize: 12, color: t.textMuted, fontFamily: 'IBM Plex Mono, monospace' }}>Belum ada data action plan.</span>
      </div>
    );
  }

  const max = Math.max(1, ...data.map((d) => d.total));
  // 4 garis bantu horizontal (0%, 33%, 66%, 100%) buat referensi skala
  const gridLines = [0, 0.33, 0.66, 1];

  return (
    <div style={{ height: 320, border: `1px solid ${t.borderCard}`, borderRadius: 10, background: t.cardbg, padding: '16px 14px 12px', display: 'flex', flexDirection: 'column' }}>
      <div style={{ position: 'relative', height: CHART_H }}>
        {/* Gridlines */}
        {gridLines.map((g, i) => (
          <div key={i} style={{ position: 'absolute', left: 0, right: 0, bottom: g * CHART_H, borderTop: `1px dashed ${t.border}`, pointerEvents: 'none' }} />
        ))}

        {/* Bars */}
        <div style={{ position: 'relative', display: 'flex', alignItems: 'flex-end', gap: 10, height: CHART_H }}>
          {data.map((d, i) => {
            const barH = Math.round((d.total / max) * CHART_H);
            const accent = palette[i % palette.length];
            const isHovered = hoverIdx === i;
            return (
              <div
                key={i}
                onMouseEnter={() => setHoverIdx(i)}
                onMouseLeave={() => setHoverIdx(null)}
                style={{ flex: 1, position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-end', height: CHART_H, cursor: 'pointer' }}
              >
                {/* Tooltip */}
                {isHovered && (
                  <div style={{
                    position: 'absolute', bottom: barH + 10, left: '50%', transform: 'translateX(-50%)',
                    background: t.tooltipBg, border: `1px solid ${t.tooltipBorder}`, borderRadius: 6,
                    padding: '5px 9px', fontSize: 10, fontFamily: 'IBM Plex Mono, monospace', color: t.text,
                    whiteSpace: 'nowrap', boxShadow: t.shadowCard, zIndex: 2, pointerEvents: 'none',
                  }}>
                    <span style={{ color: t.textMuted }}>{d.kategori}: </span>
                    <span style={{ fontWeight: 700, color: accent }}>{d.total} AP</span>
                  </div>
                )}

                <span style={{ fontSize: 10, fontWeight: 700, color: isHovered ? t.text : t.textSub, fontFamily: 'IBM Plex Mono, monospace', marginBottom: 6, transition: 'color 0.15s' }}>
                  {d.total}
                </span>
                <div
                  style={{
                    width: '100%',
                    maxWidth: 40,
                    height: Math.max(barH, 4),
                    borderRadius: '5px 5px 2px 2px',
                    background: accent,
                    opacity: isHovered ? 1 : 0.82,
                    outline: isHovered ? `2px solid ${accent}55` : 'none',
                    outlineOffset: 2,
                    transition: 'height 0.3s ease, opacity 0.15s ease, outline 0.15s ease',
                  }}
                />
              </div>
            );
          })}
        </div>
      </div>

      <div style={{ display: 'flex', gap: 10, marginTop: 10, paddingTop: 10, borderTop: `1px solid ${t.border}` }}>
        {data.map((d, i) => (
          <div
            key={i}
            style={{ flex: 1, textAlign: 'center', fontSize: 9, color: hoverIdx === i ? t.text : t.textMuted, fontFamily: 'IBM Plex Mono, monospace', overflow: 'hidden', whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4, transition: 'color 0.15s' }}
          >
            <span style={{ width: 6, height: 6, borderRadius: 2, background: palette[i % palette.length], flexShrink: 0, opacity: hoverIdx === i ? 1 : 0.7 }} />
            {truncateLabel(d.kategori)}
          </div>
        ))}
      </div>
    </div>
  );
}

// ============================================================
// CHART: Distribusi status Action Plan (donut chart, data asli dari summary)
// ============================================================
function StatusPieChart({ theme, summary, loading }: { theme: Theme; summary: SummaryData | null; loading: boolean }) {
  const t = tk[theme];
  const [hoverIdx, setHoverIdx] = useState<number | null>(null);

  if (loading) {
    return (
      <div style={{ height: 320, display: 'flex', alignItems: 'center', justifyContent: 'center', border: `1px dashed ${t.border}`, borderRadius: 10, background: t.cardbg }}>
        <span style={{ fontSize: 12, color: t.textMuted, fontFamily: 'IBM Plex Mono, monospace' }}>Memuat data...</span>
      </div>
    );
  }

  // Warna solid dari token chip
  const rawSegments = [
    { label: 'Running', value: summary?.totalRunning ?? 0, color: t.chipGreen.text, bg: t.chipGreen.bg, border: t.chipGreen.border },
    { label: 'Closed', value: summary?.totalClosed ?? 0, color: t.chipRed.text, bg: t.chipRed.bg, border: t.chipRed.border },
    { label: 'Diperpanjang', value: summary?.totalDiperpanjang ?? 0, color: t.chipGreen.text, bg: t.chipGreen.bg, border: t.chipGreen.border },
    { label: 'Dibatalkan', value: summary?.totalDibatalkan ?? 0, color: t.chipSlate.text, bg: t.chipSlate.bg, border: t.chipSlate.border },
  ];
  const total = rawSegments.reduce((s, seg) => s + seg.value, 0);

  if (total === 0) {
    return (
      <div style={{ height: 320, display: 'flex', alignItems: 'center', justifyContent: 'center', border: `1px dashed ${t.border}`, borderRadius: 10, background: t.cardbg }}>
        <span style={{ fontSize: 12, color: t.textMuted, fontFamily: 'IBM Plex Mono, monospace' }}>Belum ada data untuk ditampilkan.</span>
      </div>
    );
  }

  // Urutkan legend dari value terbesar biar prioritas kebaca duluan
  const segments = [...rawSegments].sort((a, b) => b.value - a.value);

  let acc = 0;
  const stops = rawSegments
    .filter((s) => s.value > 0)
    .map((s) => {
      const start = (acc / total) * 360;
      acc += s.value;
      const end = (acc / total) * 360;
      // gap tipis antar segmen biar keliatan terpisah
      return `${s.color} ${start}deg ${Math.max(start, end - 1.5)}deg, transparent ${Math.max(start, end - 1.5)}deg ${end}deg`;
    })
    .join(', ');

  return (
    <div style={{ height: 320, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 18, border: `1px solid ${t.borderCard}`, borderRadius: 10, background: t.cardbg, padding: 16 }}>
      <div style={{ width: 154, height: 154, borderRadius: '50%', position: 'relative', background: `conic-gradient(${stops})` }}>
        <div style={{ position: 'absolute', inset: 36, background: t.cardbg, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', boxShadow: `inset 0 0 0 1px ${t.borderCard}` }}>
          <span style={{ fontSize: 19, fontWeight: 800, color: t.text, fontFamily: 'IBM Plex Mono, monospace', letterSpacing: '-0.02em' }}>{total}</span>
          <span style={{ fontSize: 8, color: t.textMuted, fontFamily: 'IBM Plex Mono, monospace', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Total AP</span>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 5, width: '100%', maxWidth: 240 }}>
        {segments.map((s, i) => {
          const pct = total > 0 ? Math.round((s.value / total) * 100) : 0;
          const isHovered = hoverIdx === i;
          return (
            <div
              key={i}
              onMouseEnter={() => setHoverIdx(i)}
              onMouseLeave={() => setHoverIdx(null)}
              style={{
                display: 'flex', alignItems: 'center', gap: 8,
                fontSize: 10.5, fontFamily: 'IBM Plex Mono, monospace',
                background: isHovered ? s.bg : 'transparent',
                border: `1px solid ${isHovered ? s.border : 'transparent'}`,
                borderRadius: 7, padding: '5px 8px', transition: 'background 0.12s, border 0.12s',
                cursor: 'pointer'
              }}
            >
              <span style={{ width: 8, height: 8, borderRadius: 2, background: s.color, flexShrink: 0 }} />
              <span style={{ color: t.textSub, flex: 1 }}>{s.label}</span>
              <span style={{ color: t.text, fontWeight: 700 }}>{s.value}</span>
              <span style={{ color: t.textMuted, width: 34, textAlign: 'right' }}>{pct}%</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function Overview({ theme }: { theme: Theme }) {
  const t = tk[theme];

  const [filters, setFilters] = useState<ActionPlanFilterState>(DEFAULT_AP_FILTER_STATE);
  const [filterOptions, setFilterOptions] = useState<ActionPlanFilterOptions>(EMPTY_AP_FILTER_OPTIONS);

  useEffect(() => {
    fetch("/api/action-plan/filter-options")
      .then((res) => res.json())
      .then((data) => setFilterOptions({
        area: data.area ?? [],
        kategori: data.kategori ?? [],
        brand: data.brand ?? [],
        status: data.status ?? [],
      }))
      .catch((err) => console.error("Gagal ambil opsi filter:", err));
  }, []);

  // Penambahan deteksi Mobile & Tablet
  const [isMobile, setIsMobile] = useState<boolean>(false);
  const [isTablet, setIsTablet] = useState<boolean>(false);

  useEffect(() => {
    const checkScreenSize = () => {
      const width = window.innerWidth;
      setIsMobile(width < 768);
      setIsTablet(width >= 768 && width < 1024);
    };

    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  const [summary, setSummary] = useState<SummaryData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [kategoriData, setKategoriData] = useState<KategoriPoint[]>([]);
  const [kategoriLoading, setKategoriLoading] = useState(false);

  const fetchSummary = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const qs = new URLSearchParams(filterStateToParams(filters));
      const res = await fetch(`/api/action-plan/summary?${qs.toString()}`);
      if (!res.ok) throw new Error("Gagal mengambil ringkasan");
      const json = await res.json();
      setSummary(json.data as SummaryData);
    } catch (err) {
      console.error(err);
      setError("Gagal memuat ringkasan KPI.");
    } finally {
      setLoading(false);
    }
  }, [filters]);

  const fetchKategoriData = useCallback(async () => {
    setKategoriLoading(true);
    try {
      const qs = new URLSearchParams(filterStateToParams(filters));
      qs.set("limit", "10");
      const res = await fetch(`/api/action-plan/trend?${qs.toString()}`);
      if (!res.ok) throw new Error("Gagal mengambil data per kategori");
      const json = await res.json();
      setKategoriData((json.data as KategoriPoint[]) ?? []);
    } catch (err) {
      console.error(err);
      setKategoriData([]);
    } finally {
      setKategoriLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchSummary();
    fetchKategoriData();
  }, [fetchSummary, fetchKategoriData]);

  const realisasiRate =
    summary && summary.totalActionPlan > 0
      ? ((summary.totalClosed / summary.totalActionPlan) * 100).toFixed(1)
      : "0.0";

  // Konfigurasi dinamis untuk kolom Grid
  const kpiGridCols = isMobile ? 'repeat(2, 1fr)' : isTablet ? 'repeat(3, 1fr)' : 'repeat(7, 1fr)';
  const chartGridCols = (isMobile || isTablet) ? '1fr' : 'repeat(2, 1fr)';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: GAP }}>

      <ActionPlanFilterBar value={filters} onChange={setFilters} options={filterOptions} theme={theme} isMobile={isMobile} />

      {error && (
        <div className="p-3 rounded-md text-sm border" style={{ backgroundColor: t.red.bg, color: t.red.text, borderColor: t.red.border }}>
          {error}
        </div>
      )}

      {/* Grid KPI Dinamis */}
      <div style={{ display: 'grid', gridTemplateColumns: kpiGridCols, gap: GAP }}>
        <KpiMini theme={theme} bg={t.card1bg} border={t.card1border} labelColor={t.card1text} label="Action Plan" value={loading ? "..." : String(summary?.totalActionPlan ?? 0)} sub="Total Action Plan" />
        <KpiMini theme={theme} bg={t.card4bg} border={t.card4border} labelColor={t.card4text} label="Closed" value={loading ? "..." : String(summary?.totalClosed ?? 0)} sub="Action Plan Selesai" />
        <KpiMini theme={theme} bg={t.card2bg} border={t.card2border} labelColor={t.card2text} label="Running" value={loading ? "..." : String(summary?.totalRunning ?? 0)} sub="Action Plan Berjalan" />
        <KpiMini theme={theme} bg={t.card2bg} border={t.card2border} labelColor={t.card2text} label="Diperpanjang" value={loading ? "..." : String(summary?.totalDiperpanjang ?? 0)} sub="Action Plan Diperpanjang" />
        <KpiMini theme={theme} bg={t.card6bg} border={t.card6border} labelColor={t.card6text} label="Canceled" value={loading ? "..." : String(summary?.totalDibatalkan ?? 0)} sub="Action Plan Canceled" />
        <KpiMini theme={theme} bg={t.card5bg} border={t.card5border} labelColor={t.card5text} label="Realisasi Rate" value={loading ? "..." : `${realisasiRate} %`} sub="Rasio Action Plan Selesai" />
        <div style={{ gridColumn: isMobile ? '1 / -1' : 'auto', width: '100%', height: '100%' }}>
        <KpiMini theme={theme} bg={t.card3bg} border={t.card3border} labelColor={t.card3text} label="Total Biaya" value={loading ? "..." : formatRupiah(summary?.totalBiaya ?? 0)} sub="Total Biaya Keseluruhan" />
        </div>
      </div>

      {/* Grid Chart Dinamis — sekarang pakai data asli */}
      <div style={{ display: 'grid', gridTemplateColumns: chartGridCols, gap: GAP }}>
        <Card theme={theme} title="Jumlah AP" color={t.blue.text} accent={t.blue.text} icon={<Files size={12} color={t.blue.text} />}>
          <KategoriBarChart theme={theme} data={kategoriData} loading={kategoriLoading} />
        </Card>

        <Card theme={theme} title="Status AP" color={t.green.text} accent={t.green.text} icon={<FileSearchCorner size={12} color={t.green.text} />}>
          <StatusPieChart theme={theme} summary={summary} loading={loading} />
        </Card>
      </div>
    </div>
  );
}

export default Overview;