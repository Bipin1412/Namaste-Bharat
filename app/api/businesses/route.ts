import { NextRequest, NextResponse } from "next/server";
import { jsonError, parseBooleanParam, parseNumberParam } from "@/lib/backend/http";
import { createBusiness, listBusinesses } from "@/lib/backend/service";
import { validateCreateBusinessPayload } from "@/lib/backend/validation";
import { requireAdminFromAuthHeader } from "@/lib/server/daily-inquiries";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const authHeader = request.headers.get("authorization") || "";

  const page = parseNumberParam(searchParams.get("page"), 1, 1, 10000);
  const limit = parseNumberParam(searchParams.get("limit"), 12, 1, 50);
  const includeInactive = parseBooleanParam(searchParams.get("includeInactive")) === true;

  if (includeInactive) {
    try {
      await requireAdminFromAuthHeader(authHeader);
    } catch (error) {
      const status =
        typeof error === "object" &&
        error !== null &&
        "status" in error &&
        typeof (error as { status?: number }).status === "number"
          ? (error as { status: number }).status
          : 403;
      const message =
        error instanceof Error ? error.message : "Admin access required.";
      return jsonError(status, message);
    }
  }

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
    includeInactive,
    page,
    limit,
  });

  return NextResponse.json(payload);
}

export async function POST(request: NextRequest) {
  let body: unknown;

  try {
    body = (await request.json()) as unknown;
  } catch {
    return jsonError(400, "Request body must be valid JSON.");
  }

  try {
    const validation = validateCreateBusinessPayload(body);

    if (!validation.ok) {
      return jsonError(400, "Invalid business payload.", validation.errors);
    }

    const authHeader = request.headers.get("authorization") || "";
    const wantsVerifiedCreate = validation.data.verified === true;
    if (wantsVerifiedCreate) {
      await requireAdminFromAuthHeader(authHeader);
    }

    const createPayload = wantsVerifiedCreate
      ? {
          ...validation.data,
          verified: true,
          listingStatus: "active" as const,
          activatedAt: new Date().toISOString(),
          rejectedReason: null,
        }
      : {
          ...validation.data,
          verified: false,
        };

    const created = await createBusiness(createPayload);
    return NextResponse.json(created, { status: 201 });
  } catch (error) {
    const status =
      typeof error === "object" &&
      error !== null &&
      "status" in error &&
      typeof (error as { status?: number }).status === "number"
        ? (error as { status: number }).status
        : 400;
    const message = error instanceof Error ? error.message : "Could not create business.";
    return jsonError(status, message);
  }
}
