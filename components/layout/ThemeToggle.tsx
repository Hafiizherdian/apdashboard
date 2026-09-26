'use client';

import { Moon, Sun } from "lucide-react";
import { tk, Theme } from "./share";

interface ThemeToggleProps {
  theme: Theme;
  setTheme: (t: Theme) => void;
  compact?: boolean;
}

function ThemeToggle({ theme, setTheme, compact = false }: ThemeToggleProps) {
  const t = tk[theme];
  const isDark = theme === 'dark';

  const toggleTheme = () => setTheme(isDark ? 'light' : 'dark');

  // COMPACT VARIANT (Juga diperbesar ke standar sentuhan jari 44px)
  if (compact) {
    return (
      <button
        onClick={toggleTheme}
        aria-label={`Beralih ke mode ${isDark ? 'terang' : 'gelap'}`}
        title={`Mode ${isDark ? 'Gelap' : 'Terang'}`}
        style={{
          width: 44, 
          height: 44, 
          borderRadius: 14,
          background: t.toggleBg || (isDark ? '#1e293b' : '#f1f5f9'),
          border: `1px solid ${t.toggleBorder || 'transparent'}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          color: isDark ? '#fbbf24' : '#64748b',
          flexShrink: 0,
          transition: 'all 0.2s ease',
          outline: 'none',
        }}
      >
        {isDark ? <Moon size={22} /> : <Sun size={22} />}
      </button>
    );
  }

  // FULL VARIANT (Disesuaikan dengan referensi gambar)
  return (
    <button
      onClick={toggleTheme}
      aria-label={`Beralih ke mode ${isDark ? 'terang' : 'gelap'}`}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 16, // Jarak antara switch dan teks diperbesar
        padding: '10px 28px 10px 12px', // Padding luar jauh lebih lega
        background: t.toggleBg || (isDark ? '#1e293b' : '#f4f6f8'), // Sedikit abu-abu terang sesuai gambar
        border: `1px solid ${t.toggleBorder || (isDark ? '#334155' : '#e2e8f0')}`,
        borderRadius: 999, // Membulat sempurna (pill shape)
        cursor: 'pointer',
        flexShrink: 0,
        transition: 'all 0.3s ease',
        outline: 'none',
      }}
    >
      {/* Pill Container (Track Switch) */}
      <span
        style={{
          position: 'relative',
          display: 'inline-flex',
          width: 80, // Lebar track diperbesar
          height: 32, // Tinggi track diperbesar
          borderRadius: 32,
          background: isDark ? '#0f172a' : '#cbd5e1', // Warna track saat light agak gelap/abu seperti gambar
          flexShrink: 0,
          transition: 'background 0.9s ease',
          alignItems: 'center',
        }}
      >
        {/* Animated Thumb (Lingkaran dalam) */}
        <span
          style={{
            position: 'absolute',
            left: 4, // Jarak dari tepi kiri
            width: 24, // Lingkaran diperbesar
            height: 24, // Lingkaran diperbesar
            borderRadius: '50%',
            background: isDark ? '#fefefe' : '#ffffff',
            // Pergeseran disesuaikan dengan ukuran track baru (56 - 4 - 24 = 28)
            // Jadi bergeser ke kanan sejauh 24px
            transform: isDark ? 'translateX(48px)' : 'translateX(0)',
            transition: 'transform 0.4s cubic-bezier(0.4, 0.0, 0.2, 1), background 0.3s ease',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: isDark ? 'none' : '0 2px 4px rgba(0,0,0,0.15)', // Shadow agar mirip timbul di gambar
          }}
        >
          {isDark ? (
            <Moon size={14} color="#0f172a" strokeWidth={2.5} />
          ) : (
            <Sun size={14} color="#f59e0b" strokeWidth={2.5} /> // Icon matahari berwarna oranye seperti di gambar
          )}
        </span>
      </span>
      
      {/* Label Text */}
      <span
        style={{
          fontSize: 15, // Teks diperbesar agar seimbang dengan switch
          fontWeight: 600,
          color: t.textSub || (isDark ? '#94a3b8' : '#334155'), // Warna teks biru tua/gelap
          fontFamily: 'IBM Plex Mono, monospace, sans-serif',
          letterSpacing: '0.5px', // Spasi antar huruf sedikit diregangkan
        }}
      >
        {isDark ? 'Dark' : 'Light'}
      </span>
    </button>
  );
}

export { ThemeToggle };