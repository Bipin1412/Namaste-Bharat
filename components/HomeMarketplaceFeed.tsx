"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, BadgeCheck, Sparkles } from "lucide-react";
import BusinessCard, { type BusinessCardData } from "@/components/BusinessCard";
import BusinessCardSkeleton from "@/components/BusinessCardSkeleton";
import CategorySection from "@/components/CategorySection";
import OfferBannerSlot from "@/components/OfferBannerSlot";
import TestimonialsCarousel, { type Testimonial } from "@/components/TestimonialsCarousel";
import { getBusinessImage } from "@/lib/ui/showcase";

type CategoryTile = {
  label: string;
  iconKey: string;
  count?: number;
};

type HomeSnapshotResponse = {
  featuredBusinesses: BusinessCardData[];
  categories: Array<{ name: string; count: number }>;
  quickFilters: string[];
};

type BusinessesResponse = {
  data: BusinessCardData[];
  meta: {
    total: number;
  };
};

type HomeMarketplaceFeedProps = {
  fallbackCategories: CategoryTile[];
  fallbackBusinesses: BusinessCardData[];
  fallbackQuickFilters: string[];
  testimonials: Testimonial[];
};

function pickIconForCategory(label: string): string {
  const normalized = label.toLowerCase();
  if (normalized.includes("beauty") || normalized.includes("dress") || normalized.includes("grooms")) {
    return "scissors";
  }
  if (normalized.includes("repair") || normalized.includes("electrical")) return "wrench";
  if (normalized.includes("fabrication") || normalized.includes("construction")) return "hammer";
  if (
    normalized.includes("clinic") ||
    normalized.includes("health") ||
    normalized.includes("doctor") ||
    normalized.includes("dental")
  ) {
    return "health";
  }
  if (normalized.includes("catering") || normalized.includes("food")) return "utensils";
  if (normalized.includes("education")) return "education";
  if (
    normalized.includes("logistics") ||
    normalized.includes("transport") ||
    normalized.includes("courier") ||
    normalized.includes("travels")
  ) {
    return "transport";
  }
  if (normalized.includes("hotel") || normalized.includes("travel")) return "hotel";
  if (normalized.includes("auto") || normalized.includes("garage")) return "car";
  if (normalized.includes("finance") || normalized.includes("insurance") || normalized.includes("loan")) {
    return "finance";
  }
  if (normalized.includes("interior") || normalized.includes("paint") || normalized.includes("waterproof")) {
    return "paint";
  }
  if (normalized.includes("software") || normalized.includes("computer") || normalized.includes("mobile")) {
    return "tech";
  }
  if (normalized.includes("lawyer") || normalized.includes("legal") || normalized.includes("accounting")) {
    return "scale";
  }
  if (normalized.includes("flower") || normalized.includes("gardening") || normalized.includes("agriculture")) {
    return "flower";
  }
  if (normalized.includes("pack") || normalized.includes("mover") || normalized.includes("dealer")) {
    return "package";
  }
  if (normalized.includes("home")) {
    return "house";
  }
  if (normalized.includes("business") || normalized.includes("service")) {
    return "briefcase";
  }
  return "store";
}

