import Image from "next/image";
import Link from "next/link";
import heroBusinessImage from "../assests/home_page-images/1.png";
import heroDeliveryImage from "../assests/home_page-images/2.png";
import heroHealthcareImage from "../assests/home_page-images/3.png";
import heroExploreImage from "../assests/home_page-images/4.png";
import {
  ArrowRight,
  BadgeCheck,
  MapPin,
  Search,
  Sparkles,
} from "lucide-react";
import BusinessCard from "@/components/BusinessCard";
import CategorySection from "@/components/CategorySection";
import OfferBannerSlot from "@/components/OfferBannerSlot";
import TestimonialsCarousel from "@/components/TestimonialsCarousel";
import VendorCardsSection, {
  buildVendorCardsFromBusinesses,
} from "@/components/VendorCardsSection";
import { getHomeSnapshot, listBusinesses } from "@/lib/backend/service";
import {
  getBusinessImage,
  homeShowcaseCards,
} from "@/lib/ui/showcase";

export const revalidate = 300;

type CategoryTile = {
  label: string;
  iconKey: string;
  count?: number;
};

const fallbackCategories: CategoryTile[] = [
  { label: "Repairs", iconKey: "wrench" },
  { label: "Construction", iconKey: "hammer" },
  { label: "Healthcare", iconKey: "health" },
  { label: "Food", iconKey: "utensils" },
  { label: "Business", iconKey: "briefcase" },
  { label: "Education", iconKey: "education" },
  { label: "Transport", iconKey: "transport" },
  { label: "Hotels", iconKey: "hotel" },
  { label: "Auto", iconKey: "car" },
  { label: "Verified", iconKey: "store" },
];

const quickShortcuts = [
  { label: "B2B", href: "/search?q=B2B" },
  { label: "B2C", href: "/search?q=B2C" },
  { label: "Open Now", href: "/search?openNow=true&sort=rating_desc" },
  { label: "Top Rated", href: "/search?sort=rating_desc" },
  { label: "Near Me", href: "/search?q=near me" },
  { label: "Verified Only", href: "/search?verified=true&sort=rating_desc" },
];

const heroServiceCards = [
  {
    image: heroDeliveryImage,
    eyebrow: "B2B",
    title: "Quick Quotes",
    subtitle: "",
    bgColor: "#252a68",
  },
  {
    image: heroBusinessImage,
    eyebrow: "Repairs & Services",
    title: "Get Nearby Experts",
    subtitle: "",
    bgColor: "#4f67f5",
  },
  {
    image: heroHealthcareImage,
    eyebrow: "Healthcare",
    title: "Book Trusted Clinics",
    subtitle: "",
    bgColor: "#1399b5",
  },
];

const testimonials = [
  {
    quote:
      "Namaste Bharat Portal helped my business get genuine customer enquiries within days. After listing on Namaste Bharat, my business visibility increased a lot. I started getting calls from new customers regularly. Highly recommended for small business owners!",
    name: "Vihang Agashe",
    business: "Vyadeshwar Electricals",
    location: "Pune",
    highlight: "Excellent Lead Generation",
    secondaryHighlight: "Great Online Visibility",
  },
  {
    quote:
      "Very affordable service compared to other platforms. Best part is we get real leads, not just views. The portal is simple and user-friendly. Creating my business profile was quick and hassle-free.",
    name: "Mangesh Vaidya",
    business: "Aatithya Agrovan Pvt Ltd",
    location: "Guhagar",
    highlight: "Affordable & Effective",
    secondaryHighlight: "Easy to Use Platform",
  },
  {
    quote:
      "Namaste Bharat is becoming a trusted platform for business listings. Customers find us easily. The support team is very helpful and responsive. They guided me properly to grow my business online.",
    name: "Harish Hajare",
    business: "Neerai Interiors",
    location: "Thane",
    highlight: "Trusted Business Listings",
    secondaryHighlight: "Good Customer Support",
  },
  {
    quote:
      "If you have a small or local business, Namaste Bharat is a great platform to get started with digital marketing. After joining Namaste Bharat, I noticed an increase in inquiries and sales. Very useful for business growth.",
    name: "Mrs Jyoti Sharma",
    business: "Jyoti's Kitchen",
    location: "Nagpur",
    highlight: "Great for Small Business",
    secondaryHighlight: "Boost in Sales",
  },
  {
    quote:
      "Within a week of listing my business, I started getting enquiries. Really impressed with the results. My local business got more visibility in my area. Customers are now able to find me easily.",
    name: "Ketan Tayde",
    business: "Jodidar Matrimony",
    location: "Nashik",
    highlight: "Fast Enquiries",
    secondaryHighlight: "Perfect for Local Reach",
  },
];

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

