import { NextRequest, NextResponse } from "next/server";
import { jsonError } from "@/lib/backend/http";
import {
  deleteBusiness,
  getBusinessById,
  updateBusiness,
} from "@/lib/backend/service";
import { validateUpdateBusinessPayload } from "@/lib/backend/validation";

export const runtime = "nodejs";

type RouteContext = {
  params: Promise<{ id: string }>;
};

async function ensureAdmin(request: NextRequest): Promise<null | NextResponse> {
  const authHeader = request.headers.get("authorization") || "";
  const token = authHeader.startsWith("Bearer ")
    ? authHeader.slice("Bearer ".length).trim()
    : "";

  if (!token) {
    return jsonError(401, "Missing bearer token.");
  }

  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:4000";
  const response = await fetch(`${backendUrl}/api/auth/me`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  }).catch(() => null);

  if (!response || !response.ok) {
    return jsonError(401, "Unauthorized.");
  }

  const payload = (await response.json().catch(() => null)) as
    | { profile?: { role?: string | null } }
    | null;

  if (String(payload?.profile?.role || "").toLowerCase() !== "admin") {
    return jsonError(403, "Admin access required.");
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
