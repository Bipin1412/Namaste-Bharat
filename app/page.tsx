import Image from "next/image";
import Link from "next/link";
import heroBusinessImage from "../assests/home_page-images/1.png";
import heroDeliveryImage from "../assests/home_page-images/2.png";
import heroHealthcareImage from "../assests/home_page-images/3.png";
import heroExploreImage from "../assests/home_page-images/4.png";
import { ArrowRight, MapPin, Search, CalendarDays, Leaf, Briefcase, Palette, Plane, UtensilsCrossed, HeartPulse, Wrench, Banknote, Store, Calculator, Flower2, Car, Shield, GraduationCap, Droplets, Smartphone, Truck, Code, Scissors, MoreHorizontal, Scale } from "lucide-react";

export const dynamic = "force-dynamic";

const quickShortcuts = [
  { label: "B2B", href: "/search?q=B2B" },
  { label: "B2C", href: "/search?q=B2C" },
  { label: "Open Now", href: "/search?openNow=true&sort=rating_desc" },
  { label: "Top Rated", href: "/search?sort=rating_desc" },
  { label: "Near Me", href: "/search?q=near me" },
  { label: "Verified Only", href: "/search?verified=true&sort=rating_desc" },
];

const categories = [
  { label: "Doctor", icon: HeartPulse, color: "bg-rose-50 text-rose-600" },
  { label: "Plumber", icon: Wrench, color: "bg-blue-50 text-blue-600" },
  { label: "Lawyers", icon: Scale, color: "bg-purple-50 text-purple-600" },
  { label: "Education", icon: GraduationCap, color: "bg-yellow-50 text-yellow-600" },
  { label: "Tours & Travels", icon: Plane, color: "bg-sky-50 text-sky-600" },
  { label: "Caterer / Hotel", icon: UtensilsCrossed, color: "bg-orange-50 text-orange-600" },
  { label: "Car Servicing / Bike Servicing", icon: Car, color: "bg-slate-100 text-slate-600" },
  { label: "Finance", icon: Banknote, color: "bg-green-50 text-green-600" },
  { label: "Interior Design", icon: Palette, color: "bg-pink-50 text-pink-600" },
  { label: "Computer / Mobile Sales & Services", icon: Smartphone, color: "bg-indigo-50 text-indigo-600" },
  { label: "Agriculture Services", icon: Leaf, color: "bg-emerald-50 text-emerald-600" },
  { label: "Event Management", icon: CalendarDays, color: "bg-violet-50 text-violet-600" },
  { label: "Transport", icon: Truck, color: "bg-amber-50 text-amber-600" },
  { label: "Insurance", icon: Shield, color: "bg-teal-50 text-teal-600" },
  { label: "CA / Accounting Services", icon: Calculator, color: "bg-cyan-50 text-cyan-600" },
  { label: "Software / Website Design", icon: Code, color: "bg-fuchsia-50 text-fuchsia-600" },
  { label: "Gardening Services", icon: Flower2, color: "bg-lime-50 text-lime-600" },
  { label: "Waterproofing", icon: Droplets, color: "bg-blue-50 text-blue-500" },
  { label: "Dealer", icon: Store, color: "bg-orange-50 text-orange-500" },
  { label: "Other", icon: MoreHorizontal, color: "bg-slate-100 text-slate-500" },
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

export default function HomePage() {
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
        <section className="rounded-2xl border border-slate-200 bg-white p-5">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">Browse by Category</p>
              <h2 className="mt-1 text-xl font-semibold text-slate-900">What are you looking for?</h2>
            </div>
            <Link href="/search" className="text-sm font-medium text-blue-600 hover:text-blue-700">
              View all →
            </Link>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
            {categories.map((cat) => (
              <Link
                key={cat.label}
                href={`/search?category=${encodeURIComponent(cat.label)}`}
                className="flex flex-col items-center gap-2 rounded-xl border border-slate-100 bg-slate-50 p-4 text-center transition-all hover:border-blue-200 hover:bg-blue-50 hover:shadow-sm"
              >
                <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${cat.color}`}>
                  <cat.icon className="h-6 w-6" />
                </div>
                <span className="text-xs font-medium leading-tight text-slate-700">{cat.label}</span>
              </Link>
            ))}
          </div>
        </section>
      </section>
    </div>
  );
}
