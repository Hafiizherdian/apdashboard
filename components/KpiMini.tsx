'use client';

import { tk, Theme } from "./share";


function KpiMini({ bg, border, labelColor, label, value, sub, badge, theme, accent }:{
  bg:string; border:string; labelColor:string; label:string; value:string; sub?:string;
  badge?:{text:string; positive:boolean}; theme:Theme; accent?:string;
}) {
  const t = tk[theme];
  // Contoh sebelum di-render ke {value}
  const formattedValue = value.replace(/\s/g, '');
  return (
    <div style={{ borderRadius:12, padding:'14px 16px 12px', background:bg, border:`1px solid ${border}`, display:'flex', flexDirection:'column', gap:6, position:'relative', overflow:'hidden' }}>
      {accent && <div style={{ position:'absolute', top:-18, right:-18, width:64, height:64, borderRadius:'50%', background:`${accent}18`, pointerEvents:'none' }}/>}
      <div style={{ fontSize:9, fontFamily:'IBM Plex Mono, monospace', textTransform:'uppercase', letterSpacing:'0.1em', color:labelColor, fontWeight:700 }}>{label}</div>
      <div style={{ fontSize:26, fontWeight:800, color:t.text, fontFamily:'IBM Plex Mono, monospace', letterSpacing:'-0.04em', lineHeight:1 }}>{formattedValue}</div>
      {sub && <div style={{ fontSize:9.5, color:t.textMuted, fontFamily:'IBM Plex Mono, monospace', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{sub}</div>}
      {badge && (
        <span style={{ position:'absolute', top:14, right:16, display:'inline-flex', alignItems:'center', gap:3, padding:'2px 7px', borderRadius:10, width:'fit-content', fontSize:9, fontWeight:700, fontFamily:'IBM Plex Mono, monospace', background:badge.positive?t.posBg:t.negBg, color:badge.positive?t.posText:t.negText, border:`1px solid ${badge.positive?t.posBorder:t.negBorder}` }}>
          {badge.positive}
          {badge.text}
        </span>
      )}
    </div>
  );
}

export { KpiMini };