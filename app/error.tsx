"use client";

import Link from "next/link";

type GlobalErrorProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function GlobalError({ error, reset }: GlobalErrorProps) {
  return (
    <div className="min-h-[60dvh] bg-slate-50 px-4 py-16">
      <div className="mx-auto max-w-xl rounded-2xl border border-slate-200 bg-white p-8 text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-amber-700">
          Something went wrong
        </p>
        <h1 className="mt-2 text-3xl font-semibold text-slate-900">
          We couldn&apos;t load this page
        </h1>
        <p className="mt-2 text-sm text-slate-600">
          {error.message || "Unexpected error occurred."}
        </p>
        <div className="mt-5 flex justify-center gap-2">
          <button
            type="button"
            onClick={reset}
            className="inline-flex h-10 items-center rounded-lg bg-blue-600 px-3 text-sm font-semibold text-white hover:bg-blue-700"
          >
            Try again
          </button>
          <Link
            href="/"
            className="inline-flex h-10 items-center rounded-lg border border-slate-200 bg-white px-3 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            Go Home
          </Link>
        </div>
      </div>
    </div>
  );
}
