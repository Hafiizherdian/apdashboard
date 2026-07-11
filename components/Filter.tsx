'use client';

import { tk, Theme } from './share';


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

export { FilterSelect };