import { NextRequest, NextResponse } from "next/server";
import { parseActionPlanBuffer } from "@/lib/parseActionsPlan";
import { createActionPlanFromFile } from "@/lib/actionPlanRepository"; 

export const runtime = "nodejs"; // wajib, exceljs & pg butuh Node runtime, bukan edge

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json(
        { error: "File tidak ditemukan. Kirim sebagai form-data dengan key 'file'." },
        { status: 400 }
      );
    }

    const allowedExt = [".xlsx", ".xlsm"];
    const isAllowed = allowedExt.some((ext) => file.name.toLowerCase().endsWith(ext));
    if (!isAllowed) {
      return NextResponse.json({ error: "Format file harus .xlsx atau .xlsm" }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const parsed = await parseActionPlanBuffer(buffer);
    const id = await createActionPlanFromFile(buffer, file.name);

    return NextResponse.json({
      success: true,
      id,
      data: { ...parsed, rawGrid: undefined },
    });
  } catch (err) {
    console.error("Gagal parsing/menyimpan action plan:", err);
    return NextResponse.json(
      { error: "Gagal memproses file. Cek format/struktur sheet, atau lihat log server." },
      { status: 500 }
    );
  }
}