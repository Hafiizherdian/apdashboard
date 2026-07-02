'use client';

import { Moon, Sun } from "lucide-react";
import { tk, Theme } from "./share";
    

function ThemeToggle({ theme, setTheme, compact=false }:{ theme:Theme; setTheme:(t:Theme)=>void; compact?:boolean }) {
  const t=tk[theme]; const isDark=theme==='dark';
  if (compact) return (
    <button onClick={()=>setTheme(isDark?'light':'dark')}
      style={{width:30,height:30,borderRadius:7,background:t.toggleBg,border:`1px solid ${t.toggleBorder}`,display:'flex',alignItems:'center',justifyContent:'center',cursor:'pointer',color:t.textMuted,flexShrink:0}}>
      {isDark?<Sun size={13}/>:<Moon size={13}/>}
    </button>
  );
  return (
    <button onClick={()=>setTheme(isDark?'light':'dark')}
      style={{display:'flex',alignItems:'center',gap:6,padding:'4px 8px 4px 4px',background:t.toggleBg,border:`1px solid ${t.toggleBorder}`,borderRadius:16,cursor:'pointer',flexShrink:0}}>
      <span style={{position:'relative',display:'inline-flex',width:26,height:15,borderRadius:8,background:isDark?'#1e2d1a':'#e8f0fe',flexShrink:0}}>
        <span style={{position:'absolute',top:2,left:isDark?13:2,width:9,height:9,borderRadius:'50%',background:isDark?'#4ade80':'#2563eb',transition:'left 0.2s',display:'flex',alignItems:'center',justifyContent:'center'}}>
          {isDark?<Moon size={5} color="#07090e"/>:<Sun size={5} color="white"/>}
        </span>
      </span>
      <span style={{fontSize:10,fontWeight:600,color:t.textSub,fontFamily:'IBM Plex Mono,monospace'}}>{isDark?'Dark':'Light'}</span>
    </button>
  );
}

export { ThemeToggle };