"use client";

import Link from "next/link";
import { FormEvent, useEffect, useMemo, useState } from "react";
import { CheckCircle2, Loader2 } from "lucide-react";

function getRecoveryTokenFromHash() {
  if (typeof window === "undefined") {
    return "";
  }
  const raw = window.location.hash.startsWith("#")
    ? window.location.hash.slice(1)
    : window.location.hash;
  const params = new URLSearchParams(raw);
  return params.get("access_token") || "";
}

export default function ResetPasswordForm() {
  const [token, setToken] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    setToken(getRecoveryTokenFromHash());
  }, []);

  const canSubmit = useMemo(
    () =>
      Boolean(token) &&
      password.length >= 6 &&
      confirmPassword.length >= 6 &&
      password === confirmPassword,
    [token, password, confirmPassword]
  );

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!canSubmit || isSubmitting) {
      return;
    }

    setIsSubmitting(true);
    setError("");
    setMessage("");

    try {
      const response = await fetch(`/api/auth/password/reset/confirm`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ password }),
      });

      const payload = (await response.json().catch(() => null)) as
        | { error?: { message?: string }; message?: string }
        | null;

      if (!response.ok) {
        throw new Error(payload?.error?.message ?? "Unable to reset password.");
      }

      setMessage(payload?.message ?? "Password has been reset. Please login.");
      setPassword("");
      setConfirmPassword("");
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : "Unable to reset password right now."
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  if (!token) {
    return (
      <div className="space-y-3">
        <p className="rounded-md bg-amber-50 px-3 py-2 text-sm text-amber-800">
          Recovery link is missing or expired. Open the latest reset email link again.
        </p>
        <Link href="/forgot-password" className="text-sm font-semibold text-blue-700 hover:text-blue-600">
          Request new reset link
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <form onSubmit={handleSubmit} className="space-y-3">
        <div>
          <label
            htmlFor="new-password"
            className="mb-1 block text-sm font-medium text-slate-700"
          >
            New Password
          </label>
          <input
            id="new-password"
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="At least 6 characters"
            className="h-11 w-full rounded-lg border border-slate-300 px-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none"
          />
        </div>

        <div>
          <label
            htmlFor="confirm-password"
            className="mb-1 block text-sm font-medium text-slate-700"
          >
            Confirm Password
          </label>
          <input
            id="confirm-password"
            type="password"
            value={confirmPassword}
            onChange={(event) => setConfirmPassword(event.target.value)}
            placeholder="Re-enter password"
            className="h-11 w-full rounded-lg border border-slate-300 px-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none"
          />
        </div>

        <button
          type="submit"
          disabled={!canSubmit || isSubmitting}
          className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-emerald-600 px-3 text-sm font-semibold text-white transition-colors hover:bg-emerald-700 disabled:cursor-not-allowed disabled:bg-emerald-300"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
              Resetting password...
            </>
          ) : (
            <>
              <CheckCircle2 className="h-4 w-4" aria-hidden />
              Update password
            </>
          )}
        </button>
      </form>

      <p className="text-center text-sm text-slate-600">
        Go back to{" "}
        <Link href="/login" className="font-semibold text-blue-700 hover:text-blue-600">
          Login
        </Link>
      </p>

      {error ? (
        <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>
      ) : null}

      {message ? (
        <p className="rounded-md bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
          {message}
        </p>
      ) : null}
    </div>
  );
}
