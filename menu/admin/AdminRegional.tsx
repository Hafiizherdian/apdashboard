"use client";

import { useEffect, useState } from "react";
import { Landmark, Plus, Pencil, Trash2, X } from "lucide-react";
import { tk, Theme, Spinner, ConfirmModal, FormGroup } from "@/components/share";
import { Table, TableColumn } from "@/components/Table";

interface RegionalOpt {
  id: string;
  name: string;
  description?: string | null;
}

interface AreaRow {
  id: string;
  name: string;
  description: string | null;
  regional_id: string | null;
  regional_name?: string | null;
}

interface AdminRegionalProps {
  theme: Theme;
}

async function apiFetchAreas() {
  const res = await fetch("/api/areas");
  if (!res.ok) throw new Error("Gagal mengambil data area");
  const json = await res.json();
  return (json?.data?.areas ?? []) as AreaRow[];
}

async function apiCreateArea(payload: { id: string; name: string; description?: string | null; regional_id?: string | null }) {
  const res = await fetch("/api/areas", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json?.error || "Gagal menambah area");
  return json.data;
}

async function apiUpdateArea(id: string, payload: { name?: string; description?: string | null; regional_id?: string | null }) {
  const res = await fetch(`/api/areas/${encodeURIComponent(id)}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json?.error || "Gagal menyimpan perubahan area");
  return json.data;
}

async function apiDeleteArea(id: string) {
  const res = await fetch(`/api/areas/${encodeURIComponent(id)}`, { method: "DELETE" });
  if (!res.ok) {
    const json = await res.json().catch(() => ({}));
    throw new Error(json?.error || "Gagal menghapus area");
  }
}

async function apiCreateRegional(payload: { id: string; name: string; description?: string | null }) {
  const res = await fetch("/api/regionals", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json?.error || "Gagal menambah regional");
  return json.data;
}

async function apiUpdateRegional(id: string, payload: { name?: string; description?: string | null }) {
  const res = await fetch(`/api/regionals/${encodeURIComponent(id)}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json?.error || "Gagal menyimpan perubahan regional");
  return json.data;
}

async function apiDeleteRegional(id: string) {
  const res = await fetch(`/api/regionals/${encodeURIComponent(id)}`, { method: "DELETE" });
  if (!res.ok) {
    const json = await res.json().catch(() => ({}));
    throw new Error(json?.error || "Gagal menghapus regional");
  }
}

