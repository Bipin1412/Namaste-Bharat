import Link from "next/link";
import { LockKeyhole } from "lucide-react";
import LoginForm from "@/components/auth/LoginForm";

export default function LoginPage() {
  return (
    <div className="min-h-dvh bg-slate-50">
      <section className="mx-auto max-w-7xl px-4 pb-24 pt-6 md:px-6 lg:px-8">
        <div className="mx-auto grid max-w-4xl gap-4 lg:grid-cols-[1.1fr,1fr]">
          <div className="rounded-2xl bg-gradient-to-r from-blue-700 to-indigo-700 p-6 text-white">
            <p className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-blue-100">
              <LockKeyhole className="h-3.5 w-3.5" aria-hidden />
              Secure Login
            </p>
            <h1 className="mt-2 text-3xl font-semibold leading-tight">
              Welcome back to Namaste Bharat
            </h1>
            <p className="mt-2 text-sm text-blue-100">
              Login with email and password to access your account.
            </p>
            <div className="mt-5 rounded-xl bg-white/15 p-3 text-sm text-blue-50">
              Tip: New users can quickly create an account from the register
              page and start listing right away.
            </div>
            <Link
              href="/register"
              className="mt-4 inline-flex text-sm font-semibold text-white underline"
            >
              Don&apos;t have an account? Register now
            </Link>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_16px_30px_-22px_rgba(15,23,42,0.35)]">
            <p className="text-lg font-semibold text-slate-900">Login</p>
            <p className="mb-4 text-sm text-slate-600">
              Access your account to manage profile and leads.
            </p>
            <LoginForm />
          </div>
        </div>
      </section>
    </div>
  );
}
