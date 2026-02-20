import Link from "next/link";
import { KeyRound } from "lucide-react";
import ForgotPasswordForm from "@/components/auth/ForgotPasswordForm";

export default function ForgotPasswordPage() {
  return (
    <div className="min-h-dvh bg-slate-50">
      <section className="mx-auto max-w-7xl px-4 pb-24 pt-6 md:px-6 lg:px-8">
        <div className="mx-auto grid max-w-4xl gap-4 lg:grid-cols-[1.1fr,1fr]">
          <div className="rounded-2xl bg-gradient-to-r from-indigo-700 to-blue-700 p-6 text-white">
            <p className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-blue-100">
              <KeyRound className="h-3.5 w-3.5" aria-hidden />
              Reset Password
            </p>
            <h1 className="mt-2 text-3xl font-semibold leading-tight">
              Forgot your password?
            </h1>
            <p className="mt-2 text-sm text-blue-100">
              Enter your account email and we will send a secure password reset link.
            </p>
            <div className="mt-5 rounded-xl bg-white/15 p-3 text-sm text-blue-50">
              Use the latest email link. The reset token can expire after a short time.
            </div>
            <Link
              href="/login"
              className="mt-4 inline-flex text-sm font-semibold text-white underline"
            >
              Back to login
            </Link>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_16px_30px_-22px_rgba(15,23,42,0.35)]">
            <p className="text-lg font-semibold text-slate-900">Request reset link</p>
            <p className="mb-4 text-sm text-slate-600">
              We will email you instructions to reset your password.
            </p>
            <ForgotPasswordForm />
          </div>
        </div>
      </section>
    </div>
  );
}
