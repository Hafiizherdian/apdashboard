'use client';

import { tk, Theme, CardBox, FONT_MONO } from "@/components/share";
import { FileText, X, ArrowLeft } from 'lucide-react';
import { Table, TableColumn } from "@/components/Table";
import { ActionPlanFilterBar, DEFAULT_AP_FILTER_STATE, EMPTY_AP_FILTER_OPTIONS, ActionPlanFilterState, ActionPlanFilterOptions } from "@/components/Filter";
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
  estsales: number;
  tarsales: number;
  costratio: number | null;
  costperpack: number | null;
  status: "Running" | "Selesai";
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


  const [isMobile, setIsMobile] = useState<boolean>(false);
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
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
      const res = await fetch(`/api/action-plan?view=table&page=1&pageSize=100`);
      if (!res.ok) throw new Error("Gagal mengambil data");
      const json = await res.json();
      setData(json.items as TableRow[]);
    } catch (err) {
      console.error(err);
      setError("Gagal memuat data action plan.");
    } finally {
      setLoading(false);
    }
  }, []);

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

  const formatRupiah = (v: number) =>
    (v ?? 0).toLocaleString('id-ID', { style: 'currency', currency: 'IDR' });

  const columns: TableColumn<TableRow>[] = [
    { key: "area", label: "Area", isSticky: true, stickyLeft: 0, sortable: true },
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
      render: (row) => (
        <span style={{ fontFamily: FONT_MONO, color: t.textSub }}>
          {row.Angbiaya ? row.Angbiaya.toLocaleString('id-ID', { style: 'currency', currency: 'IDR' }) : '—'}
        </span>
      ),
    },
    { key: "jasa", label: "Total Jasa", align: "right", sortable: true },
    { key: "posm", label: "Total POSM", align: "right", sortable: true },
    { key: "trial", label: "Total Trial", align: "right", sortable: true },
    { key: "Totbiaya", label: "Total Biaya", align: "right", sortable: true },
    { key: "estsales", label: "Estimasi Sales", align: "right", sortable: true },
    { key: "tarsales", label: "Target Sales", align: "right", sortable: true },
    {
      key: "costratio", label: "Cost Ratio", align: "right", sortable: true,
      render: (row) => <span style={{ fontFamily: FONT_MONO, color: t.textSub }}>{row.costratio !== null ? `${(row.costratio * 100).toFixed(2)}%` : "-"}</span>,
    },
    {
      key: "costperpack", label: "Cost Per Pack", align: "right", sortable: true,
      render: (row) => <span style={{ fontFamily: FONT_MONO, color: t.textSub }}>{row.costperpack !== null ? row.costperpack.toLocaleString('id-ID', { style: 'currency', currency: 'IDR' }) : "-"}</span>,
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
          <ActionPlanFilterBar value={filters} onChange={setFilters} options={filterOptions} theme={theme} isMobile={isMobile} />

          <CardBox theme={theme} title="Daftar Action Plan">
            {error && (
              <div className="p-3 mb-3 rounded-md text-sm border" style={{ backgroundColor: t.red.bg, color: t.red.text, borderColor: t.red.border }}>
                {error}
              </div>
            )}
            {loading ? (
              <div className="py-10 text-center text-sm" style={{ color: t.textMuted }}>Memuat data...</div>
            ) : (
              <Table theme={theme} data={sortedData} columns={columns} rowKey={(row) => row.no} sortBy={sortBy} sortOrder={sortOrder} onSort={handleSort} />
            )}
          </CardBox>
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
              <ActionPlanDetailView detail={detailData} formatRupiah={formatRupiah} />
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