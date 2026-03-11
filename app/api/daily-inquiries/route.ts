import { NextRequest, NextResponse } from "next/server";
import { listDailyInquiryPosts } from "@/lib/server/daily-inquiries";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  try {
    const filterDate = request.nextUrl.searchParams.get("date");
    const data = await listDailyInquiryPosts(filterDate || null);
    return NextResponse.json({
      data,
      meta: { total: data.length },
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Daily inquiry service is temporarily unavailable.";
    return NextResponse.json({ error: { message } }, { status: 502 });
  }
}
