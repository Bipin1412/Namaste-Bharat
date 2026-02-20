"use client";

import { useEffect, useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { MapPin } from "lucide-react";
import BusinessCard, { type BusinessCardData } from "@/components/BusinessCard";
import BusinessCardSkeleton from "@/components/BusinessCardSkeleton";
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

function markerPosition(index: number) {
  return {
    top: `${16 + ((index * 14) % 62)}%`,
    left: `${12 + ((index * 19) % 68)}%`,
  };
}

export default function MapSearchPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const urlQuery = searchParams.get("q") ?? "";

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

  useEffect(() => {
    const controller = new AbortController();
    const timer = window.setTimeout(async () => {
      setIsLoading(true);
      setError(null);

      try {
        const params = new URLSearchParams({
          page: "1",
          limit: "18",
          sort: "rating_desc",
        });

        if (query.trim()) {
          params.set("q", query.trim());
        }

        const response = await fetch(`/api/businesses?${params.toString()}`, {
          method: "GET",
          signal: controller.signal,
          cache: "no-store",
        });

        if (!response.ok) {
          throw new Error("Could not load map listings.");
        }

        const payload = (await response.json()) as BusinessesApiResponse;
        setBusinesses(payload.data);
        setResultCount(payload.meta.total);
      } catch (fetchError) {
        if (!controller.signal.aborted) {
          setError(
            fetchError instanceof Error
              ? fetchError.message
              : "Something went wrong while loading map listings."
          );
          setBusinesses([]);
          setResultCount(0);
        }
      } finally {
        if (!controller.signal.aborted) {
          setIsLoading(false);
        }
      }
    }, 200);

    return () => {
      controller.abort();
      window.clearTimeout(timer);
    };
  }, [query]);

  const statusText = useMemo(() => {
    if (isLoading) return "Updating map...";
    if (error) return "Error";
    return `${resultCount} places found`;
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
        placeholder="Search businesses on map view"
      />

      <section className="mx-auto max-w-7xl space-y-4 px-4 pb-24 pt-2 md:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          <p className="text-sm font-semibold tracking-[0.012em] text-slate-800">
            Map + List Discovery
          </p>
          <p className="text-xs text-slate-500">{statusText}</p>
        </div>

        <div className="grid gap-4 lg:grid-cols-[1fr,1.1fr]">
          <div className="relative min-h-[360px] overflow-hidden rounded-2xl border border-slate-200 bg-white lg:sticky lg:top-[5.5rem] lg:h-[calc(100dvh-7.5rem)]">
            <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(148,163,184,0.16)_1px,transparent_1px),linear-gradient(0deg,rgba(148,163,184,0.16)_1px,transparent_1px)] bg-[size:36px_36px]" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(59,130,246,0.14),transparent_48%),radial-gradient(circle_at_80%_70%,rgba(34,197,94,0.12),transparent_40%)]" />

            {businesses.slice(0, 10).map((business, index) => (
              <button
                type="button"
                key={`map-${business.id}`}
                style={markerPosition(index)}
                className="absolute -translate-x-1/2 -translate-y-1/2"
              >
                <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-blue-600 text-white shadow-lg shadow-blue-900/30">
                  <MapPin className="h-4 w-4" aria-hidden />
                </span>
              </button>
            ))}

            <div className="absolute bottom-3 left-3 right-3 rounded-xl border border-slate-200 bg-white/95 p-3 backdrop-blur">
              <p className="text-sm font-semibold text-slate-900">Map preview</p>
              <p className="text-xs text-slate-600">
                Marker positions are demo-generated for design review.
              </p>
            </div>
          </div>

          <div className="space-y-3">
            {isLoading ? (
              <>
                <BusinessCardSkeleton />
                <BusinessCardSkeleton />
                <BusinessCardSkeleton />
              </>
            ) : error ? (
              <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-center text-sm text-red-700">
                {error}
              </div>
            ) : businesses.length > 0 ? (
              businesses.map((business) => (
                <BusinessCard key={business.id} business={business} />
              ))
            ) : (
              <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-6 text-center text-sm text-slate-600">
                No map listings matched your search.
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
