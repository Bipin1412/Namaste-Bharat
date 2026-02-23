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
import namasteBharatLogo from "@/assests/nameste-bharat-logo.jpeg";

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
        <div className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between gap-3 px-4 lg:gap-6 lg:px-8">
          <Link href="/" className="inline-flex items-center">
            <div className="rounded-md bg-white p-1">
              <Image
                src={namasteBharatLogo}
                alt="Namaste Bharat"
                priority
                className="h-9 w-auto bg-white lg:h-11 xl:h-12"
              />
            </div>
          </Link>

          <nav aria-label="Desktop primary navigation">
            <ul className="flex items-center gap-1">
              {headerItems.map(({ href, label, Icon }) => {
                const isActive = pathname === href;

                return (
                  <li key={href}>
                    <Link
                      href={href}
                      className={`inline-flex h-9 items-center gap-1 rounded-lg px-2 text-xs font-medium transition-colors lg:h-10 lg:gap-2 lg:px-3 lg:text-sm ${
                        isActive
                          ? "bg-blue-50 text-blue-700"
                          : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                      }`}
                    >
                      <Icon className="h-4 w-4" aria-hidden />
                      <span className="hidden xl:inline">{label}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>

          <div className="flex items-center gap-1 lg:gap-2">
            <button
              type="button"
              onClick={() => setIsLoginOpen(true)}
              className="inline-flex h-9 items-center gap-1 rounded-lg border border-slate-300 bg-white px-2 text-xs font-semibold text-slate-700 transition-colors hover:bg-slate-100 lg:h-10 lg:gap-2 lg:px-3 lg:text-sm"
            >
              <LogIn className="h-4 w-4" aria-hidden />
              <span className="lg:hidden">Login</span>
              <span className="hidden lg:inline">Login / Sign Up</span>
            </button>

            <Link
              href="/offers"
              className="inline-flex h-9 items-center gap-1 rounded-lg border border-blue-200 bg-blue-50 px-2 text-xs font-semibold text-blue-700 lg:h-10 lg:gap-2 lg:px-3 lg:text-sm"
            >
              <BadgePercent className="h-4 w-4" aria-hidden />
              <span className="hidden lg:inline">Offers</span>
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
