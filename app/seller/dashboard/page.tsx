import Link from "next/link";
import {
  ArrowRight,
  BarChart3,
  CircleCheck,
  ListChecks,
  MessageCircle,
  PhoneCall,
  ShieldCheck,
  Star,
} from "lucide-react";
import { listBusinesses, listLeads } from "@/lib/backend/service";

export const dynamic = "force-dynamic";

function formatNumber(value: number): string {
  return new Intl.NumberFormat("en-IN").format(value);
}

export default async function SellerDashboardPage() {
  const [businessesResult, leadsResult] = await Promise.all([
    listBusinesses({ page: 1, limit: 50, sort: "rating_desc" }),
    listLeads({ page: 1, limit: 100 }),
  ]);

  const businesses = businessesResult.data;
  const leads = leadsResult.data;

  const leadCountByBusiness = new Map<string, number>();
  for (const lead of leads) {
    leadCountByBusiness.set(
      lead.businessId,
      (leadCountByBusiness.get(lead.businessId) ?? 0) + 1
    );
  }

  const activeListings = businesses.filter((business) => business.isOpenNow).length;
  const verifiedListings = businesses.filter((business) => business.verified).length;
  const averageRating = businesses.length
    ? businesses.reduce((sum, business) => sum + business.rating, 0) / businesses.length
    : 0;

  const featuredListings = businesses.slice(0, 5);
  const topPerformers = [...featuredListings].sort(
    (a, b) =>
      (leadCountByBusiness.get(b.id) ?? 0) - (leadCountByBusiness.get(a.id) ?? 0)
  );

  return (
    <div className="min-h-dvh bg-slate-50">
      <section className="mx-auto max-w-7xl space-y-5 px-4 pb-24 pt-4 md:px-6 lg:px-8">
        <div className="rounded-2xl bg-gradient-to-r from-blue-700 to-indigo-700 p-6 text-white">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-blue-100">
            Seller Dashboard
          </p>
          <h1 className="mt-2 text-3xl font-semibold leading-tight md:text-4xl">
            Welcome to your business control center
          </h1>
          <p className="mt-2 max-w-3xl text-sm text-blue-100 md:text-base">
            Demo mode: this dashboard aggregates listing and lead performance so
            clients can review owner workflows.
          </p>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-4">
            <p className="text-xs uppercase tracking-[0.12em] text-slate-500">Total Listings</p>
            <p className="mt-2 text-2xl font-semibold text-slate-900">{formatNumber(businesses.length)}</p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-4">
            <p className="text-xs uppercase tracking-[0.12em] text-slate-500">Active Now</p>
            <p className="mt-2 text-2xl font-semibold text-emerald-700">{formatNumber(activeListings)}</p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-4">
            <p className="text-xs uppercase tracking-[0.12em] text-slate-500">Verified Profiles</p>
            <p className="mt-2 text-2xl font-semibold text-blue-700">{formatNumber(verifiedListings)}</p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-4">
            <p className="text-xs uppercase tracking-[0.12em] text-slate-500">Avg Rating</p>
            <p className="mt-2 text-2xl font-semibold text-amber-600">{averageRating.toFixed(1)}</p>
          </div>
        </div>

        <div className="grid gap-4 lg:grid-cols-[1.4fr,1fr]">
          <div className="rounded-2xl border border-slate-200 bg-white p-5">
            <p className="inline-flex items-center gap-2 text-lg font-semibold text-slate-900">
              <ListChecks className="h-5 w-5 text-blue-700" aria-hidden />
              Listing performance
            </p>
            <div className="mt-3 space-y-2">
              {featuredListings.map((listing) => {
                const leadCount = leadCountByBusiness.get(listing.id) ?? 0;
                return (
                  <div
                    key={listing.id}
                    className="rounded-xl border border-slate-100 bg-slate-50 p-3"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <p className="text-sm font-semibold text-slate-900">{listing.name}</p>
                      <span className="rounded-full bg-slate-200 px-2 py-0.5 text-xs font-medium text-slate-700">
                        {listing.category}
                      </span>
                    </div>
                    <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-slate-600">
                      <span className="inline-flex items-center gap-1">
                        <Star className="h-3.5 w-3.5 text-amber-500" aria-hidden />
                        {listing.rating.toFixed(1)}
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <MessageCircle className="h-3.5 w-3.5 text-blue-600" aria-hidden />
                        {leadCount} leads
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <CircleCheck className="h-3.5 w-3.5 text-emerald-600" aria-hidden />
                        {listing.isOpenNow ? "Open now" : "Closed"}
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <ShieldCheck className="h-3.5 w-3.5 text-slate-500" aria-hidden />
                        {listing.verified ? "Verified" : "Pending verification"}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="space-y-4">
            <div className="rounded-2xl border border-slate-200 bg-white p-5">
              <p className="inline-flex items-center gap-2 text-lg font-semibold text-slate-900">
                <BarChart3 className="h-5 w-5 text-blue-700" aria-hidden />
                Top performers
              </p>
              <div className="mt-3 space-y-2 text-sm text-slate-700">
                {topPerformers.slice(0, 3).map((business, index) => (
                  <div key={business.id} className="rounded-lg border border-slate-100 bg-slate-50 px-3 py-2">
                    <p className="font-semibold text-slate-900">
                      {index + 1}. {business.name}
                    </p>
                    <p className="text-xs text-slate-600">
                      {leadCountByBusiness.get(business.id) ?? 0} leads this cycle
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-5">
              <p className="text-lg font-semibold text-slate-900">Quick actions</p>
              <div className="mt-3 grid gap-2">
                <Link
                  href="/seller/leads"
                  className="inline-flex h-10 items-center justify-between rounded-lg border border-slate-200 bg-white px-3 text-sm font-medium text-slate-700 hover:bg-slate-50"
                >
                  Open leads inbox
                  <ArrowRight className="h-3.5 w-3.5" aria-hidden />
                </Link>
                <Link
                  href="/free-listing/detailed"
                  className="inline-flex h-10 items-center justify-between rounded-lg border border-slate-200 bg-white px-3 text-sm font-medium text-slate-700 hover:bg-slate-50"
                >
                  Add detailed listing
                  <ArrowRight className="h-3.5 w-3.5" aria-hidden />
                </Link>
                <Link
                  href="/seller/analytics"
                  className="inline-flex h-10 items-center justify-between rounded-lg border border-slate-200 bg-white px-3 text-sm font-medium text-slate-700 hover:bg-slate-50"
                >
                  View analytics
                  <ArrowRight className="h-3.5 w-3.5" aria-hidden />
                </Link>
              </div>
              <div className="mt-4 grid grid-cols-2 gap-2">
                <a
                  href="tel:+919876543210"
                  className="inline-flex h-10 items-center justify-center gap-1 rounded-lg border border-slate-200 bg-white text-sm font-medium text-slate-700 hover:bg-slate-50"
                >
                  <PhoneCall className="h-4 w-4" aria-hidden />
                  Support Call
                </a>
                <a
                  href="https://wa.me/919876543210"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex h-10 items-center justify-center gap-1 rounded-lg bg-green-500 text-sm font-semibold text-white hover:bg-green-600"
                >
                  <MessageCircle className="h-4 w-4" aria-hidden />
                  WhatsApp
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
