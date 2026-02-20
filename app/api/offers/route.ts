import { NextRequest, NextResponse } from "next/server";
import { parseBooleanParam } from "@/lib/backend/http";
import { listOffers } from "@/lib/backend/service";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  const activeOnly = parseBooleanParam(request.nextUrl.searchParams.get("activeOnly"));
  const offers = await listOffers({
    activeOnly: activeOnly ?? true,
  });

  return NextResponse.json({
    data: offers,
    meta: {
      total: offers.length,
    },
  });
}
