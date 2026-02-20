import Link from "next/link";
import { ArrowRight, CheckCircle2, FileText } from "lucide-react";
import DetailedListingForm from "@/components/DetailedListingForm";

export default function DetailedFreeListingPage() {
  return (
    <div className="min-h-dvh bg-slate-50">
      <section className="mx-auto max-w-7xl space-y-5 px-4 pb-24 pt-4 md:px-6 lg:px-8">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_16px_34px_-24px_rgba(15,23,42,0.4)] md:p-6">
          <p className="inline-flex items-center gap-2 rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.12em] text-blue-700">
            <FileText className="h-3.5 w-3.5" aria-hidden />
            Complete Business Listing
          </p>
          <h1 className="mt-2 text-3xl font-semibold leading-tight tracking-[0.01em] text-slate-900 md:text-4xl">
            Create a high-ranking detailed profile
          </h1>
          <p className="mt-2 max-w-3xl text-sm leading-relaxed text-slate-600 md:text-base">
            This form captures keywords, services, media, FAQs, hours, and trust details
            so your listing can be searched through specific terms and minute intent.
          </p>

          <div className="mt-4 grid gap-2 text-sm text-slate-700 md:grid-cols-3">
            <p className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-600" aria-hidden />
              Keyword-depth search discoverability
            </p>
            <p className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-600" aria-hidden />
              Full business profile data for clients
            </p>
            <p className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-600" aria-hidden />
              Ready-to-demo listing detail page
            </p>
          </div>
        </div>

        <DetailedListingForm />

        <div className="flex flex-wrap items-center gap-2">
          <Link
            href="/business/b-1"
            className="inline-flex h-10 items-center gap-1 rounded-lg border border-slate-200 bg-white px-3 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            View detailed sample profile
            <ArrowRight className="h-3.5 w-3.5" aria-hidden />
          </Link>
          <Link
            href="/free-listing"
            className="inline-flex h-10 items-center gap-1 rounded-lg border border-slate-200 bg-white px-3 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            Back to simple listing
          </Link>
        </div>
      </section>
    </div>
  );
}
