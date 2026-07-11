'use client';

import React from 'react';
import { ArrowUpDown } from 'lucide-react';
import { tk, Theme, FONT_MONO } from '@/components/share';

export interface TableColumn<T> {
  key: string;
  label: string;
  align?: 'left' | 'center' | 'right';
  isSticky?: boolean;
  stickyLeft?: number | string;
  /** @deprecated pakai align: 'right' */
  numeric?: boolean;
  sortable?: boolean;
  width?: string;
  render?: (row: T, index: number) => React.ReactNode;
}

interface TableProps<T> {
  columns: TableColumn<T>[];
  data: T[];
  theme: Theme;
  rowKey: (row: T, index: number) => string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  onSort?: (key: string) => void;
  title?: string;
  badge?: React.ReactNode;
  emptyMessage?: string;
  minWidth?: number;
  /** true = render sebagai card mandiri (border+shadow+header). false (default) = polos, cocok dipasang di dalam CardBox */
  bordered?: boolean;
}

export function Table<T>({
  columns, data, theme, rowKey, sortBy, sortOrder, onSort,
  title, badge, emptyMessage = 'Tidak ada data yang cocok.', minWidth, bordered = false,
}: TableProps<T>) {
  const t = tk[theme];
  const rowHover = theme === 'dark' ? 'rgba(255,255,255,0.045)' : 'rgba(0,0,0,0.035)';

  const getAlign = (col: TableColumn<T>): 'left' | 'center' | 'right' =>
    col.align ?? (col.numeric ? 'right' : 'left');

  const SortIcon = ({ colKey }: { colKey: string }) => {
    if (!onSort) return null;
    if (sortBy !== colKey) return <ArrowUpDown size={10} style={{ opacity: 0.3 }} />;
    return <ArrowUpDown size={11} color={sortOrder === 'asc' ? t.blue.text : t.green.text} />;
  };

  const outerStyle: React.CSSProperties = bordered
    ? { background: t.cardbg, border: `1px solid ${t.borderCard}`, borderRadius: 13, boxShadow: t.shadowCard, overflow: 'hidden' }
    : { overflow: 'hidden' };

  return (
    <div style={outerStyle}>
      {(title || badge) && (
        <div style={{
          padding: bordered ? '10px 16px' : '0 0 10px',
          borderBottom: bordered ? `1px solid ${t.border}` : 'none',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          background: bordered ? t.tableHead : 'transparent',
        }}>
          {title && (
            <span style={{ fontSize: 10, fontWeight: 700, color: t.textMuted, fontFamily: FONT_MONO, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              {title}
            </span>
          )}
          {badge && (
            typeof badge === 'string' ? (
              <span style={{
                fontSize: 10, fontFamily: FONT_MONO, color: t.textSub,
                padding: '2px 9px', borderRadius: 12, border: `1px solid ${t.border}`,
              }}>
                {badge}
              </span>
            ) : badge
          )}
        </div>
      )}

      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', minWidth, borderCollapse: 'collapse', textAlign: 'left', fontSize: 12 }}>
          <thead>
            <tr style={{ background: t.tableHead, borderBottom: `1px solid ${t.border}` }}>
              {columns.map(col => {
                const align = getAlign(col);
                const canSort = !!onSort && col.sortable !== false;
                return (
                  <th
                    key={col.key}
                    onClick={() => canSort && onSort!(col.key)}
                    style={{
                      padding: '10px 14px', fontSize: 9,
                      fontFamily: FONT_MONO,
                      textTransform: 'uppercase', letterSpacing: '0.07em',
                      color: sortBy === col.key ? t.text : t.text,
                      fontWeight: 700, whiteSpace: 'nowrap',
                      cursor: canSort ? 'pointer' : 'default',
                      textAlign: align, userSelect: 'none', width: col.width,
                      position: col.isSticky ? 'sticky' : 'static',
                      left: col.isSticky ? (col.stickyLeft || 0) : 'auto',
                      zIndex: col.isSticky ? 10 : 1,
                      background: col.isSticky ? t.tableHead : 'transparent',
                      boxShadow: col.isSticky ? `1px 0 0 ${t.border}` : 'none',
                    }}
                  >
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: 4, justifyContent: align === 'right' ? 'flex-end' : align === 'center' ? 'center' : 'flex-start', width: '100%' }}>
                      {col.label}
                      {canSort && <SortIcon colKey={col.key} />}
                    </div>
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {data.length === 0 ? (
              <tr>
                <td colSpan={columns.length} style={{ padding: '48px 10px', textAlign: 'center', fontSize: 12, color: t.textMuted, fontFamily: FONT_MONO }}>
                  {emptyMessage}
                </td>
              </tr>
            ) : data.map((row, idx) => {
              const isAlt = idx % 2 === 1;
              const rowBg = isAlt ? t.tableAlt : 'transparent';
              return (
                <tr
                  key={rowKey(row, idx)}
                  style={{ background: rowBg, transition: 'background 0.1s', borderBottom: `1px solid ${t.border}` }}
                  onMouseEnter={e => (e.currentTarget.style.background = rowHover)}
                  onMouseLeave={e => (e.currentTarget.style.background = rowBg)}
                >
                  {columns.map(col => {
                    const align = getAlign(col);

                    const stickyStyle: React.CSSProperties = col.isSticky ? {
                        position: 'sticky',
                        left: col.stickyLeft || 0,
                        zIndex: 1,
                        background: t.tableHead,
                        boxShadow: `1px 0 0 ${t.border}`,
                    } : {};
                    if (col.render) {
                      return <td key={col.key} style={{ padding: '10px 14px', ...stickyStyle }}>{col.render(row, idx)}</td>;
                    }
                    const value = (row as any)[col.key];
                    return (
                      <td
                        key={col.key}
                        style={{
                          padding: '10px 14px', textAlign: align,
                          color: t.textSub,
                          fontFamily: align === 'right' ? FONT_MONO : undefined,
                          whiteSpace: 'nowrap',
                          ...stickyStyle,
                        }}
                      >
                        {value !== undefined && value !== null && value !== '' ? String(value) : <span style={{ color: t.textMuted }}>—</span>}
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default Table;