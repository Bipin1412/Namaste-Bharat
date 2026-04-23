import { listBusinesses } from "@/lib/backend/service";
import type { BusinessCardData } from "@/components/BusinessCard";
import SearchPageView from "./SearchPageView";

export const dynamic = "force-dynamic";
export const revalidate = 0;

type SearchParamValue = string | string[] | undefined;
type SearchParamsInput =
  | Record<string, SearchParamValue>
  | Promise<Record<string, SearchParamValue>>
  | undefined;

type SortOption = "rating_desc" | "rating_asc" | "reviews_desc" | "newest";

function firstValue(value: SearchParamValue): string | undefined {
  if (Array.isArray(value)) {
    return value[0];
  }

  return value;
}

function parseBoolean(value?: string): boolean | undefined {
  if (typeof value !== "string") {
    return undefined;
  }

  const normalized = value.trim().toLowerCase();
  if (normalized === "true") return true;
  if (normalized === "false") return false;
  return undefined;
}

function parseSort(value?: string): SortOption {
  if (
    value === "rating_desc" ||
    value === "rating_asc" ||
    value === "reviews_desc" ||
    value === "newest"
  ) {
    return value;
  }

  return "rating_desc";
}

export default async function SearchPage({
  searchParams,
}: {
  searchParams?: SearchParamsInput;
}) {
  const resolvedSearchParams = ((await searchParams) ?? {}) as Record<
    string,
    SearchParamValue
  >;

  const query = firstValue(resolvedSearchParams.q) ?? "";
  const verified = parseBoolean(firstValue(resolvedSearchParams.verified));
  const openNow = parseBoolean(firstValue(resolvedSearchParams.openNow));
  const sort = parseSort(firstValue(resolvedSearchParams.sort));

  let businesses: BusinessCardData[] = [];
  let resultCount = 0;
  let error: string | null = null;

  try {
    const payload = await listBusinesses({
      q: query.trim() || undefined,
      category: firstValue(resolvedSearchParams.category) ?? undefined,
      city: firstValue(resolvedSearchParams.city) ?? undefined,
      verified,
      openNow,
      sort,
      includeInactive: false,
      page: 1,
      limit: 18,
    });

    businesses = payload.data;
    resultCount = payload.meta.total;
  } catch (fetchError) {
    error =
      fetchError instanceof Error
        ? fetchError.message
        : "Could not load business listings.";
  }

  return (
    <SearchPageView
      initialQuery={query}
      initialVerified={verified ?? false}
      initialOpenNow={openNow ?? false}
      initialSort={sort}
      businesses={businesses}
      resultCount={resultCount}
      error={error}
    />
  );
}
