import BusinessCardSkeleton from "@/components/BusinessCardSkeleton";
import OfferBannerSlot from "@/components/OfferBannerSlot";
import SmartSearchBar from "@/components/SmartSearchBar";

export default function LoadingSearchPage() {
  return (
    <div className="min-h-dvh bg-slate-50">
      <SmartSearchBar />
      <section className="mx-auto max-w-7xl space-y-4 px-4 pb-24 pt-2 md:px-6 lg:px-8">
        <OfferBannerSlot title="Search Results Offer Banner" />
        <div className="grid gap-4 lg:grid-cols-[240px,1fr]">
          <div className="hidden rounded-2xl border border-slate-200 bg-white p-4 lg:block">
            <div className="h-4 w-24 animate-pulse rounded bg-slate-200" />
            <div className="mt-3 space-y-2">
              <div className="h-10 animate-pulse rounded-lg bg-slate-100" />
              <div className="h-10 animate-pulse rounded-lg bg-slate-100" />
              <div className="h-10 animate-pulse rounded-lg bg-slate-100" />
            </div>
          </div>
          <div className="space-y-3">
            <BusinessCardSkeleton />
            <BusinessCardSkeleton />
            <BusinessCardSkeleton />
          </div>
        </div>
      </section>
    </div>
  );
}
