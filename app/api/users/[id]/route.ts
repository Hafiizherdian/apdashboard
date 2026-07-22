import { NextRequest, NextResponse } from "next/server";
import { updateUser, deleteUser } from "@/lib/userRepository";
import { withAuth } from "@/lib/auth/session";

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return withAuth(req, "manage_users", async () => {
    const body = await req.json();
    await updateUser(Number(id), body);
    return NextResponse.json({ success: true });
  });
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return withAuth(req, "manage_users", async (session) => {
    if (String(session.id) === id) {
      return NextResponse.json({ error: "Tidak bisa menghapus akun sendiri" }, { status: 400 });
    }
    await deleteUser(Number(id));
    return NextResponse.json({ success: true });
  });
}