export default function HomeMarketplaceFeed({
  fallbackCategories,
  fallbackBusinesses,
  fallbackQuickFilters,
  testimonials,
}: HomeMarketplaceFeedProps) {
  const [featuredBusinesses, setFeaturedBusinesses] = useState<BusinessCardData[]>(fallbackBusinesses);
  const [categories, setCategories] = useState<CategoryTile[]>(fallbackCategories);
  const [quickFilters, setQuickFilters] = useState<string[]>(fallbackQuickFilters);
  const [activeBusinessCount, setActiveBusinessCount] = useState<number>(fallbackBusinesses.length);
  const [totalBusinessCount, setTotalBusinessCount] = useState<number>(fallbackBusinesses.length);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const controller = new AbortController();
    const timer = window.setTimeout(async () => {
      setIsLoading(true);
      setError("");

      try {
        const [homeResponse, businessesResponse, totalResponse] = await Promise.all([
          fetch("/api/home", { cache: "no-store", signal: controller.signal }),
          fetch("/api/businesses?sort=rating_desc&page=1&limit=4", {
            cache: "no-store",
            signal: controller.signal,
          }),
          fetch("/api/businesses?sort=newest&page=1&limit=1&includeInactive=true", {
            cache: "no-store",
            signal: controller.signal,
          }),
        ]);

        if (!homeResponse.ok || !businessesResponse.ok || !totalResponse.ok) {
          throw new Error("Could not load live marketplace data.");
        }

        const homePayload = (await homeResponse.json()) as HomeSnapshotResponse;
        const businessesPayload = (await businessesResponse.json()) as BusinessesResponse;
        const totalPayload = (await totalResponse.json()) as BusinessesResponse;

        const liveCategories = Array.isArray(homePayload.categories)
          ? homePayload.categories.map((entry) => ({
              label: entry.name,
              iconKey: pickIconForCategory(entry.name),
              count: entry.count,
            }))
          : [];

        setCategories(liveCategories.length > 0 ? liveCategories : fallbackCategories);
        setQuickFilters(
          Array.isArray(homePayload.quickFilters) && homePayload.quickFilters.length > 0
            ? homePayload.quickFilters
            : fallbackQuickFilters
        );
        setFeaturedBusinesses(
          Array.isArray(businessesPayload.data) && businessesPayload.data.length > 0
            ? businessesPayload.data
            : homePayload.featuredBusinesses?.length > 0
            ? homePayload.featuredBusinesses
            : fallbackBusinesses
        );
        setActiveBusinessCount(Number(businessesPayload.meta?.total || 0));
        setTotalBusinessCount(Number(totalPayload.meta?.total || 0));
      } catch (requestError) {
        if (!controller.signal.aborted) {
          setError(
            requestError instanceof Error
              ? requestError.message
              : "Something went wrong while loading live listings."
          );
          setFeaturedBusinesses(fallbackBusinesses);
          setCategories(fallbackCategories);
          setQuickFilters(fallbackQuickFilters);
          setActiveBusinessCount(fallbackBusinesses.length);
          setTotalBusinessCount(fallbackBusinesses.length);
        }
      } finally {
        if (!controller.signal.aborted) {
          setIsLoading(false);
        }
      }
    }, 150);

    return () => {
      controller.abort();
      window.clearTimeout(timer);
    };
  }, [fallbackBusinesses, fallbackCategories, fallbackQuickFilters]);

  const statusText = useMemo(() => {
    if (isLoading) {
      return "Loading live shops...";
    }
    if (error) {
      return "Showing cached fallback";
    }
    return `${activeBusinessCount} active / ${totalBusinessCount} total listings`;
  }, [activeBusinessCount, error, isLoading, totalBusinessCount]);

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-[0_14px_30px_-24px_rgba(15,23,42,0.35)]">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <p className="text-sm font-semibold text-slate-800">Live marketplace</p>
            <p className="text-xs text-slate-500">{statusText}</p>
          </div>
          <Link
            href="/search"
            className="inline-flex items-center gap-1 text-xs font-medium text-blue-700 hover:text-blue-600"
          >
            View all listings
            <ArrowRight className="h-3.5 w-3.5" aria-hidden />
          </Link>
        </div>

        <div className="mt-3 flex flex-wrap gap-2">
          {quickFilters.map((item) => (
            <Link
              key={item}
              href={`/search?q=${encodeURIComponent(item)}`}
              className="whitespace-nowrap rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-medium text-slate-700 hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700"
            >
              {item}
            </Link>
          ))}
        </div>

        <div className="mt-4 grid gap-2 sm:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-xl bg-slate-50 px-3 py-2 text-sm text-slate-700">
            Active listings: <span className="font-semibold text-slate-900">{activeBusinessCount}</span>
          </div>
          <div className="rounded-xl bg-slate-50 px-3 py-2 text-sm text-slate-700">
            Total listings: <span className="font-semibold text-slate-900">{totalBusinessCount}</span>
          </div>
          <div className="rounded-xl bg-slate-50 px-3 py-2 text-sm text-slate-700">
            Categories: <span className="font-semibold text-slate-900">{categories.length}</span>
          </div>
          <div className="rounded-xl bg-slate-50 px-3 py-2 text-sm text-slate-700">
            Status: <span className="font-semibold text-slate-900">{error ? "Offline fallback" : "Live"}</span>
          </div>
        </div>
      </div>

      <CategorySection categories={categories} />

      <OfferBannerSlot
        title="Offer Banner Slot"
        subtitle="Use this area for festival campaigns, sponsored ads, or partner promotions."
      />

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <p className="text-sm font-semibold text-slate-800">Top picks near you</p>
          <Link href="/search" className="text-xs font-medium text-blue-700 hover:text-blue-600">
            View all listings
          </Link>
        </div>
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-2">
          {isLoading && featuredBusinesses.length === 0 ? (
            <>
              <BusinessCardSkeleton />
              <BusinessCardSkeleton />
            </>
          ) : (
            featuredBusinesses.map((business) => (
              <BusinessCard key={business.id} business={business} />
            ))
          )}
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-4">
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-orange-500" aria-hidden />
          <p className="text-sm font-semibold text-slate-800">Recent activity</p>
        </div>
        <div className="mt-3 grid gap-2 md:grid-cols-3">
          {featuredBusinesses.slice(0, 3).map((business) => (
            <div
              key={`activity-${business.id}`}
              className="rounded-xl border border-slate-100 bg-slate-50 p-3"
            >
              <div className="relative mb-2 h-24 w-full overflow-hidden rounded-lg">
                <Image
                  src={business.media?.coverImages?.[0] || getBusinessImage(business.id)}
                  alt={business.name}
                  fill
                  className="object-cover"
                />
              </div>
              <p className="text-sm font-semibold text-slate-800">{business.name}</p>
              <p className="mt-0.5 text-xs text-slate-500">
                {business.category} in {business.city}
              </p>
              <p className="mt-2 inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 text-[11px] font-medium text-emerald-700">
                <BadgeCheck className="h-3 w-3" aria-hidden />
                {business.verified ? "Verified" : "Active listing"}
              </p>
            </div>
          ))}
        </div>
      </div>

      <TestimonialsCarousel testimonials={testimonials} />
    </div>
  );
}
