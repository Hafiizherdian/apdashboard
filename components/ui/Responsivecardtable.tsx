"use client";

import React from "react";

/**
 * Komponen shared buat reflow tabel Excel-replica jadi card per-baris
 * di mobile/tablet. Dipakai di apreplica.tsx & evaluasireplica.tsx.
 *
 * Cara pakai:
 *   {isMobile ? (
 *     <MobileCardList
 *       rows={editForm.anggaranBiaya ?? []}
 *       onRemove={(i) => removeRow("anggaranBiaya", i)}
 *       getFields={(row, i) => [
 *         { label: "Uraian", render: () => <MobileTextInput value={row.uraian} onChange={(v) => handleTableChange("anggaranBiaya", i, "uraian", v)} /> },
 *         ...
 *       ]}
 *     />
 *   ) : (
 *     <table>...</table>
 *   )}
 */

export interface CardField {
  label: string;
  render: () => React.ReactNode;
  full?: boolean; // field lebar penuh (misal teks panjang), label di atas bukan di samping
}

export function MobileCardList({
  rows,
  getFields,
  onRemove,
  emptyLabel = "Belum ada data.",
  cardTitle,
}: {
  rows: any[];
  getFields: (row: any, index: number) => CardField[];
  onRemove?: (index: number) => void;
  emptyLabel?: string;
  cardTitle?: (row: any, index: number) => React.ReactNode;
}) {
  if (!rows || rows.length === 0) {
    return (
      <div style={{ padding: "14px 8px", textAlign: "center", fontSize: 13, color: "#888" }}>
        {emptyLabel}
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10, padding: "4px 2px" }}>
      {rows.map((row, i) => (
        <div
          key={row.id ?? i}
          style={{
            border: "1px solid #93C47D",
            borderRadius: 8,
            background: "#fff",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              background: "#D9EAD3",
              padding: "6px 10px",
              fontSize: 12,
              fontWeight: 700,
            }}
          >
            <span>{cardTitle ? cardTitle(row, i) : `Baris ${i + 1}`}</span>
            {onRemove && (
              <button
                type="button"
                onClick={() => onRemove(i)}
                title="Hapus baris"
                style={{
                  border: "none",
                  background: "transparent",
                  color: "#B3261E",
                  fontWeight: 700,
                  fontSize: 16,
                  lineHeight: 1,
                  cursor: "pointer",
                  padding: 2,
                }}
              >
                ×
              </button>
            )}
          </div>
          <div style={{ padding: "8px 10px", display: "flex", flexDirection: "column", gap: 6 }}>
            {getFields(row, i).map((f, fi) => (
              <div
                key={fi}
                style={{
                  display: "flex",
                  flexDirection: f.full ? "column" : "row",
                  justifyContent: "space-between",
                  alignItems: f.full ? "stretch" : "center",
                  gap: f.full ? 3 : 8,
                }}
              >
                <span style={{ fontSize: 11, color: "#666", fontWeight: 600, whiteSpace: "nowrap" }}>{f.label}</span>
                <div style={{ flex: 1, minWidth: 0, width: f.full ? "100%" : undefined }}>{f.render()}</div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

/** Ringkasan read-only (bukan editable rows) jadi list label:value di mobile. */
export function MobileSummaryList({
  rows,
  bold,
}: {
  rows: { label: string; value: React.ReactNode }[];
  bold?: boolean;
}) {
  return (
    <div
      style={{
        border: "1px solid #ccc",
        borderRadius: 8,
        overflow: "hidden",
        margin: "4px 2px",
      }}
    >
      {rows.map((r, i) => (
        <div
          key={i}
          style={{
            display: "flex",
            justifyContent: "space-between",
            gap: 8,
            padding: "8px 10px",
            fontSize: 13,
            borderTop: i === 0 ? "none" : "1px solid #eee",
            fontWeight: bold ? 700 : 400,
            background: i % 2 === 1 ? "#FAFAFA" : "#fff",
          }}
        >
          <span>{r.label}</span>
          <span style={{ textAlign: "right" }}>{r.value}</span>
        </div>
      ))}
    </div>
  );
}

// ---------- Input primitives buat dipakai di dalam card ----------

const mobileInputBase: React.CSSProperties = {
  width: "100%",
  border: "1px solid #ccc",
  borderRadius: 6,
  padding: "7px 8px",
  fontSize: 13,
  outline: "none",
  background: "#fff",
};

export function MobileTextInput({
  value,
  onChange,
  placeholder,
}: {
  value: string | number | null | undefined;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <input
      type="text"
      value={(value as any) ?? ""}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      style={mobileInputBase}
    />
  );
}

export function MobileTextArea({
  value,
  onChange,
  rows = 3,
}: {
  value: string | null | undefined;
  onChange: (v: string) => void;
  rows?: number;
}) {
  return (
    <textarea
      value={value ?? ""}
      onChange={(e) => onChange(e.target.value)}
      rows={rows}
      style={{ ...mobileInputBase, resize: "vertical" }}
    />
  );
}

export function MobileNumberInput({
  value,
  onChange,
}: {
  value: number | string | null | undefined;
  onChange: (v: string) => void;
}) {
  return (
    <input
      type="number"
      value={(value as any) ?? ""}
      onChange={(e) => onChange(e.target.value)}
      style={{ ...mobileInputBase, textAlign: "right" }}
    />
  );
}

export function MobileDateInput({
  value,
  onChange,
}: {
  value: string | null | undefined;
  onChange: (v: string) => void;
}) {
  return (
    <input type="date" value={value ?? ""} onChange={(e) => onChange(e.target.value)} style={mobileInputBase} />
  );
}

export function MobileCurrencyInput({
  value,
  onChange,
  formatRupiah,
}: {
  value: number | string | null | undefined;
  onChange: (v: string) => void;
  formatRupiah?: (v: number) => string;
}) {
  const display = formatRupiah ? formatRupiah(Number(value || 0)).replace(/^Rp\s?/, "") : String(value ?? "");
  return (
    <div style={{ display: "flex", alignItems: "center", border: "1px solid #ccc", borderRadius: 6, padding: "0 8px", background: "#fff" }}>
      <span style={{ fontSize: 12, marginRight: 4, color: "#666" }}>Rp</span>
      <input
        type="text"
        value={display}
        onChange={(e) => onChange(e.target.value.replace(/[^\d]/g, ""))}
        style={{ flex: 1, border: "none", outline: "none", padding: "7px 0", fontSize: 13, textAlign: "right", background: "transparent" }}
      />
    </div>
  );
}

export function MobilePercentInput({
  value,
  onChange,
}: {
  value: number | string | null | undefined;
  onChange: (v: string) => void;
}) {
  const display = value === null || value === undefined || value === "" ? "" : String(Math.round(Number(value) * 10000) / 100);
  return (
    <div style={{ display: "flex", alignItems: "center", border: "1px solid #ccc", borderRadius: 6, padding: "0 8px", background: "#fff" }}>
      <input
        type="text"
        value={display}
        onChange={(e) => {
          const raw = e.target.value.replace(/[^\d.]/g, "");
          onChange(raw === "" ? "" : String(Number(raw) / 100));
        }}
        style={{ flex: 1, border: "none", outline: "none", padding: "7px 0", fontSize: 13, textAlign: "right", background: "transparent" }}
      />
      <span style={{ fontSize: 12, marginLeft: 4, color: "#666" }}>%</span>
    </div>
  );
}

export function MobileCheckboxRow({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  label: string;
}) {
  return (
    <label style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 4px", fontSize: 13 }}>
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} />
      {label}
    </label>
  );
}

/** Field label-di-atas + input, buat form header (bukan repeating rows). */
export function MobileFormField({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div style={{ padding: "6px 2px" }}>
      <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "#444", marginBottom: 3 }}>{label}</label>
      {children}
    </div>
  );
}