"use client";

import { useEffect, useState } from "react";
import { Landmark, Plus, Pencil, Trash2, X } from "lucide-react";
import { tk, Theme, Spinner, ConfirmModal, FormGroup, CardBox } from "@/components/share";
import { Table, TableColumn } from "@/components/Table";
import { AreaConfig } from "@/lib/areaConfig";

interface AdminRegionalProps {
  theme: Theme;
}

async function apiFetchAreas() {
  const res = await fetch("/api/areas");
  if (!res.ok) throw new Error("Gagal mengambil data regional");
  const json = await res.json();
  return (json?.data?.areas ?? []) as AreaConfig[];
}

async function apiCreateArea(payload: Partial<AreaConfig>) {
  const res = await fetch("/api/areas", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json?.error || "Gagal menambah regional");
  return json.data as AreaConfig;
}

async function apiUpdateArea(id: string, payload: Partial<AreaConfig>) {
  const res = await fetch(`/api/areas/${encodeURIComponent(id)}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json?.error || "Gagal menyimpan perubahan regional");
  return json.data as AreaConfig;
}

async function apiDeleteArea(id: string) {
  const res = await fetch(`/api/areas/${encodeURIComponent(id)}`, { method: "DELETE" });
  if (!res.ok) {
    const json = await res.json().catch(() => ({}));
    throw new Error(json?.error || "Gagal menghapus regional");
  }
}

export default function AdminRegional({ theme }: AdminRegionalProps) {
  const t = tk[theme];

  const [areas, setAreas] = useState<AreaConfig[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [sortBy, setSortBy] = useState<string>("name");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const handleSort = (key: string) => {
    if (sortBy === key) setSortOrder((o) => (o === "asc" ? "desc" : "asc"));
    else { setSortBy(key); setSortOrder("asc"); }
  };

  const [modalOpen, setModalOpen] = useState(false);
  const [editingArea, setEditingArea] = useState<AreaConfig | null>(null);
  const [formId, setFormId] = useState("");
  const [formName, setFormName] = useState("");
  const [formDeskripsi, setFormDeskripsi] = useState("");
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const [deleteTarget, setDeleteTarget] = useState<AreaConfig | null>(null);
  const [deleting, setDeleting] = useState(false);

  const fetchAreas = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await apiFetchAreas();
      setAreas(data);
    } catch (err: any) {
      console.error(err);
      setError(err?.message || "Gagal memuat data regional.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAreas();
  }, []);

  const openCreateModal = () => {
    setEditingArea(null);
    setFormId("");
    setFormName("");
    setFormDeskripsi("");
    setFormError(null);
    setModalOpen(true);
  };

  const openEditModal = (area: AreaConfig) => {
    setEditingArea(area);
    setFormId(area.id);
    setFormName(area.name || "");
    setFormDeskripsi((area as any).deskripsi || "");
    setFormError(null);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditingArea(null);
  };

  const handleSubmit = async () => {
    if (!formId.trim() || !formName.trim()) {
      setFormError("ID dan Nama regional wajib diisi.");
      return;
    }
    setSaving(true);
    setFormError(null);
    try {
      if (editingArea) {
        await apiUpdateArea(editingArea.id, { name: formName, ...( { deskripsi: formDeskripsi } as any) });
      } else {
        await apiCreateArea({ id: formId, name: formName, ...( { deskripsi: formDeskripsi } as any) });
      }
      await fetchAreas();
      closeModal();
    } catch (err: any) {
      console.error(err);
      setFormError(err?.message || "Gagal menyimpan regional.");
    } finally {
      setSaving(false);
    }
  };

  const executeDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await apiDeleteArea(deleteTarget.id);
      await fetchAreas();
    } catch (err: any) {
      console.error(err);
      setError(err?.message || "Gagal menghapus regional.");
    } finally {
      setDeleting(false);
      setDeleteTarget(null);
    }
  };

  const sortedAreas = [...areas].sort((a, b) => {
    const valA = (a as any)[sortBy] ?? "";
    const valB = (b as any)[sortBy] ?? "";
    if (valA < valB) return sortOrder === "asc" ? -1 : 1;
    if (valA > valB) return sortOrder === "asc" ? 1 : -1;
    return 0;
  });

  const columns: TableColumn<AreaConfig>[] = [
    { key: "id", label: "ID Regional", sortable: true },
    { key: "name", label: "Nama Regional", sortable: true },
    {
      key: "deskripsi", label: "Keterangan", sortable: false,
      render: (row) => <span>{(row as any).deskripsi || "-"}</span>,
    },
    {
      key: "action", label: "", align: "center", sortable: false,
      render: (row) => (
        <div className="flex items-center justify-end gap-2">
          <button
            onClick={(e) => { e.stopPropagation(); openEditModal(row); }}
            style={{ background: t.blue.text, color: t.cardbg, border: "none", borderRadius: 4, padding: "8px 8px", cursor: "pointer" }}
          >
            <Pencil size={16} />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); setDeleteTarget(row); }}
            style={{ background: t.red.text, color: t.cardbg, border: "none", borderRadius: 4, padding: "8px 8px", cursor: "pointer" }}
          >
            <Trash2 size={16} />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="p-2 space-y-4" style={{ backgroundColor: t.pagebg, color: t.text, minHeight: "100vh" }}>
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div>
          <h1 className="text-xl font-semibold flex items-center gap-2">
            <Landmark size={20} /> Setup Regional
          </h1>
          <p className="text-xs mt-1" style={{ color: t.textMuted }}>
            Kelola daftar regional/area yang tersedia di seluruh dashboard.
          </p>
        </div>
        <button
          onClick={openCreateModal}
          className="inline-flex items-center gap-1.5 px-3 py-2 rounded-md text-sm font-medium text-white transition-colors"
          style={{ backgroundColor: "#2563eb", border: "none", cursor: "pointer" }}
        >
          <Plus size={16} /> Tambah Regional
        </button>
      </div>

      {error && (
        <div className="p-3 rounded-md text-sm border" style={{ backgroundColor: t.red.bg, color: t.red.text, borderColor: t.red.border }}>
          {error}
        </div>
      )}

      {loading ? (
        <div
          className="border rounded-md flex flex-col items-center justify-center gap-3 py-10"
          style={{ borderColor: t.border, backgroundColor: t.cardbg, color: t.textSub }}
        >
          <Spinner size={28} color={t.blue.text} />
          <span>Memuat data...</span>
        </div>
      ) : (
        <Table
          theme={theme}
          data={sortedAreas}
          columns={columns}
          rowKey={(row) => row.id}
          sortBy={sortBy}
          sortOrder={sortOrder}
          onSort={handleSort}
          emptyMessage="Belum ada regional. Tambahkan regional baru untuk mulai."
        />
      )}

      {/* Modal Tambah/Edit */}
      {modalOpen && (
        <div
          onClick={(e) => { if (e.target === e.currentTarget) closeModal(); }}
          style={{ position: "fixed", inset: 0, zIndex: 1100, background: "rgba(0,0,0,0.4)", display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}
        >
          <div
            style={{ background: t.cardbg, border: `1px solid ${t.borderCard}`, borderRadius: 14, width: "100%", maxWidth: 420, overflow: "hidden" }}
          >
            <div className="flex items-center justify-between px-4 py-3" style={{ borderBottom: `1px solid ${t.border}`, background: t.tableHead }}>
              <span className="text-sm font-semibold" style={{ color: t.text }}>
                {editingArea ? "Edit Regional" : "Tambah Regional"}
              </span>
              <button onClick={closeModal} style={{ background: "none", border: "none", cursor: "pointer", color: t.textMuted }}>
                <X size={16} />
              </button>
            </div>

            <div className="p-4 flex flex-col gap-3">
              {formError && (
                <div className="p-2 rounded-md text-xs border" style={{ backgroundColor: t.red.bg, color: t.red.text, borderColor: t.red.border }}>
                  {formError}
                </div>
              )}

              <FormGroup label="ID Regional" hint={editingArea ? "ID tidak dapat diubah" : "Contoh: jatim, jkt-1, dsb"} theme={theme}>
                <input
                  type="text"
                  value={formId}
                  onChange={(e) => setFormId(e.target.value)}
                  disabled={!!editingArea}
                  className="w-full px-3 py-2 border rounded-md text-sm outline-none disabled:opacity-60"
                  style={{ backgroundColor: t.inputBg, borderColor: t.borderInput, color: t.text }}
                />
              </FormGroup>

              <FormGroup label="Nama Regional" theme={theme}>
                <input
                  type="text"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  className="w-full px-3 py-2 border rounded-md text-sm outline-none"
                  style={{ backgroundColor: t.inputBg, borderColor: t.borderInput, color: t.text }}
                />
              </FormGroup>

              <FormGroup label="Keterangan (opsional)" theme={theme}>
                <input
                  type="text"
                  value={formDeskripsi}
                  onChange={(e) => setFormDeskripsi(e.target.value)}
                  className="w-full px-3 py-2 border rounded-md text-sm outline-none"
                  style={{ backgroundColor: t.inputBg, borderColor: t.borderInput, color: t.text }}
                />
              </FormGroup>
            </div>

            <div className="flex items-center justify-end gap-2 px-4 py-3" style={{ borderTop: `1px solid ${t.border}`, background: t.tableHead }}>
              <button
                onClick={closeModal}
                disabled={saving}
                className="px-3 py-2 rounded-md text-sm font-medium disabled:opacity-50"
                style={{ backgroundColor: t.gray.bg, color: t.text, border: `1px solid ${t.border}` }}
              >
                Batal
              </button>
              <button
                onClick={handleSubmit}
                disabled={saving}
                className="px-4 py-2 rounded-md text-sm font-medium text-white disabled:opacity-50 flex items-center gap-2"
                style={{ backgroundColor: "#2563eb", border: "none", cursor: saving ? "not-allowed" : "pointer" }}
              >
                {saving && <Spinner size={14} color="#fff" />}
                {saving ? "Menyimpan..." : "Simpan"}
              </button>
            </div>
          </div>
        </div>
      )}

      <ConfirmModal
        open={deleteTarget !== null}
        title="Hapus Regional"
        message={`Yakin menghapus regional "${deleteTarget?.name}"? Pastikan tidak ada data yang masih memakai regional ini.`}
        confirmLabel={deleting ? "Menghapus..." : "Hapus"}
        danger={true}
        theme={theme}
        onConfirm={executeDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}