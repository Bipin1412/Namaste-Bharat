"use client";

import type { ReactNode } from "react";
import { motion } from "framer-motion";
import { BadgeCheck, Heart, MessageCircle, Share2 } from "lucide-react";

export type VideoReel = {
  id: string;
  businessId?: string;
  vendorName: string;
  handle: string;
  description: string;
  city: string;
  verified?: boolean;
};

type VideoFeedProps = {
  reels?: VideoReel[];
};

const demoReels: VideoReel[] = [
  {
    id: "r-1",
    businessId: "b-1",
    vendorName: "Shree Laxmi Furniture",
    handle: "@shreelaxmifurniture",
    description: "Solid teak dining sets. Fast delivery across Pune and PCMC.",
    city: "Pune",
    verified: true,
  },
  {
    id: "r-2",
    businessId: "b-2",
    vendorName: "Kokan Fresh Mart",
    handle: "@kokanfreshmart",
    description: "Direct-from-farm alphonso pulps and kokum syrups for bulk buyers.",
    city: "Ratnagiri",
    verified: true,
  },
  {
    id: "r-3",
    businessId: "b-3",
    vendorName: "Nisha Beauty Studio",
    handle: "@nishabeautystudio",
    description: "Bridal trial slots open this week. Natural glam and matte looks.",
    city: "Nagpur",
    verified: false,
  },
];

function ActionButton({
  label,
  children,
  className,
}: {
  label: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <motion.button
      type="button"
      aria-label={label}
      whileTap={{ scale: 0.92 }}
      className={`grid h-12 w-12 place-items-center rounded-full border border-white/35 bg-white/20 text-white shadow-lg backdrop-blur-md ${className ?? ""}`}
    >
      {children}
    </motion.button>
  );
}

export default function VideoFeed({ reels = demoReels }: VideoFeedProps) {
  function captureLead(reel: VideoReel) {
    if (!reel.businessId) {
      return;
    }

    void fetch("/api/leads", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        businessId: reel.businessId,
        name: "Anonymous Visitor",
        phone: "9999999999",
        message: `Interested via reel: ${reel.vendorName}`,
        source: "reel",
      }),
    }).catch(() => {
      // Avoid blocking reels interaction on telemetry failure.
    });
  }

  return (
    <section
      aria-label="Business discovery reels"
      className="h-dvh snap-y snap-mandatory overflow-y-auto overscroll-y-contain scroll-smooth bg-slate-100 pb-20 md:mx-auto md:h-[calc(100dvh-8.5rem)] md:max-w-xl md:rounded-2xl md:border md:border-slate-200 md:pb-0"
    >
      {reels.map((reel) => {
        const whatsappText = encodeURIComponent(
          `Namaste ${reel.vendorName}, I found your business on Namaste Bharat.`
        );

        return (
          <article
            key={reel.id}
            className="relative h-dvh snap-start overflow-hidden bg-slate-200 md:h-[calc(100dvh-8.5rem)]"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-blue-200 via-indigo-200 to-cyan-200" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(37,99,235,0.32),transparent_48%),radial-gradient(circle_at_80%_30%,rgba(249,115,22,0.24),transparent_38%)]" />
            <div className="absolute inset-0 animate-pulse bg-gradient-to-t from-black/35 via-transparent to-black/20" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent" />

            <motion.div
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ amount: 0.4 }}
              transition={{ duration: 0.38, ease: [0.22, 1, 0.36, 1] }}
              className="absolute bottom-24 left-4 right-20 space-y-2 text-white"
            >
              <div className="flex items-center gap-2">
                <p className="text-lg font-semibold leading-snug tracking-[0.01em]">
                  {reel.vendorName}
                </p>
                {reel.verified ? (
                  <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/20 px-2 py-0.5 text-[11px] font-medium text-emerald-300">
                    <BadgeCheck className="h-3.5 w-3.5" aria-hidden />
                    Verified
                  </span>
                ) : null}
              </div>
              <p className="text-sm leading-relaxed tracking-[0.012em] text-slate-100/95">
                {reel.description}
              </p>
              <p className="text-xs tracking-[0.012em] text-slate-300/90">
                {reel.handle} | {reel.city}
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ amount: 0.45 }}
              transition={{ duration: 0.34, delay: 0.08 }}
              className="absolute bottom-24 right-3 flex flex-col items-center gap-3"
            >
              <ActionButton label="Like reel">
                <Heart className="h-5 w-5" aria-hidden />
              </ActionButton>
              <ActionButton label="Share reel">
                <Share2 className="h-5 w-5" aria-hidden />
              </ActionButton>
              <motion.a
                whileTap={{ scale: 0.92 }}
                href={`https://wa.me/?text=${whatsappText}`}
                target="_blank"
                rel="noreferrer"
                aria-label={`Chat with ${reel.vendorName} on WhatsApp`}
                onClick={() => captureLead(reel)}
                className="grid h-12 w-12 place-items-center rounded-full bg-green-500 text-white shadow-lg shadow-green-900/35"
              >
                <MessageCircle className="h-5 w-5" aria-hidden />
              </motion.a>
            </motion.div>
          </article>
        );
      })}
    </section>
  );
}
