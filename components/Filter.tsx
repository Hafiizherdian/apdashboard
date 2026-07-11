'use client';

import { tk, Theme } from './share';

// Regional belum ada sumber datanya di DB — dibiarkan statis dulu
export const REGIONAL_OPTIONS = [
  { label: 'Regional A', value: 'Regional-A' },
  { label: 'Regional B', value: 'Regional-B' },
];

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

  return (
    <div style={{ background: t.cardbg, border: `1px solid ${t.borderCard}`, borderRadius: 13, padding: isMobile ? 14 : 20 }}>
      <span style={{ fontSize: isMobile ? 10 : 11, fontWeight: 700, color: t.textMuted, fontFamily: 'IBM Plex Mono,monospace', textTransform: 'uppercase', letterSpacing: '.08em', display: 'block', marginBottom: isMobile ? 8 : 10 }}>
        Filter Data
      </span>
      <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr 1fr' : 'repeat(5, auto)', gap: 8, alignItems: 'center', justifyContent: isMobile ? 'stretch' : 'flex-start' }}>
        <FilterSelect label="Regional" accentColor="#10b981" value={value.regional} onChange={set('regional')} theme={theme} fullWidth={isMobile}>
          <option value="all" style={{ background: t.inputBg }}>Semua Regional</option>
          {REGIONAL_OPTIONS.map((o) => <option key={o.value} value={o.value} style={{ background: t.inputBg }}>{o.label}</option>)}
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