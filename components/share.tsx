'use client';

import React, { useRef, useEffect } from 'react';
import { AlertTriangle, X } from 'lucide-react';

export const FONT_SANS = '"IBM Plex Sans", sans-serif';
export const FONT_MONO = '"IBM Plex Mono", monospace';

export type Theme = 'dark' | 'light';

export const tk = {
  dark: {
    // Backgrounds & Layout
    pagebg: '#070a10',
    cardbg: '#0e1120',
    headerbg: '#0a0d14',
    contentBg: '#07090e',
    sidebarbg: '#07120a',
    
    // Typography
    text: 'rgba(255,255,255,0.92)',
    textSub: 'rgba(255,255,255,0.58)',
    textMuted: 'rgba(255,255,255,0.32)',
    textFaint: 'rgba(255,255,255,0.15)',
    sidebarText: 'rgba(255,255,255,0.4)',
    
    // Borders
    border: 'rgba(255,255,255,0.06)',
    borderCard: 'rgba(255,255,255,0.08)',
    borderInput: 'rgba(255,255,255,0.1)',
    borderActive: 'rgba(99,102,241,0.6)',
    sidebarBorder: 'rgba(255,255,255,0.06)',
    
    // Inputs, Toggles & Interactive
    inputbg: 'rgba(255,255,255,0.04)', // Note: Ada `inputbg` dan `inputBg` di kode asli
    inputBg: 'rgba(255,255,255,0.035)', 
    dropzoneActive: 'rgba(99,102,241,0.08)',
    toggleBg: 'rgba(255,255,255,0.055)',
    toggleBorder: 'rgba(255,255,255,0.09)',
    optionBg: '#0b0d13',
    btnDisabled: { bg: 'rgba(255,255,255,0.06)', text: 'rgba(255,255,255,0.2)' },
    
    // Tables & Navigation
    tableHead: '#171b2b',
    tableHeadRed: '#b90202',
    tableBackgroundWarn: '#fee906',
    tableTotal: '#e6f09e',
    tableAlt: 'rgba(255,255,255,0.015)',
    textNav: 'rgba(255,255,255,0.36)',
    navActiveBg: 'rgba(28,151,6,0.11)',
    navActiveText: '#4ade80',
    navActiveDot: '#1c9706',
    
    // UI Elements
    shadow: '0 1px 3px rgba(0,0,0,0.3)',
    shadowCard: '0 4px 20px rgba(0,0,0,0.4)',
    shadowElevated: '0 8px 32px rgba(0,0,0,0.5)',
    modalOverlay: 'rgba(0,0,0,0.75)',
    scrollbar: 'rgba(255,255,255,0.08)',
    rowHover: 'rgba(255,255,255,0.04)',
    
    // Base Colors
    blue:   { bg: 'rgba(99,102,241,0.12)',   text: '#a5b4fc',            border: 'rgba(99,102,241,0.3)'   },
    green:  { bg: 'rgba(16,185,129,0.1)',    text: '#6ee7b7',            border: 'rgba(16,185,129,0.25)'  },
    red:    { bg: 'rgba(239,68,68,0.1)',     text: '#fca5a5',            border: 'rgba(239,68,68,0.22)'   },
    yellow: { bg: 'rgba(245,158,11,0.1)',    text: '#fcd34d',            border: 'rgba(245,158,11,0.28)'  },
    gray:   { bg: 'rgba(255,255,255,0.05)',  text: 'rgba(255,255,255,0.42)', border: 'rgba(255,255,255,0.08)' },
    emerald:{ bg: 'rgba(5,150,105,0.1)',    text: '#6ee7b7',            border: 'rgba(5,150,105,0.25)'   },
    
    // Chips
    chipBlue:   { bg: 'rgba(59,130,246,0.11)',   text: '#93c5fd', border: 'rgba(59,130,246,0.25)'  },
    chipSlate:  { bg: 'rgba(100,116,139,0.11)',  text: '#cbd5e1', border: 'rgba(100,116,139,0.25)' },
    chipOrange: { bg: 'rgba(249,115,22,0.11)',   text: '#fb923c', border: 'rgba(249,115,22,0.25)'  },
    chipGreen:  { bg: 'rgba(16,185,129,0.11)',   text: '#34d399', border: 'rgba(16,185,129,0.25)'  },
    chipRed:    { bg: 'rgba(239,68,68,0.11)',     text: '#f87171', border: 'rgba(239,68,68,0.25)'    },
    
    // Statistics & Cards
    stat1: { accent: '#6366f1', iconBg: 'rgba(99,102,241,0.15)',  glow: 'rgba(99,102,241,0.2)'  },
    stat2: { accent: '#10b981', iconBg: 'rgba(16,185,129,0.15)',  glow: 'rgba(16,185,129,0.2)'  },
    stat3: { accent: '#a855f7', iconBg: 'rgba(168,85,247,0.15)',  glow: 'rgba(168,85,247,0.2)'  },
    stat4: { accent: '#f59e0b', iconBg: 'rgba(245,158,11,0.15)',  glow: 'rgba(245,158,11,0.2)'  },
    
    card1bg: '#0d1a28', card1border: '#1a3a5c', card1text: '#7eb8f7', card1accent: '#3b82f6',
    card2bg: '#0a1d14', card2border: '#1a4530', card2text: '#5edba8', card2accent: '#10b981',
    card3bg: '#1a1108', card3border: '#3d2b08', card3text: '#f5d060', card3accent: '#f59e0b',
    card4bg: '#1a0808', card4border: '#3d0808', card4text: '#f56060', card4accent: '#f50b0b',
    card5bg: '#11180a', card5border: '#365314', card5text: '#bef264', card5accent: '#84cc16',
    card6bg: '#160d24', card6border: '#4c1d95', card6text: '#c4b5fd', card6accent: '#8b5cf6',
    
    // Feedback / Status
    posBg:  'rgba(16,185,129,0.09)', posText:  '#34d399', posBorder:  'rgba(16,185,129,0.2)',
    negBg:  'rgba(239,68,68,0.09)',  negText:  '#f87171', negBorder:  'rgba(239,68,68,0.2)',
    warnBg: 'rgba(245,158,11,0.07)', warnText: '#fbbf24', warnBorder: 'rgba(245,158,11,0.18)',
    
    // Data & Tooltips
    gridStroke: 'rgba(255,255,255,0.04)',
    tooltipBg: '#13161f',
    tooltipBorder: 'rgba(255,255,255,0.09)',

    // Filter
    inputBorder: 'rgba(255,255,255,0.08)', selectBg: '#0c0e14',
  },
  
  light: {
    // Backgrounds & Layout
    pagebg: '#f0f3f9',
    cardbg: '#ffffff',
    headerbg: '#ffffff',
    contentBg: '#eef1f7',
    sidebarbg: '#ffffff',
    
    // Typography
    text: '#0f172a',
    textSub: '#475569',
    textMuted: '#94a3b8',
    textFaint: '#cbd5e1',
    sidebarText: 'rgba(18, 18, 18, 0.5)',
    
    // Borders
    border: 'rgba(0,0,0,0.07)',
    borderCard: 'rgba(0,0,0,0.09)',
    borderInput: 'rgba(0,0,0,0.12)',
    borderActive: '#6366f1',
    sidebarBorder: 'rgba(255,255,255,0.1)',
    
    // Inputs, Toggles & Interactive
    inputbg: '#f8fafc',
    inputBg: 'rgba(0,0,0,0.03)',
    dropzoneActive: 'rgba(99,102,241,0.05)',
    toggleBg: '#f1f5f9',
    toggleBorder: 'rgba(0,0,0,0.09)',
    optionBg: '#ffffff',
    btnDisabled: { bg: '#e2e8f0', text: '#94a3b8' },
    
    // Tables & Navigation
    tableHead: '#97c19c',
    tableHeadRed: '#b90202',
    tableBackgroundWarn: '#fee906',
    tableTotal: '#e6f09e',
    tableAlt: 'rgba(0,0,0,0.012)',
    textNav: '#64748b',
    navActiveBg: 'rgba(28,151,6,0.07)',
    navActiveText: '#15803d',
    navActiveDot: '#1c9706',
    
    // UI Elements
    shadow: '0 1px 2px rgba(0,0,0,0.05)',
    shadowCard: '0 2px 10px rgba(0,0,0,0.07)',
    shadowElevated: '0 8px 32px rgba(0,0,0,0.12)',
    modalOverlay: 'rgba(15,23,42,0.45)',
    scrollbar: 'rgba(0,0,0,0.12)',
    rowHover: 'rgba(0,0,0,0.02)',
    
    // Base Colors
    blue:   { bg: 'rgba(99,102,241,0.08)', text: '#4f46e5', border: 'rgba(99,102,241,0.2)' },
    green:  { bg: '#f0fdf4',               text: '#16a34a', border: '#bbf7d0' },
    red:    { bg: '#fef2f2',               text: '#dc2626', border: '#fecaca' },
    yellow: { bg: '#fffbeb',               text: '#d97706', border: '#fde68a' },
    gray:   { bg: '#f1f5f9',               text: '#64748b', border: 'rgba(0,0,0,0.09)' },
    emerald:{ bg: '#ecfdf5',               text: '#059669', border: '#bbf7d0' },
    
    // Chips
    chipBlue:   { bg: 'rgba(37,99,235,0.07)',  text: '#1d4ed8', border: 'rgba(37,99,235,0.2)'  },
    chipSlate:  { bg: 'rgba(100,116,139,0.07)', text: '#475569', border: 'rgba(100,116,139,0.16)' },
    chipOrange: { bg: 'rgba(234,88,12,0.07)',  text: '#c2410c', border: 'rgba(234,88,12,0.16)' },
    chipGreen:  { bg: 'rgba(22,163,74,0.07)',  text: '#15803d', border: 'rgba(22,163,74,0.16)' },
    chipRed:    { bg: 'rgba(220,38,38,0.07)',  text: '#b91c1c', border: 'rgba(220,38,38,0.16)' },
    
    // Statistics & Cards
    stat1: { accent: '#6366f1', iconBg: '#e0e7ff', glow: 'rgba(99,102,241,0.12)' },
    stat2: { accent: '#10b981', iconBg: '#d1fae5', glow: 'rgba(16,185,129,0.12)' },
    stat3: { accent: '#a855f7', iconBg: '#ede9fe', glow: 'rgba(168,85,247,0.12)' },
    stat4: { accent: '#f59e0b', iconBg: '#fef3c7', glow: 'rgba(245,158,11,0.12)' },
    
    card1bg: '#eff6ff', card1border: '#bfdbfe', card1text: '#1d4ed8', card1accent: '#3b82f6',
    card2bg: '#f0fdf4', card2border: '#bbf7d0', card2text: '#15803d', card2accent: '#10b981',
    card3bg: '#fefce8', card3border: '#fde68a', card3text: '#92400e', card3accent: '#f59e0b',
    card4bg: '#fef2f2', card4border: '#fecaca', card4text: '#b91c1c', card4accent: '#f50b0b',
    card5bg: '#f7fee7', card5border: '#d9f99d', card5text: '#4d7c0f', card5accent: '#84cc16',
    card6bg: '#faf5ff', card6border: '#ddd6fe', card6text: '#6d28d9', card6accent: '#8b5cf6',
    
    // Feedback / Status
    posBg:  '#f0fdf4', posText:  '#15803d', posBorder:  '#bbf7d0',
    negBg:  '#fef2f2', negText:  '#b91c1c', negBorder:  '#fecaca',
    warnBg: '#fffbeb', warnText: '#92400e', warnBorder: '#fde68a',
    
    // Data & Tooltips
    gridStroke: 'rgba(0,0,0,0.045)',
    tooltipBg: '#ffffff',
    tooltipBorder: 'rgba(0,0,0,0.1)',

    // Filter
    inputBorder: 'rgba(0,0,0,0.1)',
    selectBg: '#ffffff',
  },
} as const;

