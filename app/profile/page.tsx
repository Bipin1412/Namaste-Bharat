"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  BadgeCheck,
  Building2,
  LogIn,
  MessageCircle,
  Phone,
  ShieldCheck,
} from "lucide-react";
import LogoutButton from "@/components/auth/LogoutButton";
import OfferBannerSlot from "@/components/OfferBannerSlot";
import { getAuthToken } from "@/lib/auth-client";

type Profile = {
  full_name: string | null;
  phone: string | null;
  role: string | null;
};

type CurrentUser = {
  id: string;
  email: string | null;
};

export default function ProfilePage() {
  const [user, setUser] = useState<CurrentUser | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function loadSession() {
      const token = getAuthToken();
      if (!token) {
        if (isMounted) {
          setUser(null);
          setProfile(null);
        }
        return;
      }

      const response = await fetch("/api/auth/me", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }).catch(() => null);

      if (!response || !response.ok) {
        if (isMounted) {
          setUser(null);
          setProfile(null);
        }
        return;
      }

      const payload = (await response.json().catch(() => null)) as
        | {
            user?: { id?: string; email?: string | null } | null;
            profile?: Profile | null;
          }
        | null;

      if (!isMounted) {
        return;
      }

      const nextUser =
        payload?.user?.id && typeof payload.user.id === "string"
          ? {
              id: payload.user.id,
              email: payload.user.email ?? null,
            }
          : null;
      setUser(nextUser);
      setProfile(payload?.profile ?? null);
    }

    void loadSession();

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <div className="min-h-dvh bg-slate-50 px-4 pb-24 pt-4 md:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-4">
        <OfferBannerSlot title="Account and Seller Dashboard" />

        {!user ? (
          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_20px_40px_-28px_rgba(15,23,42,0.35)]">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs uppercase tracking-[0.16em] text-slate-500">
                  Account
                </p>
                <h1 className="mt-2 text-2xl font-semibold leading-tight tracking-[0.01em] text-slate-900">
                  Login to continue
                </h1>
                <p className="mt-2 max-w-xl text-sm text-slate-600">
                  Access your profile, manage listings, and track leads with a
                  secure login.
                </p>
              </div>
              <span className="inline-flex items-center gap-1 rounded-full bg-blue-100 px-2 py-1 text-xs font-medium text-blue-700">
                <ShieldCheck className="h-3.5 w-3.5" aria-hidden />
                Secure
              </span>
            </div>

            <div className="mt-5 grid gap-3 md:grid-cols-2">
              <Link
                href="/login?next=/profile"
                className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-blue-600 text-sm font-semibold text-white transition-colors hover:bg-blue-700"
              >
                <LogIn className="h-4 w-4" aria-hidden />
                Login with Email
              </Link>

              <button
                type="button"
                disabled
                className="inline-flex h-11 cursor-not-allowed items-center justify-center gap-2 rounded-lg border border-slate-300 bg-slate-100 px-3 text-sm font-semibold text-slate-500"
              >
                <span className="inline-flex h-6 w-6 items-center justify-center rounded-full border border-slate-200 text-[14px] font-bold text-blue-600">
                  G
                </span>
                Google Login (coming soon)
              </button>
            </div>

            <p className="mt-3 text-sm text-slate-600">
              New user?{" "}
              <Link
                href="/register?next=/profile"
                className="font-semibold text-blue-700 hover:text-blue-600"
              >
                Register here
              </Link>
            </p>
          </section>
        ) : (
          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_20px_40px_-28px_rgba(15,23,42,0.35)]">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs uppercase tracking-[0.16em] text-slate-500">
                  Logged In Account
                </p>
                <h1 className="mt-2 text-2xl font-semibold leading-tight tracking-[0.01em] text-slate-900">
                  {profile?.full_name ?? "User"}
                </h1>
                <p className="mt-1 text-sm text-slate-600">
                  {user.email ? `${user.email} | ` : ""}
                  {profile?.phone ?? "Phone not added"}
                </p>
                {profile?.role ? (
                  <p className="mt-1 text-xs uppercase tracking-[0.14em] text-slate-500">
                    Role: {profile.role}
                  </p>
                ) : null}
              </div>
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-1 text-xs font-medium text-emerald-700">
                <BadgeCheck className="h-3.5 w-3.5" aria-hidden />
                Verified Session
              </span>
            </div>

            <div className="mt-5 space-y-3 text-sm text-slate-600">
              <p className="flex items-center gap-2 tracking-[0.012em]">
                <Building2 className="h-4 w-4 text-slate-500" aria-hidden />
                Manage business details, leads, and account settings from this
                profile area.
              </p>
              <p className="leading-relaxed tracking-[0.012em]">
                For seller onboarding, use Free Listing and update your details
                after verification.
              </p>
            </div>

            <div className="mt-6 grid grid-cols-2 gap-2 md:max-w-sm">
              <a
                href="tel:+919876543210"
                className="inline-flex h-11 items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white text-sm font-medium text-slate-700 transition-colors hover:bg-slate-100"
              >
                <Phone className="h-4 w-4" aria-hidden />
                Support Call
              </a>
              <a
                href="https://wa.me/919876543210"
                target="_blank"
                rel="noreferrer"
                className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-green-500 text-sm font-semibold text-white shadow-[0_10px_20px_-12px_rgba(21,128,61,0.6)] transition-colors hover:bg-green-600"
              >
                <MessageCircle className="h-4 w-4" aria-hidden />
                WhatsApp
              </a>
            </div>

            <div className="mt-4">
              <LogoutButton />
            </div>
          </section>
        )}

        <div className="mt-2 flex flex-wrap gap-2">
          <Link
            href="/free-listing"
            className="inline-flex items-center rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            Go to Free Listing
          </Link>
          <Link
            href="/seller/dashboard"
            className="inline-flex items-center rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            Seller Dashboard
          </Link>
          <Link
            href="/seller/leads"
            className="inline-flex items-center rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            Seller Leads
          </Link>
          <Link
            href="/seller/analytics"
            className="inline-flex items-center rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            Seller Analytics
          </Link>
          {profile?.role === "admin" ? (
            <Link
              href="/admin"
              className="inline-flex items-center rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              Admin Dashboard
            </Link>
          ) : null}
          <Link
            href="/client-demo"
            className="inline-flex items-center rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            Client Demo Pack
          </Link>
          <Link
            href="/discover"
            className="inline-flex items-center rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            Go to Discovery Feed
          </Link>
        </div>
      </div>
    </div>
  );
}
