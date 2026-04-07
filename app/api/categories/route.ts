import { NextResponse } from "next/server";
import { getHomeSnapshot } from "@/lib/backend/service";
import { listCustomListingCategories } from "@/lib/server/listing-taxonomy";
import { mergeTaxonomyValues } from "@/lib/ui/listing-taxonomy";

export const runtime = "nodejs";

export async function GET() {
  const snapshot = await getHomeSnapshot();
  const customCategories = await listCustomListingCategories();
  const mergedCategoryNames = mergeTaxonomyValues(
    snapshot.categories.map((entry) => entry.name),
    customCategories
  );
  const categoryCountMap = new Map(
    snapshot.categories.map((entry) => [entry.name.toLowerCase(), entry.count])
  );
  const categories = mergedCategoryNames.map((name) => ({
    name,
    count: categoryCountMap.get(name.toLowerCase()) ?? 0,
  }));

  return NextResponse.json({
    data: categories,
    meta: {
      total: categories.length,
    },
  });
}