export default function AdminRegional({ theme }: AdminRegionalProps) {
  const t = tk[theme];

  const [areas, setAreas] = useState<AreaRow[]>([]);
  const [regionalOptions, setRegionalOptions] = useState<RegionalOpt[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [sortBy, setSortBy] = useState<string>("name");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const handleSort = (key: string) => {
    if (sortBy === key) setSortOrder((o) => (o === "asc" ? "desc" : "asc"));
    else { setSortBy(key); setSortOrder("asc"); }
  };

  const [modalOpen, setModalOpen] = useState(false);
  const [editingArea, setEditingArea] = useState<AreaRow | null>(null);
  const [formId, setFormId] = useState("");
  const [formName, setFormName] = useState("");
  const [formDescription, setFormDescription] = useState("");
  const [formRegionalId, setFormRegionalId] = useState("");
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const [deleteTarget, setDeleteTarget] = useState<AreaRow | null>(null);
  const [deleting, setDeleting] = useState(false);

  // ---- State untuk CRUD Regional ----
  const [regionalModalOpen, setRegionalModalOpen] = useState(false);
  const [editingRegional, setEditingRegional] = useState<RegionalOpt | null>(null);
  const [regFormId, setRegFormId] = useState("");
  const [regFormName, setRegFormName] = useState("");
  const [regFormDescription, setRegFormDescription] = useState("");
  const [regSaving, setRegSaving] = useState(false);
  const [regFormError, setRegFormError] = useState<string | null>(null);
  const [regDeleteTarget, setRegDeleteTarget] = useState<RegionalOpt | null>(null);
  const [regDeleting, setRegDeleting] = useState(false);
  const [loadingRegionals, setLoadingRegionals] = useState(false);

  const fetchRegionalOptions = async () => {
    setLoadingRegionals(true);
    try {
      const res = await fetch("/api/regionals");
      const json = await res.json();
      setRegionalOptions(json?.data?.regionals ?? []);
    } catch (err) {
      console.error("Gagal ambil regional:", err);
    } finally {
      setLoadingRegionals(false);
    }
  };

  const openCreateRegionalModal = () => {
    setEditingRegional(null);
    setRegFormId("");
    setRegFormName("");
    setRegFormDescription("");
    setRegFormError(null);
    setRegionalModalOpen(true);
  };

  const openEditRegionalModal = (regional: RegionalOpt) => {
    setEditingRegional(regional);
    setRegFormId(regional.id);
    setRegFormName(regional.name || "");
    setRegFormDescription(regional.description || "");
    setRegFormError(null);
    setRegionalModalOpen(true);
  };

  const closeRegionalModal = () => {
    setRegionalModalOpen(false);
    setEditingRegional(null);
  };

  const handleRegionalSubmit = async () => {
    if (!regFormId.trim() || !regFormName.trim()) {
      setRegFormError("ID dan Nama regional wajib diisi.");
      return;
    }
    setRegSaving(true);
    setRegFormError(null);
    try {
      if (editingRegional) {
        await apiUpdateRegional(editingRegional.id, {
          name: regFormName,
          description: regFormDescription || null,
        });
      } else {
        await apiCreateRegional({
          id: regFormId,
          name: regFormName,
          description: regFormDescription || null,
        });
      }
      await fetchRegionalOptions();
      closeRegionalModal();
    } catch (err: any) {
      console.error(err);
      setRegFormError(err?.message || "Gagal menyimpan regional.");
    } finally {
      setRegSaving(false);
    }
  };

  const executeRegionalDelete = async () => {
    if (!regDeleteTarget) return;
    setRegDeleting(true);
    try {
      await apiDeleteRegional(regDeleteTarget.id);
      await fetchRegionalOptions();
      await fetchAreas(); // area yang tadinya pakai regional ini regional_id-nya jadi null
    } catch (err: any) {
      console.error(err);
      setError(err?.message || "Gagal menghapus regional.");
    } finally {
      setRegDeleting(false);
      setRegDeleteTarget(null);
    }
  };

  const fetchAreas = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await apiFetchAreas();
      setAreas(data);
    } catch (err: any) {
      console.error(err);
      setError(err?.message || "Gagal memuat data area.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRegionalOptions();
    fetchAreas();
  }, []);

  const openCreateModal = () => {
    setEditingArea(null);
    setFormId("");
    setFormName("");
    setFormDescription("");
    setFormRegionalId("");
    setFormError(null);
    setModalOpen(true);
  };

  const openEditModal = (area: AreaRow) => {
    setEditingArea(area);
    setFormId(area.id);
    setFormName(area.name || "");
    setFormDescription(area.description || "");
    setFormRegionalId(area.regional_id || "");
    setFormError(null);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditingArea(null);
  };

  const handleSubmit = async () => {
    if (!formId.trim() || !formName.trim()) {
      setFormError("ID dan Nama area wajib diisi.");
      return;
    }
    setSaving(true);
    setFormError(null);
    try {
      if (editingArea) {
        await apiUpdateArea(editingArea.id, {
          name: formName,
          description: formDescription || null,
          regional_id: formRegionalId || null,
        });
      } else {
        await apiCreateArea({
          id: formId,
          name: formName,
          description: formDescription || null,
          regional_id: formRegionalId || null,
        });
      }
      await fetchAreas();
      closeModal();
    } catch (err: any) {
      console.error(err);
      setFormError(err?.message || "Gagal menyimpan area.");
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
      setError(err?.message || "Gagal menghapus area.");
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

  const columns: TableColumn<AreaRow>[] = [
    { key: "id", label: "ID Area", sortable: true },
    { key: "name", label: "Nama Area", sortable: true },
    {
      key: "regional_name", label: "Regional", sortable: true,
      render: (row) => (
        row.regional_name ? (
          <span
            className="px-2 py-1 rounded-full text-xs font-medium"
            style={{ backgroundColor: t.chipSlate.bg, color: t.chipSlate.text, border: `1px solid ${t.chipSlate.border}` }}
          >
            {row.regional_name}
          </span>
        ) : (
          <span style={{ color: t.textMuted }}>—</span>
        )
      ),
    },
    {
      key: "description", label: "Keterangan", sortable: false,
      render: (row) => <span>{row.description || "-"}</span>,
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

  const regionalColumns: TableColumn<RegionalOpt>[] = [
    { key: "id", label: "ID Regional", sortable: true },
    { key: "name", label: "Nama Regional", sortable: true },
    {
      key: "description", label: "Keterangan", sortable: false,
      render: (row) => <span>{row.description || "-"}</span>,
    },
    {
      key: "action", label: "", align: "center", sortable: false,
      render: (row) => (
        <div className="flex items-center justify-end gap-2">
          <button
            onClick={(e) => { e.stopPropagation(); openEditRegionalModal(row); }}
            style={{ background: t.blue.text, color: t.cardbg, border: "none", borderRadius: 4, padding: "8px 8px", cursor: "pointer" }}
          >
            <Pencil size={16} />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); setRegDeleteTarget(row); }}
            style={{ background: t.red.text, color: t.cardbg, border: "none", borderRadius: 4, padding: "8px 8px", cursor: "pointer" }}
          >
            <Trash2 size={16} />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="p-2 space-y-6" style={{ backgroundColor: t.pagebg, color: t.text, minHeight: "100vh" }}>
      {/* ============ SECTION: REGIONAL ============ */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div>
          <h1 className="text-xl font-semibold flex items-center gap-2">
            <Landmark size={20} /> Setup Regional
          </h1>
          <p className="text-xs mt-1" style={{ color: t.textMuted }}>
            Kelola daftar regional. Area di bawah bisa dikelompokkan ke salah satu regional ini.
          </p>
        </div>
        <button
          onClick={openCreateRegionalModal}
          className="inline-flex items-center gap-1.5 px-3 py-2 rounded-md text-sm font-medium text-white transition-colors"
          style={{ backgroundColor: "#0d9488", border: "none", cursor: "pointer" }}
        >
          <Plus size={16} /> Tambah Regional
        </button>
      </div>

      {loadingRegionals ? (
        <div
          className="border rounded-md flex flex-col items-center justify-center gap-3 py-8"
          style={{ borderColor: t.border, backgroundColor: t.cardbg, color: t.textSub }}
        >
          <Spinner size={24} color={t.blue.text} />
          <span>Memuat regional...</span>
        </div>
      ) : (
        <Table
          theme={theme}
          data={regionalOptions}
          columns={regionalColumns}
          rowKey={(row) => row.id}
          emptyMessage="Belum ada regional. Tambahkan regional baru untuk mulai."
        />
      )}

      {/* ============ SECTION: AREA ============ */}
      <div className="flex items-center justify-between flex-wrap gap-2 pt-2" style={{ borderTop: `1px solid ${t.border}` }}>
        <div className="pt-4">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <Landmark size={18} /> Setup Area
          </h2>
          <p className="text-xs mt-1" style={{ color: t.textMuted }}>
            Kelola daftar area, dipakai di seluruh dashboard.
          </p>
        </div>
        <button
          onClick={openCreateModal}
          className="inline-flex items-center gap-1.5 px-3 py-2 rounded-md text-sm font-medium text-white transition-colors mt-4"
          style={{ backgroundColor: "#2563eb", border: "none", cursor: "pointer" }}
        >
          <Plus size={16} /> Tambah Area
        </button>
      </div>

      {error && (
        <div className="p-3 rounded-md text-sm border" style={{ backgroundColor: t.red.bg, color: t.red.text, borderColor: t.red.border }}>
          {error}
        </div>
      )}

      {regionalOptions.length === 0 && !loading && !loadingRegionals && (
        <div className="p-3 rounded-md text-sm border" style={{ backgroundColor: t.yellow.bg, color: t.yellow.text, borderColor: t.yellow.border }}>
          Belum ada regional. Buat regional dulu di atas sebelum mengelompokkan area ke dalamnya.
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
          emptyMessage="Belum ada area. Tambahkan area baru untuk mulai."
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
                {editingArea ? "Edit Area" : "Tambah Area"}
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

              <FormGroup label="ID Area" hint={editingArea ? "ID tidak dapat diubah" : "Contoh: malang, bandung, dsb"} theme={theme}>
                <input
                  type="text"
                  value={formId}
                  onChange={(e) => setFormId(e.target.value)}
                  disabled={!!editingArea}
                  className="w-full px-3 py-2 border rounded-md text-sm outline-none disabled:opacity-60"
                  style={{ backgroundColor: t.inputBg, borderColor: t.borderInput, color: t.text }}
                />
              </FormGroup>

              <FormGroup label="Nama Area" theme={theme}>
                <input
                  type="text"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  className="w-full px-3 py-2 border rounded-md text-sm outline-none"
                  style={{ backgroundColor: t.inputBg, borderColor: t.borderInput, color: t.text }}
                />
              </FormGroup>

              <FormGroup label="Regional" hint="Regional yang menaungi area ini" theme={theme}>
                <select
                  value={formRegionalId}
                  onChange={(e) => setFormRegionalId(e.target.value)}
                  className="w-full px-3 py-2 border rounded-md text-sm outline-none"
                  style={{ backgroundColor: t.inputBg, borderColor: t.borderInput, color: t.text }}
                >
                  <option value="">— Tanpa regional —</option>
                  {regionalOptions.map((r) => (
                    <option key={r.id} value={r.id}>{r.name}</option>
                  ))}
                </select>
              </FormGroup>

              <FormGroup label="Keterangan (opsional)" theme={theme}>
                <input
                  type="text"
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
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
        title="Hapus Area"
        message={`Yakin menghapus area "${deleteTarget?.name}"? Pastikan tidak ada data yang masih memakai area ini.`}
        confirmLabel={deleting ? "Menghapus..." : "Hapus"}
        danger={true}
        theme={theme}
        onConfirm={executeDelete}
        onCancel={() => setDeleteTarget(null)}
      />

      {/* Modal Tambah/Edit Regional */}
      {regionalModalOpen && (
        <div
          onClick={(e) => { if (e.target === e.currentTarget) closeRegionalModal(); }}
          style={{ position: "fixed", inset: 0, zIndex: 1100, background: "rgba(0,0,0,0.4)", display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}
        >
          <div
            style={{ background: t.cardbg, border: `1px solid ${t.borderCard}`, borderRadius: 14, width: "100%", maxWidth: 420, overflow: "hidden" }}
          >
            <div className="flex items-center justify-between px-4 py-3" style={{ borderBottom: `1px solid ${t.border}`, background: t.tableHead }}>
              <span className="text-sm font-semibold" style={{ color: t.text }}>
                {editingRegional ? "Edit Regional" : "Tambah Regional"}
              </span>
              <button onClick={closeRegionalModal} style={{ background: "none", border: "none", cursor: "pointer", color: t.textMuted }}>
                <X size={16} />
              </button>
            </div>

            <div className="p-4 flex flex-col gap-3">
              {regFormError && (
                <div className="p-2 rounded-md text-xs border" style={{ backgroundColor: t.red.bg, color: t.red.text, borderColor: t.red.border }}>
                  {regFormError}
                </div>
              )}

              <FormGroup label="ID Regional" hint={editingRegional ? "ID tidak dapat diubah" : "Contoh: jatim, jabar, dsb"} theme={theme}>
                <input
                  type="text"
                  value={regFormId}
                  onChange={(e) => setRegFormId(e.target.value)}
                  disabled={!!editingRegional}
                  className="w-full px-3 py-2 border rounded-md text-sm outline-none disabled:opacity-60"
                  style={{ backgroundColor: t.inputBg, borderColor: t.borderInput, color: t.text }}
                />
              </FormGroup>

              <FormGroup label="Nama Regional" theme={theme}>
                <input
                  type="text"
                  value={regFormName}
                  onChange={(e) => setRegFormName(e.target.value)}
                  className="w-full px-3 py-2 border rounded-md text-sm outline-none"
                  style={{ backgroundColor: t.inputBg, borderColor: t.borderInput, color: t.text }}
                />
              </FormGroup>

              <FormGroup label="Keterangan (opsional)" theme={theme}>
                <input
                  type="text"
                  value={regFormDescription}
                  onChange={(e) => setRegFormDescription(e.target.value)}
                  className="w-full px-3 py-2 border rounded-md text-sm outline-none"
                  style={{ backgroundColor: t.inputBg, borderColor: t.borderInput, color: t.text }}
                />
              </FormGroup>
            </div>

            <div className="flex items-center justify-end gap-2 px-4 py-3" style={{ borderTop: `1px solid ${t.border}`, background: t.tableHead }}>
              <button
                onClick={closeRegionalModal}
                disabled={regSaving}
                className="px-3 py-2 rounded-md text-sm font-medium disabled:opacity-50"
                style={{ backgroundColor: t.gray.bg, color: t.text, border: `1px solid ${t.border}` }}
              >
                Batal
              </button>
              <button
                onClick={handleRegionalSubmit}
                disabled={regSaving}
                className="px-4 py-2 rounded-md text-sm font-medium text-white disabled:opacity-50 flex items-center gap-2"
                style={{ backgroundColor: "#0d9488", border: "none", cursor: regSaving ? "not-allowed" : "pointer" }}
              >
                {regSaving && <Spinner size={14} color="#fff" />}
                {regSaving ? "Menyimpan..." : "Simpan"}
              </button>
            </div>
          </div>
        </div>
      )}

      <ConfirmModal
        open={regDeleteTarget !== null}
        title="Hapus Regional"
        message={`Yakin menghapus regional "${regDeleteTarget?.name}"? Area yang tergabung di regional ini akan menjadi "Tanpa regional" (tidak ikut terhapus).`}
        confirmLabel={regDeleting ? "Menghapus..." : "Hapus"}
        danger={true}
        theme={theme}
        onConfirm={executeRegionalDelete}
        onCancel={() => setRegDeleteTarget(null)}
      />
    </div>
  );
}