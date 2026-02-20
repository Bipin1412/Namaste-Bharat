type VideoFeedSkeletonProps = {
  count?: number;
};

export default function VideoFeedSkeleton({ count = 3 }: VideoFeedSkeletonProps) {
  return (
    <section
      aria-label="Loading discovery reels"
      className="h-dvh snap-y snap-mandatory overflow-y-auto bg-slate-100 pb-20 md:mx-auto md:h-[calc(100dvh-8.5rem)] md:max-w-xl md:rounded-2xl md:border md:border-slate-200 md:pb-0"
    >
      {Array.from({ length: count }).map((_, index) => (
        <div
          key={`video-skeleton-${index}`}
          className="relative h-dvh snap-start animate-pulse overflow-hidden bg-slate-200 md:h-[calc(100dvh-8.5rem)]"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-blue-200/50 via-indigo-200/50 to-cyan-200/50" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

          <div className="absolute bottom-24 left-4 right-20 space-y-3">
            <div className="h-5 w-44 rounded-full bg-white/70" />
            <div className="h-4 w-full rounded bg-white/60" />
            <div className="h-4 w-3/4 rounded bg-white/60" />
            <div className="h-3 w-36 rounded bg-white/70" />
          </div>

          <div className="absolute bottom-24 right-3 flex flex-col gap-3">
            <div className="h-12 w-12 rounded-full bg-white/65" />
            <div className="h-12 w-12 rounded-full bg-white/65" />
            <div className="h-12 w-12 rounded-full bg-green-100/85" />
          </div>
        </div>
      ))}
    </section>
  );
}
