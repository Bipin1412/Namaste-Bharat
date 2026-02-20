import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-[60dvh] bg-slate-50 px-4 py-16">
      <div className="mx-auto max-w-xl rounded-2xl border border-slate-200 bg-white p-8 text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
          404
        </p>
        <h1 className="mt-2 text-3xl font-semibold text-slate-900">
          Page not found
        </h1>
        <p className="mt-2 text-sm text-slate-600">
          The page you are looking for does not exist or may have been moved.
        </p>
        <div className="mt-5 flex justify-center gap-2">
          <Link
            href="/"
            className="inline-flex h-10 items-center rounded-lg bg-blue-600 px-3 text-sm font-semibold text-white hover:bg-blue-700"
          >
            Go Home
          </Link>
          <Link
            href="/design-review"
            className="inline-flex h-10 items-center rounded-lg border border-slate-200 bg-white px-3 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            Open Review Hub
          </Link>
        </div>
      </div>
    </div>
  );
}
