export default function LoadingSearchPage() {
  return (
    <div className="min-h-dvh bg-slate-50">
      <div className="sticky top-0 z-30 bg-gradient-to-b from-white via-white/95 to-transparent px-4 pb-3 pt-[calc(env(safe-area-inset-top)+0.75rem)] md:top-16 md:px-6 md:pt-4 lg:px-8">
        <div className="mx-auto flex w-full max-w-5xl items-center gap-2 rounded-full border border-slate-200 bg-white p-1 pl-4 shadow-[0_12px_30px_-22px_rgba(15,23,42,0.3)]">
          <div className="h-4 w-4 shrink-0 rounded-full bg-slate-200" />
          <div className="h-10 flex-1 rounded-full bg-slate-100" />
          <div className="h-10 w-10 shrink-0 rounded-full bg-slate-200" />
        </div>
      </div>

      <section className="mx-auto max-w-7xl space-y-4 px-4 pb-24 pt-2 md:px-6 lg:px-8">
        <div className="overflow-hidden rounded-2xl border border-orange-200 bg-gradient-to-r from-amber-50 to-orange-50 p-2 md:p-3">
          <div className="h-52 rounded-xl border border-orange-200 bg-white sm:h-56 md:h-64 lg:h-72" />
        </div>

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
            <div className="animate-pulse rounded-2xl border border-slate-200 bg-white p-3 md:p-4">
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
            <div className="animate-pulse rounded-2xl border border-slate-200 bg-white p-3 md:p-4">
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
            <div className="animate-pulse rounded-2xl border border-slate-200 bg-white p-3 md:p-4">
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
          </div>
        </div>
      </section>
    </div>
  );
}
