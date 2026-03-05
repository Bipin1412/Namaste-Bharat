import Link from "next/link";
import { ArrowRight, LayoutGrid, ShieldCheck } from "lucide-react";

const reviewRoutes = [
  {
    title: "Client Demo Pack",
    description: "Single hub to navigate seller, buyer, admin, and checkout demos.",
    href: "/client-demo",
  },
  {
    title: "Homepage",
    description: "Primary marketplace, category discovery, and visual sections.",
    href: "/",
  },
  {
    title: "Search Listings",
    description: "Dynamic search result page backed by API and skeleton states.",
    href: "/search",
  },
  {
    title: "Daily Inquiry",
    description: "Daily inquiry dashboard page placeholder.",
    href: "/daily-inquiry",
  },
  {
    title: "Business Profile",
    description: "Detailed listing page with keywords, services, FAQs, and trust details.",
    href: "/business/b-1",
  },
  {
    title: "Map + List Search",
    description: "Interactive map-style discovery with listing cards.",
    href: "/search/map",
  },
  {
    title: "Detailed Listing Builder",
    description: "Multi-step full-data listing form for high search discoverability.",
    href: "/free-listing/detailed",
  },
  {
    title: "Listing",
    description: "Lead capture + onboarding funnel for seller acquisition.",
    href: "/free-listing",
  },
  {
    title: "Offers",
    description: "Promotion plans, campaigns, and monetization mockups.",
    href: "/offers",
  },
  {
    title: "Stories",
    description: "Client case studies and social proof page.",
    href: "/stories",
  },
  {
    title: "API Index",
    description: "Backend endpoint index for testing integration.",
    href: "/api",
  },
  {
    title: "Login Page",
    description: "Phone/email login and Google redirect flow.",
    href: "/login",
  },
  {
    title: "Register Page",
    description: "New account creation flow for users and sellers.",
    href: "/register",
  },
  {
    title: "Seller Dashboard",
    description: "Listing and lead health dashboard for business owners.",
    href: "/seller/dashboard",
  },
  {
    title: "Seller Leads Inbox",
    description: "Lead tracking view with source and contact actions.",
    href: "/seller/leads",
  },
  {
    title: "Seller Analytics",
    description: "Category, keyword, and lead trend insights.",
    href: "/seller/analytics",
  },
  {
    title: "Admin Moderation",
    description: "Pending verification queue and moderation controls.",
    href: "/admin/moderation",
  },
  {
    title: "Plans Checkout",
    description: "Premium plan selection and billing flow demo.",
    href: "/plans/checkout",
  },
];

const qaChecks = [
  "Mobile and desktop navigation",
  "Search listing and filtering behavior",
  "Reels loading and interaction actions",
  "Listing form submission",
  "Seller dashboard and leads inbox flow",
  "Admin moderation review flow",
  "Map plus list discovery behavior",
  "Plan checkout interaction",
  "Business detail CTA behavior",
  "Offer/story page visual consistency",
  "API response health and persistence",
];

export default function DesignReviewPage() {
  return (
    <div className="min-h-dvh bg-slate-50">
      <section className="mx-auto max-w-7xl space-y-5 px-4 pb-24 pt-4 md:px-6 lg:px-8">
        <div className="rounded-2xl bg-gradient-to-r from-indigo-700 to-blue-700 p-6 text-white">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-indigo-100">
            Design Review Mode
          </p>
          <h1 className="mt-2 text-3xl font-semibold leading-tight md:text-4xl">
            Client Testing Navigation Hub
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-indigo-100 md:text-base">
            Use this page to walk stakeholders through all key product flows and
            backend-connected screens in one place.
          </p>
        </div>

        <div className="grid gap-3 md:grid-cols-2">
          {reviewRoutes.map((route) => (
            <Link
              key={route.href}
              href={route.href}
              className="rounded-2xl border border-slate-200 bg-white p-5 transition-colors hover:border-blue-200 hover:bg-blue-50/40"
            >
              <p className="text-base font-semibold text-slate-900">{route.title}</p>
              <p className="mt-1 text-sm text-slate-600">{route.description}</p>
              <span className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-blue-700">
                Open
                <ArrowRight className="h-3.5 w-3.5" aria-hidden />
              </span>
            </Link>
          ))}
        </div>

        <div className="grid gap-4 lg:grid-cols-[1.4fr,1fr]">
          <div className="rounded-2xl border border-slate-200 bg-white p-5">
            <p className="inline-flex items-center gap-2 text-lg font-semibold text-slate-900">
              <LayoutGrid className="h-5 w-5 text-blue-700" aria-hidden />
              QA checklist
            </p>
            <ul className="mt-3 space-y-2 text-sm text-slate-700">
              {qaChecks.map((item) => (
                <li key={item}>- {item}</li>
              ))}
            </ul>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5">
            <p className="inline-flex items-center gap-2 text-lg font-semibold text-slate-900">
              <ShieldCheck className="h-5 w-5 text-emerald-600" aria-hidden />
              Testing notes
            </p>
            <ul className="mt-3 space-y-2 text-sm text-slate-600">
              <li>- Login popup is demo-only UX flow.</li>
              <li>- OTP, payment, and WhatsApp Business APIs are not production wired yet.</li>
              <li>- Listing data persists in local `data/db.json` for testing.</li>
              <li>- Use `/api/health` to validate backend status.</li>
            </ul>
          </div>
        </div>
      </section>
    </div>
  );
}

