'use client';

import { useEffect, useState } from 'react';
import { tk, Theme } from './share';

interface RegionalOpt {
  id: string;
  name: string;
}

function FilterSelect({ label, accentColor = '#3b82f6', value, onChange, children, theme, fullWidth }: {
  label: string; accentColor?: string; value: string | number;
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  children: React.ReactNode; theme: Theme; fullWidth?: boolean;
}) {
  const t = tk[theme];
  return (
    <div style={{ display: 'flex', alignItems: 'stretch', border: `1px solid ${t.inputBorder}`, borderRadius: 8, overflow: 'hidden', flex: fullWidth ? '1 1 auto' : undefined, minWidth: 0 }}>
      <span style={{ padding: '6px 10px', fontSize: 10, fontFamily: 'IBM Plex Mono,monospace', textTransform: 'uppercase', letterSpacing: '.07em', fontWeight: 600, color: accentColor, background: `${accentColor}18`, borderRight: `1px solid ${t.inputBorder}`, display: 'flex', alignItems: 'center', whiteSpace: 'nowrap', flexShrink: 0 }}>{label}</span>
      <select value={value} onChange={onChange} style={{ background: t.selectBg, border: 'none', outline: 'none', padding: '6px 10px', fontSize: 12, fontFamily: 'IBM Plex Mono,monospace', color: t.text, cursor: 'pointer', flex: 1, minWidth: 0, appearance: 'none', width: '100%' }}>
        {children}
      </select>
    </div>
  );
}

export interface ActionPlanFilterState {
  regional: string;
  area: string;
  kategori: string;
  brand: string;
  status: string;
}

export const DEFAULT_AP_FILTER_STATE: ActionPlanFilterState = {
  regional: 'all', area: 'all', kategori: 'all', brand: 'all', status: 'all',
};

// Opsi dinamis yang di-fetch dari /api/action-plan/filter-options
export interface ActionPlanFilterOptions {
  area: string[];
  kategori: string[];
  brand: string[];
  status: string[];
}

export const EMPTY_AP_FILTER_OPTIONS: ActionPlanFilterOptions = {
  area: [], kategori: [], brand: [], status: [],
};

/**
 * Ubah ActionPlanFilterState jadi URLSearchParams siap-pakai,
 * cuma masukin filter yang bukan "all".
 * Catatan: filter `regional` baru dikirim ke API kalau backend
 * (route /api/action-plan) sudah mendukung filter berdasarkan regional_id.
 */
export function filterStateToParams(filters: ActionPlanFilterState): Record<string, string> {
  const params: Record<string, string> = {};
  if (filters.regional !== 'all') params.regional = filters.regional;
  if (filters.area !== 'all') params.area = filters.area;
  if (filters.kategori !== 'all') params.kategori = filters.kategori;
  if (filters.brand !== 'all') params.brand = filters.brand;
  if (filters.status !== 'all') params.status = filters.status;
  return params;
}

function ActionPlanFilterBar({
  value,
  onChange,
  options,
  theme,
  isMobile,
}: {
  value: ActionPlanFilterState;
  onChange: (next: ActionPlanFilterState) => void;
  options: ActionPlanFilterOptions;
  theme: Theme;
  isMobile?: boolean;
}) {
  const t = tk[theme];
  const set = (key: keyof ActionPlanFilterState) =>
    (e: React.ChangeEvent<HTMLSelectElement>) => onChange({ ...value, [key]: e.target.value });

  const [regionalOptions, setRegionalOptions] = useState<RegionalOpt[]>([]);

  useEffect(() => {
    fetch('/api/regionals')
      .then((res) => res.json())
      .then((json) => setRegionalOptions(json?.data?.regionals ?? []))
      .catch((err) => console.error('Gagal ambil regional:', err));
  }, []);

  return (
    <div style={{ background: t.cardbg, border: `1px solid ${t.borderCard}`, borderRadius: 13, padding: isMobile ? 14 : 20 }}>
      <span style={{ fontSize: isMobile ? 10 : 11, fontWeight: 700, color: t.textMuted, fontFamily: 'IBM Plex Mono,monospace', textTransform: 'uppercase', letterSpacing: '.08em', display: 'block', marginBottom: isMobile ? 8 : 10 }}>
        Filter Data
      </span>
      <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr 1fr' : 'repeat(5, auto)', gap: 8, alignItems: 'center', justifyContent: isMobile ? 'stretch' : 'flex-start' }}>
        <FilterSelect label="Regional" accentColor="#10b981" value={value.regional} onChange={set('regional')} theme={theme} fullWidth={isMobile}>
          <option value="all" style={{ background: t.inputBg }}>Semua Regional</option>
          {regionalOptions.map((r) => (
            <option key={r.id} value={r.id} style={{ background: t.inputBg }}>{r.name}</option>
          ))}
        </FilterSelect>

        <FilterSelect label="Area" accentColor="#f59e0b" value={value.area} onChange={set('area')} theme={theme} fullWidth={isMobile}>
          <option value="all" style={{ background: t.inputBg }}>Semua Area</option>
          {options.area.map((a) => <option key={a} value={a} style={{ background: t.inputBg }}>{a}</option>)}
        </FilterSelect>

        <FilterSelect label="Kategori" accentColor="#8b5cf6" value={value.kategori} onChange={set('kategori')} theme={theme} fullWidth={isMobile}>
          <option value="all" style={{ background: t.inputBg }}>Semua Kategori</option>
          {options.kategori.map((c) => <option key={c} value={c} style={{ background: t.inputBg }}>{c}</option>)}
        </FilterSelect>

        <FilterSelect label="Brand" accentColor="#ef4444" value={value.brand} onChange={set('brand')} theme={theme} fullWidth={isMobile}>
          <option value="all" style={{ background: t.inputBg }}>Semua Brand</option>
          {options.brand.map((b) => <option key={b} value={b} style={{ background: t.inputBg }}>{b}</option>)}
        </FilterSelect>

        <div style={{ gridColumn: isMobile ? '1 / -1' : undefined }}>
          <FilterSelect label="Status" accentColor="#3b82f6" value={value.status} onChange={set('status')} theme={theme} fullWidth={isMobile}>
            <option value="all" style={{ background: t.inputBg }}>Semua Status</option>
            {options.status.map((s) => <option key={s} value={s} style={{ background: t.inputBg }}>{s}</option>)}
          </FilterSelect>
        </div>
      </div>
    </div>
  );
}

export { FilterSelect, ActionPlanFilterBar };