import { NextRequest, NextResponse } from "next/server";
import { createListingPlan, listListingPlans } from "@/lib/backend/service";
import { requireAdminFromAuthHeader } from "@/lib/server/daily-inquiries";

export const runtime = "nodejs";

function getErrorResponse(error: unknown, fallbackMessage: string) {
  const message = error instanceof Error ? error.message : fallbackMessage;
  const status =
    typeof error === "object" &&
    error !== null &&
    "status" in error &&
    typeof (error as { status?: number }).status === "number"
      ? (error as { status: number }).status
      : 400;

  return NextResponse.json({ error: { message } }, { status });
}

export async function GET(request: NextRequest) {
  try {
    await requireAdminFromAuthHeader(request.headers.get("authorization") || "");
    const data = await listListingPlans();
    return NextResponse.json({ data, meta: { total: data.length } });
  } catch (error) {
    return getErrorResponse(error, "Could not load listing plans.");
  }
}

export async function POST(request: NextRequest) {
  try {
    await requireAdminFromAuthHeader(request.headers.get("authorization") || "");
    const payload = (await request.json().catch(() => null)) as
      | {
          id?: string;
          name?: string;
          shortLabel?: string;
          priceLabel?: string;
          description?: string;
          features?: string[];
        }
      | null;

    const created = await createListingPlan({
      id: String(payload?.id || "").trim() || undefined,
      name: String(payload?.name || "").trim(),
      shortLabel: String(payload?.shortLabel || "").trim(),
      priceLabel: String(payload?.priceLabel || "").trim(),
      description: String(payload?.description || "").trim(),
      features: Array.isArray(payload?.features) ? payload.features : [],
    });

    return NextResponse.json(created, { status: 201 });
  } catch (error) {
    return getErrorResponse(error, "Could not create listing plan.");
  }
}
