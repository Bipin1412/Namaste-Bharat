import Link from "next/link";
import { ArrowRight, Clock3, MessageCircle, Phone, UserRound } from "lucide-react";
import { listBusinesses, listLeads } from "@/lib/backend/service";

export const dynamic = "force-dynamic";

const statusCycle = ["New", "Contacted", "Follow-up", "Qualified"] as const;

function sourceBadgeClasses(source: "search" | "reel" | "profile") {
  if (source === "search") return "bg-blue-100 text-blue-700";
  if (source === "reel") return "bg-purple-100 text-purple-700";
  return "bg-emerald-100 text-emerald-700";
}

export default async function SellerLeadsPage() {
  const [leadsResult, businessesResult] = await Promise.all([
    listLeads({ page: 1, limit: 100 }),
    listBusinesses({ page: 1, limit: 50, sort: "newest" }),
  ]);

  const leads = leadsResult.data;
  const businesses = businessesResult.data;
  const businessNameById = new Map(businesses.map((business) => [business.id, business.name]));

  const sourceSummary = {
    search: leads.filter((lead) => lead.source === "search").length,
    reel: leads.filter((lead) => lead.source === "reel").length,
    profile: leads.filter((lead) => lead.source === "profile").length,
  };

  return (
    <div className="min-h-dvh bg-slate-50">
      <section className="mx-auto max-w-7xl space-y-5 px-4 pb-24 pt-4 md:px-6 lg:px-8">
        <div className="rounded-2xl bg-gradient-to-r from-indigo-700 to-blue-700 p-6 text-white">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-indigo-100">
            Seller Leads Inbox
          </p>
          <h1 className="mt-2 text-3xl font-semibold leading-tight md:text-4xl">
            Manage customer inquiries in one place
          </h1>
          <p className="mt-2 max-w-3xl text-sm text-indigo-100 md:text-base">
            Demo view for business owners to prioritize leads by source, contact
            intent, and response stage.
          </p>
        </div>

        <div className="grid gap-3 sm:grid-cols-3">
          <div className="rounded-2xl border border-slate-200 bg-white p-4">
            <p className="text-xs uppercase tracking-[0.12em] text-slate-500">Search Leads</p>
            <p className="mt-2 text-2xl font-semibold text-blue-700">{sourceSummary.search}</p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-4">
            <p className="text-xs uppercase tracking-[0.12em] text-slate-500">Reel Leads</p>
            <p className="mt-2 text-2xl font-semibold text-purple-700">{sourceSummary.reel}</p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-4">
            <p className="text-xs uppercase tracking-[0.12em] text-slate-500">Profile Leads</p>
            <p className="mt-2 text-2xl font-semibold text-emerald-700">{sourceSummary.profile}</p>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="text-lg font-semibold text-slate-900">Recent leads</p>
            <Link
              href="/seller/dashboard"
              className="inline-flex items-center gap-1 text-sm font-semibold text-blue-700 hover:text-blue-600"
            >
              Back to dashboard
              <ArrowRight className="h-3.5 w-3.5" aria-hidden />
            </Link>
          </div>

          {leads.length === 0 ? (
            <p className="mt-3 rounded-xl border border-dashed border-slate-300 bg-slate-50 p-4 text-sm text-slate-600">
              No leads yet. Trigger some from search or business profile CTAs to populate this inbox.
            </p>
          ) : (
            <div className="mt-3 space-y-2">
              {leads.map((lead, index) => {
                const status = statusCycle[index % statusCycle.length];
                const businessName = businessNameById.get(lead.businessId) ?? "Unknown Business";

                return (
                  <article
                    key={lead.id}
                    className="rounded-xl border border-slate-100 bg-slate-50 p-3"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <div>
                        <p className="text-sm font-semibold text-slate-900">{lead.name}</p>
                        <p className="text-xs text-slate-600">{businessName}</p>
                      </div>
                      <div className="flex flex-wrap items-center gap-2">
                        <span
                          className={`rounded-full px-2 py-0.5 text-xs font-medium ${sourceBadgeClasses(lead.source)}`}
                        >
                          {lead.source}
                        </span>
                        <span className="rounded-full bg-slate-200 px-2 py-0.5 text-xs font-medium text-slate-700">
                          {status}
                        </span>
                      </div>
                    </div>

                    <p className="mt-2 text-sm text-slate-700">{lead.message}</p>

                    <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
                      <div className="flex flex-wrap items-center gap-3 text-xs text-slate-600">
                        <span className="inline-flex items-center gap-1">
                          <UserRound className="h-3.5 w-3.5 text-slate-500" aria-hidden />
                          {lead.phone}
                        </span>
                        <span className="inline-flex items-center gap-1">
                          <Clock3 className="h-3.5 w-3.5 text-slate-500" aria-hidden />
                          {new Date(lead.createdAt).toLocaleString("en-IN")}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <a
                          href={`tel:${lead.phone}`}
                          className="inline-flex h-9 items-center gap-1 rounded-lg border border-slate-200 bg-white px-3 text-xs font-medium text-slate-700 hover:bg-slate-100"
                        >
                          <Phone className="h-3.5 w-3.5" aria-hidden />
                          Call
                        </a>
                        <a
                          href={`https://wa.me/${lead.phone.replace(/\D/g, "")}`}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex h-9 items-center gap-1 rounded-lg bg-green-500 px-3 text-xs font-semibold text-white hover:bg-green-600"
                        >
                          <MessageCircle className="h-3.5 w-3.5" aria-hidden />
                          WhatsApp
                        </a>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
