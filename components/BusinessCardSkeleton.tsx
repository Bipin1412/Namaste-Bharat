export default function BusinessCardSkeleton() {
  return (
    <div
      aria-hidden
      className="animate-pulse rounded-2xl border border-slate-200 bg-white p-3 md:p-4"
    >
      <div className="grid grid-cols-[88px,1fr] gap-3 md:grid-cols-[104px,1fr] md:gap-4">
        <div className="h-24 rounded-xl bg-slate-200 md:h-28" />
        <div className="space-y-3">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0 flex-1 space-y-2">
              <div className="h-4 w-3/5 rounded bg-slate-200" />
              <div className="h-3 w-2/5 rounded bg-slate-100" />
            </div>
            <div className="h-6 w-16 rounded-md bg-amber-100" />
          </div>

          <div className="space-y-2">
            <div className="h-3 w-4/5 rounded bg-slate-100" />
            <div className="h-3 w-2/5 rounded bg-slate-100" />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div className="h-10 rounded-lg bg-slate-100" />
            <div className="h-10 rounded-lg bg-green-100" />
          </div>
        </div>
      </div>
    </div>
  );
}
