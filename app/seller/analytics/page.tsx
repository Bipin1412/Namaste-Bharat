import Link from "next/link";
import { ArrowRight, BarChart3, ChartColumn, Hash, Layers } from "lucide-react";
import { listBusinesses, listLeads, listOffers } from "@/lib/backend/service";

export const dynamic = "force-dynamic";

function formatNumber(value: number): string {
  return new Intl.NumberFormat("en-IN").format(value);
}

export default async function SellerAnalyticsPage() {
  const [businessesResult, leadsResult, offers] = await Promise.all([
    listBusinesses({ page: 1, limit: 50, sort: "rating_desc" }),
    listLeads({ page: 1, limit: 100 }),
    listOffers({ activeOnly: true }),
  ]);

  const businesses = businessesResult.data;
  const leads = leadsResult.data;

  const sourceTotals = {
    search: leads.filter((lead) => lead.source === "search").length,
    reel: leads.filter((lead) => lead.source === "reel").length,
    profile: leads.filter((lead) => lead.source === "profile").length,
  };

  const categoryCounter = new Map<string, number>();
  for (const business of businesses) {
    categoryCounter.set(
      business.category,
      (categoryCounter.get(business.category) ?? 0) + 1
    );
  }
  const topCategories = [...categoryCounter.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6);
  const maxCategoryCount = topCategories[0]?.[1] ?? 1;

  const keywordCounter = new Map<string, number>();
  for (const business of businesses) {
    for (const keyword of business.keywords ?? []) {
      const normalized = keyword.trim().toLowerCase();
      if (!normalized) continue;
      keywordCounter.set(normalized, (keywordCounter.get(normalized) ?? 0) + 1);
    }
  }
  const topKeywords = [...keywordCounter.entries()]
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .slice(0, 10);

  const leadCountByBusiness = new Map<string, number>();
  for (const lead of leads) {
    leadCountByBusiness.set(
      lead.businessId,
      (leadCountByBusiness.get(lead.businessId) ?? 0) + 1
    );
  }

  const topBusinesses = [...businesses]
    .map((business) => ({
      id: business.id,
      name: business.name,
      category: business.category,
      leads: leadCountByBusiness.get(business.id) ?? 0,
      rating: business.rating,
    }))
    .sort((a, b) => b.leads - a.leads || b.rating - a.rating)
    .slice(0, 5);

  const conversionRate = leads.length === 0 ? 0 : Math.min(72, 22 + Math.round((sourceTotals.profile / Math.max(1, leads.length)) * 100));

  return (
    <div className="min-h-dvh bg-slate-50">
      <section className="mx-auto max-w-7xl space-y-5 px-4 pb-24 pt-4 md:px-6 lg:px-8">
        <div className="rounded-2xl bg-gradient-to-r from-blue-700 to-indigo-700 p-6 text-white">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-blue-100">
            Seller Analytics
          </p>
          <h1 className="mt-2 text-3xl font-semibold leading-tight md:text-4xl">
            Performance snapshot for client review
          </h1>
          <p className="mt-2 max-w-3xl text-sm text-blue-100 md:text-base">
            Demo analytics showing lead source mix, top categories, high-performing
            listings, and search keyword coverage.
          </p>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-4">
            <p className="text-xs uppercase tracking-[0.12em] text-slate-500">Total Leads</p>
            <p className="mt-2 text-2xl font-semibold text-slate-900">{formatNumber(leads.length)}</p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-4">
            <p className="text-xs uppercase tracking-[0.12em] text-slate-500">Search Share</p>
            <p className="mt-2 text-2xl font-semibold text-blue-700">{sourceTotals.search}</p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-4">
            <p className="text-xs uppercase tracking-[0.12em] text-slate-500">Profile Intent</p>
            <p className="mt-2 text-2xl font-semibold text-emerald-700">{sourceTotals.profile}</p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-4">
            <p className="text-xs uppercase tracking-[0.12em] text-slate-500">Est. Conversion</p>
            <p className="mt-2 text-2xl font-semibold text-orange-600">{conversionRate}%</p>
          </div>
        </div>

        <div className="grid gap-4 lg:grid-cols-[1.2fr,1fr]">
          <div className="rounded-2xl border border-slate-200 bg-white p-5">
            <p className="inline-flex items-center gap-2 text-lg font-semibold text-slate-900">
              <ChartColumn className="h-5 w-5 text-blue-700" aria-hidden />
              Category coverage
            </p>
            <div className="mt-3 space-y-3">
              {topCategories.map(([category, count]) => (
                <div key={category}>
                  <div className="mb-1 flex items-center justify-between text-sm">
                    <p className="font-medium text-slate-700">{category}</p>
                    <p className="text-slate-500">{count}</p>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                    <div
                      className="h-full rounded-full bg-blue-600"
                      style={{ width: `${Math.max(8, Math.round((count / maxCategoryCount) * 100))}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5">
            <p className="inline-flex items-center gap-2 text-lg font-semibold text-slate-900">
              <BarChart3 className="h-5 w-5 text-blue-700" aria-hidden />
              Lead source mix
            </p>
            <div className="mt-3 space-y-2">
              <div className="rounded-lg bg-blue-50 p-3">
                <p className="text-xs uppercase tracking-[0.12em] text-blue-700">Search</p>
                <p className="text-xl font-semibold text-blue-800">{sourceTotals.search}</p>
              </div>
              <div className="rounded-lg bg-purple-50 p-3">
                <p className="text-xs uppercase tracking-[0.12em] text-purple-700">Reel</p>
                <p className="text-xl font-semibold text-purple-800">{sourceTotals.reel}</p>
              </div>
              <div className="rounded-lg bg-emerald-50 p-3">
                <p className="text-xs uppercase tracking-[0.12em] text-emerald-700">Profile</p>
                <p className="text-xl font-semibold text-emerald-800">{sourceTotals.profile}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          <div className="rounded-2xl border border-slate-200 bg-white p-5">
            <p className="inline-flex items-center gap-2 text-lg font-semibold text-slate-900">
              <Layers className="h-5 w-5 text-blue-700" aria-hidden />
              Top business performers
            </p>
            <div className="mt-3 space-y-2">
              {topBusinesses.map((item, index) => (
                <div key={item.id} className="rounded-xl border border-slate-100 bg-slate-50 p-3">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm font-semibold text-slate-900">
                      {index + 1}. {item.name}
                    </p>
                    <span className="rounded-full bg-slate-200 px-2 py-0.5 text-xs font-medium text-slate-700">
                      {item.leads} leads
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-slate-600">
                    {item.category} | Rating {item.rating.toFixed(1)}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5">
            <p className="inline-flex items-center gap-2 text-lg font-semibold text-slate-900">
              <Hash className="h-5 w-5 text-blue-700" aria-hidden />
              Top searchable keywords
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              {topKeywords.length > 0 ? (
                topKeywords.map(([keyword, count]) => (
                  <Link
                    key={keyword}
                    href={`/search?q=${encodeURIComponent(keyword)}`}
                    className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-medium text-slate-700 hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700"
                  >
                    {keyword} ({count})
                  </Link>
                ))
              ) : (
                <p className="text-sm text-slate-600">
                  No keyword-rich listings yet. Add them in detailed listing forms.
                </p>
              )}
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Link
            href="/seller/dashboard"
            className="inline-flex h-10 items-center gap-1 rounded-lg border border-slate-200 bg-white px-3 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            Back to dashboard
            <ArrowRight className="h-3.5 w-3.5" aria-hidden />
          </Link>
          <Link
            href="/plans/checkout"
            className="inline-flex h-10 items-center gap-1 rounded-lg border border-slate-200 bg-white px-3 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            Explore growth plans
            <ArrowRight className="h-3.5 w-3.5" aria-hidden />
          </Link>
          <p className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
            Active promotion offers: {offers.length}
          </p>
        </div>
      </section>
    </div>
  );
}
