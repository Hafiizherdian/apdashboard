import { NextRequest, NextResponse } from "next/server";
import { listActionPlans, createActionPlanFromFile, listActionPlansTable } from "@/lib/actionPlanRepository";
import type { ActionPlanStatus } from "@/lib/actionPlanRepository";

export const runtime = "nodejs";

const VALID_STATUSES: ActionPlanStatus[] = ["Running", "Closed", "Diperpanjang", "Dibatalkan"];

function toStatus(v: string | null): ActionPlanStatus | undefined {
  return v && (VALID_STATUSES as string[]).includes(v) ? (v as ActionPlanStatus) : undefined;
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search") || undefined;
    const page = parseInt(searchParams.get("page") || "1", 10);
    const pageSize = parseInt(searchParams.get("pageSize") || "20", 10);
    const view = searchParams.get("view");

    const regional = searchParams.get("regional")
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

    const { items, total } =
      view === "table"
        ? await listActionPlansTable({ search, limit: pageSize, offset: (page - 1) * pageSize, filters })
        : await listActionPlans({ search, limit: pageSize, offset: (page - 1) * pageSize, filters });

    return NextResponse.json({
      success: true,
      items,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    });
  } catch (err) {
    console.error("Gagal ambil daftar action plan:", err);
    return NextResponse.json({ error: "Gagal mengambil data." }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const regionalId = formData.get("regionalId") as string | null;   
    if (!file) {
      return NextResponse.json({ error: "File tidak ditemukan." }, { status: 400 });
    }
    if (!/\.(xlsx|xlsm)$/i.test(file.name)) {
      return NextResponse.json({ error: "Hanya file .xlsx / .xlsm yang didukung." }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const id = await createActionPlanFromFile(buffer, file.name, regionalId || null);

    return NextResponse.json({ success: true, id }, { status: 201 });
  } catch (err) {
    console.error("Gagal upload action plan:", err);
    return NextResponse.json({ error: "Gagal memproses file." }, { status: 500 });
  }
}