export default async function HomePage() {
  const [snapshot, vendorResult] = await Promise.all([
    getHomeSnapshot(),
    listBusinesses({
      q: "vendor-card",
      sort: "newest",
      page: 1,
      limit: 6,
    }),
  ]);
  const featuredBusinesses = snapshot.featuredBusinesses.slice(0, 4);
  const quickFilters = snapshot.quickFilters.slice(0, 8);

  const dynamicCategories = snapshot.categories.slice(0, 20).map((entry) => ({
    label: entry.name,
    iconKey: pickIconForCategory(entry.name),
    count: entry.count,
  }));
  const renderedCategories =
    dynamicCategories.length > 0 ? dynamicCategories : fallbackCategories;
  const popularPreviewCategories = renderedCategories.slice(0, 6);

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

        <div className="grid gap-4 xl:grid-cols-[1.45fr,0.55fr,0.55fr,0.55fr]">
          <div className="relative overflow-hidden rounded-[26px] text-white shadow-[0_20px_50px_-28px_rgba(37,42,104,0.55)] min-h-[340px] sm:min-h-[340px] md:min-h-[260px] xl:h-[238px]">
            <Image
              src={heroExploreImage}
              alt="Explore and book trusted businesses"
              fill
              priority
              className="object-cover object-center"
            />
            <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(41,63,215,0.9)_0%,rgba(56,52,203,0.82)_34%,rgba(61,42,192,0.34)_62%,rgba(61,42,192,0.08)_100%)]" />
            <div className="relative z-10 h-full p-6 md:p-8 xl:px-7 xl:py-5">
              <div className="relative h-full max-w-md pb-20 sm:pb-24 xl:pb-20">
                <div>
                  <p className="text-xs font-medium uppercase tracking-[0.18em] text-blue-100">
                    Explore and Book
                  </p>
                  <h1 className="mt-3 max-w-[10rem] text-[1.55rem] font-semibold leading-[0.98] tracking-[-0.04em] [@media(min-width:360px)]:max-w-[11rem] [@media(min-width:360px)]:text-[1.65rem] sm:max-w-[14rem] sm:text-[2.7rem] xl:max-w-[18rem] xl:text-[2.2rem]">
                    Find trusted businesses in under 30 seconds
                  </h1>
                  <p className="mt-3 max-w-[10rem] text-sm leading-5 text-blue-100 sm:mt-4 sm:max-w-sm sm:text-base xl:mt-3 xl:text-[15px] xl:leading-6">
                    {/* One place for local services, offers, and direct WhatsApp
                    connect. */}
                  </p>
                </div>

                <div className="absolute bottom-0 left-0 flex flex-wrap items-center gap-2 [@media(max-width:359px)]:gap-1.5 sm:gap-3">
                  <Link
                    href="/search"
                    className="inline-flex h-10 items-center rounded-lg bg-white px-3.5 text-[0.95rem] font-semibold text-blue-700 transition-colors hover:bg-blue-50 [@media(min-width:360px)]:px-4 [@media(min-width:360px)]:text-sm sm:h-11 sm:px-5"
                  >
                    Start Search
                  </Link>
                  <Link
                    href="/daily-inquiry"
                    className="inline-flex h-10 items-center rounded-lg border border-blue-300/60 bg-blue-500/20 px-3 text-[0.95rem] font-medium text-white backdrop-blur transition-colors hover:bg-blue-500/30 [@media(max-width:359px)]:px-2.5 [@media(max-width:359px)]:text-[0.9rem] [@media(min-width:360px)]:px-4 [@media(min-width:360px)]:text-sm sm:h-11 sm:px-5"
                  >
                    Open Daily Inquiry
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {heroServiceCards.map((card) => (
            <div
              key={card.title}
              className="group relative min-h-[340px] overflow-hidden rounded-[22px] p-4 text-white shadow-[0_18px_45px_-28px_rgba(15,23,42,0.6)] sm:min-h-[340px] md:min-h-[260px] xl:h-[238px]"
              style={{ backgroundColor: card.bgColor }}
            >
              <div className="relative z-10 -ml-1 max-w-[60%]">
                <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-white/80">
                  {card.eyebrow}
                </p>
                <h2 className="mt-2 text-[1.05rem] font-semibold leading-7 text-white">
                  {card.title}
                </h2>
                <p className="mt-2 text-sm leading-6 text-white/75">
                  {card.subtitle}
                </p>
              </div>
              <div
                className="absolute inset-y-0 right-0 w-[78%] transition-transform duration-500 group-hover:scale-[1.02]"
                style={{ backgroundColor: card.bgColor }}
              >
                <Image
                  src={card.image}
                  alt={card.title}
                  fill
                  className="object-cover object-right-bottom"
                />
              </div>
              <div className="absolute bottom-4 left-4 z-10 flex h-10 w-10 items-center justify-center rounded-xl bg-white/35 backdrop-blur">
                <ArrowRight className="h-5 w-5" aria-hidden />
              </div>
            </div>
          ))}
        </div>

        <CategorySection categories={renderedCategories} />

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
            <div className="mt-4 grid gap-2 md:grid-cols-3">
              {popularPreviewCategories.map(({ label, iconKey, count }) => (
                <Link
                  key={`popular-preview-${label}`}
                  href={`/search?q=${encodeURIComponent(label)}`}
                  className="rounded-xl border border-slate-100 bg-slate-50 p-3 transition-colors hover:border-blue-200 hover:bg-blue-50"
                >
                  <span className="grid h-10 w-10 place-items-center rounded-full bg-white text-blue-700 shadow-sm">
                    <span className="text-xs font-semibold uppercase tracking-wide text-blue-700">
                      {iconKey.slice(0, 2)}
                    </span>
                  </span>
                  <p className="mt-3 text-sm font-semibold text-slate-800">{label}</p>
                  <p className="mt-1 text-xs text-slate-500">
                    {count ? `${count} active listings` : "Explore top local options"}
                  </p>
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
                  <div className="h-28 w-full bg-gradient-to-br from-white to-slate-100 p-2">
                    <div className="relative h-full w-full overflow-hidden rounded-lg">
                      <Image
                        src={item.image}
                        alt={item.title}
                        fill
                        className="object-contain object-center"
                      />
                    </div>
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
      </section>
    </div>
  );
}
