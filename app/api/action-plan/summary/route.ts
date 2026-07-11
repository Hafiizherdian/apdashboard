import { NextResponse } from "next/server";
import { getActionPlanSummary } from "@/lib/actionPlanRepository";

export const runtime = "nodejs";

export async function GET() {
  try {
    const summary = await getActionPlanSummary();
    return NextResponse.json({ success: true, data: summary });
  } catch (err) {
    console.error("Gagal ambil summary action plan:", err);
    return NextResponse.json({ error: "Gagal mengambil ringkasan." }, { status: 500 });
  }
}