export type Tokens = typeof tk['light'];

export const badge = (bg: string, text: string, border: string): React.CSSProperties => ({
  display: 'inline-flex', alignItems: 'center', gap: 5,
  padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 600,
  fontFamily: FONT_MONO, background: bg, color: text, border: `1px solid ${border}`,
});

export const iconBtn = (bg: string, border: string, size = 32): React.CSSProperties => ({
  width: size, height: size, borderRadius: 8, background: bg,
  border: `1px solid ${border}`, cursor: 'pointer', display: 'flex',
  alignItems: 'center', justifyContent: 'center', transition: 'all 0.15s', flexShrink: 0,
});

export function Spinner({ size = 14, color = 'currentColor' }: { size?: number; color?: string }) {
  return (
    <svg style={{ animation: 'spin 0.8s linear infinite', width: size, height: size }} viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="10" stroke={color} strokeWidth="3" opacity="0.2" />
      <path d="M4 12a8 8 0 018-8" stroke={color} strokeWidth="3" fill="none" strokeLinecap="round" />
    </svg>
  );
}

export function CardBox({ title, icon: Icon, iconColor = '#6366f1', children, noPad, accent, theme }: {
  title: string;
  icon?: React.ComponentType<{ size?: number; color?: string }>;
  iconColor?: string;
  children: React.ReactNode;
  noPad?: boolean;
  accent?: string;
  theme: Theme;
}) {
  const t = tk[theme];
  return (
    <div style={{ background: t.cardbg, border: `1px solid ${t.borderCard}`, borderRadius: 12, overflow: 'hidden', boxShadow: t.shadowCard }}>
      <div style={{ padding: '12px 15px', borderBottom: `1px solid ${t.border}`, display: 'flex', alignItems: 'center', gap: 8, background: accent ? `linear-gradient(90deg, ${accent}0a 0%, transparent 60%)` : undefined }}>
        {Icon && (
          <div style={{ width: 26, height: 26, borderRadius: 7, background: iconColor + '18', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Icon size={13} color={iconColor} />
          </div>
        )}
        <span style={{ fontSize: 13, fontWeight: 700, color: t.text }}>{title}</span>
      </div>
      <div style={noPad ? {} : { padding: '15px' }}>{children}</div>
    </div>
  );
}

export function FormGroup({ label, children, hint, theme }: {
  label: string; children: React.ReactNode; hint?: string; theme: Theme;
}) {
  const t = tk[theme];
  return (
    <div style={{ marginBottom: 14 }}>
      <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: t.textSub, marginBottom: 5 }}>{label}</label>
      {children}
      {hint && <div style={{ fontSize: 11, color: t.textMuted, marginTop: 4, fontFamily: FONT_MONO }}>{hint}</div>}
    </div>
  );
}

