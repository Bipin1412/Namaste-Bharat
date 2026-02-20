export default function RootLoading() {
  return (
    <div className="min-h-[60dvh] bg-slate-50 px-4 py-8">
      <div className="mx-auto max-w-7xl space-y-3">
        <div className="h-40 animate-pulse rounded-2xl bg-slate-200" />
        <div className="grid gap-3 md:grid-cols-3">
          <div className="h-32 animate-pulse rounded-xl bg-slate-200" />
          <div className="h-32 animate-pulse rounded-xl bg-slate-200" />
          <div className="h-32 animate-pulse rounded-xl bg-slate-200" />
        </div>
        <div className="h-64 animate-pulse rounded-2xl bg-slate-200" />
      </div>
    </div>
  );
}
