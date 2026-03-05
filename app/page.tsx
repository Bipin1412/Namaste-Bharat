import Image from "next/image";
import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import {
  ArrowRight,
  BadgeCheck,
  BriefcaseBusiness,
  Car,
  GraduationCap,
  Hammer,
  Hotel,
  MapPin,
  Search,
  ShieldCheck,
  Sparkles,
  Stethoscope,
  Store,
  Truck,
  UtensilsCrossed,
  Wrench,
} from "lucide-react";
import BusinessCard from "@/components/BusinessCard";
import OfferBannerSlot from "@/components/OfferBannerSlot";
import VendorCardsSection, {
  buildVendorCardsFromBusinesses,
} from "@/components/VendorCardsSection";
import { getHomeSnapshot, listBusinesses } from "@/lib/backend/service";
import {
  getBusinessImage,
  homeShowcaseCards,
  storyShowcaseCards,
} from "@/lib/ui/showcase";

export const dynamic = "force-dynamic";

type CategoryTile = {
  label: string;
  Icon: LucideIcon;
  count?: number;
};

const fallbackCategories: CategoryTile[] = [
  { label: "Repairs", Icon: Wrench },
  { label: "Construction", Icon: Hammer },
  { label: "Healthcare", Icon: Stethoscope },
  { label: "Food", Icon: UtensilsCrossed },
  { label: "Business", Icon: BriefcaseBusiness },
  { label: "Education", Icon: GraduationCap },
  { label: "Transport", Icon: Truck },
  { label: "Hotels", Icon: Hotel },
  { label: "Auto", Icon: Car },
  { label: "Verified", Icon: ShieldCheck },
];

const quickShortcuts = [
  { label: "B2B", href: "/search?q=B2B" },
  { label: "B2C", href: "/search?q=B2C" },
  { label: "Open Now", href: "/search?openNow=true&sort=rating_desc" },
  { label: "Top Rated", href: "/search?sort=rating_desc" },
  { label: "Near Me", href: "/search?q=near me" },
  { label: "Verified Only", href: "/search?verified=true&sort=rating_desc" },
];

function pickIconForCategory(label: string): LucideIcon {
  const normalized = label.toLowerCase();
  if (normalized.includes("repair") || normalized.includes("electrical")) return Wrench;
  if (normalized.includes("fabrication") || normalized.includes("construction")) return Hammer;
  if (normalized.includes("clinic") || normalized.includes("health")) return Stethoscope;
  if (normalized.includes("catering") || normalized.includes("food")) return UtensilsCrossed;
  if (normalized.includes("education")) return GraduationCap;
  if (normalized.includes("logistics") || normalized.includes("transport")) return Truck;
  if (normalized.includes("hotel") || normalized.includes("travel")) return Hotel;
  if (normalized.includes("auto") || normalized.includes("garage")) return Car;
  if (normalized.includes("business") || normalized.includes("service")) {
    return BriefcaseBusiness;
  }
  return Store;
}

function promoPalette(index: number) {
  if (index === 0) return "from-emerald-500 to-teal-500";
  if (index === 1) return "from-blue-600 to-indigo-600";
  if (index === 2) return "from-orange-500 to-amber-500";
  return "from-purple-600 to-fuchsia-600";
}