export function ConfirmModal({ open, title, message, confirmLabel = 'Konfirmasi', danger = false, onConfirm, onCancel, theme }: {
  open: boolean; title: string; message: string; confirmLabel?: string;
  danger?: boolean; onConfirm: () => void; onCancel: () => void; theme: Theme;
}) {
  const t = tk[theme];
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    const h = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onCancel();
      if (e.key === 'Enter') onConfirm();
    };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, [open, onCancel, onConfirm]);
  if (!open) return null;
  const ac = danger ? t.red : t.yellow;
  return (
    <div ref={ref} onClick={e => { if (e.target === ref.current) onCancel(); }}
      style={{ position: 'fixed', inset: 0, zIndex: 1000, background: t.modalOverlay, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20, backdropFilter: 'blur(4px)' }}>
      <div style={{ background: t.cardbg, border: `1px solid ${t.borderCard}`, borderRadius: 16, padding: 24, width: '100%', maxWidth: 420, boxShadow: t.shadowElevated, animation: 'slideUp 0.2s ease' }}>
        <div style={{ display: 'flex', gap: 12, marginBottom: 20 }}>
          <div style={{ width: 40, height: 40, borderRadius: 10, background: ac.bg, border: `1px solid ${ac.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <AlertTriangle size={18} color={ac.text} />
          </div>
          <div>
            <div style={{ fontSize: 15, fontWeight: 700, color: t.text, marginBottom: 5 }}>{title}</div>
            <div style={{ fontSize: 13, color: t.textSub, lineHeight: 1.65 }}>{message}</div>
          </div>
        </div>
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
          <button onClick={onCancel} style={{ padding: '8px 18px', borderRadius: 9, fontSize: 13, fontWeight: 600, background: t.gray.bg, color: t.gray.text, border: `1px solid ${t.gray.border}`, cursor: 'pointer' }}>Batal</button>
          <button onClick={onConfirm} style={{ padding: '8px 18px', borderRadius: 9, fontSize: 13, fontWeight: 600, background: danger ? '#dc2626' : '#6366f1', color: '#fff', border: 'none', cursor: 'pointer' }}>{confirmLabel}</button>
        </div>
      </div>
    </div>
  );
}

export function StatCard({ label, value, cardKey, icon: Icon, sub, trend, theme }: {
  label: string; value: string; cardKey: 'stat1' | 'stat2' | 'stat3' | 'stat4';
  icon: React.ComponentType<{ size?: number; color?: string }>;
  sub?: string; trend?: 'up' | 'down' | 'neutral'; theme: Theme;
}) {
  const t = tk[theme];
  const s = t[cardKey];
  const [hovered, setHovered] = React.useState(false);
  return (
    <div onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}
      style={{ background: t.cardbg, border: `1px solid ${hovered ? s.accent + '40' : t.borderCard}`, borderRadius: 14, padding: '18px 16px 14px', display: 'flex', flexDirection: 'column', gap: 10, boxShadow: hovered ? `0 6px 24px ${s.glow}` : t.shadowCard, transition: 'all 0.2s ease', position: 'relative', overflow: 'hidden' }}>
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: s.accent, borderRadius: '14px 14px 0 0', opacity: hovered ? 1 : 0.6, transition: 'opacity 0.2s' }} />
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8 }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 10, fontWeight: 700, fontFamily: FONT_MONO, textTransform: 'uppercase', letterSpacing: '0.1em', color: t.textMuted, marginBottom: 8 }}>{label}</div>
          <div style={{ fontSize: 22, fontWeight: 800, fontFamily: FONT_MONO, color: t.text, lineHeight: 1, letterSpacing: '-0.03em', wordBreak: 'break-word' }}>{value}</div>
          {sub && <div style={{ fontSize: 10, color: t.textMuted, marginTop: 4, fontFamily: FONT_MONO }}>{sub}</div>}
        </div>
        <div style={{ width: 42, height: 42, borderRadius: 11, background: s.iconBg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <Icon size={19} color={s.accent} />
        </div>
      </div>
      {trend && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 4, paddingTop: 6, borderTop: `1px solid ${t.border}` }}>
          {trend === 'up'      && <span style={{ fontSize: 10, color: t.green.text, fontFamily: FONT_MONO, fontWeight: 600 }}>↑</span>}
          {trend === 'down'    && <span style={{ fontSize: 10, color: t.red.text,   fontFamily: FONT_MONO, fontWeight: 600 }}>↓</span>}
          {trend === 'neutral' && <span style={{ fontSize: 10, color: t.textMuted,  fontFamily: FONT_MONO }}></span>}
        </div>
      )}
    </div>
  );
}