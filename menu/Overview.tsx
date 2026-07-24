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
  const CHART_H = 210;

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

  return (
    <div style={{ height: 320, border: `1px solid ${t.borderCard}`, borderRadius: 10, background: t.cardbg, padding: '16px 12px 10px', display: 'flex', flexDirection: 'column' }}>
      <div style={{ display: 'flex', alignItems: 'flex-end', gap: 10, height: CHART_H }}>
        {data.map((d, i) => {
          const barH = Math.round((d.total / max) * CHART_H);
          return (
            <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-end', height: CHART_H }}>
              <span style={{ fontSize: 10, fontWeight: 700, color: t.text, fontFamily: 'IBM Plex Mono, monospace', marginBottom: 4 }}>
                {d.total}
              </span>
              <div
                title={`${d.kategori}: ${d.total} AP`}
                style={{
                  width: '100%',
                  maxWidth: 44,
                  height: Math.max(barH, 4),
                  borderRadius: '6px 6px 0 0',
                  background: `linear-gradient(180deg, ${t.blue.text}, ${t.blue.text}77)`,
                  transition: 'height 0.25s ease',
                }}
              />
            </div>
          );
        })}
      </div>
      <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
        {data.map((d, i) => (
          <div
            key={i}
            title={d.kategori}
            style={{ flex: 1, textAlign: 'center', fontSize: 9, color: t.textMuted, fontFamily: 'IBM Plex Mono, monospace', overflow: 'hidden', whiteSpace: 'nowrap' }}
          >
            {truncateLabel(d.kategori)}
          </div>
        ))}
      </div>
    </div>
  );
}

// ============================================================
// CHART: Distribusi status Action Plan (pie chart, data asli dari summary)
// ============================================================
function StatusPieChart({ theme, summary, loading }: { theme: Theme; summary: SummaryData | null; loading: boolean }) {
  const t = tk[theme];

  if (loading) {
    return (
      <div style={{ height: 320, display: 'flex', alignItems: 'center', justifyContent: 'center', border: `1px dashed ${t.border}`, borderRadius: 10, background: t.cardbg }}>
        <span style={{ fontSize: 12, color: t.textMuted, fontFamily: 'IBM Plex Mono, monospace' }}>Memuat data...</span>
      </div>
    );
  }

  const segments = [
    { label: 'Running', value: summary?.totalRunning ?? 0, color: t.card2accent },
    { label: 'Closed', value: summary?.totalClosed ?? 0, color: t.card4accent },
    { label: 'Diperpanjang', value: summary?.totalDiperpanjang ?? 0, color: t.card3accent },
    { label: 'Dibatalkan', value: summary?.totalDibatalkan ?? 0, color: t.card6accent },
  ];
  const total = segments.reduce((s, seg) => s + seg.value, 0);

  if (total === 0) {
    return (
      <div style={{ height: 320, display: 'flex', alignItems: 'center', justifyContent: 'center', border: `1px dashed ${t.border}`, borderRadius: 10, background: t.cardbg }}>
        <span style={{ fontSize: 12, color: t.textMuted, fontFamily: 'IBM Plex Mono, monospace' }}>Belum ada data untuk ditampilkan.</span>
      </div>
    );
  }

  let acc = 0;
  const stops = segments
    .filter((s) => s.value > 0)
    .map((s) => {
      const start = (acc / total) * 360;
      acc += s.value;
      const end = (acc / total) * 360;
      return `${s.color} ${start}deg ${end}deg`;
    })
    .join(', ');

  return (
    <div style={{ height: 320, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16, border: `1px solid ${t.borderCard}`, borderRadius: 10, background: t.cardbg, padding: 16 }}>
      <div style={{ width: 150, height: 150, borderRadius: '50%', position: 'relative', background: `conic-gradient(${stops})` }}>
        <div style={{ position: 'absolute', inset: 34, background: t.cardbg, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}>
          <span style={{ fontSize: 18, fontWeight: 800, color: t.text, fontFamily: 'IBM Plex Mono, monospace' }}>{total}</span>
          <span style={{ fontSize: 8, color: t.textMuted, fontFamily: 'IBM Plex Mono, monospace', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Total AP</span>
        </div>
      </div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, justifyContent: 'center' }}>
        {segments.map((s, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 10, color: t.textSub, fontFamily: 'IBM Plex Mono, monospace' }}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: s.color, display: 'inline-block', flexShrink: 0 }} />
            {s.label} ({s.value})
          </div>
        ))}
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
        <KpiMini theme={theme} bg={t.card3bg} border={t.card3border} labelColor={t.card3text} label="Total Biaya" value={loading ? "..." : formatRupiah(summary?.totalBiaya ?? 0)} sub="Total Biaya Keseluruhan" />
        <KpiMini theme={theme} bg={t.card5bg} border={t.card5border} labelColor={t.card5text} label="Realisasi Rate" value={loading ? "..." : `${realisasiRate} %`} sub="Rasio Action Plan Selesai" />
      </div>

      {/* Grid Chart Dinamis — sekarang pakai data asli */}
      <div style={{ display: 'grid', gridTemplateColumns: chartGridCols, gap: GAP }}>
        <Card theme={theme} title="Jumlah AP" sub="Per Kategori" color={t.blue.text} accent={t.blue.text} icon={<Files size={12} color={t.blue.text} />}>
          <div style={{ fontSize: 12, color: t.textMuted, fontFamily: 'IBM Plex Mono, monospace', marginBottom: 12 }}>
            Jumlah action plan dikelompokkan berdasarkan Kategori.
          </div>
          <KategoriBarChart theme={theme} data={kategoriData} loading={kategoriLoading} />
        </Card>

        <Card theme={theme} title="Status AP" sub="Distribusi Running / Closed / Diperpanjang / Dibatalkan" color={t.green.text} accent={t.green.text} icon={<FileSearchCorner size={12} color={t.green.text} />}>
          <StatusPieChart theme={theme} summary={summary} loading={loading} />
        </Card>
      </div>
    </div>
  );
}

export default Overview;