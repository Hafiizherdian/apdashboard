'use client';

import { useState, useEffect, useCallback } from "react";
import { tk, Theme } from "@/components/share";
import { KpiMini } from "@/components/KpiMini";
import { Card } from "@/components/Card";
import { Files, FileSearchCorner } from 'lucide-react';
import { FilterSelect } from "@/components/Filter";

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

  const [selectedUnit, setSelectedUnit] = useState<string>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedWeek, setSelectedWeek] = useState<number | null>(null);

  const RegOptions = [
    { label: 'Regional A', value: 'Regional-A' },
    { label: 'Regional B', value: 'Regional-B' },
  ];
  const availableCategories = ['Kategori 1', 'Kategori 2', 'Kategori 3'];
  const areas = ['Area 1', 'Area 2', 'Area 3', 'Area 4'];
  const brands = ['Brand A', 'Brand B', 'Brand C', 'Brand D'];
  const statusOptions = ['Running', 'Selesai'];

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
      <div style={{ background: t.cardbg, border: `1px solid ${t.borderCard}`, borderRadius: 13, padding: isMobile ? 14 : 20 }}>
        <span style={{ fontSize: isMobile ? 10 : 11, fontWeight: 700, color: t.textMuted, fontFamily: 'IBM Plex Mono,monospace', textTransform: 'uppercase', letterSpacing: '.08em', display: 'block', marginBottom: isMobile ? 8 : 10 }}>
          Filter Data
        </span>
        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr 1fr' : 'repeat(5, auto)', gap: 8, alignItems: 'center', justifyContent: isMobile ? 'stretch' : 'flex-start' }}>
          <FilterSelect label="Regional" accentColor="#10b981" value={selectedUnit} onChange={e => setSelectedUnit(e.target.value)} theme={theme} fullWidth={isMobile}>
            <option value="all" style={{ background: t.inputBg }}>Semua Regional</option>
            {RegOptions.map((o) => <option key={o.value} value={o.value} style={{ background: t.inputBg }}>{o.label}</option>)}
          </FilterSelect>
          <FilterSelect label="Area" accentColor="#f59e0b" value={selectedCategory} onChange={e => setSelectedCategory(e.target.value)} theme={theme} fullWidth={isMobile}>
            <option value="all" style={{ background: t.inputBg }}>Semua Area</option>
            {areas.map((a) => <option key={a} value={a} style={{ background: t.inputBg }}>{a}</option>)}
          </FilterSelect>
          <FilterSelect label="Kategori" accentColor="#8b5cf6" value={selectedCategory} onChange={e => setSelectedCategory(e.target.value)} theme={theme} fullWidth={isMobile}>
            <option value="all" style={{ background: t.inputBg }}>Semua Kategori</option>
            {availableCategories.map((c) => <option key={c} value={c} style={{ background: t.inputBg }}>{c}</option>)}
          </FilterSelect>
          <FilterSelect label="Brand" accentColor="#ef4444" value={selectedCategory} onChange={e => setSelectedCategory(e.target.value)} theme={theme} fullWidth={isMobile}>
            <option value="all" style={{ background: t.inputBg }}>Semua Brand</option>
            {brands.map((b) => <option key={b} value={b} style={{ background: t.inputBg }}>{b}</option>)}
          </FilterSelect>
          <div style={{ gridColumn: isMobile ? '1 / -1' : undefined }}>
            <FilterSelect label="Status" accentColor="#3b82f6" value={selectedWeek?.toString() ?? 'all'} onChange={e => setSelectedWeek(e.target.value === 'all' ? null : Number(e.target.value))} theme={theme} fullWidth={isMobile}>
              <option value="all" style={{ background: t.inputBg }}>Semua Status</option>
              {statusOptions.map((w) => <option key={w} value={w} style={{ background: t.inputBg }}>{w}</option>)}
            </FilterSelect>
          </div>
        </div>
      </div>

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