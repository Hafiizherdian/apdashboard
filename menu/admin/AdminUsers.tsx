"use client";

import { useEffect, useState } from "react";
import { Users, Plus, Pencil, Trash2, X } from "lucide-react";
import { tk, Theme, Spinner, ConfirmModal, FormGroup } from "@/components/share";
import { Table, TableColumn } from "@/components/Table";
import { UserRole, ScopeType, ROLE_LABELS, SCOPE_LABELS } from "@/lib/auth/types";

interface UserListItem {
  id: number;
  username: string;
  email: string | null;
  role: UserRole;
  scope_type: ScopeType;
  is_active: boolean;
  created_at: string;
  regionals: { id: string; name: string }[];
  areas: { id: string; name: string }[];
}

interface RegionalOpt { id: string; name: string }
interface AreaOpt { id: string; name: string; regional_id: string | null }

export default function AdminUsers({ theme }: { theme: Theme }) {
  const t = tk[theme];

  const [users, setUsers] = useState<UserListItem[]>([]);
  const [regionals, setRegionals] = useState<RegionalOpt[]>([]);
  const [areas, setAreas] = useState<AreaOpt[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [sortBy, setSortBy] = useState("username");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const handleSort = (key: string) => {
    if (sortBy === key) setSortOrder((o) => (o === "asc" ? "desc" : "asc"));
    else { setSortBy(key); setSortOrder("asc"); }
  };

  const [modalOpen, setModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<UserListItem | null>(null);
  const [formUsername, setFormUsername] = useState("");
  const [formEmail, setFormEmail] = useState("");
  const [formPassword, setFormPassword] = useState("");
  const [formRole, setFormRole] = useState<UserRole>("user");
  const [formScope, setFormScope] = useState<ScopeType>("all");
  const [formRegionalIds, setFormRegionalIds] = useState<string[]>([]);
  const [formAreaIds, setFormAreaIds] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const [deleteTarget, setDeleteTarget] = useState<UserListItem | null>(null);
  const [deleting, setDeleting] = useState(false);

  const fetchAll = async () => {
    setLoading(true);
    setError(null);
    try {
      const [uRes, rRes, aRes] = await Promise.all([
        fetch("/api/users"),
        fetch("/api/regionals"),
        fetch("/api/areas"),
      ]);
      const uJson = await uRes.json();
      const rJson = await rRes.json();
      const aJson = await aRes.json();
      if (!uRes.ok) throw new Error(uJson?.error || "Gagal memuat user");
      setUsers(uJson.data?.users ?? []);
      setRegionals(rJson.data?.regionals ?? []);
      setAreas(aJson.data?.areas ?? []);
    } catch (err: any) {
      console.error(err);
      setError(err?.message || "Gagal memuat data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAll(); }, []);

  const openCreateModal = () => {
    setEditingUser(null);
    setFormUsername("");
    setFormEmail("");
    setFormPassword("");
    setFormRole("user");
    setFormScope("all");
    setFormRegionalIds([]);
    setFormAreaIds([]);
    setFormError(null);
    setModalOpen(true);
  };

  const openEditModal = (u: UserListItem) => {
    setEditingUser(u);
    setFormUsername(u.username);
    setFormEmail(u.email || "");
    setFormPassword("");
    setFormRole(u.role);
    setFormScope(u.scope_type);
    setFormRegionalIds(u.regionals.map((r) => r.id));
    setFormAreaIds(u.areas.map((a) => a.id));
    setFormError(null);
    setModalOpen(true);
  };

  const closeModal = () => { setModalOpen(false); setEditingUser(null); };

  const toggleInArray = (arr: string[], setArr: (v: string[]) => void, id: string) => {
    setArr(arr.includes(id) ? arr.filter((x) => x !== id) : [...arr, id]);
  };

  const handleSubmit = async () => {
    if (!editingUser && (!formUsername.trim() || !formPassword.trim())) {
      setFormError("Username dan password wajib diisi.");
      return;
    }
    if (formScope === "regional" && formRegionalIds.length === 0) {
      setFormError("Pilih minimal 1 regional untuk scope 'Regional Tertentu'.");
      return;
    }
    if (formScope === "area" && formAreaIds.length === 0) {
      setFormError("Pilih minimal 1 area untuk scope 'Area Tertentu'.");
      return;
    }

    setSaving(true);
    setFormError(null);
    try {
      const payload: any = {
        email: formEmail || null,
        role: formRole,
        scope_type: formScope,
        regionalIds: formScope === "regional" ? formRegionalIds : [],
        areaIds: formScope === "area" ? formAreaIds : [],
      };
      if (formPassword) payload.password = formPassword;

      if (editingUser) {
        const res = await fetch(`/api/users/${editingUser.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        const json = await res.json();
        if (!res.ok) throw new Error(json?.error || "Gagal menyimpan user");
      } else {
        const res = await fetch("/api/users", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...payload, username: formUsername, password: formPassword }),
        });
        const json = await res.json();
        if (!res.ok) throw new Error(json?.error || "Gagal menambah user");
      }
      await fetchAll();
      closeModal();
    } catch (err: any) {
      console.error(err);
      setFormError(err?.message || "Gagal menyimpan user.");
    } finally {
      setSaving(false);
    }
  };

  const executeDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/users/${deleteTarget.id}`, { method: "DELETE" });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error || "Gagal menghapus user");
      await fetchAll();
    } catch (err: any) {
      console.error(err);
      setError(err?.message || "Gagal menghapus user.");
    } finally {
      setDeleting(false);
      setDeleteTarget(null);
    }
  };

  const sortedUsers = [...users].sort((a, b) => {
    const valA = (a as any)[sortBy] ?? "";
    const valB = (b as any)[sortBy] ?? "";
    if (valA < valB) return sortOrder === "asc" ? -1 : 1;
    if (valA > valB) return sortOrder === "asc" ? 1 : -1;
    return 0;
  });

  const scopeSummary = (u: UserListItem) => {
    if (u.scope_type === "all") return "Semua Regional & Area";
    if (u.scope_type === "regional") return u.regionals.map((r) => r.name).join(", ") || "-";
    return u.areas.map((a) => a.name).join(", ") || "-";
  };

  const columns: TableColumn<UserListItem>[] = [
    { key: "username", label: "Username", sortable: true },
    { key: "email", label: "Email", sortable: true, render: (row) => <span>{row.email || "-"}</span> },
    {
      key: "role", label: "Role", sortable: true,
      render: (row) => (
        <span
          className="px-2 py-1 rounded-full text-xs font-medium"
          style={{ backgroundColor: t.chipSlate.bg, color: t.chipSlate.text, border: `1px solid ${t.chipSlate.border}` }}
        >
          {ROLE_LABELS[row.role]}
        </span>
      ),
    },
    {
      key: "scope_type", label: "Cakupan Akses", sortable: true,
      render: (row) => (
        <div className="flex flex-col">
          <span className="text-xs font-semibold">{SCOPE_LABELS[row.scope_type]}</span>
          {row.role === "user" && (
            <span className="text-xs" style={{ color: t.textMuted }}>{scopeSummary(row)}</span>
          )}
        </div>
      ),
    },
    {
      key: "is_active", label: "Status", align: "center", sortable: true,
      render: (row) => (
        <span
          className="px-2 py-1 rounded-full text-xs font-medium"
          style={row.is_active
            ? { backgroundColor: t.chipGreen.bg, color: t.chipGreen.text, border: `1px solid ${t.chipGreen.border}` }
            : { backgroundColor: t.red.bg, color: t.red.text, border: `1px solid ${t.red.border}` }}
        >
          {row.is_active ? "Aktif" : "Nonaktif"}
        </span>
      ),
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
            <Users size={20} /> Manajemen User
          </h1>
          <p className="text-xs mt-1" style={{ color: t.textMuted }}>
            Kelola akun, role, dan cakupan akses regional/area tiap user.
          </p>
        </div>
        <button
          onClick={openCreateModal}
          className="inline-flex items-center gap-1.5 px-3 py-2 rounded-md text-sm font-medium text-white transition-colors"
          style={{ backgroundColor: "#2563eb", border: "none", cursor: "pointer" }}
        >
          <Plus size={16} /> Tambah User
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
          data={sortedUsers}
          columns={columns}
          rowKey={(row) => String(row.id)}
          sortBy={sortBy}
          sortOrder={sortOrder}
          onSort={handleSort}
          emptyMessage="Belum ada user."
        />
      )}

      {/* Modal Tambah/Edit */}
      {modalOpen && (
        <div
          onClick={(e) => { if (e.target === e.currentTarget) closeModal(); }}
          style={{ position: "fixed", inset: 0, zIndex: 1100, background: "rgba(0,0,0,0.4)", display: "flex", alignItems: "center", justifyContent: "center", padding: 16, overflowY: "auto" }}
        >
          <div style={{ background: t.cardbg, border: `1px solid ${t.borderCard}`, borderRadius: 14, width: "100%", maxWidth: 460, overflow: "hidden", maxHeight: "90vh", display: "flex", flexDirection: "column" }}>
            <div className="flex items-center justify-between px-4 py-3" style={{ borderBottom: `1px solid ${t.border}`, background: t.tableHead }}>
              <span className="text-sm font-semibold" style={{ color: t.text }}>
                {editingUser ? "Edit User" : "Tambah User"}
              </span>
              <button onClick={closeModal} style={{ background: "none", border: "none", cursor: "pointer", color: t.textMuted }}>
                <X size={16} />
              </button>
            </div>

            <div className="p-4 flex flex-col gap-3 overflow-y-auto">
              {formError && (
                <div className="p-2 rounded-md text-xs border" style={{ backgroundColor: t.red.bg, color: t.red.text, borderColor: t.red.border }}>
                  {formError}
                </div>
              )}

              <FormGroup label="Username" hint={editingUser ? "Username tidak dapat diubah" : undefined} theme={theme}>
                <input
                  type="text"
                  value={formUsername}
                  onChange={(e) => setFormUsername(e.target.value)}
                  disabled={!!editingUser}
                  className="w-full px-3 py-2 border rounded-md text-sm outline-none disabled:opacity-60"
                  style={{ backgroundColor: t.inputBg, borderColor: t.borderInput, color: t.text }}
                />
              </FormGroup>

              <FormGroup label="Email (opsional)" theme={theme}>
                <input
                  type="email"
                  value={formEmail}
                  onChange={(e) => setFormEmail(e.target.value)}
                  className="w-full px-3 py-2 border rounded-md text-sm outline-none"
                  style={{ backgroundColor: t.inputBg, borderColor: t.borderInput, color: t.text }}
                />
              </FormGroup>

              <FormGroup label={editingUser ? "Password Baru (kosongkan jika tidak diubah)" : "Password"} theme={theme}>
                <input
                  type="password"
                  value={formPassword}
                  onChange={(e) => setFormPassword(e.target.value)}
                  className="w-full px-3 py-2 border rounded-md text-sm outline-none"
                  style={{ backgroundColor: t.inputBg, borderColor: t.borderInput, color: t.text }}
                />
              </FormGroup>

              <FormGroup label="Role" theme={theme}>
                <select
                  value={formRole}
                  onChange={(e) => setFormRole(e.target.value as UserRole)}
                  className="w-full px-3 py-2 border rounded-md text-sm outline-none"
                  style={{ backgroundColor: t.inputBg, borderColor: t.borderInput, color: t.text }}
                >
                  <option value="root">Root — akses penuh, kelola user & regional</option>
                  <option value="admin">Admin — akses semua data, tanpa kelola user</option>
                  <option value="user">User — cakupan akses diatur di bawah</option>
                </select>
              </FormGroup>

              {formRole === "user" && (
                <>
                  <FormGroup label="Cakupan Akses" theme={theme}>
                    <select
                      value={formScope}
                      onChange={(e) => setFormScope(e.target.value as ScopeType)}
                      className="w-full px-3 py-2 border rounded-md text-sm outline-none"
                      style={{ backgroundColor: t.inputBg, borderColor: t.borderInput, color: t.text }}
                    >
                      <option value="all">Semua Regional & Area (userall)</option>
                      <option value="regional">Regional Tertentu (user1)</option>
                      <option value="area">Area Tertentu (user2)</option>
                    </select>
                  </FormGroup>

                  {formScope === "regional" && (
                    <FormGroup label="Pilih Regional" hint="Bisa pilih lebih dari satu" theme={theme}>
                      <div className="flex flex-wrap gap-2">
                        {regionals.map((r) => {
                          const active = formRegionalIds.includes(r.id);
                          return (
                            <button
                              key={r.id}
                              type="button"
                              onClick={() => toggleInArray(formRegionalIds, setFormRegionalIds, r.id)}
                              className="px-3 py-1.5 rounded-full text-xs font-medium border"
                              style={active
                                ? { backgroundColor: t.blue.bg, color: t.blue.text, borderColor: t.blue.border }
                                : { backgroundColor: t.gray.bg, color: t.gray.text, borderColor: t.gray.border }}
                            >
                              {r.name}
                            </button>
                          );
                        })}
                        {regionals.length === 0 && (
                          <span className="text-xs" style={{ color: t.textMuted }}>Belum ada regional. Tambahkan dulu di menu Management Regional.</span>
                        )}
                      </div>
                    </FormGroup>
                  )}

                  {formScope === "area" && (
                    <FormGroup label="Pilih Area" hint="Bisa pilih lebih dari satu" theme={theme}>
                      <div className="flex flex-wrap gap-2 max-h-40 overflow-y-auto">
                        {areas.map((a) => {
                          const active = formAreaIds.includes(a.id);
                          return (
                            <button
                              key={a.id}
                              type="button"
                              onClick={() => toggleInArray(formAreaIds, setFormAreaIds, a.id)}
                              className="px-3 py-1.5 rounded-full text-xs font-medium border"
                              style={active
                                ? { backgroundColor: t.blue.bg, color: t.blue.text, borderColor: t.blue.border }
                                : { backgroundColor: t.gray.bg, color: t.gray.text, borderColor: t.gray.border }}
                            >
                              {a.name}
                            </button>
                          );
                        })}
                        {areas.length === 0 && (
                          <span className="text-xs" style={{ color: t.textMuted }}>Belum ada area.</span>
                        )}
                      </div>
                    </FormGroup>
                  )}
                </>
              )}
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
        title="Hapus User"
        message={`Yakin menghapus user "${deleteTarget?.username}"? Akun ini tidak akan bisa login lagi.`}
        confirmLabel={deleting ? "Menghapus..." : "Hapus"}
        danger={true}
        theme={theme}
        onConfirm={executeDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}