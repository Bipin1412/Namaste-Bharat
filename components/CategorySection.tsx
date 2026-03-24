"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  BriefcaseBusiness,
  Car,
  ChevronRight,
  CircleDollarSign,
  Flower2,
  GraduationCap,
  Hammer,
  HeartPulse,
  Hotel,
  House,
  MonitorSmartphone,
  PackageOpen,
  PaintbrushVertical,
  Scale,
  Search,
  Scissors,
  Store,
  Truck,
  UtensilsCrossed,
  Wrench,
  X,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

type CategoryItem = {
  label: string;
  iconKey: string;
  count?: number;
};

type CategorySectionProps = {
  categories: CategoryItem[];
};

const iconMap: Record<string, LucideIcon> = {
  briefcase: BriefcaseBusiness,
  car: Car,
  education: GraduationCap,
  finance: CircleDollarSign,
  flower: Flower2,
  hammer: Hammer,
  health: HeartPulse,
  hotel: Hotel,
  house: House,
  package: PackageOpen,
  paint: PaintbrushVertical,
  scale: Scale,
  scissors: Scissors,
  store: Store,
  tech: MonitorSmartphone,
  transport: Truck,
  utensils: UtensilsCrossed,
  wrench: Wrench,
};

function categoryAccent(index: number): string {
  const accents = [
    "bg-amber-50 text-amber-600",
    "bg-sky-50 text-sky-600",
    "bg-rose-50 text-rose-600",
    "bg-emerald-50 text-emerald-600",
    "bg-violet-50 text-violet-600",
    "bg-cyan-50 text-cyan-600",
  ];

  return accents[index % accents.length];
}

function CategoryTile({
  label,
  iconKey,
  count,
  index,
}: CategoryItem & { index: number }) {
  const Icon = iconMap[iconKey] ?? Store;

  return (
    <Link
      href={`/search?q=${encodeURIComponent(label)}`}
      className="group flex flex-col items-center text-center"
    >
      <span className="flex h-[74px] w-[74px] items-center justify-center rounded-[18px] border border-slate-300 bg-white shadow-[0_2px_10px_rgba(15,23,42,0.04)] transition-all duration-200 group-hover:-translate-y-0.5 group-hover:border-slate-400">
        <span
          className={`flex h-11 w-11 items-center justify-center rounded-full ${categoryAccent(index)} transition-transform duration-200 group-hover:scale-105`}
        >
          <Icon className="h-6 w-6" aria-hidden />
        </span>
      </span>
      <p className="mt-3 line-clamp-2 max-w-[108px] text-[13px] font-medium leading-[1.25] text-slate-900">
        {label}
      </p>
      {count ? <p className="mt-1 text-[11px] text-slate-500">{count} listed</p> : null}
    </Link>
  );
}

