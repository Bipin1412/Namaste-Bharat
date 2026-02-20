"use client";

import { FormEvent, useMemo, useState } from "react";
import { CheckCircle2, Loader2 } from "lucide-react";

type ListingPayload = {
  name: string;
  category: string;
  locality: string;
  city: string;
  rating: number;
  reviewCount: number;
  isOpenNow: boolean;
  verified: boolean;
  phone: string;
  whatsappNumber: string;
};

function normalizeIndianPhone(value: string): string {
  const digits = value.replace(/\D/g, "").slice(-10);
  if (digits.length === 0) {
    return "";
  }
  return `+91${digits}`;
}

export default function FreeListingForm() {
  const [businessName, setBusinessName] = useState("");
  const [mobile, setMobile] = useState("");
  const [city, setCity] = useState("");
  const [category, setCategory] = useState("");
  const [locality, setLocality] = useState("");
  const [agreeTerms, setAgreeTerms] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);

  const canSubmit = useMemo(() => {
    return (
      businessName.trim().length > 2 &&
      mobile.replace(/\D/g, "").length >= 10 &&
      city.trim().length > 1 &&
      category.trim().length > 1 &&
      locality.trim().length > 1 &&
      agreeTerms
    );
  }, [agreeTerms, businessName, category, city, locality, mobile]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!canSubmit || isSubmitting) {
      return;
    }

    setIsSubmitting(true);
    setMessage("");
    setIsSuccess(false);

    const phone = normalizeIndianPhone(mobile);
    const payload: ListingPayload = {
      name: businessName.trim(),
      category: category.trim(),
      locality: locality.trim(),
      city: city.trim(),
      rating: 0,
      reviewCount: 0,
      isOpenNow: true,
      verified: false,
      phone,
      whatsappNumber: phone,
    };

    try {
      const response = await fetch("/api/businesses", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorPayload = (await response.json().catch(() => null)) as
          | { error?: { message?: string } }
          | null;
        throw new Error(
          errorPayload?.error?.message ?? "Could not submit free listing."
        );
      }

      setIsSuccess(true);
      setMessage("Listing request submitted. Our team will verify and activate it.");
      setBusinessName("");
      setMobile("");
      setCity("");
      setCategory("");
      setLocality("");
    } catch (error) {
      setIsSuccess(false);
      setMessage(
        error instanceof Error
          ? error.message
          : "Something went wrong. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-2xl border border-slate-200 bg-white p-4 shadow-[0_16px_30px_-20px_rgba(15,23,42,0.35)]"
    >
      <div className="mb-3">
        <p className="text-lg font-semibold text-slate-900">
          List Your Business for FREE
        </p>
        <p className="text-sm text-slate-600">
          Reach local customers on search, reels, and WhatsApp.
        </p>
      </div>

      <div className="grid gap-2">
        <input
          value={businessName}
          onChange={(event) => setBusinessName(event.target.value)}
          placeholder="Business name"
          className="h-11 rounded-lg border border-slate-300 px-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none"
        />
        <input
          value={mobile}
          onChange={(event) => setMobile(event.target.value)}
          placeholder="Mobile number"
          inputMode="numeric"
          className="h-11 rounded-lg border border-slate-300 px-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none"
        />
        <div className="grid gap-2 sm:grid-cols-2">
          <input
            value={city}
            onChange={(event) => setCity(event.target.value)}
            placeholder="City"
            className="h-11 rounded-lg border border-slate-300 px-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none"
          />
          <input
            value={locality}
            onChange={(event) => setLocality(event.target.value)}
            placeholder="Area / Locality"
            className="h-11 rounded-lg border border-slate-300 px-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none"
          />
        </div>
        <input
          value={category}
          onChange={(event) => setCategory(event.target.value)}
          placeholder="Category (e.g. AC Repair, Catering)"
          className="h-11 rounded-lg border border-slate-300 px-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none"
        />
      </div>

      <label className="mt-3 inline-flex items-center gap-2 text-sm text-slate-600">
        <input
          type="checkbox"
          checked={agreeTerms}
          onChange={(event) => setAgreeTerms(event.target.checked)}
          className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
        />
        I agree to terms and privacy policy.
      </label>

      <button
        type="submit"
        disabled={!canSubmit || isSubmitting}
        className="mt-3 inline-flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 text-sm font-semibold text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-300"
      >
        {isSubmitting ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
            Submitting...
          </>
        ) : (
          "Start Free Listing"
        )}
      </button>

      {message ? (
        <p
          className={`mt-2 inline-flex items-center gap-1 rounded-md px-2 py-1 text-sm ${
            isSuccess ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"
          }`}
        >
          {isSuccess ? <CheckCircle2 className="h-4 w-4" aria-hidden /> : null}
          {message}
        </p>
      ) : null}
    </form>
  );
}