export default async function HomePage() {
  const snapshot = await getHomeSnapshot();
  const featuredBusinesses = snapshot.featuredBusinesses.slice(0, 4);
  const quickFilters = snapshot.quickFilters.slice(0, 8);

  const dynamicCategories = snapshot.categories.slice(0, 10).map((entry) => ({
    label: entry.name,
    Icon: pickIconForCategory(entry.name),
    count: entry.count,
  }));
  const renderedCategories =
    dynamicCategories.length > 0 ? dynamicCategories : fallbackCategories;

  const promoOffers = snapshot.offers.slice(0, 4);
  const vendorResult = await listBusinesses({
    q: "vendor-card",
    sort: "newest",
    page: 1,
    limit: 6,
  });
  const vendorCards = buildVendorCardsFromBusinesses(vendorResult.data);

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
            className="mt-3 grid gap-2 md:grid-cols-[170px,1fr,46px]"
          >
            <button
              type="button"
              className="inline-flex h-11 items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-3 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              <MapPin className="h-4 w-4 text-blue-700" aria-hidden />
              Pune
            </button>

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
              />
            </label>

            <button
              type="submit"
              className="inline-flex h-11 items-center justify-center rounded-lg bg-orange-500 text-white transition-colors hover:bg-orange-600"
              aria-label="Search now"
            >
              <ArrowRight className="h-4 w-4" aria-hidden />
            </button>
          </form>

          <div className="no-scrollbar mt-3 flex gap-2 overflow-x-auto pb-1">
            {quickShortcuts.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className="whitespace-nowrap rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-medium text-slate-700 hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700"
              >
                {item.label}
              </Link>
            ))}
          </div>
        </div>

        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-[2fr,1fr,1fr,1fr]">
          <div className="rounded-2xl bg-gradient-to-r from-blue-700 to-indigo-700 p-5 text-white">
            <p className="text-xs uppercase tracking-[0.14em] text-blue-100">
              Explore and Book
            </p>
            <h1 className="mt-2 text-2xl font-semibold leading-tight tracking-[0.01em]">
              Find trusted businesses in under 30 seconds
            </h1>
            <p className="mt-2 max-w-xl text-sm text-blue-100">
              One place for local services, offers, and direct WhatsApp
              connect.
            </p>
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <Link
                href="/search"
                className="inline-flex h-9 items-center rounded-lg bg-white px-3 text-sm font-semibold text-blue-700"
              >
                Start Search
              </Link>
              <Link
                href="/daily-inquiry"
                className="inline-flex h-9 items-center rounded-lg border border-blue-300/50 bg-blue-600/40 px-3 text-sm font-medium text-white"
              >
                Open Daily Inquiry
              </Link>
            </div>
          </div>

          {promoOffers.length > 0
            ? promoOffers.map((offer, index) => (
                <div
                  key={offer.id}
                  className={`rounded-2xl bg-gradient-to-br ${promoPalette(index)} p-4 text-white`}
                >
                  <p className="text-[11px] uppercase tracking-[0.12em] text-white/80">
                    {offer.badge}
                  </p>
                  <p className="mt-1 text-sm font-semibold leading-snug">
                    {offer.title}
                  </p>
                </div>
              ))
            : [0, 1, 2].map((index) => (
                <div
                  key={`promo-${index}`}
                  className={`rounded-2xl bg-gradient-to-br ${promoPalette(index)} p-4 text-white`}
                >
                  <p className="text-[11px] uppercase tracking-[0.12em] text-white/80">
                    Offer
                  </p>
                  <p className="mt-1 text-sm font-semibold leading-snug">
                    Campaign slot
                  </p>
                </div>
              ))}
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-4">
          <div className="mb-3 flex items-center justify-between">
            <p className="text-sm font-semibold text-slate-800">
              Browse by category
            </p>
            <Link
              href="/search"
              className="text-xs font-medium text-blue-700 hover:text-blue-600"
            >
              View all
            </Link>
          </div>

          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-10">
            {renderedCategories.map(({ label, Icon, count }) => (
              <Link
                key={label}
                href={`/search?q=${encodeURIComponent(label)}`}
                className="rounded-xl border border-slate-100 bg-slate-50 p-2 text-center transition-colors hover:border-blue-200 hover:bg-blue-50"
              >
                <span className="mx-auto grid h-9 w-9 place-items-center rounded-full bg-white text-blue-700 shadow-sm">
                  <Icon className="h-[18px] w-[18px]" aria-hidden />
                </span>
                <p className="mt-1 line-clamp-2 text-[11px] font-medium leading-tight text-slate-700">
                  {label}
                </p>
                {count ? (
                  <p className="mt-0.5 text-[10px] text-slate-500">{count} listed</p>
                ) : null}
              </Link>
            ))}
          </div>
        </div>

        <OfferBannerSlot
          title="Offer Banner Slot"
          subtitle="Use this area for festival campaigns, sponsored ads, or partner promotions."
        />

        <VendorCardsSection vendors={vendorCards} />

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1.4fr,1fr]">
          <div className="min-w-0 overflow-hidden rounded-2xl border border-slate-200 bg-white p-4">
            <div className="mb-3 flex items-center justify-between">
              <p className="text-sm font-semibold text-slate-800">
                Popular searches
              </p>
              <Link
                href="/search"
                className="text-xs font-medium text-blue-700 hover:text-blue-600"
              >
                See results
              </Link>
            </div>
            <div className="flex flex-wrap gap-2 pb-1 md:no-scrollbar md:flex-nowrap md:overflow-x-auto">
              {quickFilters.map((item) => (
                <Link
                  key={item}
                  href={`/search?q=${encodeURIComponent(item)}`}
                  className="whitespace-nowrap rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-700 hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700"
                >
                  {item}
                </Link>
              ))}
            </div>
          </div>

          <div className="min-w-0 overflow-hidden rounded-2xl border border-slate-200 bg-white p-4">
            <p className="text-sm font-semibold text-slate-800">
              Quick collections
            </p>
            <div className="mt-3 grid min-w-0 gap-2 md:grid-cols-2">
              {homeShowcaseCards.map((item) => (
                <Link
                  key={item.title}
                  href={item.href}
                  className="min-w-0 w-full overflow-hidden rounded-xl border border-slate-100 bg-slate-50 transition-colors hover:border-blue-200"
                >
                  <div className="relative h-28 w-full">
                    <Image
                      src={item.image}
                      alt={item.title}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="min-w-0 p-2">
                    <p className="break-words text-sm font-semibold text-slate-800">{item.title}</p>
                    <p className="break-words text-xs text-slate-500">{item.subtitle}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold text-slate-800">
              Top picks near you
            </p>
            <Link
              href="/search"
              className="text-xs font-medium text-blue-700 hover:text-blue-600"
            >
              View all listings
            </Link>
          </div>
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-2">
            {featuredBusinesses.map((business) => (
              <BusinessCard key={business.id} business={business} />
            ))}
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
                    src={getBusinessImage(business.id)}
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

        <div className="rounded-2xl border border-slate-200 bg-white p-4">
          <div className="mb-3 flex items-center justify-between">
            <p className="text-sm font-semibold text-slate-900">Client showcase stories</p>
            <Link
              href="/stories"
              className="text-xs font-medium text-blue-700 hover:text-blue-600"
            >
              Read stories
            </Link>
          </div>
          <div className="grid gap-3 md:grid-cols-3">
            {storyShowcaseCards.map((story) => (
              <Link
                key={story.title}
                href={story.href}
                className="overflow-hidden rounded-xl border border-slate-100 bg-slate-50 transition-colors hover:border-blue-200"
              >
                <div className="relative h-32 w-full">
                  <Image
                    src={story.image}
                    alt={story.title}
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="p-3">
                  <p className="text-sm font-semibold text-slate-900">{story.title}</p>
                  <p className="text-xs text-slate-500">{story.subtitle}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
