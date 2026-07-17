import { NextRequest, NextResponse } from "next/server";
import {
  getActionPlanById,
  updateActionPlanFull,
  deleteActionPlan,
} from "@/lib/actionPlanRepository";

export const runtime = "nodejs";

type Params = { params: Promise<{ id: string }> };

export async function GET(_req: NextRequest, { params }: Params) {
  const id = parseInt((await params).id, 10);
  if (isNaN(id)) return NextResponse.json({ error: "ID tidak valid" }, { status: 400 });

  const data = await getActionPlanById(id);
  if (!data) return NextResponse.json({ error: "Action plan tidak ditemukan" }, { status: 404 });

  return NextResponse.json({ success: true, data });
}

export async function PUT(req: NextRequest, { params }: Params) {
  const id = parseInt((await params).id, 10);
  if (isNaN(id)) return NextResponse.json({ error: "ID tidak valid" }, { status: 400 });

  try {
    const body = await req.json();

    // Whitelist top-level field yang boleh diterima dari form.
    // Ini menggantikan whitelist lama yang cuma nyakup kolom header.
    const allowedFields = [
      "no_action_plan", "perwakilan_agen", "brand", "nama_program",
      "jenis_program", "lokasi_program", "tgl_mulai", "tgl_selesai",
      "ditujukan_kepada", "lama_program_hari", "total_biaya",
      "uraian", "LatarBelakang", "Objektif", "Mekanisme",
      "TargetProgram", "TargetEvent", "DataDistribusi", "anggaranBiaya",
      "thl", "barangPromo", "brandjln", "tbyd", "transfer", "analisa",
      "mekanismeDetail", "evaluasiDetail",
    ] as const;

    const updateData: Record<string, unknown> = {};
    for (const field of allowedFields) {
      if (field in body) updateData[field] = body[field];
    }

    await updateActionPlanFull(id, updateData);
    const updated = await getActionPlanById(id);
    return NextResponse.json({ success: true, data: updated });
  } catch (err) {
    console.error("Gagal update action plan:", err);
    return NextResponse.json({ error: "Gagal menyimpan perubahan." }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  const id = parseInt((await params).id, 10);
  if (isNaN(id)) return NextResponse.json({ error: "ID tidak valid" }, { status: 400 });

  try {
    await deleteActionPlan(id);
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Gagal hapus action plan:", err);
    return NextResponse.json({ error: "Gagal menghapus data." }, { status: 500 });
  }
}