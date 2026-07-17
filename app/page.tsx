'use client';

import { useState, useEffect } from 'react';
import { AuthProvider } from '@/lib/auth/AuthContext';
import { Sidebar, TabId } from '@/components/sidebar';
import { tk, Theme } from '@/components/share';
import Overview from '@/menu/Overview';
import DataAP from '@/menu/DataAP';
import EntriAP from '@/menu/EntriAP';

function DashboardContent() {
  const [activeTab, setActiveTab] = useState<TabId>('Overview');
  const [collapsed, setCollapsed] = useState(false);
  const [theme, setTheme] = useState<Theme>('light');
  
  // 1. Tambahkan state untuk mendeteksi layar mobile
  const [isMobile, setIsMobile] = useState(false);

  // 2. Tambahkan event listener untuk resize window
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile(); // Cek saat pertama kali render
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const t = tk[theme];

  return (
    <div style={{ minHeight: '100vh', background: t.pagebg }}>
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        collapsed={collapsed}
        setCollapsed={setCollapsed}
        theme={theme}
        setTheme={setTheme}
      />
      <main
        style={{
          // 3. Ubah marginLeft menjadi 0 jika di mode mobile
          marginLeft: isMobile ? 0 : (collapsed ? 52 : 200),
          transition: 'margin-left 0.2s cubic-bezier(.4,0,.2,1)',
          padding: 20,
          // 4. Beri padding-bottom lebih besar di mobile agar konten tidak tertutup nav bawah (tinggi nav ~60px)
          paddingBottom: isMobile ? 80 : 20, 
          minHeight: '100vh',
        }}
      >
        {activeTab === 'Overview' && <Overview theme={theme} />}
        {activeTab === 'DataAP' && <DataAP theme={theme} />}
        {activeTab === 'EntryAP' && <EntriAP theme={theme} />}
      </main>
    </div>
  );
}

export default function Home() {
  return (
    <AuthProvider>
      <DashboardContent />
    </AuthProvider>
  );
}