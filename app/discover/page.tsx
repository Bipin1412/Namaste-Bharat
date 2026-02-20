"use client";

import { useEffect, useState } from "react";
import OfferBannerSlot from "@/components/OfferBannerSlot";
import SmartSearchBar from "@/components/SmartSearchBar";
import VideoFeed, { type VideoReel } from "@/components/VideoFeed";
import VideoFeedSkeleton from "@/components/VideoFeedSkeleton";

type ReelsApiResponse = {
  data: VideoReel[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
};

export default function DiscoverPage() {
  const [query, setQuery] = useState("");
  const [reels, setReels] = useState<VideoReel[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    const timer = window.setTimeout(async () => {
      setIsLoading(true);
      setError(null);

      try {
        const params = new URLSearchParams({ page: "1", limit: "12" });
        if (query.trim()) {
          params.set("q", query.trim());
        }

        const response = await fetch(`/api/reels?${params.toString()}`, {
          method: "GET",
          signal: controller.signal,
          cache: "no-store",
        });

        if (!response.ok) {
          throw new Error("Could not load discovery reels.");
        }

        const payload = (await response.json()) as ReelsApiResponse;
        setReels(payload.data);
      } catch (fetchError) {
        if (!controller.signal.aborted) {
          setError(
            fetchError instanceof Error
              ? fetchError.message
              : "Something went wrong while loading reels."
          );
          setReels([]);
        }
      } finally {
        if (!controller.signal.aborted) {
          setIsLoading(false);
        }
      }
    }, 220);

    return () => {
      controller.abort();
      window.clearTimeout(timer);
    };
  }, [query]);

  return (
    <div className="min-h-dvh bg-slate-50">
      <SmartSearchBar
        value={query}
        onChange={setQuery}
        onSubmit={setQuery}
        placeholder="Search and discover trending reels"
      />
      <section className="mx-auto max-w-7xl space-y-4 px-4 pb-24 pt-2 md:px-6 lg:px-8">
        <OfferBannerSlot title="Discovery Feed Sponsorship Banner" />
        <div className="grid gap-4 xl:grid-cols-[1fr,300px]">
          {isLoading ? (
            <VideoFeedSkeleton count={2} />
          ) : error ? (
            <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-center text-sm tracking-[0.012em] text-red-700">
              {error}
            </div>
          ) : reels.length > 0 ? (
            <VideoFeed reels={reels} />
          ) : (
            <div className="rounded-2xl border border-slate-200 bg-white p-6 text-center text-sm tracking-[0.012em] text-slate-600">
              No reels matched your search. Try a city or service keyword.
            </div>
          )}

          <aside className="hidden h-fit rounded-2xl border border-slate-200 bg-white p-4 xl:block">
            <p className="text-sm font-semibold tracking-[0.012em] text-slate-800">
              Trending right now
            </p>
            <ul className="mt-3 space-y-2 text-sm text-slate-600">
              <li className="rounded-lg bg-slate-50 px-3 py-2">
                Wedding catering deals
              </li>
              <li className="rounded-lg bg-slate-50 px-3 py-2">
                Home renovation offers
              </li>
              <li className="rounded-lg bg-slate-50 px-3 py-2">
                Clinic booking this week
              </li>
              <li className="rounded-lg bg-slate-50 px-3 py-2">
                Verified garages nearby
              </li>
            </ul>
          </aside>
        </div>
      </section>
    </div>
  );
}
