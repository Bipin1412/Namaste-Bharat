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
  return (
    <section
      aria-label="Offer banner placeholder"
      className={`rounded-2xl border border-orange-200 bg-gradient-to-r from-amber-50 to-orange-50 p-3 md:p-4 ${className ?? ""}`}
    >
      <div className="rounded-xl border border-dashed border-orange-300 bg-white p-4 text-center">
        <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-orange-600">
          {title}
        </p>
        <p className="mt-1 text-sm leading-relaxed tracking-[0.012em] text-slate-600">
          {subtitle}
        </p>
      </div>
    </section>
  );
}
