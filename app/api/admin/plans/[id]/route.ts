import { NextRequest, NextResponse } from "next/server";
import { updateListingPlan } from "@/lib/backend/service";
import { requireAdminFromAuthHeader } from "@/lib/server/daily-inquiries";

export const runtime = "nodejs";

type RouteContext = {
  params: Promise<{ id: string }>;
};

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

export async function PATCH(request: NextRequest, context: RouteContext) {
  try {
    await requireAdminFromAuthHeader(request.headers.get("authorization") || "");
    const { id } = await context.params;
    const payload = (await request.json().catch(() => null)) as
      | {
          name?: string;
          shortLabel?: string;
          priceLabel?: string;
          description?: string;
          features?: string[];
        }
      | null;

    const updated = await updateListingPlan(id, {
      name: payload?.name,
      shortLabel: payload?.shortLabel,
      priceLabel: payload?.priceLabel,
      description: payload?.description,
      features: Array.isArray(payload?.features) ? payload.features : undefined,
    });

    if (!updated) {
      return NextResponse.json({ error: { message: "Listing plan not found." } }, { status: 404 });
    }

    return NextResponse.json(updated);
  } catch (error) {
    return getErrorResponse(error, "Could not update listing plan.");
  }
}
