import Link from "next/link";
import { ShieldCheck } from "lucide-react";
import ResetPasswordForm from "@/components/auth/ResetPasswordForm";

export default function ResetPasswordPage() {
  return (
    <div className="min-h-dvh bg-slate-50">
      <section className="mx-auto max-w-7xl px-4 pb-24 pt-6 md:px-6 lg:px-8">
        <div className="mx-auto grid max-w-4xl gap-4 lg:grid-cols-[1.1fr,1fr]">
          <div className="rounded-2xl bg-gradient-to-r from-emerald-700 to-teal-700 p-6 text-white">
            <p className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-emerald-100">
              <ShieldCheck className="h-3.5 w-3.5" aria-hidden />
              Secure Reset
            </p>
            <h1 className="mt-2 text-3xl font-semibold leading-tight">
              Create a new password
            </h1>
            <p className="mt-2 text-sm text-emerald-100">
              Set a strong password and use it the next time you login.
            </p>
            <div className="mt-5 rounded-xl bg-white/15 p-3 text-sm text-emerald-50">
              This page works only from a valid recovery link sent to your email.
            </div>
            <Link
              href="/forgot-password"
              className="mt-4 inline-flex text-sm font-semibold text-white underline"
            >
              Need a new recovery link?
            </Link>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_16px_30px_-22px_rgba(15,23,42,0.35)]">
            <p className="text-lg font-semibold text-slate-900">Reset password</p>
            <p className="mb-4 text-sm text-slate-600">
              Enter and confirm your new password.
            </p>
            <ResetPasswordForm />
          </div>
        </div>
      </section>
    </div>
  );
}
