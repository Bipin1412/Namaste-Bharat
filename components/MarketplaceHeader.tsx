"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import type { LucideIcon } from "lucide-react";
import {
  BadgePercent,
  BriefcaseBusiness,
  Compass,
  Home,
  LogIn,
  Search,
  Sparkles,
  UserRound,
} from "lucide-react";
import LoginPopup from "./LoginPopup";
import namasteBharatLogo from "@/assests/namaste-bharat-logo.jpeg";

type HeaderItem = {
  href: string;
  label: string;
  Icon: LucideIcon;
};

const headerItems: HeaderItem[] = [
  { href: "/", label: "Home", Icon: Home },
  { href: "/free-listing", label: "Free Listing", Icon: BriefcaseBusiness },
  { href: "/discover", label: "Discover", Icon: Compass },
  { href: "/stories", label: "Stories", Icon: Sparkles },
  { href: "/search", label: "Search", Icon: Search },
  { href: "/profile", label: "Account", Icon: UserRound },
];

export default function MarketplaceHeader() {
  const pathname = usePathname();
  const [isLoginOpen, setIsLoginOpen] = useState(false);

  useEffect(() => {
    const hasSeenPrompt = window.localStorage.getItem("nb-login-prompt-seen");
    if (!hasSeenPrompt) {
      setIsLoginOpen(true);
      window.localStorage.setItem("nb-login-prompt-seen", "true");
    }
  }, []);

  return (
    <>
      <header className="sticky top-0 z-40 hidden border-b border-slate-200 bg-white/95 backdrop-blur-md md:block">
        <div className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between gap-6 px-6 lg:px-8">
          <Link href="/" className="inline-flex items-center">
            <Image
              src={namasteBharatLogo}
              alt="Namaste Bharat"
              priority
              className="h-14 w-auto rounded-md bg-white p-1 md:h-16 lg:h-20"
            />
          </Link>

          <nav aria-label="Desktop primary navigation">
            <ul className="flex items-center gap-1">
              {headerItems.map(({ href, label, Icon }) => {
                const isActive = pathname === href;

                return (
                  <li key={href}>
                    <Link
                      href={href}
                      className={`inline-flex h-10 items-center gap-2 rounded-lg px-3 text-sm font-medium transition-colors ${
                        isActive
                          ? "bg-blue-50 text-blue-700"
                          : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                      }`}
                    >
                      <Icon className="h-4 w-4" aria-hidden />
                      {label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setIsLoginOpen(true)}
              className="inline-flex h-10 items-center gap-2 rounded-lg border border-slate-300 bg-white px-3 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-100"
            >
              <LogIn className="h-4 w-4" aria-hidden />
              Login / Sign Up
            </button>

            <Link
              href="/offers"
              className="inline-flex h-10 items-center gap-2 rounded-lg border border-blue-200 bg-blue-50 px-3 text-sm font-semibold text-blue-700"
            >
              <BadgePercent className="h-4 w-4" aria-hidden />
              Offers
            </Link>
          </div>
        </div>
      </header>

      <LoginPopup
        open={isLoginOpen}
        onClose={() => {
          setIsLoginOpen(false);
          window.localStorage.setItem("nb-login-prompt-seen", "true");
        }}
      />
    </>
  );
}
