"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Check, X } from "lucide-react";

type LoginPopupProps = {
  open: boolean;
  onClose: () => void;
};

function normalizePhone(value: string) {
  return value.replace(/\D/g, "");
}

export default function LoginPopup({ open, onClose }: LoginPopupProps) {
  const [phone, setPhone] = useState("");
  const [acceptedTerms, setAcceptedTerms] = useState(true);
  const [feedback, setFeedback] = useState("");

  const numericPhone = useMemo(() => normalizePhone(phone), [phone]);
  const canSubmit = acceptedTerms && numericPhone.length === 10;

  function handleSubmit() {
    if (!acceptedTerms) {
      setFeedback("Please accept terms and conditions.");
      return;
    }

    if (numericPhone.length !== 10) {
      setFeedback("Enter a valid 10-digit mobile number.");
      return;
    }

    setFeedback("Redirecting to phone login...");
    window.location.href = "/login?next=/profile";
  }

  function handleClose() {
    setFeedback("");
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
            <div className="mb-5 flex items-start justify-between gap-4">
              <div className="grid w-full grid-cols-[130px,1px,1fr] items-center gap-4">
                <div>
                  <p className="text-[34px] font-bold leading-none tracking-tight">
                    <span className="text-blue-700">Namaste</span>
                    <span className="text-orange-500">Bharat</span>
                  </p>
                </div>
                <div className="h-12 w-px bg-slate-200" />
                <div>
                  <p className="text-[34px] font-semibold leading-none text-slate-900">
                    Welcome
                  </p>
                  <p className="mt-1 text-[24px] leading-snug text-slate-700">
                    Login for a seamless experience
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={handleClose}
                className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-slate-200 text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-800"
                aria-label="Close login popup"
              >
                <X className="h-4 w-4" aria-hidden />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label
                  htmlFor="login-mobile"
                  className="mb-1 block text-sm font-medium text-slate-700"
                >
                  Enter Mobile Number
                </label>
                <div className="flex h-12 items-center rounded-xl border-2 border-slate-300 px-3">
                  <span className="text-2xl font-medium text-slate-500">+91</span>
                  <span className="mx-3 h-7 w-px bg-slate-300" />
                  <input
                    id="login-mobile"
                    type="tel"
                    inputMode="numeric"
                    maxLength={10}
                    value={phone}
                    onChange={(event) => {
                      setPhone(event.target.value);
                      if (feedback) setFeedback("");
                    }}
                    placeholder="Enter mobile number"
                    className="h-full w-full border-0 bg-transparent text-lg text-slate-900 placeholder:text-slate-400 focus:outline-none"
                  />
                </div>
              </div>

              <label className="inline-flex items-center gap-2 text-sm text-slate-700">
                <input
                  type="checkbox"
                  checked={acceptedTerms}
                  onChange={(event) => {
                    setAcceptedTerms(event.target.checked);
                    if (feedback) setFeedback("");
                  }}
                  className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                />
                I Agree to Terms and Conditions
              </label>

              <p className="-mt-2 text-center text-sm text-slate-500 underline">
                T&amp;C&apos;s Privacy Policy
              </p>

              <button
                type="button"
                onClick={handleSubmit}
                disabled={!canSubmit}
                className="inline-flex h-12 w-full items-center justify-center rounded-xl bg-blue-600 text-lg font-semibold text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-300"
              >
                Login with OTP
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

              {feedback ? (
                <p
                  className={`inline-flex items-center gap-1 rounded-md px-2 py-1 text-sm ${
                    feedback.toLowerCase().includes("success")
                      ? "bg-emerald-50 text-emerald-700"
                      : "bg-amber-50 text-amber-700"
                  }`}
                >
                  <Check className="h-4 w-4" aria-hidden />
                  {feedback}
                </p>
              ) : null}
            </div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
