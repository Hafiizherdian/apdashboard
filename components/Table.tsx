'use client';

import React from 'react';
import { ArrowUpDown } from 'lucide-react';
import { tk, Theme, FONT_MONO } from '@/components/share';

export interface TableColumn<T> {
  key: string;
  label: string;
  align?: 'left' | 'center' | 'right';
  /** Kolom ini akan "menempel" saat tabel di-scroll horizontal (mis. kolom Produk) */
  isSticky?: boolean;
  stickyLeft?: number | string;
  /** Lebar kolom sticky, kalau beda dari `width` biasa */
  stickyWidth?: number | string;
  /** @deprecated pakai align: 'right' */
  numeric?: boolean;
  sortable?: boolean;
  width?: string;
  render?: (row: T, index: number) => React.ReactNode;
  /** Kalau diisi, kolom ini akan dapat baris TOTAL di footer tabel */
  footer?: (rows: T[]) => React.ReactNode;
}

interface TableProps<T> {
  columns: TableColumn<T>[];
  data: T[];
  theme: Theme;
  rowKey: (row: T, index: number) => string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  onSort?: (key: string) => void;
  onRowClick?: (row: T, index: number) => void;
  title?: string;
  badge?: React.ReactNode;
  emptyMessage?: string;
  minWidth?: number;
  /** Kalau diisi, body tabel jadi scrollable (vertikal) dengan header yang tetap menempel di atas */
  maxHeight?: number | string;
  loading?: boolean;
  loadingMessage?: string;
  /** Tampilkan baris TOTAL kalau ada kolom dengan `footer`. Default true. */
  showFooter?: boolean;
  /** true = render sebagai card mandiri (border+shadow+header). false (default) = polos, cocok dipasang di dalam CardBox */
  bordered?: boolean;
}

