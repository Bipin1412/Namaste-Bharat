import { NextResponse } from "next/server";
import { getDatabaseStats } from "@/lib/backend/service";

export const runtime = "nodejs";

export async function GET() {
  const stats = await getDatabaseStats();

  return NextResponse.json({
    ok: true,
    service: "namastebharat-api",
    stats,
    timestamp: new Date().toISOString(),
  });
}
