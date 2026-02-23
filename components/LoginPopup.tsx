"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import { Loader2, X } from "lucide-react";
import { getBackendBaseUrl, saveAuthToken } from "@/lib/auth-client";
import namasteBharatLogo from "@/assests/nameste-bharat-logo.jpeg";

type LoginPopupProps = {
  open: boolean;
  onClose: () => void;
};

export default function LoginPopup({ open, onClose }: LoginPopupProps) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const canSubmit = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()) && password.length >= 6;

  async function handleSubmit() {
    if (!canSubmit || isSubmitting) {
      return;
    }

    setIsSubmitting(true);
    setError("");

    try {
      const response = await fetch(`${getBackendBaseUrl()}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.trim().toLowerCase(),
          password,
        }),
      });

      const payload = (await response.json().catch(() => null)) as
        | {
            error?: { message?: string };
            session?: { access_token?: string | null } | null;
            profile?: { role?: string | null } | null;
          }
        | null;

      if (!response.ok) {
        throw new Error(payload?.error?.message ?? "Login failed.");
      }

      const accessToken = payload?.session?.access_token ?? "";
      if (!accessToken) {
        throw new Error("Login succeeded but no access token was returned.");
      }

      saveAuthToken(accessToken);
      onClose();

      if (payload?.profile?.role === "admin") {
        router.push("/admin");
      } else {
        router.push("/profile");
      }
      router.refresh();
    } catch (submitError) {
      setError(
        submitError instanceof Error ? submitError.message : "Unable to login right now."
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  function handleClose() {
    setError("");
    onClose();
  }

  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[90] grid place-items-center bg-slate-900/55 p-4 backdrop-blur-[2px]"
          role="dialog"
          aria-modal="true"
          aria-label="Login popup"
        >
          <motion.div
            initial={{ opacity: 0, y: 24, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.98 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="w-full max-w-[520px] rounded-[22px] border border-slate-200 bg-white p-5 shadow-[0_24px_60px_-24px_rgba(15,23,42,0.45)] md:p-6"
          >
            <div className="relative mb-5">
              <button
                type="button"
                onClick={handleClose}
                className="absolute right-0 top-0 inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-slate-200 text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-800"
                aria-label="Close login popup"
              >
                <X className="h-4 w-4" aria-hidden />
              </button>

              <div className="flex flex-col items-center text-center">
                <div className="rounded-md bg-white p-1">
                  <Image
                    src={namasteBharatLogo}
                    alt="Namaste Bharat"
                    className="h-16 w-auto bg-white md:h-20"
                    priority
                  />
                </div>
                <p className="mt-2 text-lg font-medium text-slate-700 whitespace-nowrap">
                  Login for a seamless experience
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label
                  htmlFor="login-email"
                  className="mb-1 block text-sm font-medium text-slate-700"
                >
                  Email
                </label>
                <input
                  id="login-email"
                  type="email"
                  value={email}
                  onChange={(event) => {
                    setEmail(event.target.value);
                    if (error) setError("");
                  }}
                  placeholder="name@email.com"
                  className="h-12 w-full rounded-xl border border-slate-300 px-3 text-base text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label
                  htmlFor="login-password"
                  className="mb-1 block text-sm font-medium text-slate-700"
                >
                  Password
                </label>
                <input
                  id="login-password"
                  type="password"
                  value={password}
                  onChange={(event) => {
                    setPassword(event.target.value);
                    if (error) setError("");
                  }}
                  placeholder="Enter password"
                  className="h-12 w-full rounded-xl border border-slate-300 px-3 text-base text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none"
                />
              </div>

              <button
                type="button"
                onClick={handleSubmit}
                disabled={!canSubmit}
                className="inline-flex h-12 w-full items-center justify-center rounded-xl bg-blue-600 text-lg font-semibold text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-300"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" aria-hidden />
                    Logging in...
                  </>
                ) : (
                  "Login"
                )}
              </button>

              <div className="flex items-center gap-3">
                <div className="h-px flex-1 bg-slate-200" />
                <span className="rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-500">
                  Or Login Using
                </span>
                <div className="h-px flex-1 bg-slate-200" />
              </div>

              <button
                type="button"
                disabled
                className="inline-flex h-12 w-full cursor-not-allowed items-center justify-center gap-3 rounded-xl border border-slate-300 bg-slate-100 text-2xl font-medium text-slate-500"
              >
                <span className="inline-flex h-7 w-7 items-center justify-center rounded-full border border-slate-200 bg-white text-[18px] font-bold text-blue-600">
                  G
                </span>
                Google (coming soon)
              </button>

              <p className="text-center text-sm text-slate-600">
                New user?{" "}
                <Link
                  href="/register?next=/profile"
                  className="font-semibold text-blue-700 hover:text-blue-600"
                >
                  Register here
                </Link>
              </p>

              <button
                type="button"
                onClick={handleClose}
                className="text-sm font-medium text-slate-500 hover:text-slate-700"
              >
                Skip
              </button>

              {error ? (
                <p className="rounded-md bg-red-50 px-2 py-1 text-sm text-red-700">
                  {error}
                </p>
              ) : null}
            </div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
