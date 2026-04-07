import { NextResponse } from "next/server";
import { listListingCities } from "@/lib/server/listing-taxonomy";

export const runtime = "nodejs";

export async function GET() {
  const cities = await listListingCities();

  return NextResponse.json({
    data: cities,
    meta: { total: cities.length },
  });
}
