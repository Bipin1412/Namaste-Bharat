import Link from "next/link";
import { ArrowRight, BriefcaseBusiness, ChartColumn, ShieldCheck } from "lucide-react";

const demoModules = [
  {
    title: "Seller Dashboard",
    description: "Listing health, lead summary, and quick action center.",
    href: "/seller/dashboard",
  },
  {
    title: "Seller Leads Inbox",
    description: "Incoming inquiries with source tags and follow-up actions.",
    href: "/seller/leads",
  },
  {
    title: "Seller Analytics",
    description: "Lead trends, category insights, and keyword performance.",
    href: "/seller/analytics",
  },
  {
    title: "Admin Moderation",
    description: "Verification queue and profile quality checks.",
    href: "/admin/moderation",
  },
  {
    title: "Map + List Discovery",
    description: "Buyer search with map markers and listing cards.",
    href: "/search/map",
  },
  {
    title: "Plans and Checkout",
    description: "Paid promotion plan selection and billing demo.",
    href: "/plans/checkout",
  },
];

export default function ClientDemoPackPage() {
  return (
    <div className="min-h-dvh bg-slate-50">
      <section className="mx-auto max-w-7xl space-y-5 px-4 pb-24 pt-4 md:px-6 lg:px-8">
        <div className="rounded-2xl bg-gradient-to-r from-blue-700 to-indigo-700 p-6 text-white">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-blue-100">
            Client Demo Pack
          </p>
          <h1 className="mt-2 text-3xl font-semibold leading-tight md:text-4xl">
            End-to-end showcase flows
          </h1>
          <p className="mt-2 max-w-3xl text-sm text-blue-100 md:text-base">
            This hub groups all high-value screens to demonstrate a near JD-style
            experience across buyer, seller, admin, and monetization workflows.
          </p>
        </div>

        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {demoModules.map((module) => (
            <Link
              key={module.href}
              href={module.href}
              className="rounded-2xl border border-slate-200 bg-white p-5 transition-colors hover:border-blue-200 hover:bg-blue-50/40"
            >
              <p className="text-base font-semibold text-slate-900">{module.title}</p>
              <p className="mt-1 text-sm text-slate-600">{module.description}</p>
              <span className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-blue-700">
                Open module
                <ArrowRight className="h-3.5 w-3.5" aria-hidden />
              </span>
            </Link>
          ))}
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <div className="rounded-2xl border border-slate-200 bg-white p-5">
            <p className="inline-flex items-center gap-2 text-sm font-semibold text-slate-900">
              <BriefcaseBusiness className="h-4 w-4 text-blue-700" aria-hidden />
              Seller Readiness
            </p>
            <p className="mt-2 text-sm text-slate-600">
              Includes onboarding, listing management style UI, lead inbox, and
              business analytics.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5">
            <p className="inline-flex items-center gap-2 text-sm font-semibold text-slate-900">
              <ShieldCheck className="h-4 w-4 text-emerald-600" aria-hidden />
              Admin Readiness
            </p>
            <p className="mt-2 text-sm text-slate-600">
              Verification queue and profile quality blocks for moderation demos.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5">
            <p className="inline-flex items-center gap-2 text-sm font-semibold text-slate-900">
              <ChartColumn className="h-4 w-4 text-orange-500" aria-hidden />
              Revenue Readiness
            </p>
            <p className="mt-2 text-sm text-slate-600">
              Plan selection and checkout style flow for premium listing upsell.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
