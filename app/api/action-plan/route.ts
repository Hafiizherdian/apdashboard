import { NextRequest, NextResponse } from "next/server";
import { listActionPlans, createActionPlanFromFile, listActionPlansTable } from "@/lib/actionPlanRepository";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search") || undefined;
    const page = parseInt(searchParams.get("page") || "1", 10);
    const pageSize = parseInt(searchParams.get("pageSize") || "20", 10);
    const view = searchParams.get("view");
    const { items, total } =
      view === "table"
        ? await listActionPlansTable({ search, limit: pageSize, offset: (page - 1) * pageSize })
        : await listActionPlans({ search, limit: pageSize, offset: (page - 1) * pageSize });

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
    if (!file) {
      return NextResponse.json({ error: "File tidak ditemukan." }, { status: 400 });
    }
    if (!/\.(xlsx|xlsm)$/i.test(file.name)) {
      return NextResponse.json({ error: "Hanya file .xlsx / .xlsm yang didukung." }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const id = await createActionPlanFromFile(buffer, file.name);

    return NextResponse.json({ success: true, id }, { status: 201 });
  } catch (err) {
    console.error("Gagal upload action plan:", err);
    return NextResponse.json({ error: "Gagal memproses file." }, { status: 500 });
  }
}