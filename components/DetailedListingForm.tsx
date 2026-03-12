"use client";

import Link from "next/link";
import { FormEvent, useMemo, useState } from "react";
import {
  Check,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Sparkles,
} from "lucide-react";
import { getAuthToken } from "@/lib/auth-client";
import { listingPlans, type ListingPlanId } from "@/lib/ui/listing-plans";

const steps = [
  "Basic Profile",
  "Contact and Location",
  "Search Visibility",
  "Trust and Operations",
] as const;

const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

function csv(input: string): string[] {
  return input
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

function normalizePhone(value: string): string {
  const digits = value.replace(/\D/g, "").slice(-10);
  return digits ? `+91${digits}` : "";
}

function Input({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  type?: string;
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm font-medium text-slate-700">{label}</span>
      <input
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="h-11 w-full rounded-lg border border-slate-300 px-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none"
      />
    </label>
  );
}

function Textarea({
  label,
  value,
  onChange,
  placeholder,
  rows = 3,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  rows?: number;
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm font-medium text-slate-700">{label}</span>
      <textarea
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        rows={rows}
        className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none"
      />
    </label>
  );
}

type DetailedListingFormProps = {
  adminMode?: boolean;
  onSuccess?: () => void | Promise<void>;
};

export default function DetailedListingForm({
  adminMode = false,
  onSuccess,
}: DetailedListingFormProps) {
  const [step, setStep] = useState(0);
  const [selectedPlan, setSelectedPlan] = useState<ListingPlanId>("basic");

  const [name, setName] = useState("");
  const [category, setCategory] = useState("");
  const [tagline, setTagline] = useState("");
  const [description, setDescription] = useState("");
  const [ownerName, setOwnerName] = useState("");

  const [phone, setPhone] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [city, setCity] = useState("");
  const [locality, setLocality] = useState("");
  const [addressLine1, setAddressLine1] = useState("");
  const [pincode, setPincode] = useState("");
  const [email, setEmail] = useState("");
  const [website, setWebsite] = useState("");

  const [keywords, setKeywords] = useState("");
  const [serviceAreas, setServiceAreas] = useState("");
  const [languages, setLanguages] = useState("English, Hindi, Marathi");
  const [highlights, setHighlights] = useState("");
  const [services, setServices] = useState(
    "Wiring setup|Starts Rs 499|Home and office wiring, MCB repair\nInverter installation|Starts Rs 799|Installation and maintenance"
  );

  const [openTime, setOpenTime] = useState("09:00");
  const [closeTime, setCloseTime] = useState("19:00");
  const [weeklyOff, setWeeklyOff] = useState("Sunday");
  const [paymentMethods, setPaymentMethods] = useState("UPI, Cash, Card");
  const [gstNumber, setGstNumber] = useState("");
  const [licenseNumber, setLicenseNumber] = useState("");
  const [faqOne, setFaqOne] = useState("Do you provide emergency electrician support?|Yes, we offer same-day emergency visits.");
  const [faqTwo, setFaqTwo] = useState("Do you provide GST invoice?|Yes, GST invoices are available for all jobs.");
  const [coverImage, setCoverImage] = useState("/showcase/business-electrical.svg");
  const [gallery, setGallery] = useState("/showcase/business-electrical.svg, /showcase/service-home.svg");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [createdId, setCreatedId] = useState("");

  const validity = useMemo(() => {
    const keywordCount = csv(keywords).length;
    return [
      name.trim().length >= 3 && category.trim().length >= 2 && description.trim().length >= 20,
      phone.replace(/\D/g, "").length >= 10 && city.trim().length >= 2 && locality.trim().length >= 2,
      keywordCount >= 3,
      openTime.length > 0 && closeTime.length > 0,
    ];
  }, [category, city, closeTime, description, keywords, locality, name, openTime, phone]);

  const progress = Math.round(((step + 1) / steps.length) * 100);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!validity.every(Boolean) || isSubmitting) {
      return;
    }

    setIsSubmitting(true);
    setMessage("");
    setCreatedId("");

    const weeklyOffSet = new Set(csv(weeklyOff).map((item) => item.toLowerCase()));
    const serviceItems = services
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean)
      .map((line) => {
        const [serviceName, servicePrice, serviceDesc] = line.split("|").map((part) => part.trim());
        return {
          name: serviceName,
          ...(servicePrice ? { priceLabel: servicePrice } : {}),
          ...(serviceDesc ? { description: serviceDesc } : {}),
        };
      })
      .filter((service) => service.name);

    const faqItems = [faqOne, faqTwo]
      .map((line) => line.split("|").map((part) => part.trim()))
      .filter((parts) => parts[0] && parts[1])
      .map(([question, answer]) => ({ question, answer }));

    const payload: Record<string, unknown> = {
      name: name.trim(),
      category: category.trim(),
      tagline: tagline.trim() || undefined,
      description: description.trim(),
      ownerName: ownerName.trim() || undefined,
      locality: locality.trim(),
      city: city.trim(),
      addressLine1: addressLine1.trim() || undefined,
      pincode: pincode.trim() || undefined,
      phone: normalizePhone(phone),
      whatsappNumber: normalizePhone(whatsapp || phone),
      email: email.trim() || undefined,
      website: website.trim() || undefined,
      rating: 0,
      reviewCount: 0,
      isOpenNow: true,
      verified: adminMode,
      keywords: csv(keywords),
      serviceAreas: csv(serviceAreas),
      languages: csv(languages),
      highlights: csv(highlights),
      services: serviceItems,
      businessHours: days.map((day) =>
        weeklyOffSet.has(day.toLowerCase())
          ? { day, closed: true }
          : { day, open: openTime, close: closeTime, closed: false }
      ),
      faqs: faqItems,
      policies: {
        listingPlan: selectedPlan,
        paymentMethods: csv(paymentMethods),
      },
      media: {
        logo: coverImage.trim() || undefined,
        coverImages: coverImage.trim() ? [coverImage.trim()] : undefined,
        gallery: csv(gallery),
      },
      verification: {
        gstNumber: gstNumber.trim() || undefined,
        licenseNumber: licenseNumber.trim() || undefined,
      },
    };

    try {
      const authToken = adminMode ? getAuthToken() : "";
      const response = await fetch("/api/businesses", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
        },
        body: JSON.stringify(payload),
      });
      const result = (await response.json().catch(() => null)) as
        | { id?: string; error?: { message?: string } }
        | null;

      if (!response.ok) {
        throw new Error(result?.error?.message ?? "Could not create detailed listing.");
      }

      setCreatedId(result?.id ?? "");
      setMessage(
        adminMode
          ? "Listing created from admin panel."
          : "Listing request submitted. Our team will verify and activate it."
      );
      await onSuccess?.();
    } catch (submitError) {
      setMessage(
        submitError instanceof Error ? submitError.message : "Could not save listing."
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_20px_42px_-26px_rgba(15,23,42,0.38)] md:p-6"
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="inline-flex items-center gap-2 rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.12em] text-blue-700">
            <Sparkles className="h-3.5 w-3.5" aria-hidden />
            {adminMode ? "Admin Listing Form" : "Detailed Listing Form"}
          </p>
          <h2 className="mt-2 text-xl font-semibold text-slate-900 md:text-2xl">
            Step {step + 1}: {steps[step]}
          </h2>
        </div>
        <p className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
          {progress}% complete
        </p>
      </div>

      <div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-100">
        <div
          className="h-full rounded-full bg-blue-600 transition-all duration-300"
          style={{ width: `${progress}%` }}
        />
      </div>

      <div className="mt-5 space-y-3">
        {step === 0 ? (
          <div className="space-y-4">
            <div className="grid gap-3 md:grid-cols-2">
              {listingPlans.map((plan) => {
                const isActive = selectedPlan === plan.id;
                return (
                  <button
                    key={plan.id}
                    type="button"
                    onClick={() => setSelectedPlan(plan.id)}
                    className={`rounded-2xl border p-4 text-left transition-colors ${
                      isActive
                        ? "border-blue-500 bg-blue-50 shadow-[0_12px_24px_-18px_rgba(37,99,235,0.55)]"
                        : "border-slate-200 bg-slate-50 hover:border-blue-200 hover:bg-white"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-lg font-semibold text-slate-900">{plan.name}</p>
                        <p className="mt-1 text-sm font-semibold text-blue-700">{plan.priceLabel}</p>
                        <p className="mt-1 text-xs text-slate-500">{plan.description}</p>
                      </div>
                      <span
                        className={`inline-flex h-5 w-5 items-center justify-center rounded-full border text-[10px] font-bold ${
                          isActive
                            ? "border-blue-500 bg-blue-600 text-white"
                            : "border-slate-300 text-transparent"
                        }`}
                      >
                        <Check className="h-3 w-3" aria-hidden />
                      </span>
                    </div>
                    <ul className="mt-3 space-y-1.5 text-sm text-slate-700">
                      {plan.features.map((feature) => (
                        <li key={feature} className="flex items-center gap-2">
                          <span className="inline-flex h-4 w-4 items-center justify-center rounded-full border border-emerald-500 text-[10px] font-bold text-emerald-600">
                            <Check className="h-3 w-3" aria-hidden />
                          </span>
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </button>
                );
              })}
            </div>
            <div className="grid gap-3 md:grid-cols-2">
            <Input label="Business Name" value={name} onChange={setName} placeholder="Sai Electricals and Smart Services" />
            <Input label="Category" value={category} onChange={setCategory} placeholder="Electrical Contractor" />
            <Input label="Tagline" value={tagline} onChange={setTagline} placeholder="24x7 local electrician and wiring experts" />
            <Input label="Owner Name" value={ownerName} onChange={setOwnerName} placeholder="Sachin Kulkarni" />
            <div className="md:col-span-2">
              <Textarea
                label="Business Description"
                value={description}
                onChange={setDescription}
                placeholder="Describe your expertise, experience, trust factors, and what customers can expect."
                rows={5}
              />
            </div>
            </div>
          </div>
        ) : null}

        {step === 1 ? (
          <div className="grid gap-3 md:grid-cols-2">
            <Input label="Phone" value={phone} onChange={setPhone} placeholder="+91 98765 43210" />
            <Input label="WhatsApp" value={whatsapp} onChange={setWhatsapp} placeholder="Leave blank to use same number" />
            <Input label="City" value={city} onChange={setCity} placeholder="Pune" />
            <Input label="Locality" value={locality} onChange={setLocality} placeholder="Kothrud" />
            <Input label="Address" value={addressLine1} onChange={setAddressLine1} placeholder="Shop no. 4, Paud Road" />
            <Input label="Pincode" value={pincode} onChange={setPincode} placeholder="411038" />
            <Input label="Email" value={email} onChange={setEmail} placeholder="support@example.com" />
            <Input label="Website" value={website} onChange={setWebsite} placeholder="https://example.com" />
          </div>
        ) : null}

        {step === 2 ? (
          <div className="space-y-3">
            <Textarea
              label="Keywords (comma separated)"
              value={keywords}
              onChange={setKeywords}
              placeholder="electrician near me, mcb repair, inverter wiring, emergency electrician pune, electrician in kothrud"
              rows={4}
            />
            <Input
              label="Service Areas (comma separated)"
              value={serviceAreas}
              onChange={setServiceAreas}
              placeholder="Kothrud, Karve Nagar, Baner, Aundh"
            />
            <Input
              label="Languages (comma separated)"
              value={languages}
              onChange={setLanguages}
              placeholder="English, Hindi, Marathi"
            />
            <Input
              label="Highlights (comma separated)"
              value={highlights}
              onChange={setHighlights}
              placeholder="GST invoice, 30-min support, certified technicians"
            />
            <Textarea
              label="Services (one per line: name|price|description)"
              value={services}
              onChange={setServices}
              rows={4}
            />
          </div>
        ) : null}

        {step === 3 ? (
          <div className="grid gap-3 md:grid-cols-2">
            <Input label="Opening Time" value={openTime} onChange={setOpenTime} type="time" />
            <Input label="Closing Time" value={closeTime} onChange={setCloseTime} type="time" />
            <Input label="Weekly Off (comma separated)" value={weeklyOff} onChange={setWeeklyOff} placeholder="Sunday" />
            <Input label="Payment Methods" value={paymentMethods} onChange={setPaymentMethods} placeholder="UPI, Cash, Card" />
            <Input label="GST Number" value={gstNumber} onChange={setGstNumber} placeholder="27ABCDE1234F1Z5" />
            <Input label="License Number" value={licenseNumber} onChange={setLicenseNumber} placeholder="ELEC-PN-2026-0091" />
            <div className="md:col-span-2">
              <Textarea
                label="FAQ 1 (question|answer)"
                value={faqOne}
                onChange={setFaqOne}
                rows={2}
              />
            </div>
            <div className="md:col-span-2">
              <Textarea
                label="FAQ 2 (question|answer)"
                value={faqTwo}
                onChange={setFaqTwo}
                rows={2}
              />
            </div>
            <Input label="Cover Image Path" value={coverImage} onChange={setCoverImage} placeholder="/showcase/business-electrical.svg" />
            <Input label="Gallery Images (comma separated paths)" value={gallery} onChange={setGallery} placeholder="/showcase/business-electrical.svg, /showcase/service-home.svg" />
          </div>
        ) : null}
      </div>

      <div className="mt-6 flex flex-wrap items-center justify-between gap-2">
        <div className="inline-flex gap-2">
          <button
            type="button"
            onClick={() => setStep((current) => Math.max(current - 1, 0))}
            disabled={step === 0}
            className="inline-flex h-10 items-center gap-1 rounded-lg border border-slate-300 bg-white px-3 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <ChevronLeft className="h-4 w-4" aria-hidden />
            Back
          </button>

          {step < steps.length - 1 ? (
            <button
              type="button"
              onClick={() => setStep((current) => Math.min(current + 1, steps.length - 1))}
              disabled={!validity[step]}
              className="inline-flex h-10 items-center gap-1 rounded-lg bg-blue-600 px-3 text-sm font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-300"
            >
              Next
              <ChevronRight className="h-4 w-4" aria-hidden />
            </button>
          ) : (
            <button
              type="submit"
              disabled={!validity.every(Boolean) || isSubmitting}
              className="inline-flex h-10 items-center gap-2 rounded-lg bg-emerald-600 px-3 text-sm font-semibold text-white hover:bg-emerald-700 disabled:cursor-not-allowed disabled:bg-emerald-300"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                  Publishing...
                </>
              ) : (
                "Publish Listing"
              )}
            </button>
          )}
        </div>

        {!adminMode ? (
          <Link href="/business/b-1" className="text-sm font-medium text-blue-700 hover:text-blue-600">
            Open sample detailed page
          </Link>
        ) : null}
      </div>

      {message ? (
        <div
          className={`mt-4 rounded-lg px-3 py-2 text-sm ${
            createdId ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"
          }`}
        >
          <p className="inline-flex items-center gap-1">
            <CheckCircle2 className="h-4 w-4" aria-hidden />
            {message}
          </p>
          {createdId ? (
            <p className="mt-1">
              View new listing:{" "}
              <Link href={`/business/${createdId}`} className="font-semibold underline">
                /business/{createdId}
              </Link>
            </p>
          ) : null}
        </div>
      ) : null}
    </form>
  );
}

