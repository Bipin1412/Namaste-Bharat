"use client";

import { useEffect, useState } from "react";

export type Testimonial = {
  quote: string;
  name: string;
  business: string;
  location: string;
  highlight: string;
  secondaryHighlight?: string;
};

type TestimonialsCarouselProps = {
  testimonials: Testimonial[];
};

function wrapIndex(index: number, total: number) {
  return (index + total) % total;
}

function getInitials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

export default function TestimonialsCarousel({
  testimonials,
}: TestimonialsCarouselProps) {
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    if (testimonials.length <= 1) return;

    const timer = window.setInterval(() => {
      setActiveIndex((current) => (current + 1) % testimonials.length);
    }, 6000);

    return () => window.clearInterval(timer);
  }, [testimonials.length]);

  const visibleIndexes =
    testimonials.length <= 3
      ? testimonials.map((_, index) => index)
      : [
          wrapIndex(activeIndex - 1, testimonials.length),
          activeIndex,
          wrapIndex(activeIndex + 1, testimonials.length),
        ];

  return (
    <section className="rounded-[30px] border border-slate-200 bg-[linear-gradient(180deg,#ffffff_0%,#f8fafc_100%)] px-5 pb-8 pt-5 shadow-[0_20px_45px_-32px_rgba(15,23,42,0.22)] md:px-8 md:pb-9 md:pt-5">
      <div className="mx-auto max-w-3xl text-center">
        <p className="text-xl font-semibold tracking-[-0.03em] text-slate-900 md:text-3xl">
          Real Stories
        </p>
        <p className="mt-2 text-xs leading-6 text-slate-500 md:text-sm">
          Stories of trust, collaboration, and business growth with Namaste
          Bharat
        </p>
      </div>

      <div className="mt-8 grid gap-4 lg:grid-cols-3">
        {visibleIndexes.map((testimonialIndex, slotIndex) => {
          const testimonial = testimonials[testimonialIndex];
          const isCenterCard =
            testimonials.length === 1 || slotIndex === Math.floor(visibleIndexes.length / 2);

          return (
            <article
              key={`${testimonial.name}-${testimonialIndex}`}
              className={`rounded-[26px] bg-white px-5 pb-6 pt-6 text-center shadow-[0_18px_34px_-28px_rgba(15,23,42,0.18)] transition-all duration-500 ${
                isCenterCard
                  ? "lg:-translate-y-2 lg:shadow-[0_28px_48px_-30px_rgba(15,23,42,0.26)]"
                  : "hidden lg:block lg:opacity-90"
              }`}
            >
              <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full border-[3px] border-amber-400 bg-[linear-gradient(135deg,#eff6ff_0%,#dbeafe_100%)] text-xl font-semibold text-slate-700 shadow-sm">
                {getInitials(testimonial.name)}
              </div>

              <p className="mt-4 text-[0.88rem] italic leading-6 text-slate-600 md:text-[0.95rem] md:leading-7">
                "{testimonial.quote}"
              </p>

              <div className="mt-6">
                <p className="text-lg font-semibold tracking-[-0.03em] text-slate-900">
                  {testimonial.name}
                </p>
                <p className="mt-1 text-xs text-slate-500 md:text-sm">
                  {testimonial.business} | {testimonial.location}
                </p>
              </div>
            </article>
          );
        })}
      </div>

      <div className="mt-6 flex justify-center gap-2">
        {testimonials.map((testimonial, index) => (
          <button
            key={`${testimonial.name}-${index}`}
            type="button"
            onClick={() => setActiveIndex(index)}
            className={`h-2.5 rounded-full transition-all ${
              index === activeIndex
                ? "w-7 bg-blue-600"
                : "w-2.5 bg-slate-300 hover:bg-slate-400"
            }`}
            aria-label={`Go to story ${index + 1}`}
          />
        ))}
      </div>
    </section>
  );
}
