"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { LucideIcon } from "lucide-react";
import {
  BriefcaseBusiness,
  Compass,
  Home,
  Search,
  UserRound,
} from "lucide-react";

type NavItem = {
  href: string;
  label: string;
  compactLabel?: string;
  compactIconClassName?: string;
  Icon: LucideIcon;
};

const navItems: NavItem[] = [
  { href: "/", label: "Home", Icon: Home },
  { href: "/free-listing", label: "List", Icon: BriefcaseBusiness },
  {
    href: "/daily-inquiry",
    label: "Daily Inquiry",
    compactLabel: "Daily\nInquiry",
    compactIconClassName: "[@media(max-width:359px)]:-translate-x-1",
    Icon: Compass,
  },
  { href: "/search", label: "Search", Icon: Search },
  { href: "/profile", label: "Profile", Icon: UserRound },
];

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Primary"
      className="fixed inset-x-0 bottom-0 z-50 border-t border-slate-200 bg-white/95 pb-[env(safe-area-inset-bottom)] shadow-[0_-8px_24px_-16px_rgba(15,23,42,0.35)] backdrop-blur-lg md:hidden"
    >
      <ul className="mx-auto grid h-[4.4rem] w-full max-w-xl grid-cols-5 px-1 [@media(min-width:360px)]:h-16 [@media(min-width:360px)]:px-2">
        {navItems.map(({ href, label, compactLabel, compactIconClassName, Icon }) => {
          const isActive = pathname === href;

          return (
            <li key={href} className="h-full min-w-0">
              <Link
                href={href}
                className={`flex h-full w-full min-w-0 flex-col items-center justify-center gap-0.5 rounded-xl px-0.5 text-center transition-colors [@media(min-width:360px)]:gap-1 ${
                  isActive
                    ? "text-blue-700"
                    : "text-slate-500 hover:text-slate-900"
                }`}
              >
                <Icon
                  className={`h-5 w-5 shrink-0 ${compactIconClassName ?? ""}`}
                  aria-hidden
                />
                <span className="hidden text-[11px] font-medium tracking-wide [@media(min-width:360px)]:block">
                  {label}
                </span>
                <span className="block whitespace-pre-line text-center text-[9px] font-medium leading-[1.05] tracking-normal [@media(min-width:360px)]:hidden">
                  {compactLabel ?? label}
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
