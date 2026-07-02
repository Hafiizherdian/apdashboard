'use client';

import { tk, Theme } from "./share";


function Card({ children, theme, title, icon, color, sub, style, accent }:{
  children: React.ReactNode; theme: Theme;
  title?: string; icon?: React.ReactNode; color?: string; accent?: string;
  sub?: string; style?: React.CSSProperties;
}) {
  const t = tk[theme];
  return (
    <div style={{
      background: t.cardbg, border: `1px solid ${t.borderCard}`, borderRadius: 13,
      padding: '10px 12px 8px', display: 'flex', flexDirection: 'column',
      overflow: 'hidden', boxShadow: t.shadowCard, position: 'relative',
      transition: 'box-shadow 0.18s ease', ...style,
    }}>
      {accent && <div style={{ position:'absolute', top:0, left:16, right:16, height:2, borderRadius:'0 0 2px 2px', background:`linear-gradient(90deg, ${accent}55, ${accent}22)` }}/>}
      {title && (
        <div style={{ display:'flex', alignItems:'center', gap:7, marginBottom:8, flexShrink:0 }}>
          {icon && color && (
            <div style={{ width:22, height:22, borderRadius:6, background:`${color}15`, border:`1px solid ${color}28`, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
              {icon}
            </div>
          )}
          <div style={{ minWidth:0, flex:1 }}>
            <div style={{ fontSize:11, fontWeight:700, color:t.text, fontFamily:'IBM Plex Sans, sans-serif', lineHeight:1.25, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{title}</div>
            {sub && <div style={{ fontSize:8.5, color:t.textMuted, fontFamily:'IBM Plex Mono, monospace', marginTop:1 }}>{sub}</div>}
          </div>
        </div>
      )}
      <div style={{ flex:1, minHeight:0, display:'flex', flexDirection:'column' }}>{children}</div>
    </div>
  );
}

export { Card };