import Link from "next/link";
import { UserPlus } from "lucide-react";
import RegisterForm from "@/components/auth/RegisterForm";

export default function RegisterPage() {
  return (
    <div className="min-h-dvh bg-slate-50">
      <section className="mx-auto max-w-7xl px-4 pb-24 pt-6 md:px-6 lg:px-8">
        <div className="mx-auto grid max-w-4xl gap-4 lg:grid-cols-[1.1fr,1fr]">
          <div className="rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 p-6 text-white">
            <p className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-emerald-100">
              <UserPlus className="h-3.5 w-3.5" aria-hidden />
              Create Account
            </p>
            <h1 className="mt-2 text-3xl font-semibold leading-tight">
              Join Namaste Bharat
            </h1>
            <p className="mt-2 text-sm text-emerald-100">
              Register as a user to explore listings, save preferences, and
              manage your profile.
            </p>
            <div className="mt-5 rounded-xl bg-white/15 p-3 text-sm text-emerald-50">
              Business owners can use this account and then submit listing
              details from the onboarding page.
            </div>
            <Link
              href="/free-listing"
              className="mt-4 inline-flex text-sm font-semibold text-white underline"
            >
              Go to Listing page
            </Link>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_16px_30px_-22px_rgba(15,23,42,0.35)]">
            <p className="text-lg font-semibold text-slate-900">Register</p>
            <p className="mb-4 text-sm text-slate-600">
              Create your account in a few steps.
            </p>
            <RegisterForm />
          </div>
        </div>
      </section>
    </div>
  );
}

