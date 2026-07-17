'use client';

import { tk, Theme, CardBox, FONT_MONO } from "@/components/share";
import { FileText, ArrowLeft } from 'lucide-react';
import { Table, TableColumn } from "@/components/Table";
import {
  ActionPlanFilterBar,
  DEFAULT_AP_FILTER_STATE,
  EMPTY_AP_FILTER_OPTIONS,
  ActionPlanFilterState,
  ActionPlanFilterOptions,
  filterStateToParams,
} from "@/components/Filter";
import { useCallback, useEffect, useState } from "react";
import ActionPlanDetailView from "@/components/ActionPlanDetailView";

const GAP = 8;

interface TableRow {
  id: number;
  area: string;
  no: string;
  tipe: string;
  brand: string;
  program: string;
  jenis: string;
  mulai: string | null;
  selesai: string | null;
  Angbiaya: number;
  jasa: number;
  posm: number;
  trial: number;
  Totbiaya: number;
  estimasiSales: number;
  tarsales: number;
  costratio: number | null;
  costperpack: number | null;
  status: "Running" | "Closed";
  entri: string | null;
}

function DataAP({ theme }: { theme: Theme }) {
  const t = tk[theme];

  const [filters, setFilters] = useState<ActionPlanFilterState>(DEFAULT_AP_FILTER_STATE);
  const [filterOptions, setFilterOptions] = useState<ActionPlanFilterOptions>(EMPTY_AP_FILTER_OPTIONS);
  const [sortBy, setSortBy] = useState<string>('');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  const handleSort = (key: string) => {
    if (sortBy === key) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(key);
      setSortOrder('asc');
    }
  };

  useEffect(() => {
    fetch("/api/action-plan/filter-options")
      .then((res) => res.json())
      .then((data) => setFilterOptions({
        area: data.area ?? [],
        kategori: data.kategori ?? [],
        brand: data.brand ?? [],
        status: data.status ?? [],
      }))
      .catch((err) => console.error("Gagal ambil opsi filter:", err));
  }, []);

  // Breakpoint disamakan dengan EntriAP (< 1024px agar tablet masuk ke mode Card)
  const [isMobile, setIsMobile] = useState<boolean>(false);
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 1024);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const [data, setData] = useState<TableRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const qs = new URLSearchParams({
        view: "table",
        page: "1",
        pageSize: "100",
        ...filterStateToParams(filters),
      });
      const res = await fetch(`/api/action-plan?${qs.toString()}`);
      if (!res.ok) throw new Error("Gagal mengambil data");
      const json = await res.json();
      setData(json.items as TableRow[]);
    } catch (err) {
      console.error(err);
      setError("Gagal memuat data action plan.");
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const formatDate = (date?: string | null) => {
    if (!date) return "-";
    const d = new Date(date);
    const bulan = [
      "Januari","Februari","Maret","April","Mei","Juni",
      "Juli","Agustus","September","Oktober","November","Desember"
    ];
    return `${String(d.getDate()).padStart(2, "0")}/${bulan[d.getMonth()]}/${String(d.getFullYear()).slice(-2)}`;
  };

  const formatRupiah = (v: number | null | undefined) =>
    (v ?? 0).toLocaleString('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0, maximumFractionDigits: 0 });

  // ---- State untuk modal detail (read-only) ----
  const [detailOpen, setDetailOpen] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState<string | null>(null);
  const [detailData, setDetailData] = useState<any>(null);

  const openDetail = useCallback(async (row: TableRow) => {
    setDetailOpen(true);
    setDetailLoading(true);
    setDetailError(null);
    setDetailData(null);
    try {
      const res = await fetch(`/api/action-plan/${row.id}`);
      if (!res.ok) throw new Error("Gagal mengambil detail");
      const json = await res.json();
      setDetailData(json.data);
    } catch (err) {
      console.error(err);
      setDetailError("Gagal memuat detail action plan.");
    } finally {
      setDetailLoading(false);
    }
  }, []);

  const closeDetail = () => {
    setDetailOpen(false);
    setDetailData(null);
    setDetailError(null);
  };

  const columns: TableColumn<TableRow>[] = [
    { key: "area", label: "Lokasi program", isSticky: true, stickyLeft: 0, sortable: true },
    { key: "no", label: "No AP", isSticky: true, stickyLeft: 113, sortable: true },
    { key: "tipe", label: "Tipe", sortable: true },
    { key: "brand", label: "Brand", sortable: true },
    { key: "program", label: "Nama Program", sortable: true },
    { key: "jenis", label: "Jenis", sortable: true },
    { key: "mulai", label: "Mulai", sortable: true,  
      render: (row) => (
        <span style={{ fontFamily: FONT_MONO, color: t.text, whiteSpace:"nowrap" }}>
          {formatDate(row.mulai)}
        </span>
      ),
    },
    { key: "selesai", label: "Selesai", sortable: true, 
      render: (row) => (
        <span style={{ fontFamily: FONT_MONO, color: t.text, whiteSpace:"nowrap" }}>
          {formatDate(row.selesai)}
        </span>
      ),
    },
    {
      key: "Angbiaya", label: "Anggaran Biaya", align: "right", sortable: true,
      render: (row) => <span style={{ fontFamily: FONT_MONO, color: t.textSub }}>{formatRupiah(row.Angbiaya)}</span>,
    },
    { key: "jasa", label: "Total Jasa", align: "right", sortable: true, 
      render: (row) => <span style={{ fontFamily: FONT_MONO, color: t.textSub }}>{formatRupiah(row.jasa)}</span>,
    },
    { key: "posm", label: "Total POSM", align: "right", sortable: true,
      render: (row) => <span style={{ fontFamily: FONT_MONO, color: t.textSub }}>{formatRupiah(row.posm)}</span>,
     },
    { key: "trial", label: "Total Trial", align: "right", sortable: true,
      render: (row) => <span style={{ fontFamily: FONT_MONO, color: t.textSub }}>{formatRupiah(row.trial)}</span>,
     },
    { key: "Totbiaya", label: "Total Biaya", align: "right", sortable: true,
      render: (row) => <span style={{ fontFamily: FONT_MONO, color: t.textSub }}>{formatRupiah(row.Totbiaya)}</span>,
     },
    { key: "estimasiSales", label: "Estimasi Sales", align: "right", sortable: true },
    { key: "tarsales", label: "Target Sales", align: "right", sortable: true,
      render: (row) => <span style={{ fontFamily: FONT_MONO, color: t.textSub }}>{formatRupiah(row.tarsales)}</span>,
     },
    {
      key: "costratio", label: "Cost Ratio", align: "right", sortable: true,
      render: (row) => <span style={{ fontFamily: FONT_MONO, color: t.textSub }}>{row.costratio !== null ? `${(row.costratio * 100).toFixed(2)}%` : "-"}</span>,
    },
    {
      key: "costperpack", label: "Cost Per Pack", align: "right", sortable: true,
      render: (row) => <span style={{ fontFamily: FONT_MONO, color: t.textSub }}>{row.costperpack !== null ? formatRupiah(row.costperpack) : "-"}</span>,
    },
    { key: "status", label: "Status", align: "center", sortable: true },
    { key: "entri", label: "Entri", align: "center", sortable: true },
    {
      key: "action", label: "Action", align: "center",
      render: (row) => (
        <button
          onClick={() => openDetail(row)}
          style={{ background: t.blue.text, color: t.cardbg, border: 'none', borderRadius: 4, padding: '4px 8px', cursor: 'pointer' }}
        >
          <FileText size={16} style={{ marginRight: 2 }} />
        </button>
      ),
    },
  ];

  const handleFilterChange = (next: ActionPlanFilterState) => {
    setFilters(next);
  };

  const sortedData = [...data].sort((a, b) => {
    if (!sortBy) return 0;
    const valA = (a as any)[sortBy];
    const valB = (b as any)[sortBy];
    if (valA === null || valA === undefined) return 1;
    if (valB === null || valB === undefined) return -1;
    if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
    if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
    return 0;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: GAP }}>
      {!detailOpen && (
        <>
          <ActionPlanFilterBar value={filters} onChange={handleFilterChange} options={filterOptions} theme={theme} isMobile={isMobile} />

          {/* <CardBox theme={theme} title="Daftar Action Plan"> */}
            {error && (
              <div className="p-3 mb-3 rounded-md text-sm border" style={{ backgroundColor: t.red.bg, color: t.red.text, borderColor: t.red.border }}>
                {error}
              </div>
            )}
            
            {loading ? (
              <div className="py-10 text-center text-sm" style={{ color: t.textMuted }}>Memuat data...</div>
            ) : sortedData.length === 0 ? (
              <div className="py-10 text-center text-sm" style={{ color: t.textMuted }}>Belum ada data Action Plan.</div>
            ) : isMobile ? (
              /* ===== TAMPILAN CARD UNTUK MOBILE & TABLET (PERSIS ENTRI AP) ===== */
              <div className="flex flex-col gap-2">
                {sortedData.map((row) => (
                  <div
                    key={row.no}
                    className="rounded-lg border p-3 flex flex-col gap-1.5"
                    style={{ borderColor: t.border, backgroundColor: t.cardbg, color: t.text }}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <div className="text-sm font-semibold truncate">{row.no || "-"}</div>
                        <div className="text-xs truncate" style={{ color: t.text }}>{row.area || "-"}</div>
                      </div>
                      <span
                        className="px-2 py-1 rounded-full text-xs font-medium shrink-0"
                        style={{ backgroundColor: t.chipSlate.bg, color: t.chipSlate.text, border: `1px solid ${t.chipSlate.border}` }}
                      >
                        {row.brand || "-"}
                      </span>
                    </div>

                    <div className="text-sm">{row.program || "-"}</div>

                    <div className="flex items-center justify-between text-xs" style={{ color: t.text }}>
                      <span>{formatDate(row.mulai)} s/d {formatDate(row.selesai) || "-"}</span>
                      <span className="font-medium" style={{ color: t.text }}>{formatRupiah(row.Totbiaya)}</span>
                    </div>

                    <div className="flex items-center justify-end gap-2 pt-1">
                      <button
                        onClick={() => openDetail(row)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium"
                        style={{ background: t.blue.text, color: t.cardbg, border: 'none', cursor: 'pointer' }}
                      >
                        <FileText size={14} /> Detail
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              /* ===== TAMPILAN TABEL UNTUK DESKTOP ===== */
              <Table theme={theme} data={sortedData} columns={columns} rowKey={(row) => row.no} sortBy={sortBy} sortOrder={sortOrder} onSort={handleSort} />
            )}
          {/* </CardBox> */}
        </>
      )}

      {/* ============ DETAIL ACTION PLAN (READ-ONLY, FULL PAGE) ============ */}
      {detailOpen && (
        <div
          className="rounded-2xl overflow-hidden shadow-sm flex flex-col"
          style={{ backgroundColor: t.cardbg, border: `1px solid ${t.borderCard}`, minHeight: 'calc(100vh - 16px)' }}
        >
          {/* Header */}
          <div
            className="shrink-0 flex items-center justify-between gap-3"
            style={{ padding: '12px 16px', borderBottom: `1px solid ${t.borderCard}` }}
          >
            <div className="flex items-center gap-3 min-w-0">
              <button
                onClick={closeDetail}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium shrink-0 transition-colors cursor-pointer"
                style={{ backgroundColor: t.gray.bg, color: t.text, border: `1px solid ${t.border}` }}
              >
                <ArrowLeft size={16} />
                Kembali
              </button>
              <span style={{ fontWeight: 700, fontSize: 14, color: t.textSub }}>
                {detailLoading || !detailData ? "Memuat detail..." : (detailData.nama_program || "Detail Action Plan")}
              </span>
            </div>
          </div>

          {/* Body */}
          <div className="flex-1 overflow-y-auto">
            {detailLoading && (
              <div className="py-10 text-center text-sm" style={{ color: t.textMuted }}>Memuat detail...</div>
            )}
            {detailError && (
              <div className="p-3 m-3 rounded-md text-sm border" style={{ backgroundColor: t.red.bg, color: t.red.text, borderColor: t.red.border }}>
                {detailError}
              </div>
            )}
            {!detailLoading && !detailError && detailData && (
              <ActionPlanDetailView detail={detailData} formatRupiah={(v) => formatRupiah(v)} />
            )}
          </div>

          {/* Footer */}
          {!detailLoading && detailData && (
            <div
              className="shrink-0 px-4 py-3 flex items-center justify-end"
              style={{ borderTop: `1px solid ${t.borderCard}` }}
            >
              <button
                onClick={closeDetail}
                className="px-4 py-2 rounded-md text-sm font-medium transition-colors cursor-pointer"
                style={{ backgroundColor: t.gray.bg, color: t.text, border: `1px solid ${t.border}` }}
              >
                Kembali
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default DataAP;