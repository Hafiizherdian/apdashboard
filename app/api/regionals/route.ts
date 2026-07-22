import { NextRequest, NextResponse } from "next/server";
import { listRegionals, createRegional } from "@/lib/regionalRepository";
import { withAuth } from "@/lib/auth/session";

export async function GET() {
  const regionals = await listRegionals();
  return NextResponse.json({ success: true, data: { regionals } });
}

export async function POST(req: NextRequest) {
  return withAuth(req, "manage_regionals", async () => {
    const body = await req.json();
    await createRegional(body);
    return NextResponse.json({ success: true }, { status: 201 });
  });
}