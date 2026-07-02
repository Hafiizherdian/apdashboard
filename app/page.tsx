import { KpiMini } from '@/components/KpiMini';
import { Sidebar } from 'lucide-react';

export default function Home() {
  return (
    <main>
      <Sidebar></Sidebar>
      <KpiMini
        bg="var(--bg)"
        border="var(--border)"
        labelColor="var(--label-color)"
        label="Total Users"
        value="1,234"
        sub="↑ 12.5% from last month"
        badge={{ text: "Positive", positive: true }}
        theme="light"
      />
    </main>
  );
}
