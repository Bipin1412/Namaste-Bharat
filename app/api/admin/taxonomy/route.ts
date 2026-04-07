import { NextRequest, NextResponse } from "next/server";
import { getHomeSnapshot } from "@/lib/backend/service";
import { requireAdminFromAuthHeader } from "@/lib/server/daily-inquiries";
import {
  addListingCategory,
  addListingCity,
  listCustomListingCategories,
  listListingCities,
} from "@/lib/server/listing-taxonomy";
import { mergeTaxonomyValues } from "@/lib/ui/listing-taxonomy";

export const runtime = "nodejs";

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

async function getListingTaxonomyPayload() {
  const [snapshot, cities, customCategories] = await Promise.all([
    getHomeSnapshot(),
    listListingCities(),
    listCustomListingCategories(),
  ]);

  return {
    cities,
    categories: mergeTaxonomyValues(
      snapshot.categories.map((entry) => entry.name),
      customCategories
    ),
  };
}

export async function GET(request: NextRequest) {
  try {
    await requireAdminFromAuthHeader(request.headers.get("authorization") || "");
    const data = await getListingTaxonomyPayload();
    return NextResponse.json({
      data,
      meta: {
        cities: data.cities.length,
        categories: data.categories.length,
      },
    });
  } catch (error) {
    return getErrorResponse(error, "Could not load listing taxonomy.");
  }
}

export async function POST(request: NextRequest) {
  try {
    await requireAdminFromAuthHeader(request.headers.get("authorization") || "");

    const payload = (await request.json().catch(() => null)) as
      | { type?: string; value?: string }
      | null;

    const type = String(payload?.type || "").trim().toLowerCase();
    const value = String(payload?.value || "").trim();

    if (!value) {
      throw new Error("Value is required.");
    }

    if (type === "city") {
      await addListingCity(value);
    } else if (type === "category") {
      const current = await getListingTaxonomyPayload();
      if (current.categories.some((entry) => entry.toLowerCase() === value.toLowerCase())) {
        throw new Error("This category already exists.");
      }
      await addListingCategory(value);
    } else {
      throw new Error("Unsupported taxonomy type.");
    }

    const data = await getListingTaxonomyPayload();
    return NextResponse.json({ data }, { status: 201 });
  } catch (error) {
    return getErrorResponse(error, "Could not update listing taxonomy.");
  }
}
