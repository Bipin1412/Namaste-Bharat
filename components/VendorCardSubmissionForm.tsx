"use client";

import { FormEvent, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, Loader2, PlusSquare } from "lucide-react";

type VendorFormState = {
  businessName: string;
  ownerName: string;
  mobileNumber: string;
  website: string;
  email: string;
  address: string;
  city: string;
  pincode: string;
  businessType: string;
  businessInfo: string;
};

const initialState: VendorFormState = {
  businessName: "",
  ownerName: "",
  mobileNumber: "",
  website: "",
  email: "",
  address: "",
  city: "",
  pincode: "",
  businessType: "",
  businessInfo: "",
};

const businessTypeOptions = ["Product Seller", "Service", "Other"];

function normalizeDigits(value: string, maxLength: number) {
  return value.replace(/\D/g, "").slice(0, maxLength);
}

function toWebsite(value: string) {
  const trimmed = value.trim();
  if (!trimmed) {
    return "";
  }
  if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
    return trimmed;
  }
  return `https://${trimmed}`;
}

export default function VendorCardSubmissionForm() {
  const router = useRouter();
  const [form, setForm] = useState<VendorFormState>(initialState);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);

  const canSubmit = useMemo(() => {
    return (
      form.businessName.trim().length > 1 &&
      form.ownerName.trim().length > 1 &&
      form.mobileNumber.length >= 10 &&
      form.address.trim().length > 4 &&
      form.city.trim().length > 1 &&
      form.pincode.length === 6 &&
      form.businessType.trim().length > 0 &&
      form.businessInfo.trim().length > 10
    );
  }, [form]);

  function setField<K extends keyof VendorFormState>(key: K, value: VendorFormState[K]) {
    if (key === "mobileNumber") {
      setForm((prev) => ({ ...prev, mobileNumber: normalizeDigits(value, 10) }));
      return;
    }
    if (key === "pincode") {
      setForm((prev) => ({ ...prev, pincode: normalizeDigits(value, 6) }));
      return;
    }
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!canSubmit || isSubmitting) {
      return;
    }

    setIsSubmitting(true);
    setMessage("");
    setIsSuccess(false);

    try {
      const digits = form.mobileNumber;
      const phone = digits.length > 10 ? digits : `91${digits}`;
      const payload = {
        name: form.businessName.trim(),
        category: form.businessType.trim(),
        tagline: `Owner: ${form.ownerName.trim()}`,
        description: form.businessInfo.trim(),
        locality: form.city.trim(),
        city: form.city.trim(),
        addressLine1: form.address.trim(),
        pincode: form.pincode.trim(),
        ownerName: form.ownerName.trim(),
        email: form.email.trim() || undefined,
        website: toWebsite(form.website),
        rating: 0,
        reviewCount: 0,
        isOpenNow: true,
        verified: false,
        phone,
        whatsappNumber: phone,
        keywords: ["vendor-card", form.businessName.trim(), form.city.trim()],
        serviceAreas: [form.city.trim()],
      };

      const response = await fetch("/api/businesses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const responsePayload = (await response.json().catch(() => null)) as
        | { error?: { message?: string } }
        | null;

      if (!response.ok) {
        throw new Error(responsePayload?.error?.message ?? "Could not create vendor card.");
      }

      setForm(initialState);
      setIsSuccess(true);
      setMessage("Vendor card created and added to search.");
      router.refresh();
    } catch (error) {
      setIsSuccess(false);
      setMessage(error instanceof Error ? error.message : "Could not create vendor card.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-[0_16px_30px_-22px_rgba(15,23,42,0.35)]">
      <div className="mb-3">
        <p className="inline-flex items-center gap-2 rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.12em] text-blue-700">
          <PlusSquare className="h-3.5 w-3.5" aria-hidden />
          Create Vendor Card
        </p>
        <p className="mt-2 text-sm text-slate-600">
          Submit details to create a card below. These listings are also searchable from the search bar.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="grid gap-3 md:grid-cols-2">
        <input
          value={form.businessName}
          onChange={(event) => setField("businessName", event.target.value)}
          placeholder="Business Name"
          className="h-11 rounded-lg border border-slate-300 px-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none"
        />
        <input
          value={form.ownerName}
          onChange={(event) => setField("ownerName", event.target.value)}
          placeholder="Owner Name"
          className="h-11 rounded-lg border border-slate-300 px-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none"
        />
        <input
          value={form.mobileNumber}
          onChange={(event) => setField("mobileNumber", event.target.value)}
          placeholder="Mobile Number"
          className="h-11 rounded-lg border border-slate-300 px-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none"
        />
        <input
          value={form.email}
          onChange={(event) => setField("email", event.target.value)}
          placeholder="Email (optional)"
          className="h-11 rounded-lg border border-slate-300 px-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none"
        />
        <input
          value={form.website}
          onChange={(event) => setField("website", event.target.value)}
          placeholder="Website (optional)"
          className="h-11 rounded-lg border border-slate-300 px-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none"
        />
        <input
          value={form.city}
          onChange={(event) => setField("city", event.target.value)}
          placeholder="City"
          className="h-11 rounded-lg border border-slate-300 px-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none"
        />
        <input
          value={form.pincode}
          onChange={(event) => setField("pincode", event.target.value)}
          placeholder="Pincode"
          className="h-11 rounded-lg border border-slate-300 px-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none"
        />
        <select
          value={form.businessType}
          onChange={(event) => setField("businessType", event.target.value)}
          className="h-11 rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-900 focus:border-blue-500 focus:outline-none"
        >
          <option value="">Business Type</option>
          {businessTypeOptions.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
        <textarea
          value={form.address}
          onChange={(event) => setField("address", event.target.value)}
          placeholder="Address"
          rows={3}
          className="rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none md:col-span-2"
        />
        <textarea
          value={form.businessInfo}
          onChange={(event) => setField("businessInfo", event.target.value)}
          placeholder="Business Information"
          rows={4}
          className="rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none md:col-span-2"
        />
        <div className="md:col-span-2">
          <button
            type="submit"
            disabled={!canSubmit || isSubmitting}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 text-sm font-semibold text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-300"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                Creating...
              </>
            ) : (
              "Create Vendor Card"
            )}
          </button>
        </div>
      </form>

      {message ? (
        <p
          className={`mt-3 inline-flex items-center gap-1 rounded-md px-3 py-2 text-sm ${
            isSuccess ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"
          }`}
        >
          {isSuccess ? <CheckCircle2 className="h-4 w-4" aria-hidden /> : null}
          {message}
        </p>
      ) : null}
    </section>
  );
}