export default function CategorySection({ categories }: CategorySectionProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");

  const visibleCategories = categories.slice(0, Math.max(0, 19));
  const filteredCategories = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return categories;
    return categories.filter((category) => category.label.toLowerCase().includes(normalized));
  }, [categories, query]);

  useEffect(() => {
    if (!isOpen) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    };

    window.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [isOpen]);

  return (
    <>
      <div className="rounded-[28px] border border-slate-200 bg-white px-4 py-5 shadow-[0_20px_45px_-35px_rgba(15,23,42,0.35)] sm:px-6">
        <div className="mb-5 flex items-center justify-between">
          <p className="text-sm font-semibold text-slate-800 md:text-base">
            Browse by category
          </p>
          <button
            type="button"
            onClick={() => setIsOpen(true)}
            className="text-xs font-medium text-blue-700 transition-colors hover:text-blue-600"
          >
            View all
          </button>
        </div>
        <div className="grid grid-cols-3 gap-x-3 gap-y-6 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-10 lg:gap-x-4 lg:gap-y-8">
          {visibleCategories.map((category, index) => (
            <CategoryTile key={category.label} {...category} index={index} />
          ))}

          <button
            type="button"
            onClick={() => setIsOpen(true)}
            className="group flex flex-col items-center text-center"
          >
            <span className="flex h-[74px] w-[74px] items-center justify-center rounded-[18px] border border-slate-900 bg-white shadow-[0_2px_10px_rgba(15,23,42,0.04)] transition-all duration-200 group-hover:-translate-y-0.5">
              <span className="flex h-11 w-11 items-center justify-center rounded-full bg-blue-600 text-white transition-transform duration-200 group-hover:scale-105">
                <ChevronRight className="h-6 w-6" aria-hidden />
              </span>
            </span>
            <p className="mt-3 max-w-[108px] text-[13px] font-medium leading-[1.25] text-slate-900">
              Popular Categories
            </p>
          </button>
        </div>
      </div>

      <AnimatePresence>
        {isOpen ? (
          <>
            <motion.button
              type="button"
              aria-label="Close popular categories"
              className="fixed inset-0 z-40 bg-slate-950/25"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
            />

            <motion.aside
              className="fixed right-0 top-0 z-50 flex h-dvh w-full max-w-[1120px] flex-col overflow-hidden bg-white shadow-[-18px_0_40px_rgba(15,23,42,0.18)]"
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", stiffness: 280, damping: 30 }}
            >
              <div className="border-b border-slate-200 px-4 py-4 sm:px-6">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => setIsOpen(false)}
                      className="inline-flex h-10 w-10 items-center justify-center rounded-full text-slate-700 transition-colors hover:bg-slate-100"
                      aria-label="Close categories panel"
                    >
                      <X className="h-6 w-6" aria-hidden />
                    </button>
                    <h2 className="text-xl font-semibold text-slate-900">
                      Popular Categories
                    </h2>
                  </div>

                  <label className="hidden min-h-12 min-w-[340px] items-center gap-3 rounded-xl border border-slate-300 bg-white px-4 text-sm text-slate-500 shadow-sm md:flex">
                    <Search className="h-4 w-4 text-slate-400" aria-hidden />
                    <input
                      type="search"
                      value={query}
                      onChange={(event) => setQuery(event.target.value)}
                      placeholder="Search"
                      className="w-full bg-transparent text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none"
                    />
                  </label>
                </div>

                <label className="mt-4 flex min-h-12 items-center gap-3 rounded-xl border border-slate-300 bg-white px-4 text-sm text-slate-500 shadow-sm md:hidden">
                  <Search className="h-4 w-4 text-slate-400" aria-hidden />
                  <input
                    type="search"
                    value={query}
                    onChange={(event) => setQuery(event.target.value)}
                    placeholder="Search"
                    className="w-full bg-transparent text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none"
                  />
                </label>
              </div>

              <div className="flex-1 overflow-y-auto px-4 py-6 sm:px-6">
                <div className="grid grid-cols-1 gap-x-8 gap-y-5 sm:grid-cols-2 lg:grid-cols-4">
                  {filteredCategories.map((category, index) => {
                    const Icon = iconMap[category.iconKey] ?? Store;

                    return (
                      <Link
                        key={category.label}
                        href={`/search?q=${encodeURIComponent(category.label)}`}
                        onClick={() => setIsOpen(false)}
                        className="flex items-start gap-3 rounded-xl px-3 py-2 transition-colors hover:bg-slate-100"
                      >
                        <span
                          className={`mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${categoryAccent(index)}`}
                        >
                          <Icon className="h-5 w-5" aria-hidden />
                        </span>
                        <div className="min-w-0">
                          <p className="text-lg font-medium leading-6 text-slate-900">
                            {category.label}
                          </p>
                          {category.count ? (
                            <p className="mt-1 text-xs text-slate-500">
                              {category.count} listed
                            </p>
                          ) : null}
                        </div>
                      </Link>
                    );
                  })}
                </div>

                {filteredCategories.length === 0 ? (
                  <div className="flex h-40 items-center justify-center text-sm text-slate-500">
                    No categories match your search.
                  </div>
                ) : null}
              </div>
            </motion.aside>
          </>
        ) : null}
      </AnimatePresence>
    </>
  );
}
