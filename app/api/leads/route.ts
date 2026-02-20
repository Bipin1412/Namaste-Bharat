import { NextRequest, NextResponse } from "next/server";
import { jsonError, parseNumberParam } from "@/lib/backend/http";
import { createLead, getBusinessById, listLeads } from "@/lib/backend/service";
import { validateCreateLeadPayload } from "@/lib/backend/validation";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  const page = parseNumberParam(request.nextUrl.searchParams.get("page"), 1, 1, 10000);
  const limit = parseNumberParam(request.nextUrl.searchParams.get("limit"), 20, 1, 100);
  const payload = await listLeads({ page, limit });
  return NextResponse.json(payload);
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as unknown;
    const validation = validateCreateLeadPayload(body);

    if (!validation.ok) {
      return jsonError(400, "Invalid lead payload.", validation.errors);
    }

    const business = await getBusinessById(validation.data.businessId);
    if (!business) {
      return jsonError(404, "Business for lead not found.");
    }

    const created = await createLead(validation.data);
    return NextResponse.json(created, { status: 201 });
  } catch {
    return jsonError(400, "Request body must be valid JSON.");
  }
}
