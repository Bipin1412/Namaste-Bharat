"use client";

import { useEffect, useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import BusinessCard, { type BusinessCardData } from "@/components/BusinessCard";
import BusinessCardSkeleton from "@/components/BusinessCardSkeleton";
import OfferBannerSlot from "@/components/OfferBannerSlot";
import SmartSearchBar from "@/components/SmartSearchBar";

type BusinessesApiResponse = {
  data: BusinessCardData[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
};

function normalizeSearchText(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function businessSearchText(business: BusinessCardData): string {
  return normalizeSearchText(
    [
      business.name,
      business.category,
      business.locality,
      business.city,
      business.phone,
      business.whatsappNumber,
    ].join(" ")
  );
}

function matchesBusinessQuery(business: BusinessCardData, rawQuery: string): boolean {
  const query = normalizeSearchText(rawQuery);
  if (!query) {
    return true;
  }

  const haystack = businessSearchText(business);
  if (!haystack) {
    return false;
  }

  if (haystack.includes(query)) {
    return true;
  }

  const tokens = query.split(" ").filter((token) => token.length >= 2);
  return tokens.length > 0 && tokens.every((token) => haystack.includes(token));
}

function mergeBusinesses(primary: BusinessCardData[], fallback: BusinessCardData[]): BusinessCardData[] {
  const merged = new Map<string, BusinessCardData>();

  for (const business of primary) {
    merged.set(business.id, business);
  }

  for (const business of fallback) {
    if (!merged.has(business.id)) {
      merged.set(business.id, business);
    }
  }

  return [...merged.values()];
}

async function fetchAllActiveBusinesses(
  signal: AbortSignal,
  sort: "rating_desc" | "rating_asc" | "reviews_desc" | "newest",
  filters: {
    verified?: boolean;
    openNow?: boolean;
  } = {}
): Promise<BusinessCardData[]> {
  const firstParams = new URLSearchParams({
    page: "1",
    limit: "50",
    sort,
  });

  if (typeof filters.verified === "boolean") {
    firstParams.set("verified", filters.verified ? "true" : "false");
  }

  if (typeof filters.openNow === "boolean") {
    firstParams.set("openNow", filters.openNow ? "true" : "false");
  }

  const firstResponse = await fetch(`/api/businesses?${firstParams.toString()}`, {
    method: "GET",
    signal,
    cache: "no-store",
  });

  if (!firstResponse.ok) {
    return [];
  }

  const firstPayload = (await firstResponse.json().catch(() => null)) as BusinessesApiResponse | null;
  const firstPage = Array.isArray(firstPayload?.data) ? firstPayload.data : [];
  const totalPages = Math.max(1, firstPayload?.meta?.totalPages ?? 1);

  if (totalPages === 1) {
    return firstPage;
  }

  const remainingPages = await Promise.all(
    Array.from({ length: totalPages - 1 }, async (_, index) => {
      const page = index + 2;
      const params = new URLSearchParams({
        page: String(page),
        limit: "50",
        sort,
      });

      if (typeof filters.verified === "boolean") {
        params.set("verified", filters.verified ? "true" : "false");
      }

      if (typeof filters.openNow === "boolean") {
        params.set("openNow", filters.openNow ? "true" : "false");
      }

      const response = await fetch(`/api/businesses?${params.toString()}`, {
        method: "GET",
        signal,
        cache: "no-store",
      }).catch(() => null);

      if (!response || !response.ok) {
        return [] as BusinessCardData[];
      }

      const payload = (await response.json().catch(() => null)) as BusinessesApiResponse | null;
      return Array.isArray(payload?.data) ? payload.data : [];
    })
  );

  return [...firstPage, ...remainingPages.flat()];
}

export default function SearchPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const urlQuery = searchParams.get("q") ?? "";
  const urlVerified = (searchParams.get("verified") ?? "").toLowerCase() === "true";
  const urlOpenNow = (searchParams.get("openNow") ?? "").toLowerCase() === "true";
  const urlSort =
    (searchParams.get("sort") as
      | "rating_desc"
      | "rating_asc"
      | "reviews_desc"
      | "newest"
      | null) ?? "rating_desc";

  const [query, setQuery] = useState(urlQuery);
  const [businesses, setBusinesses] = useState<BusinessCardData[]>([]);
  const [resultCount, setResultCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setQuery((currentValue) => (currentValue === urlQuery ? currentValue : urlQuery));
  }, [urlQuery]);

  function syncQueryToUrl(nextQuery: string) {
    const params = new URLSearchParams(searchParams.toString());
    const normalizedQuery = nextQuery.trim();

    if (normalizedQuery) {
      params.set("q", normalizedQuery);
    } else {
      params.delete("q");
    }

    const queryString = params.toString();
    router.replace(queryString ? `${pathname}?${queryString}` : pathname, {
      scroll: false,
    });
  }

  function syncFilterToUrl(nextFilters: {
    verified?: boolean;
    openNow?: boolean;
    sort?: "rating_desc" | "rating_asc" | "reviews_desc" | "newest";
  }) {
    const params = new URLSearchParams(searchParams.toString());

    if (typeof nextFilters.verified === "boolean") {
      if (nextFilters.verified) params.set("verified", "true");
      else params.delete("verified");
    }

    if (typeof nextFilters.openNow === "boolean") {
      if (nextFilters.openNow) params.set("openNow", "true");
      else params.delete("openNow");
    }

    if (nextFilters.sort) {
      params.set("sort", nextFilters.sort);
    }

    const queryString = params.toString();
    router.replace(queryString ? `${pathname}?${queryString}` : pathname, {
      scroll: false,
    });
  }

  useEffect(() => {
    const controller = new AbortController();
    const timer = window.setTimeout(async () => {
      setIsLoading(true);
      setError(null);

      try {
        const params = new URLSearchParams({
          page: "1",
          limit: "18",
          sort: urlSort,
        });

        if (query.trim()) {
          params.set("q", query.trim());
        }
        if (urlVerified) {
          params.set("verified", "true");
        }
        if (urlOpenNow) {
          params.set("openNow", "true");
        }

        const response = await fetch(`/api/businesses?${params.toString()}`, {
          method: "GET",
          signal: controller.signal,
          cache: "no-store",
        });

        if (!response.ok) {
          throw new Error("Could not load business listings.");
        }

        const payload = (await response.json()) as BusinessesApiResponse;

        if (query.trim()) {
          const activeBusinesses = await fetchAllActiveBusinesses(controller.signal, urlSort, {
            verified: urlVerified,
            openNow: urlOpenNow,
          });
          const fallbackMatches = activeBusinesses.filter((business) =>
            matchesBusinessQuery(business, query)
          );
          const merged = mergeBusinesses(payload.data, fallbackMatches);
          setBusinesses(merged);
          setResultCount(Math.max(payload.meta.total, merged.length));
        } else {
          setBusinesses(payload.data);
          setResultCount(payload.meta.total);
        }
      } catch (fetchError) {
        if (!controller.signal.aborted) {
          setError(
            fetchError instanceof Error
              ? fetchError.message
              : "Something went wrong while loading listings."
          );
          setBusinesses([]);
          setResultCount(0);
        }
      } finally {
        if (!controller.signal.aborted) {
          setIsLoading(false);
        }
      }
    }, 220);

    return () => {
      controller.abort();
      window.clearTimeout(timer);
    };
  }, [query, urlOpenNow, urlSort, urlVerified]);

  const statusText = useMemo(() => {
    if (isLoading) {
      return "Updating...";
    }

    if (error) {
      return "Error";
    }

    return `${resultCount} found`;
  }, [error, isLoading, resultCount]);

  return (
    <div className="min-h-dvh bg-slate-50">
      <SmartSearchBar
        value={query}
        onChange={setQuery}
        onSubmit={(value) => {
          setQuery(value);
          syncQueryToUrl(value);
        }}
        onVoiceSearch={() => {
          const voiceQuery = "repair";
          setQuery(voiceQuery);
          syncQueryToUrl(voiceQuery);
        }}
      />

      <section className="mx-auto max-w-7xl space-y-4 px-4 pb-24 pt-2 md:px-6 lg:px-8">
        <OfferBannerSlot title="Search Results Offer Banner" />

        <div className="flex items-center justify-between">
          <p className="text-sm font-semibold tracking-[0.012em] text-slate-800">
            Search Results
          </p>
          <p className="text-xs text-slate-500">
            {statusText}
          </p>
        </div>

        <div className="grid gap-4 lg:grid-cols-[240px,1fr]">
          <aside className="hidden h-fit rounded-2xl border border-slate-200 bg-white p-4 lg:block">
            <p className="text-sm font-semibold tracking-[0.012em] text-slate-800">
              Quick Filters
            </p>
            <div className="mt-3 space-y-2 text-sm text-slate-600">
              <button
                type="button"
                onClick={() => syncFilterToUrl({ verified: !urlVerified })}
                className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-left hover:border-blue-300 hover:bg-blue-50"
              >
                {urlVerified ? "Verified businesses (On)" : "Verified businesses"}
              </button>
              <button
                type="button"
                onClick={() => syncFilterToUrl({ openNow: !urlOpenNow })}
                className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-left hover:border-blue-300 hover:bg-blue-50"
              >
                {urlOpenNow ? "Open now (On)" : "Open now"}
              </button>
              <button
                type="button"
                onClick={() => syncFilterToUrl({ sort: "rating_desc" })}
                className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-left hover:border-blue-300 hover:bg-blue-50"
              >
                Top rated 4.5+
              </button>
              <button
                type="button"
                onClick={() => {
                  setQuery("whatsapp");
                  syncQueryToUrl("whatsapp");
                }}
                className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-left hover:border-blue-300 hover:bg-blue-50"
              >
                WhatsApp available
              </button>
            </div>
          </aside>

          <div className="space-y-3">
            {isLoading ? (
              <>
                <BusinessCardSkeleton />
                <BusinessCardSkeleton />
                <BusinessCardSkeleton />
              </>
            ) : error ? (
              <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-center text-sm leading-relaxed tracking-[0.012em] text-red-700">
                {error}
              </div>
            ) : businesses.length > 0 ? (
              businesses.map((business) => (
                <BusinessCard key={business.id} business={business} />
              ))
            ) : (
              <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-6 text-center text-sm leading-relaxed tracking-[0.012em] text-slate-600">
                No listings matched your search. Try category names like
                plumber, clinic, or hardware.
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
