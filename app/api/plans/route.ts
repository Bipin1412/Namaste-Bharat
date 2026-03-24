import { NextResponse } from "next/server";
import { listListingPlans } from "@/lib/backend/service";

export const runtime = "nodejs";

export async function GET() {
  const plans = await listListingPlans();
  return NextResponse.json({
    data: plans,
    meta: { total: plans.length },
  });
}
