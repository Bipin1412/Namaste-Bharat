"use client";

import { FormEvent, useEffect, useState } from "react";

type DailyInquiry = {
  id: string;
  cityName: string;
  inquiryDate: string;
  shortDescription: string;
  phoneNumber: string;
  createdAt: string;
};

export default function DailyInquiryPage() {
  const [cityName, setCityName] = useState("");
  const [inquiryDate, setInquiryDate] = useState("");
  const [shortDescription, setShortDescription] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [inquiries, setInquiries] = useState<DailyInquiry[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  async function loadInquiries() {
    const response = await fetch("/api/daily-inquiries", {
      cache: "no-store",
    }).catch(() => null);

    if (!response || !response.ok) {
      setInquiries([]);
      setIsLoading(false);
      return;
    }

    const payload = (await response.json().catch(() => null)) as
      | { data?: DailyInquiry[] }
      | null;
    setInquiries(Array.isArray(payload?.data) ? payload.data : []);
    setIsLoading(false);
  }

  useEffect(() => {
    void loadInquiries();
  }, []);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");
    setIsSubmitting(true);

    const response = await fetch("/api/daily-inquiries", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        cityName,
        inquiryDate,
        shortDescription,
        phoneNumber,
      }),
    }).catch(() => null);

    if (!response || !response.ok) {
      const payload = (await response?.json().catch(() => null)) as
        | { error?: { message?: string } }
        | null;
      setMessage(payload?.error?.message || "Could not submit inquiry.");
      setIsSubmitting(false);
      return;
    }

    setCityName("");
    setInquiryDate("");
    setShortDescription("");
    setPhoneNumber("");
    setMessage("Inquiry submitted successfully.");
    await loadInquiries();
    setIsSubmitting(false);
  }

  return (
    <div className="min-h-dvh bg-slate-50 px-4 pb-24 pt-4 md:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-4">
        <section className="rounded-2xl border border-slate-200 bg-white p-6">
          <h1 className="text-2xl font-semibold text-slate-900">Daily Inquiry</h1>
          <p className="mt-1 text-sm text-slate-600">
            Submit your inquiry details below.
          </p>

          <form onSubmit={onSubmit} className="mt-4 grid gap-3 md:grid-cols-2">
            <input
              value={cityName}
              onChange={(event) => setCityName(event.target.value)}
              placeholder="City name"
              required
              className="h-11 rounded-lg border border-slate-300 px-3 text-sm"
            />
            <input
              type="date"
              value={inquiryDate}
              onChange={(event) => setInquiryDate(event.target.value)}
              required
              className="h-11 rounded-lg border border-slate-300 px-3 text-sm"
            />
            <input
              value={shortDescription}
              onChange={(event) => setShortDescription(event.target.value)}
              placeholder="Inquiry short description"
              required
              className="h-11 rounded-lg border border-slate-300 px-3 text-sm md:col-span-2"
            />
            <input
              value={phoneNumber}
              onChange={(event) => setPhoneNumber(event.target.value)}
              placeholder="Phone number"
              required
              className="h-11 rounded-lg border border-slate-300 px-3 text-sm"
            />
            <button
              type="submit"
              disabled={isSubmitting}
              className="h-11 rounded-lg bg-blue-600 px-4 text-sm font-semibold text-white disabled:opacity-70"
            >
              {isSubmitting ? "Submitting..." : "Submit"}
            </button>
          </form>

          {message ? <p className="mt-3 text-sm text-slate-700">{message}</p> : null}
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-6">
          <p className="text-lg font-semibold text-slate-900">Recent Inquiries</p>
          {isLoading ? (
            <p className="mt-3 text-sm text-slate-600">Loading inquiries...</p>
          ) : inquiries.length === 0 ? (
            <p className="mt-3 text-sm text-slate-600">No inquiries yet.</p>
          ) : (
            <div className="mt-3 space-y-2">
              {inquiries.map((item) => (
                <article key={item.id} className="rounded-lg border border-slate-200 p-3">
                  <p className="text-sm font-semibold text-slate-900">
                    {item.cityName} | {item.inquiryDate}
                  </p>
                  <p className="mt-1 text-sm text-slate-700">{item.shortDescription}</p>
                  <p className="mt-1 text-xs text-slate-500">
                    Phone: {item.phoneNumber}
                  </p>
                </article>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
