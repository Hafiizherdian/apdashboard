import { NextRequest, NextResponse } from "next/server";
import { getUserByUsername, resolveUserScope } from "@/lib/userRepository";
import { verifyPassword } from "@/lib/auth/password";
import { signToken } from "@/lib/auth/jwt";
import { COOKIE_NAME } from "@/lib/auth/session";

export async function POST(req: NextRequest) {
  const { username, password } = await req.json();
  if (!username || !password) {
    return NextResponse.json({ error: "Username dan password wajib diisi" }, { status: 400 });
  }

  const user = await getUserByUsername(username);
  if (!user || !(await verifyPassword(password, user.password_hash))) {
    return NextResponse.json({ error: "Username atau password salah" }, { status: 401 });
  }

  const { allowed_areas, allowed_regionals } = await resolveUserScope(user.id, user.scope_type);

  const sessionUser = {
    id: String(user.id),
    username: user.username,
    email: user.email ?? "",
    role: user.role,
    scope_type: user.scope_type,
    allowed_areas,
    allowed_regionals,
  };

  const token = await signToken(sessionUser);
  const res = NextResponse.json({ success: true, data: sessionUser });
  res.cookies.set(COOKIE_NAME, token, {
    httpOnly: true, secure: process.env.NODE_ENV === "production",
    sameSite: "lax", path: "/", maxAge: 60 * 60 * 8,
  });
  return res;
}