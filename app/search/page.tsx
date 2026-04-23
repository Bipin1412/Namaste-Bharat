import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  BadgeCheck,
  Clock3,
  MapPin,
  MessageCircle,
  Phone,
  Search,
} from "lucide-react";
import { listBusinesses } from "@/lib/backend/service";
import type { Business } from "@/lib/backend/types";
import { getBusinessImage } from "@/lib/ui/showcase";

export const dynamic = "force-dynamic";
export const revalidate = 0;

type SearchParams = Record<string, string | string[] | undefined>;

type SearchPageProps = {
  searchParams?: Promise<SearchParams>;
};

function firstParam(value: string | string[] | undefined): string {
  if (Array.isArray(value)) {
    return value[0] ?? "";
  }
  return value ?? "";
}

function normalizeValue(value: string): string {
  return value.trim();
}

function toBoolean(value: string): boolean | undefined {
  const normalized = value.trim().toLowerCase();
  if (normalized === "true" || normalized === "1") return true;
  if (normalized === "false" || normalized === "0") return false;
  return undefined;
}

function buildSearchUrl(
  current: SearchParams,
  updates: Record<string, string | boolean | undefined | null>
): string {
  const params = new URLSearchParams();

  const keepKeys = ["q", "verified", "openNow", "sort", "category", "city"] as const;
  for (const key of keepKeys) {
    const currentValue = firstParam(current[key]);
    if (currentValue) {
      params.set(key, currentValue);
    }
  }

  for (const [key, value] of Object.entries(updates)) {
    if (value === undefined || value === null || value === "") {
      params.delete(key);
      continue;
    }

    if (typeof value === "boolean") {
      if (value) params.set(key, "true");
      else params.delete(key);
      continue;
    }

    params.set(key, value);
  }

  const queryString = params.toString();
  return queryString ? `/search?${queryString}` : "/search";
}

function buildWhatsappUrl(number: string, businessName: string): string {
  const sanitized = number.replace(/\D/g, "");
  const message = encodeURIComponent(
    `Namaste ${businessName}, I found you on Namaste Bharat and want to know more.`
  );
  return `https://wa.me/${sanitized}?text=${message}`;
}

function SearchResultCard({ business }: { business: Business }) {
  const image = business.media?.coverImages?.[0] || getBusinessImage(business.id);

  return (
    <article className="overflow-hidden rounded-2xl border border-slate-200 bg-white p-3 shadow-[0_10px_24px_-18px_rgba(15,23,42,0.35)] md:p-4">
      <div className="grid grid-cols-[88px,1fr] gap-3 md:grid-cols-[112px,1fr] md:gap-4">
        <div className="relative h-24 overflow-hidden rounded-xl border border-slate-200 bg-slate-100 md:h-28">
          <Image
            src={image}
            alt={business.name}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 88px, 112px"
          />
        </div>

        <div className="min-w-0">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0 space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="truncate text-base font-semibold leading-snug tracking-[0.01em] text-slate-900">
                  {business.name}
                </h3>
                {business.verified ? (
                  <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 text-[11px] font-medium text-emerald-700">
                    <BadgeCheck className="h-3.5 w-3.5" aria-hidden />
                    Verified
                  </span>
                ) : null}
              </div>
              <p className="text-sm tracking-[0.012em] text-slate-600">{business.category}</p>
            </div>

            <div className="shrink-0 rounded-md border border-amber-200 bg-amber-50 px-2 py-1 text-xs font-semibold text-amber-700">
              {business.rating.toFixed(1)} ({business.reviewCount})
            </div>
          </div>

          <div className="mt-2 space-y-1.5 text-sm text-slate-600">
            <p className="flex items-center gap-2">
              <MapPin className="h-4 w-4 shrink-0 text-slate-500" aria-hidden />
              <span className="truncate tracking-[0.012em]">
                {business.locality}, {business.city}
              </span>
            </p>
            <p className="flex items-center gap-2">
              <Clock3 className="h-4 w-4 shrink-0 text-slate-500" aria-hidden />
              <span
                className={`font-medium tracking-[0.012em] ${
                  business.isOpenNow ? "text-emerald-700" : "text-rose-600"
                }`}
              >
                {business.isOpenNow ? "Open now" : "Closed"}
              </span>
            </p>
          </div>

          <div className="mt-3 grid grid-cols-2 gap-2">
            <a
              href={`tel:${business.phone}`}
              aria-label={`Call ${business.name}`}
              className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white text-sm font-medium text-slate-700 transition-colors hover:bg-slate-100"
            >
              <Phone className="h-4 w-4" aria-hidden />
              Call
            </a>
            <a
              href={buildWhatsappUrl(business.whatsappNumber, business.name)}
              target="_blank"
              rel="noreferrer"
              aria-label={`Chat with ${business.name} on WhatsApp`}
              className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-green-500 text-sm font-semibold text-white shadow-[0_10px_20px_-12px_rgba(21,128,61,0.6)] transition-colors hover:bg-green-600"
            >
              <MessageCircle className="h-4 w-4" aria-hidden />
              WhatsApp
            </a>
          </div>

          <Link
            href={`/business/${business.id}`}
            className="mt-2 inline-flex text-xs font-semibold text-blue-700 hover:text-blue-600"
          >
            View full profile
          </Link>
        </div>
      </div>
    </article>
  );
}

