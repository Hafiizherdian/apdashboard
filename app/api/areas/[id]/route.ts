import { NextRequest, NextResponse } from "next/server";
import { updateArea, deleteArea } from "@/lib/regionalRepository";
import { withAuth } from "@/lib/auth/session";

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return withAuth(req, "manage_areas", async () => {
    const body = await req.json();
    await updateArea(id, body);
    return NextResponse.json({ success: true });
  });
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return withAuth(req, "manage_areas", async () => {
    await deleteArea(id);
    return NextResponse.json({ success: true });
  });
}