import { NextRequest, NextResponse } from "next/server";
import { getActionPlanSummary } from "@/lib/actionPlanRepository";
import type { ActionPlanStatus } from "@/lib/actionPlanRepository";

export const runtime = "nodejs";

const VALID_STATUSES: ActionPlanStatus[] = ["Running", "Closed", "Diperpanjang", "Dibatalkan"];

function toStatus(v: string | null): ActionPlanStatus | undefined {
  return v && (VALID_STATUSES as string[]).includes(v) ? (v as ActionPlanStatus) : undefined;
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const area = searchParams.get("area");
    const kategori = searchParams.get("kategori");
    const brand = searchParams.get("brand");
    const status = searchParams.get("status");
    const filters = {
      area: area && area !== "all" ? area : undefined,
      kategori: kategori && kategori !== "all" ? kategori : undefined,
      brand: brand && brand !== "all" ? brand : undefined,
      status: status && status !== "all" ? toStatus(status) : undefined,
    };

    const summary = await getActionPlanSummary(filters);
    return NextResponse.json({ success: true, data: summary });
  } catch (err) {
    console.error("Gagal ambil summary action plan:", err);
    return NextResponse.json({ error: "Gagal mengambil ringkasan." }, { status: 500 });
  }
}