import { NextRequest, NextResponse } from "next/server";
import { listUsers, createUser } from "@/lib/userRepository";
import { withAuth } from "@/lib/auth/session";

export async function GET(req: NextRequest) {
  return withAuth(req, "view_users", async () => {
    const users = await listUsers();
    return NextResponse.json({ success: true, data: { users } });
  });
}

export async function POST(req: NextRequest) {
  return withAuth(req, "manage_users", async () => {
    const body = await req.json();
    if (!body.username || !body.password) {
      return NextResponse.json({ error: "Username dan password wajib diisi" }, { status: 400 });
    }
    const id = await createUser(body);
    return NextResponse.json({ success: true, id }, { status: 201 });
  });
}