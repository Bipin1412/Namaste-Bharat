import { NextRequest, NextResponse } from "next/server";
import {
  createDailyInquiryPost,
  listDailyInquiryPosts,
  requireAdminFromAuthHeader,
} from "@/lib/server/daily-inquiries";

export const runtime = "nodejs";

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

export async function GET(request: NextRequest) {
  try {
    await requireAdminFromAuthHeader(request.headers.get("authorization") || "");
    const filterDate = request.nextUrl.searchParams.get("date");
    const data = await listDailyInquiryPosts(filterDate || null);
    return NextResponse.json({
      data,
      meta: { total: data.length },
    });
  } catch (error) {
    return getErrorResponse(error, "Admin daily inquiry service is temporarily unavailable.");
  }
}

export async function POST(request: NextRequest) {
  try {
    await requireAdminFromAuthHeader(request.headers.get("authorization") || "");
    const payload = (await request.json().catch(() => null)) as
      | { inquiryDate?: string; description?: string }
      | null;

    const inquiryDate = String(payload?.inquiryDate || "").trim().slice(0, 10);
    const description = String(payload?.description || "").trim();

    const parsedDate = inquiryDate ? new Date(inquiryDate) : null;
    if (!inquiryDate || !description || !parsedDate || Number.isNaN(parsedDate.getTime())) {
      return NextResponse.json(
        { error: { message: "Invalid daily inquiry payload." } },
        { status: 400 }
      );
    }

    const created = await createDailyInquiryPost({
      inquiryDate,
      description,
    });
    return NextResponse.json(created, { status: 201 });
  } catch (error) {
    return getErrorResponse(error, "Admin daily inquiry service is temporarily unavailable.");
  }
}
