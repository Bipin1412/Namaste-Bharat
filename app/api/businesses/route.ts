import { NextRequest, NextResponse } from "next/server";
import { jsonError, parseBooleanParam, parseNumberParam } from "@/lib/backend/http";
import { createBusiness, listBusinesses } from "@/lib/backend/service";
import { validateCreateBusinessPayload } from "@/lib/backend/validation";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;

  const page = parseNumberParam(searchParams.get("page"), 1, 1, 10000);
  const limit = parseNumberParam(searchParams.get("limit"), 12, 1, 50);

  const payload = await listBusinesses({
    q: searchParams.get("q") ?? undefined,
    category: searchParams.get("category") ?? undefined,
    city: searchParams.get("city") ?? undefined,
    verified: parseBooleanParam(searchParams.get("verified")),
    openNow: parseBooleanParam(searchParams.get("openNow")),
    sort:
      (searchParams.get("sort") as
        | "rating_desc"
        | "rating_asc"
        | "reviews_desc"
        | "newest"
        | null) ?? "rating_desc",
    page,
    limit,
  });

  return NextResponse.json(payload);
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as unknown;
    const validation = validateCreateBusinessPayload(body);

    if (!validation.ok) {
      return jsonError(400, "Invalid business payload.", validation.errors);
    }

    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:4000";
    const upstream = await fetch(`${backendUrl}/api/businesses`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(validation.data),
      cache: "no-store",
    }).catch(() => null);

    if (upstream && upstream.ok) {
      const payload = await upstream.json();
      return NextResponse.json(payload, { status: 201 });
    }

    const created = await createBusiness(validation.data);
    return NextResponse.json(created, { status: 201 });
  } catch {
    return jsonError(400, "Request body must be valid JSON.");
  }
}
