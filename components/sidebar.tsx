'use client';

import { useState, useEffect } from 'react';
import { useAuth, AuthProvider } from '@/lib/auth/AuthContext';
import { UserRole } from '@/lib/auth/types';
import { Theme, tk } from '@/components/share';
import { RoleIcon} from '@/components/Roleicon';
import { ThemeToggle } from '@/components/ThemeToggle';
import {
  TrendingUp, Calendar, BarChart3, PieChart,
  Activity, FileText, Store, Sun, Moon,
  ChevronLeft, Filter, X, LogOut,
  ShieldAlert, ShieldCheck, Shield,
  Boxes, NotepadTextDashed, WalletCards,
} from 'lucide-react';

const TABS=[
  {id:'Overview',        label:'Overview',       shortLabel:'Overview',  Icon:NotepadTextDashed},
  {id:'DataAP',        label:'Data Action Plan',        shortLabel:'DataAP',   Icon:Calendar  },
  {id:'EntryAP',     label:'Entri Action Plan',         shortLabel:'EntryAP',    Icon:BarChart3 },
//   {id:'l4wc4w',        label:'L4W vs C1W',      shortLabel:'L4W',        Icon:Activity  },
//   {id:'yoy',           label:'YoY Growth',      shortLabel:'YoY',        Icon:PieChart  },
//   {id:'outlet',        label:'Outlet',          shortLabel:'Outlet',     Icon:Store     },
//   {id:'analysis',      label:'Brand Performance',shortLabel:'Brand',     Icon:FileText  },
//   {id:'distribution',  label:'Distribusi',      shortLabel:'Distribusi', Icon:Boxes    },
//   {id:'piutang',       label:'Piutang',         shortLabel:'Piutang',    Icon:WalletCards}
] as const;
type TabId = typeof TABS[number]['id'];