export function Table<T>({
  columns, data, theme, rowKey, sortBy, sortOrder, onSort, onRowClick,
  title, badge, emptyMessage = 'Tidak ada data yang cocok.', minWidth, maxHeight,
  loading = false, loadingMessage = 'Memuat data…', showFooter = true, bordered = false,
}: TableProps<T>) {
  const t = tk[theme];
  // id unik per instance, dipakai untuk scope CSS hover (technique yang sama dengan StockLevelPabrikTab)
  const uid = React.useId().replace(/[:]/g, '');
  const hoverClass = `tbl-hover-${uid}`;

  const getAlign = (col: TableColumn<T>): 'left' | 'center' | 'right' =>
    col.align ?? (col.numeric ? 'right' : 'left');

  const SortIcon = ({ colKey }: { colKey: string }) => {
    if (!onSort) return null;
    if (sortBy !== colKey) return <ArrowUpDown size={10} style={{ opacity: 0.3 }} />;
    return <ArrowUpDown size={11} color={sortOrder === 'asc' ? t.blue.text : t.green.text} />;
  };

  const stickyCols = columns.filter(c => c.isSticky);
  const lastStickyKey = stickyCols.length ? stickyCols[stickyCols.length - 1].key : null;

  const footerCols = columns.filter(c => c.footer);
  const hasFooter = showFooter && footerCols.length > 0;

  const outerStyle: React.CSSProperties = bordered
    ? { background: t.cardbg, border: `1px solid ${t.borderCard}`, borderRadius: 13, boxShadow: t.shadowCard, overflow: 'hidden' }
    : { overflow: 'hidden' };

  return (
    <div style={outerStyle}>
      {/*
        Kenapa CSS manual, bukan onMouseEnter/onMouseLeave seperti versi lama:
        kolom sticky punya background sendiri (supaya data yang discroll di
        baliknya tidak "tembus pandang"), jadi hover di <tr> saja tidak akan
        kelihatan di kolom sticky. Overlay ini yang bikin hover tetap
        konsisten di seluruh baris, termasuk kolom yang menempel.
      */}
      <style>{`
        .${hoverClass} tr.tbl-row:hover td:not(.tbl-sticky) {
          background-color: ${t.rowHover} !important;
        }
        .${hoverClass} tr.tbl-row:hover td.tbl-sticky {
          background-image: linear-gradient(${t.rowHover}, ${t.rowHover});
        }
      `}</style>

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

      <div className={hoverClass} style={{ overflow: maxHeight ? 'auto' : undefined, overflowX: 'auto', maxHeight }}>
        <table style={{ width: '100%', minWidth, borderCollapse: 'separate', borderSpacing: 0, textAlign: 'left', fontSize: 12 }}>
          <thead>
            <tr>
              {columns.map(col => {
                const align = getAlign(col);
                const canSort = !!onSort && col.sortable !== false;
                const isSticky = !!col.isSticky;
                return (
                  <th
                    key={col.key}
                    onClick={() => canSort && onSort!(col.key)}
                    style={{
                      position: 'sticky', top: 0,
                      padding: '10px 14px', fontSize: 9,
                      fontFamily: FONT_MONO,
                      textTransform: 'uppercase', letterSpacing: '0.07em',
                      color: t.text,
                      fontWeight: 700, whiteSpace: 'nowrap',
                      cursor: canSort ? 'pointer' : 'default',
                      textAlign: align, userSelect: 'none',
                      width: col.width, minWidth: isSticky ? (col.stickyWidth ?? col.width) : undefined,
                      maxWidth: isSticky ? (col.stickyWidth ?? col.width) : undefined,
                      left: isSticky ? (col.stickyLeft ?? 0) : undefined,
                      zIndex: isSticky ? 3 : 2,
                      background: t.tableHead,
                      borderBottom: `1px solid ${t.border}`,
                      boxShadow: col.key === lastStickyKey ? `1px 0 0 ${t.border}` : undefined,
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
            {loading ? (
              <tr>
                <td colSpan={columns.length} style={{ padding: '48px 10px', textAlign: 'center', fontSize: 12, color: t.textMuted, fontFamily: FONT_MONO }}>
                  {loadingMessage}
                </td>
              </tr>
            ) : data.length === 0 ? (
              <tr>
                <td colSpan={columns.length} style={{ padding: '48px 10px', textAlign: 'center', fontSize: 12, color: t.textMuted, fontFamily: FONT_MONO }}>
                  {emptyMessage}
                </td>
              </tr>
            ) : data.map((row, idx) => {
              const isAlt = idx % 2 === 1;
              const rowBg = isAlt ? t.tableAlt : 'transparent';
              // Kolom sticky butuh background solid (bukan transparent) biar data yang
              // discroll di belakangnya tidak tembus pandang — samakan dengan warna baris.
              const stickyBg = isAlt ? t.card1bg : t.cardbg;

              return (
                <tr
                  key={rowKey(row, idx)}
                  className="tbl-row"
                  onClick={onRowClick ? () => onRowClick(row, idx) : undefined}
                  style={{ background: rowBg, borderBottom: `1px solid ${t.border}`, cursor: onRowClick ? 'pointer' : 'default' }}
                >
                  {columns.map(col => {
                    const align = getAlign(col);
                    const isSticky = !!col.isSticky;
                    const stickyStyle: React.CSSProperties = isSticky ? {
                      position: 'sticky',
                      left: col.stickyLeft ?? 0,
                      zIndex: 1,
                      minWidth: col.stickyWidth ?? col.width,
                      maxWidth: col.stickyWidth ?? col.width,
                      background: stickyBg,
                      boxShadow: col.key === lastStickyKey ? `1px 0 0 ${t.border}` : undefined,
                    } : {};

                    if (col.render) {
                      return (
                        <td 
                          key={col.key} 
                          className={isSticky ? 'tbl-sticky' : undefined} 
                          style={{ 
                            padding: '10px 14px', 
                            overflow: 'hidden', 
                            textOverflow: 'ellipsis', 
                            whiteSpace: 'nowrap', 
                            ...stickyStyle }}>
                          {col.render(row, idx)}
                        </td>
                      );
                    }
                    const value = (row as any)[col.key];
                    return (
                      <td
                        key={col.key}
                        className={isSticky ? 'tbl-sticky' : undefined}
                        style={{
                          padding: '10px 14px', textAlign: align,
                          color: t.textSub,
                          fontFamily: align === 'right' ? FONT_MONO : undefined,
                          whiteSpace: 'nowrap',
                          overflow: 'hidden', 
                          textOverflow: 'ellipsis',
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

          {hasFooter && !loading && data.length > 0 && (
            <tfoot>
              <tr>
                {columns.map(col => {
                  const align = getAlign(col);
                  const isSticky = !!col.isSticky;
                  return (
                    <td
                      key={col.key}
                      style={{
                        position: 'sticky', bottom: 0,
                        left: isSticky ? (col.stickyLeft ?? 0) : undefined,
                        zIndex: isSticky ? 3 : 2,
                        padding: '10px 14px', fontFamily: FONT_MONO, fontSize: 11, fontWeight: 800,
                        color: t.text, background: t.tableHead, borderTop: `2px solid ${t.borderInput}`,
                        whiteSpace: 'nowrap', textAlign: align,
                        minWidth: isSticky ? (col.stickyWidth ?? col.width) : undefined,
                        maxWidth: isSticky ? (col.stickyWidth ?? col.width) : undefined,
                        boxShadow: col.key === lastStickyKey ? `1px 0 0 ${t.border}` : undefined,
                      }}
                    >
                      {col.footer ? col.footer(data) : null}
                    </td>
                  );
                })}
              </tr>
            </tfoot>
          )}
        </table>
      </div>
    </div>
  );
}

export default Table;