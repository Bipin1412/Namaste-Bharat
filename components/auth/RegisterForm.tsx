"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { FormEvent, useMemo, useState } from "react";
import { Loader2, UserPlus } from "lucide-react";
import { getBackendBaseUrl, saveAuthToken } from "@/lib/auth-client";

export default function RegisterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const nextPath = searchParams.get("next") || "/profile";

  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const canSubmit = useMemo(() => {
    const digits = phone.replace(/\D/g, "");
    const normalizedEmail = email.trim().toLowerCase();
    const validEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail);
    return (
      fullName.trim().length >= 2 &&
      validEmail &&
      digits.length >= 10 &&
      password.length >= 6
    );
  }, [fullName, phone, email, password]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!canSubmit || isSubmitting) {
      return;
    }

    setIsSubmitting(true);
    setError("");
    setMessage("");

    try {
      const response = await fetch(`${getBackendBaseUrl()}/api/auth/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: fullName.trim(),
          phone: phone.trim(),
          email: email.trim().toLowerCase(),
          password,
        }),
      });

      const payload = (await response.json().catch(() => null)) as
        | {
            error?: { message?: string };
            session?: { access_token?: string | null } | null;
            emailConfirmationRequired?: boolean;
          }
        | null;

      if (!response.ok) {
        throw new Error(payload?.error?.message ?? "Unable to register right now.");
      }

      const accessToken = payload?.session?.access_token ?? "";
      if (accessToken) {
        saveAuthToken(accessToken);
        router.push(nextPath);
        router.refresh();
        return;
      }

      if (payload?.emailConfirmationRequired) {
        setMessage(
          "Signup successful. Please verify your email, then login."
        );
        return;
      }

      throw new Error("Signup completed but no session was returned.");
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : "Unable to register right now."
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div>
        <label
          htmlFor="fullName"
          className="mb-1 block text-sm font-medium text-slate-700"
        >
          Full Name
        </label>
        <input
          id="fullName"
          value={fullName}
          onChange={(event) => setFullName(event.target.value)}
          placeholder="Enter full name"
          className="h-11 w-full rounded-lg border border-slate-300 px-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none"
        />
      </div>

      <div>
        <label
          htmlFor="phone"
          className="mb-1 block text-sm font-medium text-slate-700"
        >
          Mobile Number
        </label>
        <input
          id="phone"
          value={phone}
          onChange={(event) => setPhone(event.target.value)}
          placeholder="+91 98765 43210"
          className="h-11 w-full rounded-lg border border-slate-300 px-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none"
        />
      </div>

      <div>
        <label
          htmlFor="email"
          className="mb-1 block text-sm font-medium text-slate-700"
        >
          Email
        </label>
        <input
          id="email"
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder="name@email.com"
          className="h-11 w-full rounded-lg border border-slate-300 px-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none"
        />
      </div>

      <div>
        <label
          htmlFor="registerPassword"
          className="mb-1 block text-sm font-medium text-slate-700"
        >
          Password
        </label>
        <input
          id="registerPassword"
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          placeholder="At least 6 characters"
          className="h-11 w-full rounded-lg border border-slate-300 px-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none"
        />
      </div>

      <button
        type="submit"
        disabled={!canSubmit || isSubmitting}
        className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-blue-600 px-3 text-sm font-semibold text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-300"
      >
        {isSubmitting ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
            Creating account...
          </>
        ) : (
          <>
            <UserPlus className="h-4 w-4" aria-hidden />
            Create Account
          </>
        )}
      </button>

      <button
        type="button"
        disabled
        className="inline-flex h-11 w-full cursor-not-allowed items-center justify-center gap-2 rounded-lg border border-slate-300 bg-slate-100 px-3 text-sm font-semibold text-slate-500"
      >
        <span className="inline-flex h-6 w-6 items-center justify-center rounded-full border border-slate-200 text-[14px] font-bold text-blue-600">
          G
        </span>
        Google Login (coming soon)
      </button>

      <p className="text-center text-sm text-slate-600">
        Already have an account?{" "}
        <Link
          href={`/login?next=${encodeURIComponent(nextPath)}`}
          className="font-semibold text-blue-700 hover:text-blue-600"
        >
          Login
        </Link>
      </p>

      {error ? (
        <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </p>
      ) : null}

      {message ? (
        <p className="rounded-md bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
          {message}
        </p>
      ) : null}
    </form>
  );
}
