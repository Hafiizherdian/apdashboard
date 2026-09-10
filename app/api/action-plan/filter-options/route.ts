//api/action-plan/filter-options/route.ts
import { NextResponse } from "next/server";
import { pool } from "@/lib/db"; 

export async function GET() {
  try {
    const [area, kategori, brand] = await Promise.all([
      // Gunakan UPPER() untuk menyeragamkan area
      pool.query(
        `SELECT DISTINCT UPPER(perwakilan_agen) AS value FROM action_plans
         WHERE perwakilan_agen IS NOT NULL AND perwakilan_agen <> '' ORDER BY 1`
      ),
      // Lakukan hal yang sama untuk kategori jika diperlukan
      pool.query(
        `SELECT DISTINCT UPPER(jenis_program) AS value FROM action_plans
         WHERE jenis_program IS NOT NULL AND jenis_program <> '' ORDER BY 1`
      ),
      // Lakukan hal yang sama untuk brand jika diperlukan
      pool.query(
        `SELECT DISTINCT UPPER(brand) AS value FROM action_plans
         WHERE brand IS NOT NULL AND brand <> '' ORDER BY 1`
      ),
    ]);

    return NextResponse.json({
      area: area.rows.map((r) => r.value as string),
      kategori: kategori.rows.map((r) => r.value as string),
      brand: brand.rows.map((r) => r.value as string),
      status: ["Running", "Closed", "Diperpanjang", "Dibatalkan"],
    });
  } catch (err) {
    console.error("Gagal ambil filter options:", err);
    return NextResponse.json({ error: "Gagal mengambil opsi filter" }, { status: 500 });
  }
}