'use client';

import { useState, useEffect, useCallback } from "react";
import { tk, Theme } from "@/components/share";
import { KpiMini } from "@/components/KpiMini";
import { Card } from "@/components/Card";
import { Files, FileSearchCorner } from 'lucide-react';
import { ActionPlanFilterBar, DEFAULT_AP_FILTER_STATE, EMPTY_AP_FILTER_OPTIONS, ActionPlanFilterState, ActionPlanFilterOptions } from "@/components/Filter";

const GAP = 8;

interface SummaryData {
  totalActionPlan: number;
  totalClosed: number;
  totalRunning: number;
  totalBiaya: number;
}

function ChartPlaceholder({ theme }: { theme: Theme }) {
  const t = tk[theme];
  return (
    <div style={{ height: 220, border: `1px dashed ${t.border}`, borderRadius: 10, padding: 16, display: "flex", alignItems: "flex-end", gap: 10, background: t.cardbg }}>
      {[40, 80, 120, 70, 150, 100, 130].map((h, i) => (
        <div key={i} style={{ flex: 1, height: h, borderRadius: 6, background: t.blue.text, opacity: 0.75 }} />
      ))}
    </div>
  );
}

function PiePlaceholder({ theme }: { theme: Theme }) {
  const t = tk[theme];
  return (
    <div style={{ height: 220, display: "flex", justifyContent: "center", alignItems: "center", border: `1px dashed ${t.border}`, borderRadius: 10, background: t.cardbg }}>
      <div style={{ width: 140, height: 140, borderRadius: "50%", position: "relative", background: `conic-gradient(${t.green.text} 0deg 120deg, ${t.blue.text} 120deg 220deg, ${t.card3accent} 220deg 290deg, ${t.card4accent} 290deg 360deg)` }}>
        <div style={{ position: "absolute", inset: 35, background: t.cardbg, borderRadius: "50%" }} />
      </div>
    </div>
  );
}

function formatRupiah(n: number) {
  return n.toLocaleString('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 });
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

  const [isMobile, setIsMobile] = useState<boolean>(false);
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const [summary, setSummary] = useState<SummaryData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchSummary = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/action-plan/summary");
      if (!res.ok) throw new Error("Gagal mengambil ringkasan");
      const json = await res.json();
      setSummary(json.data as SummaryData);
    } catch (err) {
      console.error(err);
      setError("Gagal memuat ringkasan KPI.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSummary();
  }, [fetchSummary]);

  const realisasiRate =
    summary && summary.totalActionPlan > 0
      ? ((summary.totalClosed / summary.totalActionPlan) * 100).toFixed(1)
      : "0.0";

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: GAP }}>
      
      <ActionPlanFilterBar value={filters} onChange={setFilters} options={filterOptions} theme={theme} isMobile={isMobile} />

      {error && (
        <div className="p-3 rounded-md text-sm border" style={{ backgroundColor: t.red.bg, color: t.red.text, borderColor: t.red.border }}>
          {error}
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: GAP }}>
        <KpiMini theme={theme} bg={t.card1bg} border={t.card1border} labelColor={t.card1text} label="Action Plan" value={loading ? "..." : String(summary?.totalActionPlan ?? 0)} sub="Total Action Plan" />
        <KpiMini theme={theme} bg={t.card4bg} border={t.card4border} labelColor={t.card4text} label="Closed" value={loading ? "..." : String(summary?.totalClosed ?? 0)} sub="Action Plan Selesai" />
        <KpiMini theme={theme} bg={t.card2bg} border={t.card2border} labelColor={t.card2text} label="Running" value={loading ? "..." : String(summary?.totalRunning ?? 0)} sub="Action Plan Berjalan" />
        <KpiMini theme={theme} bg={t.card3bg} border={t.card3border} labelColor={t.card3text} label="Total Biaya" value={loading ? "..." : formatRupiah(summary?.totalBiaya ?? 0)} sub="Total Biaya Keseluruhan" />
        <KpiMini theme={theme} bg={t.card5bg} border={t.card5border} labelColor={t.card5text} label="Realisasi Rate" value={loading ? "..." : `${realisasiRate} %`} sub="Rasio Action Plan Selesai" />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: GAP }}>
        <Card theme={theme} title="Jumlah AP" sub="Jumlah AP" color={t.blue.text} accent={t.blue.text} icon={<Files size={12} color={t.blue.text} />}>
          <div style={{ fontSize: 12, color: t.textMuted, fontFamily: 'IBM Plex Mono, monospace', marginBottom: 12 }}>
            Grafik tren jumlah action plan (belum ada endpoint time-series — bisa ditambah nanti kalau perlu).
          </div>
          <ChartPlaceholder theme={theme} />
        </Card>

        <Card theme={theme} title="Tipe AP" sub="Tipe AP" color={t.green.text} accent={t.green.text} icon={<FileSearchCorner size={12} color={t.green.text} />}>
          <PiePlaceholder theme={theme} />
          <div style={{ fontSize: 12, color: t.textMuted, fontFamily: 'IBM Plex Mono, monospace', marginTop: 12 }}>
            Distribusi tipe action plan (belum ada endpoint agregasi per jenis_program — bisa ditambah nanti kalau perlu).
          </div>
        </Card>
      </div>
    </div>
  );
}

export default Overview;