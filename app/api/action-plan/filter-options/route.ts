//api/action-plan/filter-options/route.ts
import { NextResponse } from "next/server";
import { pool } from "@/lib/db"; // sesuaikan sama koneksi db kamu

export async function GET() {
  try {
    const [area, kategori, brand] = await Promise.all([
      pool.query(
        `SELECT DISTINCT perwakilan_agen AS value FROM action_plans
         WHERE perwakilan_agen IS NOT NULL AND perwakilan_agen <> '' ORDER BY 1`
      ),
      pool.query(
        `SELECT DISTINCT jenis_program AS value FROM action_plans
         WHERE jenis_program IS NOT NULL AND jenis_program <> '' ORDER BY 1`
      ),
      pool.query(
        `SELECT DISTINCT brand AS value FROM action_plans
         WHERE brand IS NOT NULL AND brand <> '' ORDER BY 1`
      ),
    ]);

    return NextResponse.json({
      area: area.rows.map((r) => r.value as string),
      kategori: kategori.rows.map((r) => r.value as string),
      brand: brand.rows.map((r) => r.value as string),
      // Status BUKAN kolom yang di-query dari DB — dihitung dari kombinasi
      // tgl_selesai, status_override, dan riwayat action_plan_perpanjangan
      // (lihat deriveStatus() di actionPlanRepository.ts), jadi cuma 4
      // kemungkinan tetap ini.
      status: ["Running", "Closed", "Diperpanjang", "Dibatalkan"],
    });
  } catch (err) {
    console.error("Gagal ambil filter options:", err);
    return NextResponse.json({ error: "Gagal mengambil opsi filter" }, { status: 500 });
  }
}