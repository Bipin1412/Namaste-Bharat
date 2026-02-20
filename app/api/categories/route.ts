import { NextResponse } from "next/server";
import { getHomeSnapshot } from "@/lib/backend/service";

export const runtime = "nodejs";

export async function GET() {
  const snapshot = await getHomeSnapshot();
  return NextResponse.json({
    data: snapshot.categories,
    meta: {
      total: snapshot.categories.length,
    },
  });
}
