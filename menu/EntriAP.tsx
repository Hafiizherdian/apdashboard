"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  FileText,
  Trash2,
  ArrowLeft,
  Info,
  ClipboardList,
  Target,
  TrendingUp,
  Megaphone,
  MapPin,
  Layers,
  Wallet,
  Package,
  Tag,
  Wallet2,
} from "lucide-react";
import { tk, Theme, Spinner, ConfirmModal, FormGroup, FONT_MONO, CardBox } from "@/components/share";
import { ActionPlanFilterBar, DEFAULT_AP_FILTER_STATE, EMPTY_AP_FILTER_OPTIONS, ActionPlanFilterState, ActionPlanFilterOptions } from "@/components/Filter";
import ExcelReplicaBody from "@/components/apreplica"


// ---------- Types ----------

interface ActionPlanListItem {
  id: number;
  no_action_plan: string | null;
  perwakilan_agen: string | null;
  brand: string | null;
  nama_program: string | null;
  tgl_mulai: string | null;
  tgl_selesai: string | null;
  total_biaya: number | null;
  created_at: string;
}

interface ActionPlanDetail extends ActionPlanListItem {
  jenis_program: string | null;
  lokasi_program: string | null;
  ditujukan_kepada: string | null;
  tembusan: string[] | null;
  lama_program_hari: number | null;
  total_biaya_yang_dibutuhkan: number | null;
  cost_ratio_percent: number | null;
  source_filename: string | null;
  uraian: string | null;
  LatarBelakang: string | null;
  Objektif: string | null;
  TargetProgram: {
    id: number;
    uraian: string;
    brand: string;
    wbp: number | null;
    rbp: number | null;
    cbp: number | null;
    estimasiSales: number | null;
    estimasiTotal: number | null;
  }[];
  TargetEvent: {
    id: number;
    JenisProgram: string;
    target: string;
    brand: string;
    qty: number | null;
    harga: number | null;
    TargetPenjualan: number | null;
    estimasiTotal: number | null;
  }[];
  DataDistribusi: {
    id: number;
    wilayah: string;
    outlet: number | null;
    avaibility: number | null;
    visibility: number | null;
    avg: number | null;
    status: string | null;
    keterangan: string | null;
    estimasiTotal: number | null;
  }[];
  Mekanisme: string | null;
  anggaranBiaya: {
    id: number;
    uraian: string;
    qty: number | null;
    satuan: string | null;
    hargaUnit: number | null;
    totalBiaya: number | null;
  }[];
  thl: {
    id: number;
    jasaperorg: string;
    jumlahtng: number | null;
    harikerja: number | null;
    imbalanperhari: number | null;
    estimasiTotal: number | null;
  }[];
  barangPromo: {
    id: number;
    namaBarang: string;
    origin: string | null;
    satuan: string | null;
    qty: number | null;
    hargaUnit: number | null;
    estimasiTotal: number | null;
  }[];
  brandjln: {
    id: number;
    Programjln: string;
    qtybks: number | null;
    hrgbks: number | null;
    Nominal: number | null;
    estimasiTotal: number | null;
  }[];
  tbyd: {
    id: number;
    biayapromo: number | null;
    jasaperorg: number | null;
    kbtbrgprm: number | null;
    trialtaste: number | null;
    estimasiTotal: number | null;
  }[];
  transfer: {
    id: number;
    jenis: string;
    tanggal: string | null;
    jumlah: number | null;
  }[];
  analisa: {
    id: number;
    analisabiaya: string;
    costperpack: number | null;
    costratio: number | null;
    totalcostperpack: number | null;
    totalcostratio: number | null;
  }[];
}

const formatRupiah = (n: number | null | undefined) => {
  if (n === null || n === undefined) return "-";
  return `Rp${n.toLocaleString("id-ID")}`;
};

const GAP = 8;

