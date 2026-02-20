"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { BadgeCheck, Clock3, MapPin, MessageCircle, Phone } from "lucide-react";
import { getBusinessImage } from "@/lib/ui/showcase";

export type BusinessCardData = {
  id: string;
  name: string;
  category: string;
  locality: string;
  city: string;
  rating: number;
  reviewCount: number;
  isOpenNow: boolean;
  verified?: boolean;
  phone: string;
  whatsappNumber: string;
};

type BusinessCardProps = {
  business: BusinessCardData;
};

function formatWhatsappUrl(number: string, businessName: string) {
  const sanitized = number.replace(/\D/g, "");
  const text = encodeURIComponent(
    `Namaste ${businessName}, I found you on Namaste Bharat and want to know more.`
  );

  return `https://wa.me/${sanitized}?text=${text}`;
}

export default function BusinessCard({ business }: BusinessCardProps) {
  const whatsappUrl = formatWhatsappUrl(business.whatsappNumber, business.name);

  function captureLead(source: "search" | "profile") {
    void fetch("/api/leads", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        businessId: business.id,
        name: "Anonymous Visitor",
        phone: business.phone.replace(/\D/g, "").slice(0, 12),
        message: `Interested in ${business.name}`,
        source,
      }),
    }).catch(() => {
      // UX should never break if analytics capture fails.
    });
  }

  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-3 shadow-[0_10px_24px_-18px_rgba(15,23,42,0.35)] transition-shadow hover:shadow-[0_16px_36px_-22px_rgba(15,23,42,0.35)] md:p-4">
      <div className="grid grid-cols-[88px,1fr] gap-3 md:grid-cols-[104px,1fr] md:gap-4">
        <div className="relative h-24 overflow-hidden rounded-xl border border-slate-200 bg-slate-100 md:h-28">
          <Image
            src={getBusinessImage(business.id)}
            alt={business.name}
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
                  {business.name}
                </h3>
                {business.verified ? (
                  <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 text-[11px] font-medium text-emerald-700">
                    <BadgeCheck className="h-3.5 w-3.5" aria-hidden />
                    Verified
                  </span>
                ) : null}
              </div>
              <p className="text-sm tracking-[0.012em] text-slate-600">
                {business.category}
              </p>
            </div>

            <div className="shrink-0 rounded-md border border-amber-200 bg-amber-50 px-2 py-1 text-xs font-semibold text-amber-700">
              {business.rating.toFixed(1)} ({business.reviewCount})
            </div>
          </div>

          <div className="mt-2 space-y-1.5 text-sm text-slate-600">
            <p className="flex items-center gap-2">
              <MapPin className="h-4 w-4 shrink-0 text-slate-500" aria-hidden />
              <span className="truncate tracking-[0.012em]">
                {business.locality}, {business.city}
              </span>
            </p>
            <p className="flex items-center gap-2">
              <Clock3 className="h-4 w-4 shrink-0 text-slate-500" aria-hidden />
              <span
                className={`font-medium tracking-[0.012em] ${
                  business.isOpenNow ? "text-emerald-700" : "text-rose-600"
                }`}
              >
                {business.isOpenNow ? "Open now" : "Closed"}
              </span>
            </p>
          </div>

          <div className="mt-3 grid grid-cols-2 gap-2">
            <a
              href={`tel:${business.phone}`}
              aria-label={`Call ${business.name}`}
              onClick={() => captureLead("search")}
              className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white text-sm font-medium text-slate-700 transition-colors hover:bg-slate-100"
            >
              <Phone className="h-4 w-4" aria-hidden />
              Call
            </a>
            <motion.a
              whileTap={{ scale: 0.96 }}
              href={whatsappUrl}
              target="_blank"
              rel="noreferrer"
              aria-label={`Chat with ${business.name} on WhatsApp`}
              onClick={() => captureLead("search")}
              className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-green-500 text-sm font-semibold text-white shadow-[0_10px_20px_-12px_rgba(21,128,61,0.6)] transition-colors hover:bg-green-600"
            >
              <MessageCircle className="h-4 w-4" aria-hidden />
              WhatsApp
            </motion.a>
          </div>

          <Link
            href={`/business/${business.id}`}
            onClick={() => captureLead("profile")}
            className="mt-2 inline-flex text-xs font-semibold text-blue-700 hover:text-blue-600"
          >
            View full profile
          </Link>
        </div>
      </div>
    </article>
  );
}
