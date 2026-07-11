'use client';

import { useState } from 'react';
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
          marginLeft: collapsed ? 52 : 200,
          transition: 'margin-left 0.2s cubic-bezier(.4,0,.2,1)',
          padding: 20,
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