const DETAIL_SECTIONS: { id: string; label: string;}[] = [
  { id: "sec-info", label: "Informasi Utama", },
  { id: "sec-latar", label: "Latar Belakang",},
  { id: "sec-objektif", label: "Objektif", },
  { id: "sec-target-program", label: "Target Program", },
  { id: "sec-target-event", label: "Target Event", },
  { id: "sec-distribusi", label: "Data Distribusi", },
  { id: "sec-mekanisme", label: "Mekanisme", },
  { id: "sec-anggaran", label: "Anggaran", },
  { id: "sec-thl", label: "THL", },
  { id: "sec-barang", label: "Barang Promo", },
  { id: "sec-brand", label: "Brand", },
  { id: "sec-Totalbiaya", label: "Total Biaya", },
  { id: "sec-transfer", label: "Transfer", },
  { id: "sec-analisa", label: "Analisa", },
];

// ---------- API helpers ----------

async function apiFetchList(params: { page: number; pageSize: number; search: string }) {
  const qs = new URLSearchParams({
    page: String(params.page),
    pageSize: String(params.pageSize),
    ...(params.search ? { search: params.search } : {}),
  });
  const res = await fetch(`/api/action-plan?${qs.toString()}`);
  if (!res.ok) throw new Error("Gagal mengambil daftar action plan");
  const json = await res.json();
  return { items: json.items as ActionPlanListItem[], total: json.total as number };
}

async function apiFetchDetail(id: number) {
  const res = await fetch(`/api/action-plan/${id}`);
  if (!res.ok) throw new Error("Gagal mengambil detail action plan");
  const json = await res.json();
  return json.data as ActionPlanDetail;
}

