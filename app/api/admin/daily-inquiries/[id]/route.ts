import { NextRequest, NextResponse } from "next/server";
import {
  deleteDailyInquiryPost,
  requireAdminFromAuthHeader,
} from "@/lib/server/daily-inquiries";

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
      : 502;

  return NextResponse.json({ error: { message } }, { status });
}

export async function DELETE(request: NextRequest, context: RouteContext) {
  try {
    await requireAdminFromAuthHeader(request.headers.get("authorization") || "");
    const { id } = await context.params;
    const removed = await deleteDailyInquiryPost(id);
    if (!removed) {
      return NextResponse.json(
        { error: { message: "Daily inquiry not found." } },
        { status: 404 }
      );
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    return getErrorResponse(error, "Admin daily inquiry service is temporarily unavailable.");
  }
}
