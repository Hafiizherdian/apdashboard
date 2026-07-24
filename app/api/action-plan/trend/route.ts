import { NextRequest, NextResponse } from "next/server";
import { getActionPlanByKategori } from "@/lib/actionPlanRepository";
import type { ActionPlanStatus } from "@/lib/actionPlanRepository";

export const runtime = "nodejs";

const VALID_STATUSES: ActionPlanStatus[] = ["Running", "Closed", "Diperpanjang", "Dibatalkan"];

function toStatus(v: string | null): ActionPlanStatus | undefined {
  return v && (VALID_STATUSES as string[]).includes(v) ? (v as ActionPlanStatus) : undefined;
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const limit = parseInt(searchParams.get("limit") || "10", 10);

    const regional = searchParams.get("regional");
    const area = searchParams.get("area");
    const kategori = searchParams.get("kategori");
    const brand = searchParams.get("brand");
    const status = searchParams.get("status");

    const filters = {
      regional: regional && regional !== "all" ? regional : undefined,
      area: area && area !== "all" ? area : undefined,
      kategori: kategori && kategori !== "all" ? kategori : undefined,
      brand: brand && brand !== "all" ? brand : undefined,
      status: status && status !== "all" ? toStatus(status) : undefined,
    };

    const data = await getActionPlanByKategori(filters, limit);
    return NextResponse.json({ success: true, data });
  } catch (err) {
    console.error("Gagal ambil data per kategori:", err);
    return NextResponse.json({ error: "Gagal mengambil data." }, { status: 500 });
  }
}