"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import homePageBanner from "@/assests/home_page-banner.jpeg";
import homePageBanner2 from "@/assests/home_page-banner2.jpeg";
import homePageMobile from "@/assests/home_page-mobile.jpeg";
import homePageMobile2 from "@/assests/home_page-mobile2.jpeg";

type OfferBannerSlotProps = {
  title?: string;
  subtitle?: string;
  className?: string;
};

export default function OfferBannerSlot({
  title = "Festival Offer Banner",
  subtitle = "Place campaign creative here (desktop 1200x240, mobile 640x200).",
  className,
}: OfferBannerSlotProps) {
  const desktopBanners = [homePageBanner, homePageBanner2];
  const mobileBanners = [homePageMobile, homePageMobile2];
  const [isMobile, setIsMobile] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const banners = isMobile ? mobileBanners : desktopBanners;

  useEffect(() => {
    const mediaQuery = window.matchMedia("(max-width: 639px)");
    const sync = () => setIsMobile(mediaQuery.matches);
    sync();
    mediaQuery.addEventListener("change", sync);
    return () => mediaQuery.removeEventListener("change", sync);
  }, []);

  useEffect(() => {
    setActiveIndex(0);
  }, [isMobile]);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % banners.length);
    }, 3500);

    return () => window.clearInterval(timer);
  }, [banners.length]);

  return (
    <section
      aria-label="Offer banner placeholder"
      className={`overflow-hidden rounded-2xl border border-orange-200 bg-gradient-to-r from-amber-50 to-orange-50 p-2 md:p-3 ${className ?? ""}`}
    >
      <div className="relative h-52 overflow-hidden rounded-xl border border-orange-200 bg-white sm:h-56 md:h-64 lg:h-72">
        <div
          className="flex h-full w-full transition-transform duration-700 ease-in-out"
          style={{ transform: `translateX(-${activeIndex * 100}%)` }}
        >
          {banners.map((banner, index) => (
            <div key={index} className="relative h-full min-w-full bg-black">
              <Image
                src={banner}
                alt={`${title} ${index + 1}`}
                fill
                className="object-contain sm:object-cover"
                priority={index === 0}
              />
            </div>
          ))}
        </div>
      </div>
      <div className="mt-2 flex items-center justify-center gap-1.5">
        {banners.map((_, index) => (
          <button
            key={index}
            type="button"
            onClick={() => setActiveIndex(index)}
            className={`h-1.5 rounded-full transition-all ${
              activeIndex === index ? "w-5 bg-orange-500" : "w-2.5 bg-orange-300"
            }`}
            aria-label={`Go to banner ${index + 1}`}
          />
        ))}
      </div>
      <p className="sr-only">{subtitle}</p>
      <div aria-hidden className="sr-only">
        {title}
      </div>
    </section>
  );
}
