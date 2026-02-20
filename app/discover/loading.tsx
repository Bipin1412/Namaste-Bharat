import OfferBannerSlot from "@/components/OfferBannerSlot";
import SmartSearchBar from "@/components/SmartSearchBar";
import VideoFeedSkeleton from "@/components/VideoFeedSkeleton";

export default function LoadingDiscoverPage() {
  return (
    <div className="min-h-dvh bg-slate-50">
      <SmartSearchBar placeholder="Search and discover trending reels" />
      <section className="mx-auto max-w-7xl space-y-4 px-4 pb-24 pt-2 md:px-6 lg:px-8">
        <OfferBannerSlot title="Discovery Feed Sponsorship Banner" />
        <div className="grid gap-4 xl:grid-cols-[1fr,300px]">
          <VideoFeedSkeleton count={2} />
          <aside className="hidden rounded-2xl border border-slate-200 bg-white p-4 xl:block">
            <div className="h-4 w-32 animate-pulse rounded bg-slate-200" />
            <div className="mt-3 space-y-2">
              <div className="h-10 animate-pulse rounded-lg bg-slate-100" />
              <div className="h-10 animate-pulse rounded-lg bg-slate-100" />
              <div className="h-10 animate-pulse rounded-lg bg-slate-100" />
            </div>
          </aside>
        </div>
      </section>
    </div>
  );
}
