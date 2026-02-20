import { NextRequest, NextResponse } from "next/server";
import { parseBooleanParam, parseNumberParam } from "@/lib/backend/http";
import { listReels } from "@/lib/backend/service";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;

  const page = parseNumberParam(searchParams.get("page"), 1, 1, 10000);
  const limit = parseNumberParam(searchParams.get("limit"), 12, 1, 50);

  const payload = await listReels({
    q: searchParams.get("q") ?? undefined,
    city: searchParams.get("city") ?? undefined,
    verified: parseBooleanParam(searchParams.get("verified")),
    page,
    limit,
  });

  return NextResponse.json(payload);
}