function QuickFilterLink({
  href,
  label,
  active,
}: {
  href: string;
  label: string;
  active?: boolean;
}) {
  return (
    <Link
      href={href}
      className={`whitespace-nowrap rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${
        active
          ? "border-blue-200 bg-blue-50 text-blue-700"
          : "border-slate-200 bg-slate-50 text-slate-700 hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700"
      }`}
    >
      {label}
    </Link>
  );
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const resolvedParams = (await searchParams) ?? {};
  const query = normalizeValue(firstParam(resolvedParams.q));
  const verified = toBoolean(firstParam(resolvedParams.verified));
  const openNow = toBoolean(firstParam(resolvedParams.openNow));
  const sort =
    (firstParam(resolvedParams.sort) as
      | "rating_desc"
      | "rating_asc"
      | "reviews_desc"
      | "newest"
      | "") || "rating_desc";
  const category = normalizeValue(firstParam(resolvedParams.category));
  const city = normalizeValue(firstParam(resolvedParams.city));

  const resultLimit = query ? 10000 : 18;
  const payload = await listBusinesses({
    page: 1,
    limit: resultLimit,
    q: query || undefined,
    verified,
    openNow,
    sort,
    category: category || undefined,
    city: city || undefined,
  });

  const businesses = payload.data;
  const resultCount = payload.meta.total;
  const hasFilters = Boolean(query || verified !== undefined || openNow !== undefined || category || city);

  const quickFilters = [
    { label: "Verified businesses", href: buildSearchUrl(resolvedParams, { verified: !verified }), active: verified === true },
    { label: "Open now", href: buildSearchUrl(resolvedParams, { openNow: !openNow }), active: openNow === true },
    { label: "Top rated", href: buildSearchUrl(resolvedParams, { sort: "rating_desc" }), active: sort === "rating_desc" },
    { label: "WhatsApp available", href: buildSearchUrl(resolvedParams, { q: "whatsapp" }), active: query.toLowerCase() === "whatsapp" },
  ];

  return (
    <div className="min-h-dvh bg-slate-50">
      <section className="mx-auto max-w-7xl space-y-4 px-4 pb-24 pt-3 md:px-6 lg:px-8">
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-[0_14px_30px_-24px_rgba(15,23,42,0.35)]">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
            Bharat Local Search
          </p>

          <form
            action="/search"
            method="get"
            className="mt-3 grid gap-2 md:grid-cols-[170px,1fr,120px]"
          >
            <div className="inline-flex h-11 items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-3 text-sm font-medium text-slate-700">
              <MapPin className="h-4 w-4 text-blue-700" aria-hidden />
              Pune
            </div>

            <label className="inline-flex h-11 items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-500">
              <Search className="h-4 w-4 text-slate-400" aria-hidden />
              <span className="sr-only">Search businesses</span>
              <input
                type="search"
                name="q"
                placeholder="Search for services, businesses, products..."
                className="h-full w-full bg-transparent text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none"
                autoComplete="off"
                enterKeyHint="search"
                defaultValue={query}
              />
            </label>

            <button
              type="submit"
              className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-orange-500 text-white transition-colors hover:bg-orange-600"
              aria-label="Search now"
            >
              Search
              <ArrowRight className="h-4 w-4" aria-hidden />
            </button>

            <input type="hidden" name="verified" value={verified === true ? "true" : ""} />
            <input type="hidden" name="openNow" value={openNow === true ? "true" : ""} />
            <input type="hidden" name="sort" value={sort} />
            {category ? <input type="hidden" name="category" value={category} /> : null}
            {city ? <input type="hidden" name="city" value={city} /> : null}
          </form>

          <div className="no-scrollbar mt-3 flex gap-2 overflow-x-auto pb-1">
            <QuickFilterLink href={buildSearchUrl(resolvedParams, { q: "B2B" })} label="B2B" />
            <QuickFilterLink href={buildSearchUrl(resolvedParams, { q: "B2C" })} label="B2C" />
            <QuickFilterLink
              href={buildSearchUrl(resolvedParams, { openNow: true })}
              label="Open Now"
              active={openNow === true}
            />
            <QuickFilterLink
              href={buildSearchUrl(resolvedParams, { sort: "rating_desc" })}
              label="Top Rated"
              active={sort === "rating_desc"}
            />
            <QuickFilterLink href={buildSearchUrl(resolvedParams, { q: "near me" })} label="Near Me" />
            <QuickFilterLink
              href={buildSearchUrl(resolvedParams, { verified: true })}
              label="Verified Only"
              active={verified === true}
            />
          </div>
        </div>

        <div className="flex items-center justify-between">
          <p className="text-sm font-semibold tracking-[0.012em] text-slate-800">
            Search Results
          </p>
          <p className="text-xs text-slate-500">
            {hasFilters ? `${resultCount} found` : "Browse listings"}
          </p>
        </div>

        <div className="grid gap-4 lg:grid-cols-[240px,1fr]">
          <aside className="hidden h-fit rounded-2xl border border-slate-200 bg-white p-4 lg:block">
            <p className="text-sm font-semibold tracking-[0.012em] text-slate-800">
              Quick Filters
            </p>
            <div className="mt-3 space-y-2 text-sm text-slate-600">
              <Link
                href={buildSearchUrl(resolvedParams, { verified: !verified })}
                className="block rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 hover:border-blue-300 hover:bg-blue-50"
              >
                {verified ? "Verified businesses (On)" : "Verified businesses"}
              </Link>
              <Link
                href={buildSearchUrl(resolvedParams, { openNow: !openNow })}
                className="block rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 hover:border-blue-300 hover:bg-blue-50"
              >
                {openNow ? "Open now (On)" : "Open now"}
              </Link>
              <Link
                href={buildSearchUrl(resolvedParams, { sort: "rating_desc" })}
                className="block rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 hover:border-blue-300 hover:bg-blue-50"
              >
                Top rated 4.5+
              </Link>
              <Link
                href={buildSearchUrl(resolvedParams, { q: "whatsapp" })}
                className="block rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 hover:border-blue-300 hover:bg-blue-50"
              >
                WhatsApp available
              </Link>
            </div>
          </aside>

          <div className="space-y-3">
            {businesses.length > 0 ? (
              businesses.map((business) => (
                <SearchResultCard key={business.id} business={business} />
              ))
            ) : (
              <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-6 text-center text-sm leading-relaxed tracking-[0.012em] text-slate-600">
                No listings matched your search. Try category names like plumber, clinic, or hardware.
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
