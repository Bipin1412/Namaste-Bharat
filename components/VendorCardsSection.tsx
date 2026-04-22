import Image from "next/image";
import Link from "next/link";
import type { StaticImageData } from "next/image";
import {
  Building2,
  BadgeCheck,
  Clock3,
  Globe,
  MapPin,
  MessageCircle,
  Phone,
} from "lucide-react";
import type { Business } from "@/lib/backend/types";
import { getBusinessImage } from "@/lib/ui/showcase";

type VendorCard = {
  id: string;
  businessName: string;
  mobileNumber: string;
  whatsappNumber: string;
  website: string;
  locality: string;
  city: string;
  businessType: string;
  verified: boolean;
  rating: number;
  reviewCount: number;
  isOpenNow: boolean;
  image: string | StaticImageData;
};

function toWebsiteUrl(value: string) {
  if (!value.trim()) {
    return "";
  }
  if (value.startsWith("http://") || value.startsWith("https://")) {
    return value;
  }
  return `https://${value}`;
}

function toTel(value: string) {
  const digits = value.replace(/\D/g, "");
  if (!digits) {
    return "";
  }
  return `tel:+91${digits.slice(-10)}`;
}

function toWhatsappUrl(number: string, businessName: string) {
  const digits = number.replace(/\D/g, "");
  if (!digits) {
    return "";
  }

  const text = encodeURIComponent(
    `Namaste ${businessName}, I found your profile on Namaste Bharat and want more details.`
  );

  return `https://wa.me/${digits}?text=${text}`;
}

type VendorCardsSectionProps = {
  vendors?: VendorCard[];
};

function mapBusinessToVendorCard(business: Business): VendorCard {
  return {
    id: business.id,
    businessName: business.name,
    mobileNumber: business.phone || "",
    whatsappNumber: business.whatsappNumber || business.phone || "",
    website: business.website || "",
    locality: business.locality || business.addressLine1 || business.city,
    city: business.city,
    businessType: business.category,
    verified: business.verified,
    rating: business.rating,
    reviewCount: business.reviewCount,
    isOpenNow: business.isOpenNow,
    image: business.media?.coverImages?.[0] || getBusinessImage(business.id),
  };
}

export function buildVendorCardsFromBusinesses(businesses: Business[]): VendorCard[] {
  return businesses.map(mapBusinessToVendorCard);
}

export default function VendorCardsSection({ vendors = [] }: VendorCardsSectionProps) {
  if (vendors.length === 0) {
    return null;
  }

  return (
    <section className="space-y-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-[0_16px_30px_-22px_rgba(15,23,42,0.35)]">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
            Vendor Spotlight
          </p>
          <h2 className="mt-1 text-lg font-semibold text-slate-900">
            Registered Vendors
          </h2>
        </div>
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        {vendors.map((vendor) => {
          const websiteUrl = toWebsiteUrl(vendor.website);
          const whatsappUrl = toWhatsappUrl(vendor.whatsappNumber, vendor.businessName);

          return (
            <article
              key={vendor.id}
              className="rounded-2xl border border-slate-200 bg-white p-3 shadow-[0_10px_24px_-18px_rgba(15,23,42,0.35)] transition-shadow hover:shadow-[0_16px_36px_-22px_rgba(15,23,42,0.35)] md:p-4"
            >
              <div className="grid grid-cols-[88px,1fr] gap-3 md:grid-cols-[104px,1fr] md:gap-4">
                <div className="relative h-24 overflow-hidden rounded-xl border border-slate-200 bg-slate-100 md:h-28">
                  <Image
                    src={vendor.image}
                    alt={vendor.businessName}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 88px, 104px"
                  />
                </div>

                <div className="min-w-0">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="truncate text-base font-semibold leading-snug tracking-[0.01em] text-slate-900">
                          {vendor.businessName}
                        </h3>
                        {vendor.verified ? (
                          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 text-[11px] font-medium text-emerald-700">
                            <BadgeCheck className="h-3.5 w-3.5" aria-hidden />
                            Verified
                          </span>
                        ) : null}
                      </div>
                      <p className="text-sm tracking-[0.012em] text-slate-600">
                        {vendor.businessType}
                      </p>
                    </div>

                    <div className="shrink-0 rounded-md border border-amber-200 bg-amber-50 px-2 py-1 text-xs font-semibold text-amber-700">
                      {vendor.rating.toFixed(1)} ({vendor.reviewCount})
                    </div>
                  </div>

                  <div className="mt-2 space-y-1.5 text-sm text-slate-600">
                    <p className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 shrink-0 text-slate-500" aria-hidden />
                      <span className="truncate tracking-[0.012em]">
                        {vendor.locality}, {vendor.city}
                      </span>
                    </p>
                    <p className="flex items-center gap-2">
                      <Clock3 className="h-4 w-4 shrink-0 text-slate-500" aria-hidden />
                      <span
                        className={`font-medium tracking-[0.012em] ${
                          vendor.isOpenNow ? "text-emerald-700" : "text-rose-600"
                        }`}
                      >
                        {vendor.isOpenNow ? "Open now" : "Closed"}
                      </span>
                    </p>
                    {vendor.website ? (
                      <p className="flex items-center gap-2">
                        <Globe className="h-4 w-4 shrink-0 text-slate-500" aria-hidden />
                        <span className="truncate tracking-[0.012em]">{vendor.website}</span>
                      </p>
                    ) : null}
                  </div>

                  <div className="mt-3 grid grid-cols-2 gap-2">
                    <Link
                      href={toTel(vendor.mobileNumber)}
                      className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white text-sm font-medium text-slate-700 transition-colors hover:bg-slate-100"
                    >
                      <Phone className="h-4 w-4" aria-hidden />
                      Call
                    </Link>
                    {whatsappUrl ? (
                      <Link
                        href={whatsappUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-green-500 text-sm font-semibold text-white shadow-[0_10px_20px_-12px_rgba(21,128,61,0.6)] transition-colors hover:bg-green-600"
                      >
                        <MessageCircle className="h-4 w-4" aria-hidden />
                        WhatsApp
                      </Link>
                    ) : websiteUrl ? (
                      <Link
                        href={websiteUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-blue-600 text-sm font-semibold text-white transition-colors hover:bg-blue-700"
                      >
                        <Building2 className="h-4 w-4" aria-hidden />
                        Visit Website
                      </Link>
                    ) : (
                      <div className="inline-flex h-10 items-center justify-center rounded-lg border border-dashed border-slate-200 bg-slate-50 text-sm font-medium text-slate-400">
                        No Website
                      </div>
                    )}
                  </div>

                  <Link
                    href={`/business/${vendor.id}`}
                    className="mt-2 inline-flex text-xs font-semibold text-blue-700 hover:text-blue-600"
                  >
                    View full profile
                  </Link>
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
