import Link from "next/link";
import { Headset, Mail, MapPin, Phone } from "lucide-react";

const contactItems = [
  {
    title: "Support Hotline",
    value: "+91 90000 11111",
    note: "Mon-Sat, 9 AM to 7 PM",
    Icon: Phone,
  },
  {
    title: "Email Support",
    value: "support@namastebharat.in",
    note: "Response within 24 hours",
    Icon: Mail,
  },
  {
    title: "HQ",
    value: "Pune, Maharashtra",
    note: "India",
    Icon: MapPin,
  },
];

export default function ContactPage() {
  return (
    <div className="min-h-dvh bg-slate-50">
      <section className="mx-auto max-w-7xl space-y-5 px-4 pb-24 pt-4 md:px-6 lg:px-8">
        <div className="rounded-2xl bg-gradient-to-r from-blue-700 to-cyan-700 p-6 text-white">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-blue-100">
            Contact Us
          </p>
          <h1 className="mt-2 text-3xl font-semibold leading-tight md:text-4xl">
            Need help with listing or leads?
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-blue-100 md:text-base">
            Reach our support team for onboarding, listing updates, campaigns,
            and account assistance.
          </p>
        </div>

        <div className="grid gap-3 md:grid-cols-3">
          {contactItems.map(({ title, value, note, Icon }) => (
            <article
              key={title}
              className="rounded-2xl border border-slate-200 bg-white p-5"
            >
              <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 text-blue-700">
                <Icon className="h-5 w-5" aria-hidden />
              </span>
              <p className="mt-3 text-base font-semibold text-slate-900">{title}</p>
              <p className="mt-1 text-sm font-medium text-slate-700">{value}</p>
              <p className="text-xs text-slate-500">{note}</p>
            </article>
          ))}
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5">
          <p className="inline-flex items-center gap-2 text-lg font-semibold text-slate-900">
            <Headset className="h-5 w-5 text-blue-700" aria-hidden />
            Quick actions
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <Link
              href="/free-listing"
              className="inline-flex h-10 items-center rounded-lg bg-blue-600 px-3 text-sm font-semibold text-white hover:bg-blue-700"
            >
              Start Free Listing
            </Link>
            <Link
              href="/offers"
              className="inline-flex h-10 items-center rounded-lg border border-slate-200 bg-white px-3 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              Explore Offers
            </Link>
            <Link
              href="/design-review"
              className="inline-flex h-10 items-center rounded-lg border border-slate-200 bg-white px-3 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              Open Design Review
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
