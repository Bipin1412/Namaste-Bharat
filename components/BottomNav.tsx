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
  Icon: LucideIcon;
};

const navItems: NavItem[] = [
  { href: "/", label: "Home", Icon: Home },
  { href: "/free-listing", label: "List", Icon: BriefcaseBusiness },
  { href: "/daily-inquiry", label: "Daily Inquiry", Icon: Compass },
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
      <ul className="mx-auto grid h-16 w-full max-w-xl grid-cols-5 px-2">
        {navItems.map(({ href, label, Icon }) => {
          const isActive = pathname === href;

          return (
            <li key={href} className="h-full">
              <Link
                href={href}
                className={`flex h-full flex-col items-center justify-center gap-1 rounded-xl transition-colors ${
                  isActive
                    ? "text-blue-700"
                    : "text-slate-500 hover:text-slate-900"
                }`}
              >
                <Icon className="h-5 w-5" aria-hidden />
                <span className="text-[11px] font-medium tracking-wide">
                  {label}
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
