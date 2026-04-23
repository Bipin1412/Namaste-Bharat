"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import BusinessCard, { type BusinessCardData } from "@/components/BusinessCard";
import OfferBannerSlot from "@/components/OfferBannerSlot";
import SmartSearchBar from "@/components/SmartSearchBar";

type SortOption = "rating_desc" | "rating_asc" | "reviews_desc" | "newest";

type SearchPageViewProps = {
  initialQuery: string;
  initialVerified: boolean;
  initialOpenNow: boolean;
  initialSort: SortOption;
  businesses: BusinessCardData[];
  resultCount: number;
  error: string | null;
};

function setParam(
  params: URLSearchParams,
  key: string,
  value: string | boolean | undefined
) {
  if (typeof value === "undefined") {
    params.delete(key);
    return;
  }

  if (typeof value === "boolean") {
    if (value) {
      params.set(key, "true");
    } else {
      params.delete(key);
    }
    return;
  }

  const normalized = value.trim();
  if (normalized) {
    params.set(key, normalized);
  } else {
    params.delete(key);
  }
}

export default function SearchPageView({
  initialQuery,
  initialVerified,
  initialOpenNow,
  initialSort,
  businesses,
  resultCount,
  error,
}: SearchPageViewProps) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const [query, setQuery] = useState(initialQuery);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    setQuery(initialQuery);
  }, [initialQuery]);

  function syncToUrl(nextParams: {
    q?: string;
    verified?: boolean;
    openNow?: boolean;
    sort?: SortOption;
  }) {
    const params = new URLSearchParams(searchParams.toString());
    setParam(params, "q", nextParams.q);
    setParam(params, "verified", nextParams.verified);
    setParam(params, "openNow", nextParams.openNow);
    setParam(params, "sort", nextParams.sort);

    const queryString = params.toString();
    const nextUrl = queryString ? `${pathname}?${queryString}` : pathname;

    startTransition(() => {
      router.replace(nextUrl, { scroll: false });
    });
  }

  const statusText = useMemo(() => {
    if (isPending) {
      return "Updating...";
    }

    if (error) {
      return "Error";
    }

    return `${resultCount} found`;
  }, [error, isPending, resultCount]);

  return (
    <div className="min-h-dvh bg-slate-50">
      <SmartSearchBar
        value={query}
        onChange={setQuery}
        onSubmit={(value) => {
          setQuery(value);
          syncToUrl({
            q: value,
            verified: initialVerified,
            openNow: initialOpenNow,
            sort: initialSort,
          });
        }}
        onVoiceSearch={() => {
          const voiceQuery = "repair";
          setQuery(voiceQuery);
          syncToUrl({
            q: voiceQuery,
            verified: initialVerified,
            openNow: initialOpenNow,
            sort: initialSort,
          });
        }}
      />

      <section className="mx-auto max-w-7xl space-y-4 px-4 pb-24 pt-2 md:px-6 lg:px-8">
        <OfferBannerSlot title="Search Results Offer Banner" />

        <div className="flex items-center justify-between">
          <p className="text-sm font-semibold tracking-[0.012em] text-slate-800">
            Search Results
          </p>
          <p className="text-xs text-slate-500">{statusText}</p>
        </div>

        <div className="grid gap-4 lg:grid-cols-[240px,1fr]">
          <aside className="hidden h-fit rounded-2xl border border-slate-200 bg-white p-4 lg:block">
            <p className="text-sm font-semibold tracking-[0.012em] text-slate-800">
              Quick Filters
            </p>
            <div className="mt-3 space-y-2 text-sm text-slate-600">
              <button
                type="button"
                onClick={() =>
                  syncToUrl({
                    q: query,
                    verified: !initialVerified,
                    openNow: initialOpenNow,
                    sort: initialSort,
                  })
                }
                className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-left hover:border-blue-300 hover:bg-blue-50"
              >
                {initialVerified ? "Verified businesses (On)" : "Verified businesses"}
              </button>
              <button
                type="button"
                onClick={() =>
                  syncToUrl({
                    q: query,
                    verified: initialVerified,
                    openNow: !initialOpenNow,
                    sort: initialSort,
                  })
                }
                className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-left hover:border-blue-300 hover:bg-blue-50"
              >
                {initialOpenNow ? "Open now (On)" : "Open now"}
              </button>
              <button
                type="button"
                onClick={() =>
                  syncToUrl({
                    q: query,
                    verified: initialVerified,
                    openNow: initialOpenNow,
                    sort: "rating_desc",
                  })
                }
                className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-left hover:border-blue-300 hover:bg-blue-50"
              >
                Top rated 4.5+
              </button>
              <button
                type="button"
                onClick={() => {
                  const nextQuery = "whatsapp";
                  setQuery(nextQuery);
                  syncToUrl({
                    q: nextQuery,
                    verified: initialVerified,
                    openNow: initialOpenNow,
                    sort: initialSort,
                  });
                }}
                className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-left hover:border-blue-300 hover:bg-blue-50"
              >
                WhatsApp available
              </button>
            </div>
          </aside>

          <div className="space-y-3">
            {error ? (
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
