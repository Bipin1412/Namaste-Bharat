import { NextRequest, NextResponse } from "next/server";
import { jsonError } from "@/lib/backend/http";
import {
  deleteBusiness,
  getBusinessById,
  updateBusiness,
} from "@/lib/backend/service";
import { validateUpdateBusinessPayload } from "@/lib/backend/validation";
import { requireAdminFromAuthHeader } from "@/lib/server/daily-inquiries";

export const runtime = "nodejs";

type RouteContext = {
  params: Promise<{ id: string }>;
};

async function ensureAdmin(request: NextRequest): Promise<null | NextResponse> {
  const authHeader = request.headers.get("authorization") || "";
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

  return null;
}

export async function GET(_: NextRequest, context: RouteContext) {
  const { id } = await context.params;
  const business = await getBusinessById(id);

  if (!business) {
    return jsonError(404, "Business not found.");
  }

  return NextResponse.json(business);
}

export async function PATCH(request: NextRequest, context: RouteContext) {
  const authError = await ensureAdmin(request);
  if (authError) {
    return authError;
  }

  const { id } = await context.params;

  try {
    const body = (await request.json()) as unknown;
    const validation = validateUpdateBusinessPayload(body);

    if (!validation.ok) {
      return jsonError(400, "Invalid business update payload.", validation.errors);
    }

    const updated = await updateBusiness(id, validation.data);
    if (!updated) {
      return jsonError(404, "Business not found.");
    }

    return NextResponse.json(updated);
  } catch {
    return jsonError(400, "Request body must be valid JSON.");
  }
}

export async function DELETE(_: NextRequest, context: RouteContext) {
  const authError = await ensureAdmin(_);
  if (authError) {
    return authError;
  }

  const { id } = await context.params;
  const removed = await deleteBusiness(id);

  if (!removed) {
    return jsonError(404, "Business not found.");
  }

  return NextResponse.json({ ok: true });
}
