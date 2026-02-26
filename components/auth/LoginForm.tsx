"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { FormEvent, useEffect, useMemo, useState } from "react";
import { Loader2, LogIn } from "lucide-react";
import { getBackendBaseUrl, saveAuthToken } from "@/lib/auth-client";

export default function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const nextPath = searchParams.get("next") || "/profile";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [mode, setMode] = useState<"password" | "otp">("password");
  const [otpSent, setOtpSent] = useState(false);
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (searchParams.get("verified") === "1") {
      setError("");
      setMessage("Email verified successfully. Please login.");
    }
  }, [searchParams]);

  const canPasswordSubmit = useMemo(
    () => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()) && password.length >= 6,
    [email, password]
  );
  const normalizedPhone = useMemo(() => {
    const raw = phone.trim();
    if (!raw) {
      return "";
    }
    if (raw.startsWith("+")) {
      return `+${raw.slice(1).replace(/\D/g, "")}`;
    }
    const digits = raw.replace(/\D/g, "");
    return digits ? `+${digits}` : "";
  }, [phone]);
  const canSendOtp = useMemo(() => /^\+[1-9]\d{9,14}$/.test(normalizedPhone), [normalizedPhone]);
  const canVerifyOtp = useMemo(() => canSendOtp && /^\d{4,8}$/.test(otp.trim()), [canSendOtp, otp]);

  async function completeLogin(endpoint: string, body: Record<string, string>) {
    try {
      const response = await fetch(`${getBackendBaseUrl()}${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
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

      if (payload?.profile?.role === "admin") {
        router.push("/admin");
      } else {
        router.push(nextPath);
      }
      router.refresh();
    } catch (error) {
      throw error;
    }
  }

  async function handlePasswordLogin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!canPasswordSubmit || isSubmitting) {
      return;
    }

    setIsSubmitting(true);
    setError("");
    setMessage("");

    try {
      await completeLogin("/api/auth/login", {
        email: email.trim().toLowerCase(),
        password,
      });
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : "Unable to login right now."
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleSendOtp(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!canSendOtp || isSubmitting) {
      return;
    }

    setIsSubmitting(true);
    setError("");
    setMessage("");

    try {
      const response = await fetch(`${getBackendBaseUrl()}/api/auth/login/otp/send`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: normalizedPhone }),
      });

      const payload = (await response.json().catch(() => null)) as
        | {
            error?: { message?: string };
            message?: string;
          }
        | null;

      if (!response.ok) {
        throw new Error(payload?.error?.message ?? "Unable to send OTP.");
      }

      setOtpSent(true);
      setMessage(payload?.message ?? "OTP sent successfully.");
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : "Unable to send OTP right now."
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleVerifyOtp(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!canVerifyOtp || isSubmitting) {
      return;
    }

    setIsSubmitting(true);
    setError("");
    setMessage("");

    try {
      await completeLogin("/api/auth/login/otp/verify", {
        phone: normalizedPhone,
        otp: otp.trim(),
      });
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : "Unable to verify OTP right now."
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-2">
        <button
          type="button"
          onClick={() => {
            setMode("password");
            setError("");
            setMessage("");
          }}
          className={`h-10 rounded-lg border text-sm font-medium transition-colors ${
            mode === "password"
              ? "border-blue-600 bg-blue-50 text-blue-700"
              : "border-slate-300 bg-white text-slate-600 hover:bg-slate-50"
          }`}
        >
          Email Login
        </button>
        <button
          type="button"
          onClick={() => {
            setMode("otp");
            setError("");
            setMessage("");
          }}
          className={`h-10 rounded-lg border text-sm font-medium transition-colors ${
            mode === "otp"
              ? "border-blue-600 bg-blue-50 text-blue-700"
              : "border-slate-300 bg-white text-slate-600 hover:bg-slate-50"
          }`}
        >
          Phone OTP Login
        </button>
      </div>

      {mode === "password" ? (
        <form onSubmit={handlePasswordLogin} className="space-y-3">
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
              htmlFor="password"
              className="mb-1 block text-sm font-medium text-slate-700"
            >
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Enter password"
              className="h-11 w-full rounded-lg border border-slate-300 px-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none"
            />
            <div className="mt-1 text-right">
              <Link
                href="/forgot-password"
                className="text-xs font-semibold text-blue-700 hover:text-blue-600"
              >
                Forgot password?
              </Link>
            </div>
          </div>

          <button
            type="submit"
            disabled={!canPasswordSubmit || isSubmitting}
            className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-blue-600 px-3 text-sm font-semibold text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-300"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                Logging in...
              </>
            ) : (
              <>
                <LogIn className="h-4 w-4" aria-hidden />
                Login
              </>
            )}
          </button>
        </form>
      ) : (
        <div className="space-y-3">
          <form onSubmit={handleSendOtp} className="space-y-3">
            <div>
              <label
                htmlFor="phone"
                className="mb-1 block text-sm font-medium text-slate-700"
              >
                Phone Number
              </label>
              <input
                id="phone"
                type="tel"
                value={phone}
                onChange={(event) => setPhone(event.target.value)}
                placeholder="+919876543210"
                className="h-11 w-full rounded-lg border border-slate-300 px-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none"
              />
              <p className="mt-1 text-xs text-slate-500">
                Use phone in international format with country code.
              </p>
            </div>

            <button
              type="submit"
              disabled={!canSendOtp || isSubmitting}
              className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-blue-600 px-3 text-sm font-semibold text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-300"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                  Sending OTP...
                </>
              ) : (
                "Send OTP"
              )}
            </button>
          </form>

          {otpSent ? (
            <form onSubmit={handleVerifyOtp} className="space-y-3">
              <div>
                <label
                  htmlFor="otp"
                  className="mb-1 block text-sm font-medium text-slate-700"
                >
                  Enter OTP
                </label>
                <input
                  id="otp"
                  value={otp}
                  onChange={(event) => setOtp(event.target.value)}
                  placeholder="Enter OTP"
                  className="h-11 w-full rounded-lg border border-slate-300 px-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none"
                />
              </div>
              <button
                type="submit"
                disabled={!canVerifyOtp || isSubmitting}
                className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-emerald-600 px-3 text-sm font-semibold text-white transition-colors hover:bg-emerald-700 disabled:cursor-not-allowed disabled:bg-emerald-300"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                    Verifying OTP...
                  </>
                ) : (
                  "Verify OTP and Login"
                )}
              </button>
            </form>
          ) : null}
        </div>
      )}

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
        New here?{" "}
        <Link
          href={`/register?next=${encodeURIComponent(nextPath)}`}
          className="font-semibold text-blue-700 hover:text-blue-600"
        >
          Create account
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
    </div>
  );
}