function Sidebar({ activeTab, setActiveTab, collapsed, setCollapsed, theme, setTheme }:{
  activeTab:TabId; setActiveTab:(id:TabId)=>void;
  collapsed:boolean; setCollapsed:(v:boolean)=>void;
  theme:Theme; setTheme:(t:Theme)=>void;
}) {
  const t=tk[theme]; 
  const {user,logout}=useAuth();
  
  // State untuk deteksi layar mobile
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile(); // Cek saat pertama kali render
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  return (
    <aside style={{
      position: 'fixed',
      left: 0,
      top: isMobile ? 'auto' : 0, // Di mobile tidak ditarik dari atas
      bottom: isMobile ? 0 : 'auto', // Di mobile menempel di bawah
      height: isMobile ? 60 : '100vh',
      zIndex: 40,
      display: 'flex',
      flexDirection: isMobile ? 'row' : 'column',
      width: isMobile ? '100%' : (collapsed ? 52 : 200),
      background: t.sidebarbg,
      borderRight: isMobile ? 'none' : `1px solid ${t.border}`,
      borderTop: isMobile ? `1px solid ${t.border}` : 'none',
      transition: 'width 0.2s cubic-bezier(.4,0,.2,1)',
      overflowX: 'hidden'
    }}>
      
      {/* Header (Logo & Collapse) - Disembunyikan di Mobile */}
      {!isMobile && (
        <div style={{display:'flex',alignItems:'center',justifyContent:collapsed?'center':'space-between',padding:collapsed?'0':'0 8px 0 12px',borderBottom:`1px solid ${t.border}`,flexShrink:0,minHeight:46}}>
          {collapsed ? (
            <button onClick={()=>setCollapsed(false)} style={{background:'none',border:'none',cursor:'pointer',padding:6,display:'flex'}}>
              <img src="/logo-cgkn.png" alt="CGKN" style={{width:26,height:26,borderRadius:7,objectFit:'contain'}}/>
            </button>
          ) : (
            <>
              <div style={{display:'flex',alignItems:'center',gap:8}}>
                <img src="/logo-cgkn.png" alt="CGKN" style={{width:26,height:26,borderRadius:7,objectFit:'contain',flexShrink:0}}/>
                <div>
                  <div style={{color:t.text,fontSize:12,fontWeight:800,fontFamily:'IBM Plex Mono,monospace',lineHeight:1.1}}>CGKN</div>
                  <div style={{color:t.textMuted,fontSize:8,fontFamily:'IBM Plex Mono,monospace',letterSpacing:'0.1em',textTransform:'uppercase'}}>AP Dashboard</div>
                </div>
              </div>
              <button onClick={()=>setCollapsed(true)} style={{background:t.inputBg,border:`1px solid ${t.borderInput}`,cursor:'pointer',color:t.textMuted,borderRadius:6,width:22,height:22,display:'flex',alignItems:'center',justifyContent:'center'}}>
                <ChevronLeft size={11}/>
              </button>
            </>
          )}
        </div>
      )}

      {/* Navigasi Utama */}
      <nav style={{
        flex: 1,
        padding: isMobile ? '0' : '6px 4px',
        overflowY: isMobile ? 'visible' : 'auto',
        display: 'flex',
        flexDirection: isMobile ? 'row' : 'column',
        justifyContent: isMobile ? 'space-around' : 'flex-start',
        alignItems: 'center'
      }}>
        {TABS.map(({id,label,shortLabel,Icon})=>{
          const active=activeTab===id;
          return (
            <button key={id} onClick={()=>setActiveTab(id)} title={collapsed?label:undefined}
              style={{
                display:'flex',
                alignItems:'center',
                flexDirection: isMobile ? 'column' : 'row', // Ikon di atas teks pada mode mobile
                gap: isMobile ? 4 : 8,
                width: isMobile ? '100%' : '100%',
                minHeight: isMobile ? '100%' : 33,
                padding: isMobile ? '8px 0' : (collapsed ? '5px 0' : '5px 8px'),
                borderRadius: isMobile ? 0 : 7,
                border:'none',
                cursor:'pointer',
                justifyContent: isMobile ? 'center' : (collapsed ? 'center' : 'flex-start'),
                background: isMobile ? 'transparent' : (active ? t.navActiveBg : 'transparent'),
                color: active ? t.navActiveText : t.textNav,
                fontSize: isMobile ? 10 : 12,
                fontWeight: active ? 600 : 400,
                fontFamily:'IBM Plex Sans,sans-serif',
                transition:'all 0.12s',
                marginBottom: isMobile ? 0 : 1,
                position:'relative'
              }}>
              <Icon size={isMobile ? 20 : 13} color={active ? t.navActiveText : t.textMuted}/>
              {(!collapsed || isMobile) && (
                <span style={{
                  flex: isMobile ? 'none' : 1, 
                  textAlign: isMobile ? 'center' : 'left', 
                  overflow:'hidden', 
                  textOverflow:'ellipsis', 
                  whiteSpace:'nowrap', 
                  marginTop: isMobile ? 2 : 0
                }}>
                  {/* Gunakan shortLabel di mobile agar tidak terlalu panjang */}
                  {isMobile ? shortLabel : label}
                </span>
              )}
              {/* Indikator Aktif Desktop (garis vertikal kiri) */}
              {!isMobile && active && <span style={{position:'absolute',left:0,top:'20%',bottom:'20%',width:2,borderRadius:'0 2px 2px 0',background:t.navActiveDot}}/>}
            </button>
          );
        })}
      </nav>

      {/* Footer (Profile & Settings) - Disembunyikan di Mobile agar bersih */}
      {!isMobile && (
        <div style={{padding:collapsed?'8px 4px':'8px',borderTop:`1px solid ${t.border}`,flexShrink:0,display:'flex',flexDirection:'column',gap:5,alignItems:collapsed?'center':'stretch'}}>
          {collapsed ? (
            <>
              <button onClick={()=>setTheme(theme==='dark'?'light':'dark')} style={{background:'none',border:'none',cursor:'pointer',color:t.textMuted,borderRadius:7,width:32,height:32,display:'flex',alignItems:'center',justifyContent:'center'}}>{theme==='dark'?<Sun size={13}/>:<Moon size={13}/>}</button>
              <button onClick={logout} style={{background:t.red.bg,border:`1px solid ${t.red.border}`,cursor:'pointer',borderRadius:7,width:32,height:32,display:'flex',alignItems:'center',justifyContent:'center'}}><LogOut size={12} color={t.red.text}/></button>
            </>
          ) : (
            <>
              {user&&(
                <div style={{padding:'6px 8px',borderRadius:8,background:t.inputBg,border:`1px solid ${t.borderInput}`,display:'flex',alignItems:'center',gap:6}}>
                  <div style={{width:24,height:24,borderRadius:6,background:user.role==='root'?'rgba(139,92,246,0.14)':user.role==='admin'?'rgba(37,99,235,0.12)':'rgba(16,185,129,0.1)',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}><RoleIcon role={user.role} size={11}/></div>
                  <div style={{minWidth:0,flex:1}}>
                    <div style={{fontSize:11,fontWeight:700,color:t.text,fontFamily:'IBM Plex Mono,monospace',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{user.username}</div>
                    <div style={{fontSize:8,color:t.textMuted,fontFamily:'IBM Plex Mono,monospace',textTransform:'uppercase',letterSpacing:'0.08em'}}>{user.role}</div>
                  </div>
                  <button onClick={logout} style={{background:t.red.bg,border:`1px solid ${t.red.border}`,cursor:'pointer',borderRadius:5,width:22,height:22,display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}><LogOut size={10} color={t.red.text}/></button>
                </div>
              )}
              <ThemeToggle theme={theme} setTheme={setTheme}/>
            </>
          )}
        </div>
      )}
    </aside>
  );
}

export { Sidebar, TABS, type TabId };