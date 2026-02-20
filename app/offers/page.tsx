import Image from "next/image";
import Link from "next/link";
import { ArrowRight, BadgePercent, Megaphone, Sparkles } from "lucide-react";
import { listOffers } from "@/lib/backend/service";
import { offerShowcaseCards } from "@/lib/ui/showcase";

export const dynamic = "force-dynamic";

const planCards = [
  {
    title: "Starter Boost",
    price: "Rs 999 / month",
    points: [
      "Featured in local search results",
      "Priority WhatsApp inquiry visibility",
      "Profile optimization suggestions",
    ],
  },
  {
    title: "Growth Plus",
    price: "Rs 2,499 / month",
    points: [
      "Premium category placement",
      "Reels discovery support",
      "Performance and lead report",
    ],
  },
  {
    title: "City Prime",
    price: "Rs 5,999 / month",
    points: [
      "Top listing slots in target city",
      "Dedicated campaign manager",
      "Co-branded seasonal creatives",
    ],
  },
];

export default async function OffersPage() {
  const offers = await listOffers({ activeOnly: true });

  return (
    <div className="min-h-dvh bg-slate-50">
      <section className="mx-auto max-w-7xl space-y-5 px-4 pb-24 pt-4 md:px-6 lg:px-8">
        <div className="rounded-2xl bg-gradient-to-r from-blue-700 to-indigo-700 p-6 text-white">
          <p className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.13em] text-blue-100">
            <BadgePercent className="h-3.5 w-3.5" aria-hidden />
            Offers and Promotion
          </p>
          <h1 className="mt-2 text-3xl font-semibold leading-tight md:text-4xl">
            Grow your listing visibility
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-blue-100 md:text-base">
            Select campaign plans to reach high-intent local buyers across
            search, reels, and featured placements.
          </p>
        </div>

        <div className="grid gap-3 md:grid-cols-2">
          {offerShowcaseCards.map((item) => (
            <Link
              key={item.title}
              href={item.href}
              className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_14px_30px_-22px_rgba(15,23,42,0.35)]"
            >
              <div className="relative h-48 w-full">
                <Image
                  src={item.image}
                  alt={item.title}
                  fill
                  className="object-cover"
                />
              </div>
              <div className="p-4">
                <p className="text-lg font-semibold text-slate-900">{item.title}</p>
                <p className="text-sm text-slate-600">{item.subtitle}</p>
              </div>
            </Link>
          ))}
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5">
          <p className="inline-flex items-center gap-2 text-lg font-semibold text-slate-900">
            <Megaphone className="h-5 w-5 text-blue-700" aria-hidden />
            Active offers on Namaste Bharat
          </p>
          <div className="mt-3 grid gap-3 md:grid-cols-3">
            {offers.map((offer) => (
              <div
                key={offer.id}
                className="rounded-xl border border-slate-100 bg-slate-50 p-4"
              >
                <p className="text-xs font-semibold uppercase tracking-[0.12em] text-blue-700">
                  {offer.badge}
                </p>
                <p className="mt-1 text-base font-semibold text-slate-900">
                  {offer.title}
                </p>
                <p className="mt-1 text-sm text-slate-600">{offer.subtitle}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5">
          <p className="inline-flex items-center gap-2 text-lg font-semibold text-slate-900">
            <Sparkles className="h-5 w-5 text-orange-500" aria-hidden />
            Promotion Plans
          </p>
          <div className="mt-3 grid gap-3 md:grid-cols-3">
            {planCards.map((plan) => (
              <div
                key={plan.title}
                className="rounded-xl border border-slate-100 bg-slate-50 p-4"
              >
                <p className="text-base font-semibold text-slate-900">{plan.title}</p>
                <p className="mt-1 text-sm font-medium text-blue-700">{plan.price}</p>
                <ul className="mt-2 space-y-1 text-sm text-slate-600">
                  {plan.points.map((point) => (
                    <li key={point}>- {point}</li>
                  ))}
                </ul>
                <Link
                  href="/free-listing"
                  className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-blue-700 hover:text-blue-600"
                >
                  Choose Plan
                  <ArrowRight className="h-3.5 w-3.5" aria-hidden />
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
