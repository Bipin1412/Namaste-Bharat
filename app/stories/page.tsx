import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Quote, Sparkles } from "lucide-react";
import { storyShowcaseCards } from "@/lib/ui/showcase";

const storyHighlights = [
  {
    title: "More quality inquiries",
    description:
      "Businesses report stronger intent from customers who discover via verified listings.",
  },
  {
    title: "Faster response cycle",
    description:
      "Integrated WhatsApp and call CTAs help teams convert leads quickly.",
  },
  {
    title: "Better local recall",
    description:
      "Consistent brand presence across search and reels builds trust in neighborhood markets.",
  },
];

export default function StoriesPage() {
  return (
    <div className="min-h-dvh bg-slate-50">
      <section className="mx-auto max-w-7xl space-y-5 px-4 pb-24 pt-4 md:px-6 lg:px-8">
        <div className="rounded-2xl bg-gradient-to-r from-indigo-700 to-blue-700 p-6 text-white">
          <p className="text-xs font-semibold uppercase tracking-[0.13em] text-indigo-100">
            Success Stories
          </p>
          <h1 className="mt-2 text-3xl font-semibold leading-tight md:text-4xl">
            How MSMEs are growing with Namaste Bharat
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-indigo-100 md:text-base">
            Real examples of listings gaining visibility, better response rates,
            and repeat customer flow.
          </p>
        </div>

        <div className="grid gap-3 md:grid-cols-3">
          {storyShowcaseCards.map((story) => (
            <article
              key={story.title}
              className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_14px_30px_-22px_rgba(15,23,42,0.35)]"
            >
              <div className="relative h-56 w-full">
                <Image src={story.image} alt={story.title} fill className="object-cover" />
              </div>
              <div className="p-4">
                <p className="text-lg font-semibold text-slate-900">{story.title}</p>
                <p className="text-sm text-slate-600">{story.subtitle}</p>
              </div>
            </article>
          ))}
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5">
          <p className="inline-flex items-center gap-2 text-lg font-semibold text-slate-900">
            <Quote className="h-5 w-5 text-blue-700" aria-hidden />
            Client voices
          </p>
          <div className="mt-3 grid gap-3 md:grid-cols-2">
            <blockquote className="rounded-xl border border-slate-100 bg-slate-50 p-4 text-sm leading-relaxed text-slate-700">
              &quot;Within two months we started receiving local B2B inquiries
              regularly. The WhatsApp CTA brought serious buyers.&quot;
              <footer className="mt-2 text-xs font-medium text-slate-500">
                - Founder, Urban Steel Works
              </footer>
            </blockquote>
            <blockquote className="rounded-xl border border-slate-100 bg-slate-50 p-4 text-sm leading-relaxed text-slate-700">
              &quot;Our listing became easier to discover than social posts.
              Customers now call directly after seeing our profile.&quot;
              <footer className="mt-2 text-xs font-medium text-slate-500">
                - Owner, Ganraj Caterers
              </footer>
            </blockquote>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5">
          <p className="inline-flex items-center gap-2 text-lg font-semibold text-slate-900">
            <Sparkles className="h-5 w-5 text-orange-500" aria-hidden />
            What changed after listing?
          </p>
          <div className="mt-3 grid gap-3 md:grid-cols-3">
            {storyHighlights.map((item) => (
              <div
                key={item.title}
                className="rounded-xl border border-slate-100 bg-slate-50 p-4"
              >
                <p className="text-base font-semibold text-slate-900">{item.title}</p>
                <p className="mt-1 text-sm text-slate-600">{item.description}</p>
              </div>
            ))}
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            <Link
              href="/free-listing"
              className="inline-flex h-10 items-center rounded-lg bg-blue-600 px-3 text-sm font-semibold text-white hover:bg-blue-700"
            >
              Start Free Listing
            </Link>
            <Link
              href="/search"
              className="inline-flex h-10 items-center gap-1 rounded-lg border border-slate-200 bg-white px-3 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              Explore Businesses
              <ArrowRight className="h-3.5 w-3.5" aria-hidden />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
