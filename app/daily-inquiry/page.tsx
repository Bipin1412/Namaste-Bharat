"use client";

import { useEffect, useState } from "react";

type DailyInquiryPost = {
  id: string;
  inquiryDate: string;
  description: string;
  createdAt: string;
};

export default function DailyInquiryPage() {
  const [selectedDate, setSelectedDate] = useState("");
  const [posts, setPosts] = useState<DailyInquiryPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [message, setMessage] = useState("");

  async function loadPosts(filterDate?: string) {
    setIsLoading(true);
    setMessage("");
    const query = filterDate ? `?date=${encodeURIComponent(filterDate)}` : "";
    const response = await fetch(`/api/daily-inquiries${query}`, {
      cache: "no-store",
    }).catch(() => null);

    if (!response || !response.ok) {
      setPosts([]);
      setMessage("Could not load daily inquiry posts.");
      setIsLoading(false);
      return;
    }

    const payload = (await response.json().catch(() => null)) as
      | { data?: DailyInquiryPost[] }
      | null;
    setPosts(Array.isArray(payload?.data) ? payload.data : []);
    setIsLoading(false);
  }

  useEffect(() => {
    void loadPosts(selectedDate || undefined);
  }, [selectedDate]);

  return (
    <div className="min-h-dvh bg-slate-50 px-4 pb-24 pt-4 md:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-4">
        <section className="rounded-2xl border border-slate-200 bg-white p-6">
          <h1 className="text-2xl font-semibold text-slate-900">Daily Inquiry</h1>
          <p className="mt-1 text-sm text-slate-600">
            Daily updates posted by admin.
          </p>
        </section>

        <section className="grid gap-4 lg:grid-cols-[1fr,280px]">
          <div className="rounded-2xl border border-slate-200 bg-white p-6">
            {isLoading ? (
              <p className="text-sm text-slate-600">Loading posts...</p>
            ) : posts.length === 0 ? (
              <p className="text-sm text-slate-600">No posts available.</p>
            ) : (
              <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                {posts.map((post) => (
                  <article key={post.id} className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.08em] text-blue-700">
                      {post.inquiryDate}
                    </p>
                    <p className="mt-2 text-sm leading-relaxed text-slate-800">
                      {post.description}
                    </p>
                  </article>
                ))}
              </div>
            )}
            {message ? <p className="mt-3 text-sm text-rose-700">{message}</p> : null}
          </div>

          <aside className="h-fit rounded-2xl border border-slate-200 bg-white p-4">
            <p className="text-sm font-semibold text-slate-900">Filter By Date</p>
            <input
              type="date"
              value={selectedDate}
              onChange={(event) => setSelectedDate(event.target.value)}
              className="mt-3 h-10 w-full rounded-lg border border-slate-300 px-3 text-sm"
            />
            <button
              type="button"
              onClick={() => setSelectedDate("")}
              className="mt-3 h-10 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm font-medium text-slate-700"
            >
              Clear Filter
            </button>
          </aside>
        </section>
      </div>
    </div>
  );
}
