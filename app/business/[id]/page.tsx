import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  BadgeCheck,
  Clock3,
  Globe,
  Languages,
  MapPin,
  MessageCircle,
  Phone,
  ShieldCheck,
  Star,
  Wallet,
  Wrench,
} from "lucide-react";
import BusinessCard from "@/components/BusinessCard";
import { getBusinessById, listBusinesses } from "@/lib/backend/service";
import { getBusinessImage } from "@/lib/ui/showcase";

type BusinessProfilePageProps = {
  params: Promise<{ id: string }>;
};

export const dynamic = "force-dynamic";

function formatWhatsappUrl(number: string, businessName: string) {
  const sanitized = number.replace(/\D/g, "");
  const text = encodeURIComponent(
    `Namaste ${businessName}, I found your profile on Namaste Bharat and would like more details.`
  );
  return `https://wa.me/${sanitized}?text=${text}`;
}

export default async function BusinessProfilePage({
  params,
}: BusinessProfilePageProps) {
  const { id } = await params;
  const business = await getBusinessById(id);

  if (!business) {
    notFound();
  }

  const relatedResult = await listBusinesses({
    city: business.city,
    limit: 4,
    page: 1,
    sort: "rating_desc",
  });
  const relatedBusinesses = relatedResult.data.filter((entry) => entry.id !== business.id);

  const whatsappUrl = formatWhatsappUrl(business.whatsappNumber, business.name);
  const coverImage = business.media?.coverImages?.[0] ?? getBusinessImage(business.id);
  const galleryImages =
    business.media?.gallery && business.media.gallery.length > 0
      ? business.media.gallery.slice(0, 6)
      : [coverImage, "/showcase/service-home.svg", "/showcase/offer-growth.svg"];

  const keywords = business.keywords ?? [];
  const highlights = business.highlights ?? [];
  const services = business.services ?? [];
  const hours = business.businessHours ?? [];
  const serviceAreas = business.serviceAreas ?? [];
  const languages = business.languages ?? [];
  const faqs = business.faqs ?? [];
  const paymentMethods = business.policies?.paymentMethods ?? [];

  return (
    <div className="min-h-dvh bg-slate-50">
      <section className="mx-auto max-w-7xl space-y-5 px-4 pb-24 pt-4 md:px-6 lg:px-8">
        <div className="grid gap-4 lg:grid-cols-[1.3fr,1fr]">
          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
            <div className="relative h-64 w-full md:h-[340px]">
              <Image
                src={coverImage}
                alt={`${business.name} showcase`}
                fill
                className="object-cover"
                priority
              />
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-4 text-white">
                <p className="text-xs uppercase tracking-[0.12em] text-slate-200">
                  Detailed Listing
                </p>
                <h1 className="mt-1 text-2xl font-semibold leading-tight md:text-3xl">
                  {business.name}
                </h1>
                {business.tagline ? (
                  <p className="mt-1 text-sm text-slate-100">{business.tagline}</p>
                ) : null}
              </div>
            </div>

            <div className="p-5">
              <div className="flex flex-wrap items-center gap-2">
                <p className="inline-flex items-center gap-1 rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-700">
                  {business.category}
                </p>
                {business.verified ? (
                  <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-700">
                    <BadgeCheck className="h-3.5 w-3.5" aria-hidden />
                    Verified
                  </span>
                ) : null}
              </div>

              <div className="mt-3 grid gap-2 text-sm text-slate-700 sm:grid-cols-3">
                <p className="inline-flex items-center gap-1">
                  <MapPin className="h-4 w-4 text-slate-500" aria-hidden />
                  {business.locality}, {business.city}
                </p>
                <p className="inline-flex items-center gap-1">
                  <Clock3 className="h-4 w-4 text-slate-500" aria-hidden />
                  {business.isOpenNow ? "Open now" : "Closed"}
                </p>
                <p className="inline-flex items-center gap-1">
                  <Star className="h-4 w-4 text-amber-500" aria-hidden />
                  {business.rating.toFixed(1)} ({business.reviewCount} reviews)
                </p>
              </div>

              {keywords.length > 0 ? (
                <div className="mt-4">
                  <p className="mb-2 text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
                    Searchable keywords
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {keywords.slice(0, 16).map((keyword) => (
                      <Link
                        key={keyword}
                        href={`/search?q=${encodeURIComponent(keyword)}`}
                        className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-medium text-slate-700 hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700"
                      >
                        {keyword}
                      </Link>
                    ))}
                  </div>
                </div>
              ) : null}
            </div>
          </div>

          <aside className="space-y-3">
            <div className="rounded-2xl border border-slate-200 bg-white p-4">
              <p className="text-sm font-semibold text-slate-900">Contact this business</p>
              <div className="mt-3 grid gap-2">
                <a
                  href={`tel:${business.phone}`}
                  className="inline-flex h-11 items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white text-sm font-medium text-slate-700 hover:bg-slate-50"
                >
                  <Phone className="h-4 w-4" aria-hidden />
                  Call now
                </a>
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-green-500 text-sm font-semibold text-white hover:bg-green-600"
                >
                  <MessageCircle className="h-4 w-4" aria-hidden />
                  WhatsApp
                </a>
                {business.website ? (
                  <a
                    href={business.website}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex h-11 items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white text-sm font-medium text-slate-700 hover:bg-slate-50"
                  >
                    <Globe className="h-4 w-4" aria-hidden />
                    Visit website
                  </a>
                ) : null}
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-4">
              <p className="text-sm font-semibold text-slate-900">Business facts</p>
              <ul className="mt-2 space-y-1 text-sm text-slate-600">
                {business.ownerName ? <li>Owner: {business.ownerName}</li> : null}
                {business.establishedYear ? <li>Established: {business.establishedYear}</li> : null}
                {business.pincode ? <li>Pincode: {business.pincode}</li> : null}
                {business.email ? <li>Email: {business.email}</li> : null}
              </ul>
            </div>

            {highlights.length > 0 ? (
              <div className="rounded-2xl border border-slate-200 bg-white p-4">
                <p className="text-sm font-semibold text-slate-900">Why customers choose this listing</p>
                <ul className="mt-2 space-y-1 text-sm text-slate-600">
                  {highlights.map((highlight) => (
                    <li key={highlight}>- {highlight}</li>
                  ))}
                </ul>
              </div>
            ) : null}
          </aside>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5">
          <p className="text-lg font-semibold text-slate-900">About this business</p>
          <p className="mt-2 text-sm leading-relaxed text-slate-600">
            {business.description ||
              `${business.name} is a trusted ${business.category.toLowerCase()} provider in ${business.city}. This profile is optimized for local keyword search and instant customer contact.`}
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <Link
              href="/search"
              className="inline-flex h-10 items-center rounded-lg border border-slate-200 bg-white px-3 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              Back to Search
            </Link>
            <Link
              href="/free-listing/detailed"
              className="inline-flex h-10 items-center rounded-lg bg-blue-600 px-3 text-sm font-semibold text-white hover:bg-blue-700"
            >
              Create Detailed Listing
            </Link>
          </div>
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          <div className="rounded-2xl border border-slate-200 bg-white p-5">
            <p className="inline-flex items-center gap-2 text-lg font-semibold text-slate-900">
              <Wrench className="h-5 w-5 text-blue-700" aria-hidden />
              Services and packages
            </p>
            <div className="mt-3 grid gap-2">
              {services.length > 0 ? (
                services.map((service) => (
                  <div
                    key={`${service.name}-${service.priceLabel ?? ""}`}
                    className="rounded-xl border border-slate-100 bg-slate-50 p-3"
                  >
                    <p className="text-sm font-semibold text-slate-900">{service.name}</p>
                    {service.priceLabel ? (
                      <p className="text-xs font-medium text-blue-700">{service.priceLabel}</p>
                    ) : null}
                    {service.description ? (
                      <p className="mt-1 text-sm text-slate-600">{service.description}</p>
                    ) : null}
                  </div>
                ))
              ) : (
                <p className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-3 text-sm text-slate-600">
                  Detailed services will appear here when the business fills them in the listing form.
                </p>
              )}
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5">
            <p className="inline-flex items-center gap-2 text-lg font-semibold text-slate-900">
              <Clock3 className="h-5 w-5 text-blue-700" aria-hidden />
              Hours, areas, and languages
            </p>
            <div className="mt-3 space-y-3">
              {hours.length > 0 ? (
                <ul className="rounded-xl border border-slate-100 bg-slate-50 p-3 text-sm text-slate-700">
                  {hours.map((slot) => (
                    <li key={slot.day} className="flex items-center justify-between py-1">
                      <span>{slot.day}</span>
                      <span className={slot.closed ? "text-rose-600" : "text-emerald-700"}>
                        {slot.closed ? "Closed" : `${slot.open ?? "-"} - ${slot.close ?? "-"}`}
                      </span>
                    </li>
                  ))}
                </ul>
              ) : null}

              {serviceAreas.length > 0 ? (
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
                    Service areas
                  </p>
                  <div className="mt-1 flex flex-wrap gap-2">
                    {serviceAreas.map((area) => (
                      <span
                        key={area}
                        className="rounded-full border border-slate-200 bg-white px-2.5 py-1 text-xs font-medium text-slate-700"
                      >
                        {area}
                      </span>
                    ))}
                  </div>
                </div>
              ) : null}

              {languages.length > 0 ? (
                <div>
                  <p className="inline-flex items-center gap-1 text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
                    <Languages className="h-3.5 w-3.5" aria-hidden />
                    Languages
                  </p>
                  <p className="mt-1 text-sm text-slate-700">{languages.join(", ")}</p>
                </div>
              ) : null}
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5">
          <p className="text-lg font-semibold text-slate-900">Gallery</p>
          <div className="mt-3 grid grid-cols-2 gap-2 md:grid-cols-3">
            {galleryImages.map((imagePath, index) => (
              <div key={`${imagePath}-${index}`} className="relative h-32 overflow-hidden rounded-xl border border-slate-200 bg-slate-100">
                <Image
                  src={imagePath}
                  alt={`${business.name} gallery ${index + 1}`}
                  fill
                  className="object-cover"
                />
              </div>
            ))}
          </div>
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          <div className="rounded-2xl border border-slate-200 bg-white p-5">
            <p className="text-lg font-semibold text-slate-900">FAQs</p>
            <div className="mt-3 space-y-2">
              {faqs.length > 0 ? (
                faqs.map((faq) => (
                  <details
                    key={faq.question}
                    className="rounded-xl border border-slate-200 bg-slate-50 p-3"
                  >
                    <summary className="cursor-pointer list-none text-sm font-medium text-slate-800">
                      {faq.question}
                    </summary>
                    <p className="mt-2 text-sm text-slate-600">{faq.answer}</p>
                  </details>
                ))
              ) : (
                <p className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-3 text-sm text-slate-600">
                  FAQ details can be added through the detailed listing form.
                </p>
              )}
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5">
            <p className="inline-flex items-center gap-2 text-lg font-semibold text-slate-900">
              <ShieldCheck className="h-5 w-5 text-emerald-600" aria-hidden />
              Verification and policies
            </p>
            <div className="mt-3 space-y-2 text-sm text-slate-700">
              {business.verification?.gstNumber ? (
                <p>GST: {business.verification.gstNumber}</p>
              ) : null}
              {business.verification?.licenseNumber ? (
                <p>License: {business.verification.licenseNumber}</p>
              ) : null}
              {paymentMethods.length > 0 ? (
                <p className="inline-flex items-center gap-1">
                  <Wallet className="h-4 w-4 text-slate-500" aria-hidden />
                  Payments: {paymentMethods.join(", ")}
                </p>
              ) : null}
            </div>
          </div>
        </div>

        {relatedBusinesses.length > 0 ? (
          <div className="space-y-3">
            <p className="text-sm font-semibold text-slate-900">
              Similar businesses in {business.city}
            </p>
            <div className="grid gap-3 md:grid-cols-2">
              {relatedBusinesses.slice(0, 2).map((entry) => (
                <BusinessCard key={entry.id} business={entry} />
              ))}
            </div>
          </div>
        ) : null}
      </section>
    </div>
  );
}