async function apiSaveDetail(id: number, data: Partial<ActionPlanDetail>) {
  const res = await fetch(`/api/action-plan/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Gagal menyimpan perubahan");
  const json = await res.json();
  return json.data as ActionPlanDetail;
}

async function apiDelete(id: number) {
  const res = await fetch(`/api/action-plan/${id}`, { method: "DELETE" });
  if (!res.ok) throw new Error("Gagal menghapus data");
}

async function apiUpload(file: File) {
  const formData = new FormData();
  formData.append("file", file);
  const res = await fetch("/api/action-plan/upload", { method: "POST", body: formData });
  const json = await res.json();
  if (!res.ok) throw new Error(json?.error || "Gagal upload file");
  return json.id as number;
}

// ---------- Component ----------

export default function EntriAP({ theme }: { theme: Theme }) {
  const [filters, setFilters] = useState<ActionPlanFilterState>(DEFAULT_AP_FILTER_STATE);
  const [filterOptions, setFilterOptions] = useState<ActionPlanFilterOptions>(EMPTY_AP_FILTER_OPTIONS);
  const [sortBy, setSortBy] = useState<string>("");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");

  const handleSort = (key: string) => {
    if (sortBy === key) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(key);
      setSortOrder("asc");
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
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const [items, setItems] = useState<ActionPlanListItem[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [loadingList, setLoadingList] = useState(false);
  const [listError, setListError] = useState<string | null>(null);

  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [detail, setDetail] = useState<ActionPlanDetail | null>(null);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<ActionPlanDetail>>({});

  const [deleteId, setDeleteId] = useState<number | null>(null);

  const modalScrollRef = useRef<HTMLDivElement>(null);

  const pageSize = 20;
  const currentTheme: Theme = theme;
  const t = tk[currentTheme];

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  // Handler untuk mengedit data di dalam tabel (Harga Brand, Anggaran, Barang Promo)
  const handleTableChange = (
    tableName: "TargetProgram" | "TargetEvent" | "anggaranBiaya" | "thl" | "barangPromo" | "DataDistribusi" | "Mekanisme" | "brandjln" | "tbyd" | "transfer" | "analisa",
    index: number,
    field: string,
    value: any
  ) => {
    setEditForm((prev) => {
      const updatedTable = [...((prev[tableName] as any[]) || [])];
      updatedTable[index] = { ...updatedTable[index], [field]: value };
      return { ...prev, [tableName]: updatedTable };
    });
  };

  const fetchList = useCallback(async () => {
    setLoadingList(true);
    setListError(null);
    try {
      const { items, total } = await apiFetchList({ page, pageSize, search });
      setItems(items);
      setTotal(total);
    } catch (err) {
      console.error("Gagal fetch list:", err);
      setListError("Gagal memuat daftar action plan. Cek koneksi ke server / API.");
      setItems([]);
      setTotal(0);
    } finally {
      setLoadingList(false);
    }
  }, [page, search]);

  useEffect(() => {
    fetchList();
  }, [fetchList]);

  const handleUpload = async (file: File) => {
    setUploading(true);
    setUploadError(null);
    try {
      const newId = await apiUpload(file);
      setPage(1);
      await fetchList();
      await openDetail(newId);
    } catch (err: any) {
      console.error("Gagal upload:", err);
      setUploadError(err?.message || "Terjadi kesalahan saat upload.");
    } finally {
      setUploading(false);
    }
  };

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleUpload(file);
    e.target.value = "";
  };

  const formatDate = (date?: string | null) => {
  if (!date) return "-";

  return new Date(date).toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "long",
    year: "2-digit",
  });
};

  const openDetail = async (id: number) => {
    setSelectedId(id);
    setLoadingDetail(true);
    try {
      const found = await apiFetchDetail(id);
      setDetail(found);
      setEditForm(found);
    } catch (err) {
      console.error("Gagal fetch detail:", err);
    } finally {
      setLoadingDetail(false);
    }
  };

  const closeDetail = () => {
    setSelectedId(null);
    setDetail(null);
    setEditForm({});
    setSaveError(null);
  };

  const handleSave = async () => {
    if (!selectedId) return;
    setSaving(true);
    setSaveError(null);
    try {
      const updated = await apiSaveDetail(selectedId, editForm);
      setDetail(updated);
      setEditForm(updated);
      await fetchList();
    } catch (err: any) {
      console.error("Gagal simpan:", err);
      setSaveError(err?.message || "Gagal menyimpan perubahan.");
    } finally {
      setSaving(false);
    }
  };

  const executeDelete = async () => {
    if (!deleteId) return;
    try {
      await apiDelete(deleteId);
      if (selectedId === deleteId) closeDetail();
      await fetchList();
    } catch (err) {
      console.error("Gagal hapus:", err);
    } finally {
      setDeleteId(null);
    }
  };

  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  return (
    <div className="p-2 space-y-2" style={{ backgroundColor: t.pagebg, color: t.text, minHeight: "100vh" }}>
      {!selectedId && (
        <>
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-semibold">Entri Action Plan</h1>

            <label className="inline-flex items-center gap-2 px-2 py-2 bg-blue-600 text-white rounded-md cursor-pointer hover:bg-blue-700 disabled:opacity-50 transition-colors">
              {uploading ? (
                <span className="flex items-center gap-2">
                  <Spinner size={16} /> Mengupload...
                </span>
              ) : (
                "Upload AP (.xlsx)"
              )}
              <input
                type="file"
                accept=".xlsx,.xlsm"
                className="hidden"
                onChange={onFileChange}
                disabled={uploading}
              />
            </label>
          </div>

          {uploadError && (
            <div className="p-3 rounded-md text-sm border" style={{ backgroundColor: t.red.bg, color: t.red.text, borderColor: t.red.border }}>
              {uploadError}
            </div>
          )}

          {/* Filter */}
          <ActionPlanFilterBar value={filters} onChange={setFilters} options={filterOptions} theme={theme} isMobile={isMobile} />

          {/* Search */}
          <input
            type="text"
            placeholder="Cari no. AP / perwakilan / brand / program..."
            value={search}
            onChange={(e) => { setPage(1); setSearch(e.target.value); }}
            className="w-full px-3 py-2 border rounded-md text-sm outline-none"
            style={{ backgroundColor: t.inputBg, borderColor: t.borderInput, color: t.text }}
          />

          {listError && (
            <div className="p-3 rounded-md text-sm border" style={{ backgroundColor: t.red.bg, color: t.red.text, borderColor: t.red.border }}>
              {listError}
            </div>
          )}

          {/* Table list */}
          <div className="border rounded-md overflow-hidden" style={{ borderColor: t.border, backgroundColor: t.cardbg }}>
            <table className="w-full text-sm">
              <thead className="text-left" style={{ backgroundColor: t.tableHead, color: t.text }}>
                <tr>
                  <th className="px-3 py-3 font-semibold">No. Action Plan</th>
                  <th className="px-3 py-3 font-semibold">Perwakilan</th>
                  <th className="px-3 py-3 font-semibold">Brand</th>
                  <th className="px-3 py-3 font-semibold">Program</th>
                  <th className="px-3 py-3 font-semibold">Periode</th>
                  <th className="px-3 py-3 font-semibold text-right">Total Biaya</th>
                  <th className="px-3 py-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y" style={{ borderColor: t.border }}>
                {loadingList ? (
                  <tr>
                    <td colSpan={7} className="px-3 py-10 text-center flex justify-center w-full">
                      <div className="flex flex-col items-center gap-3" style={{ color: t.textSub }}>
                        <Spinner size={28} color={t.blue.text} />
                        <span>Memuat data...</span>
                      </div>
                    </td>
                  </tr>
                ) : items.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-3 py-10 text-center" style={{ color: t.textMuted }}>
                      Belum ada data. Upload file Action Plan untuk mulai.
                    </td>
                  </tr>
                ) : (
                  items.map((item) => (
                    <tr
                      key={item.id}
                      className="transition-colors"
                      style={{ ':hover': { backgroundColor: t.rowHover } } as any}
                      // onClick={() => openDetail(item.id)}
                    >
                      <td className="px-3 py-3">{item.no_action_plan || "-"}</td>
                      <td className="px-3 py-3">{item.perwakilan_agen || "-"}</td>
                      <td className="px-3 py-3">
                        <span className="px-2 py-1 rounded-full text-xs font-medium" style={{ backgroundColor: t.chipSlate.bg, color: t.chipSlate.text, border: `1px solid ${t.chipSlate.border}` }}>
                          {item.brand || "-"}
                        </span>
                      </td>
                      <td className="px-3 py-3">{item.nama_program || "-"}</td>
                      <td className="px-3 py-3" style={{ color: t.textSub }}>
                        {formatDate(item.tgl_mulai)} s/d {formatDate(item.tgl_selesai) || "-"}
                      </td>
                      <td className="px-3 py-3 text-right font-medium">{formatRupiah(item.total_biaya)}</td>
                      <td className="px-3 py-3">
  <div className="flex items-center justify-end gap-2">
    <button
      onClick={(e) => {
        e.stopPropagation();
        openDetail(item.id);
      }}
      style={{ background: t.blue.text, color: t.cardbg, border: 'none', borderRadius: 4, padding: '4px 8px', cursor: 'pointer' }}
    >
      <FileText size={16} style={{ marginRight: 2 }} />
    </button>

    <button
      onClick={(e) => {
        e.stopPropagation();
        setDeleteId(item.id);
      }}
      style={{ background: t.red.text, color: t.cardbg, border: 'none', borderRadius: 4, padding: '4px 8px', cursor: 'pointer' }}
    >
      <Trash2 size={16} style={{ marginRight: 2 }} />
    </button>
  </div>
</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between text-sm" style={{ color: t.textSub }}>
            <span>
              Halaman {page} dari {totalPages} ({total} data)
            </span>
            <div className="flex gap-2">
              <button
                className="px-3 py-1 border rounded-md disabled:opacity-40 transition-colors"
                style={{ borderColor: t.border, backgroundColor: t.cardbg, color: t.text }}
                disabled={page <= 1}
                onClick={() => setPage((p) => p - 1)}
              >
                Sebelumnya
              </button>
              <button
                className="px-3 py-1 border rounded-md disabled:opacity-40 transition-colors"
                style={{ borderColor: t.border, backgroundColor: t.cardbg, color: t.text }}
                disabled={page >= totalPages}
                onClick={() => setPage((p) => p + 1)}
              >
                Berikutnya
              </button>
            </div>
          </div>
        </>
      )}

      {/* Detail / Edit halaman penuh (bukan modal) */}
      {selectedId && (
        <div
          className=" rounded-2xl overflow-hidden shadow-sm flex flex-col"
          style={{ backgroundColor: t.contentBg, border: `1px solid ${t.border}`, minHeight: 'calc(100vh - 16px)' }}
        >
          {/* Header */}
          <div
            className="shrink-0 px-5 py-4 flex items-center justify-between gap-3"
            style={{ backgroundColor: t.headerbg, borderBottom: `1px solid ${t.border}` }}
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
              {/* <div
                className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                style={{ backgroundColor: t.blue.bg, border: `1px solid ${t.blue.border}` }}
              >
                <FileText size={18} color={t.blue.text} />
                <img src="logo-cgkn.png" alt="CGKN" />
              </div> */}
              <img src="logo-cgkn.png" alt="CGKN" width={20} height={20}/>
              <div className="min-w-0">
                <h2 className="text-base font-semibold truncate" style={{ color: t.text }}>
                  {loadingDetail || !detail ? "Memuat detail..." : (detail.nama_program || "Detail Action Plan")}
                </h2>
                {!loadingDetail && detail && (
                  <div className="flex items-center gap-2 mt-0.5 text-xs" style={{ color: t.textMuted, fontFamily: 'IBM Plex Mono,monospace' }}>
                    <span>{detail.no_action_plan || "-"}</span>
                    <span style={{ opacity: 0.5 }}>•</span>
                    <span className="truncate">{detail.brand || "-"}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Section nav */}
          {!loadingDetail && detail && (
            <div
              className="shrink-0 flex gap-1.5 overflow-x-auto px-4 py-2"
              style={{ backgroundColor: t.headerbg, borderBottom: `1px solid ${t.border}` }}
            >
              {DETAIL_SECTIONS.map((s) => (
                <button
                  key={s.id}
                  onClick={() => scrollToSection(s.id)}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors cursor-pointer"
                  style={{ backgroundColor: t.chipSlate.bg, color: t.chipSlate.text, border: `1px solid ${t.chipSlate.border}` }}
                >
                  {/* <s.icon size={12} /> */}
                  {s.label}
                </button>
              ))}
            </div>
          )}

          {/* Scrollable body */}
          <ExcelReplicaBody
  loadingDetail={loadingDetail}
  detail={detail}
  saveError={saveError}
  editForm={editForm}
  setEditForm={setEditForm}
  handleTableChange={handleTableChange}
  formatRupiah={formatRupiah}
  modalScrollRef={modalScrollRef}
/>

          {/* Sticky footer */}
          {!loadingDetail && detail && (
            <div
              className="shrink-0 px-5 py-3 flex items-center justify-between gap-3 flex-wrap"
              style={{ backgroundColor: t.headerbg, borderTop: `1px solid ${t.border}`, boxShadow: '0 -2px 12px rgba(0,0,0,0.06)' }}
            >
              <span className="text-xs truncate" style={{ color: t.textMuted }}>
                {detail.source_filename ? `Sumber file: ${detail.source_filename}` : ""}
              </span>
              <div className="flex items-center gap-2 ml-auto">
                <button
                  onClick={closeDetail}
                  disabled={saving}
                  className="px-4 py-2 rounded-md text-sm font-medium transition-colors disabled:opacity-50 cursor-pointer"
                  style={{ backgroundColor: t.gray.bg, color: t.text, border: `1px solid ${t.border}` }}
                >
                  Kembali
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="px-5 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 disabled:opacity-50 transition-colors flex items-center gap-2 cursor-pointer"
                >
                  {saving && <Spinner size={16} />}
                  {saving ? "Menyimpan..." : "Simpan Perubahan"}
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Komponen Modal Konfirmasi Delete */}
      <ConfirmModal
        open={deleteId !== null}
        title="Hapus Action Plan"
        message="Apakah kamu yakin ingin menghapus action plan ini? Data tidak bisa dikembalikan."
        confirmLabel="Hapus Data"
        danger={true}
        theme={currentTheme}
        onConfirm={executeDelete}
        onCancel={() => setDeleteId(null)}
      />
    </div>
  );
}

// ---------- Small reusable pieces ----------

function Field({
  label,
  value,
  onChange,
  fullWidth,
  theme = "light",
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  fullWidth?: boolean;
  theme?: Theme;
}) {
  const t = tk[theme];
  return (
    <div className={fullWidth ? "md:col-span-2" : ""}>
      <FormGroup label={label} theme={theme}>
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full px-3 py-2 border rounded-md text-sm transition-colors outline-none focus:ring-1"
          style={{
            backgroundColor: t.inputBg,
            borderColor: t.borderInput,
            color: t.text,
          }}
        />
      </FormGroup>
    </div>
  );
}