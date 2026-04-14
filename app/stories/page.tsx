import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Quote, Sparkles } from "lucide-react";
import { storyShowcaseCards } from "@/lib/ui/showcase";

export default function StoriesPage() {
  return (
    <div className="min-h-dvh bg-[#f6f7fb]">
      <section className="mx-auto max-w-7xl px-4 pb-24 pt-4 md:px-6 lg:px-8">
        <div className="overflow-hidden rounded-[32px] border border-slate-200 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.96),rgba(248,250,252,0.98)_42%,rgba(241,245,249,1)_100%)] p-5 shadow-[0_24px_60px_-38px_rgba(15,23,42,0.45)] md:p-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl">
              <p className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-slate-600 shadow-sm">
                <Sparkles className="h-3.5 w-3.5 text-orange-500" aria-hidden />
                Success Stories
              </p>
              <h1 className="mt-4 text-3xl font-semibold tracking-[-0.04em] text-slate-900 md:text-5xl">
                Real local businesses. Real growth.
              </h1>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600 md:text-base">
                Each story card now uses the matching image from the stories asset
                folder so the layout and visuals stay aligned.
              </p>
            </div>
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {storyShowcaseCards.map((story) => (
              <article
                key={story.title}
                className="group overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-[0_18px_50px_-30px_rgba(15,23,42,0.45)] transition-transform duration-300 hover:-translate-y-1"
              >
                <div className={`relative h-56 overflow-hidden bg-gradient-to-br ${story.accent}`}>
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.3),transparent_42%),radial-gradient(circle_at_bottom_left,rgba(255,255,255,0.18),transparent_35%)]" />
                  <div className="absolute left-4 top-4 z-10 inline-flex items-center rounded-full bg-white/18 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-white backdrop-blur">
                    {story.category}
                  </div>

                  {story.image ? (
                    <Image
                      src={story.image}
                      alt={story.title}
                      fill
                      className="object-cover object-center"
                    />
                  ) : (
                    <div className="absolute inset-x-4 top-12 bottom-4 overflow-hidden rounded-[22px] border border-white/15 bg-white/10 backdrop-blur-sm">
                      <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(255,255,255,0.18),transparent_45%,rgba(255,255,255,0.08)_100%)]" />
                      <div className="absolute inset-0 flex items-center justify-center px-4 text-center text-white/85">
                        <div>
                          <p className="text-sm font-semibold uppercase tracking-[0.18em]">
                            Image space
                          </p>
                          <p className="mt-1 text-xs">Ready for the matching photo later</p>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="absolute bottom-4 left-4 right-4 z-10">
                    <h2 className="max-w-[16rem] text-2xl font-semibold leading-tight text-slate-900 drop-shadow-none">
                      {story.title}
                    </h2>
                  </div>
                </div>

                <div className="p-5">
                  <p className="text-sm leading-6 text-slate-600">{story.summary}</p>

                  <div className="mt-4 flex flex-wrap gap-2">
                    {story.outcomes.map((outcome) => (
                      <span
                        key={outcome}
                        className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-[11px] font-semibold text-slate-700"
                      >
                        {outcome}
                      </span>
                    ))}
                  </div>

                  <blockquote className="mt-5 rounded-2xl border border-slate-100 bg-slate-50 p-4 text-sm leading-6 text-slate-700">
                    <Quote className="mb-2 h-4 w-4 text-orange-500" aria-hidden />
                    {`"${story.quote}"`}
                  </blockquote>
                </div>
              </article>
            ))}
          </div>

          <div className="mt-5 rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-sm font-semibold text-slate-900">
                  Story images are now in place
                </p>
                <p className="mt-1 text-sm text-slate-600">
                  Each card is matched with its corresponding image from
                  `assests/stories`.
                </p>
              </div>
              <Link
                href="/search"
                className="inline-flex h-10 items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-4 text-sm font-medium text-slate-700 transition-colors hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700"
              >
                Explore businesses
                <ArrowRight className="h-4 w-4" aria-hidden />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
