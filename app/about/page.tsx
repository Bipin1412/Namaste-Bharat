import Link from "next/link";
import { Building2, Handshake, Target, Users } from "lucide-react";

const values = [
  {
    title: "MSME-first",
    description:
      "Every feature is designed to help small and medium businesses get discovered faster.",
    Icon: Building2,
  },
  {
    title: "Trust and Verification",
    description:
      "Profiles are built around transparent details, direct contact, and quality signals.",
    Icon: Handshake,
  },
  {
    title: "Growth Focus",
    description:
      "From listing to promotions, the platform supports local growth journeys.",
    Icon: Target,
  },
  {
    title: "Community Impact",
    description:
      "We connect local buyers and local sellers to strengthen neighborhood economies.",
    Icon: Users,
  },
];

export default function AboutPage() {
  return (
    <div className="min-h-dvh bg-slate-50">
      <section className="mx-auto max-w-7xl space-y-5 px-4 pb-24 pt-4 md:px-6 lg:px-8">
        <div className="rounded-2xl bg-gradient-to-r from-blue-700 to-indigo-700 p-6 text-white">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-blue-100">
            About Namaste Bharat
          </p>
          <h1 className="mt-2 text-3xl font-semibold leading-tight md:text-4xl">
            Built for local businesses in Bharat
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-blue-100 md:text-base">
            Namaste Bharat is a modern local discovery platform connecting users
            with verified MSMEs through search, reels, and direct lead channels.
          </p>
        </div>

        <div className="grid gap-3 md:grid-cols-2">
          {values.map(({ title, description, Icon }) => (
            <article
              key={title}
              className="rounded-2xl border border-slate-200 bg-white p-5"
            >
              <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 text-blue-700">
                <Icon className="h-5 w-5" aria-hidden />
              </span>
              <p className="mt-3 text-lg font-semibold text-slate-900">{title}</p>
              <p className="mt-1 text-sm leading-relaxed text-slate-600">
                {description}
              </p>
            </article>
          ))}
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5">
          <p className="text-lg font-semibold text-slate-900">What next?</p>
          <p className="mt-2 text-sm text-slate-600">
            Explore live business listings, see growth stories, or onboard your
            own business profile with no signup charge.
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <Link
              href="/search"
              className="inline-flex h-10 items-center rounded-lg bg-blue-600 px-3 text-sm font-semibold text-white hover:bg-blue-700"
            >
              Explore Listings
            </Link>
            <Link
              href="/free-listing"
              className="inline-flex h-10 items-center rounded-lg border border-slate-200 bg-white px-3 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              Start Listing
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

