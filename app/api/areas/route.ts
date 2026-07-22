import { NextRequest, NextResponse } from "next/server";
import { listAreas, createArea } from "@/lib/regionalRepository";
import { withAuth } from "@/lib/auth/session";

export async function GET() {
  const areas = await listAreas();
  return NextResponse.json({ success: true, data: { areas } });
}

export async function POST(req: NextRequest) {
  return withAuth(req, "manage_areas", async () => {
    const body = await req.json();
    await createArea(body);
    return NextResponse.json({ success: true }, { status: 201 });
  });
}