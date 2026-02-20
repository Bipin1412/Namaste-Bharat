"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { CheckCircle2, CreditCard, ShieldCheck, Sparkles } from "lucide-react";

type Plan = {
  id: string;
  name: string;
  monthlyPrice: number;
  subtitle: string;
  features: string[];
};

const plans: Plan[] = [
  {
    id: "starter",
    name: "Starter Boost",
    monthlyPrice: 999,
    subtitle: "Best for first-time local sellers",
    features: [
      "Highlighted in 1 category",
      "Priority WhatsApp CTA placement",
      "Monthly listing health suggestions",
    ],
  },
  {
    id: "growth",
    name: "Growth Plus",
    monthlyPrice: 2499,
    subtitle: "For growing MSMEs with repeat demand",
    features: [
      "Featured in search and map view",
      "Reel support slots",
      "Lead quality report",
    ],
  },
  {
    id: "prime",
    name: "City Prime",
    monthlyPrice: 5999,
    subtitle: "For category leaders in one city",
    features: [
      "Top rank placement in city",
      "Dedicated campaign manager",
      "Festival-season ad creatives",
    ],
  },
];

const addOns = [
  { id: "reels", name: "Extra reel boost", price: 799 },
  { id: "verified", name: "Fast verification SLA", price: 499 },
  { id: "festival", name: "Festival banner slot", price: 999 },
] as const;

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value);
}

export default function PlansCheckoutPage() {
  const [selectedPlanId, setSelectedPlanId] = useState(plans[1].id);
  const [selectedAddOns, setSelectedAddOns] = useState<string[]>([]);

  const [businessName, setBusinessName] = useState("");
  const [ownerName, setOwnerName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [gstin, setGstin] = useState("");
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");

  const selectedPlan = plans.find((plan) => plan.id === selectedPlanId) ?? plans[0];
  const selectedAddOnItems = addOns.filter((addOn) => selectedAddOns.includes(addOn.id));

  const pricing = useMemo(() => {
    const base = selectedPlan.monthlyPrice;
    const addOnTotal = selectedAddOnItems.reduce((sum, item) => sum + item.price, 0);
    const subtotal = base + addOnTotal;
    const gst = Math.round(subtotal * 0.18);
    const total = subtotal + gst;
    return { base, addOnTotal, subtotal, gst, total };
  }, [selectedAddOnItems, selectedPlan.monthlyPrice]);

  const canPlaceOrder =
    businessName.trim().length >= 3 &&
    ownerName.trim().length >= 2 &&
    email.trim().includes("@") &&
    phone.replace(/\D/g, "").length >= 10;

  async function handlePlaceOrder() {
    if (!canPlaceOrder || isPlacingOrder) {
      return;
    }

    setIsPlacingOrder(true);
    setStatusMessage("");
    await new Promise((resolve) => setTimeout(resolve, 900));
    setIsPlacingOrder(false);
    setStatusMessage(
      "Order created in demo mode. Payment gateway integration can be connected next."
    );
  }

  return (
    <div className="min-h-dvh bg-slate-50">
      <section className="mx-auto max-w-7xl space-y-5 px-4 pb-24 pt-4 md:px-6 lg:px-8">
        <div className="rounded-2xl bg-gradient-to-r from-blue-700 to-indigo-700 p-6 text-white">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-blue-100">
            Plans and Checkout
          </p>
          <h1 className="mt-2 text-3xl font-semibold leading-tight md:text-4xl">
            Promote your listing with premium plans
          </h1>
          <p className="mt-2 max-w-3xl text-sm text-blue-100 md:text-base">
            Demo checkout flow for monetization discussions with clients.
          </p>
        </div>

        <div className="grid gap-4 xl:grid-cols-[1.35fr,1fr]">
          <div className="space-y-4">
            <div className="rounded-2xl border border-slate-200 bg-white p-5">
              <p className="inline-flex items-center gap-2 text-lg font-semibold text-slate-900">
                <Sparkles className="h-5 w-5 text-blue-700" aria-hidden />
                Select plan
              </p>
              <div className="mt-3 grid gap-3">
                {plans.map((plan) => {
                  const selected = selectedPlanId === plan.id;
                  return (
                    <button
                      key={plan.id}
                      type="button"
                      onClick={() => setSelectedPlanId(plan.id)}
                      className={`rounded-xl border p-4 text-left transition-colors ${
                        selected
                          ? "border-blue-300 bg-blue-50"
                          : "border-slate-200 bg-white hover:bg-slate-50"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="text-base font-semibold text-slate-900">{plan.name}</p>
                          <p className="text-sm text-slate-600">{plan.subtitle}</p>
                        </div>
                        <p className="text-sm font-semibold text-blue-700">
                          {formatCurrency(plan.monthlyPrice)}/mo
                        </p>
                      </div>
                      <ul className="mt-2 space-y-1 text-sm text-slate-700">
                        {plan.features.map((feature) => (
                          <li key={feature}>- {feature}</li>
                        ))}
                      </ul>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-5">
              <p className="inline-flex items-center gap-2 text-lg font-semibold text-slate-900">
                <ShieldCheck className="h-5 w-5 text-emerald-600" aria-hidden />
                Optional add-ons
              </p>
              <div className="mt-3 grid gap-2">
                {addOns.map((addOn) => {
                  const selected = selectedAddOns.includes(addOn.id);
                  return (
                    <label
                      key={addOn.id}
                      className="inline-flex items-center justify-between rounded-lg border border-slate-200 bg-slate-50 px-3 py-2"
                    >
                      <span className="inline-flex items-center gap-2 text-sm text-slate-700">
                        <input
                          type="checkbox"
                          checked={selected}
                          onChange={(event) => {
                            setSelectedAddOns((current) => {
                              if (event.target.checked) {
                                return [...current, addOn.id];
                              }
                              return current.filter((id) => id !== addOn.id);
                            });
                          }}
                          className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                        />
                        {addOn.name}
                      </span>
                      <span className="text-sm font-semibold text-slate-900">
                        +{formatCurrency(addOn.price)}
                      </span>
                    </label>
                  );
                })}
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-5">
              <p className="inline-flex items-center gap-2 text-lg font-semibold text-slate-900">
                <CreditCard className="h-5 w-5 text-blue-700" aria-hidden />
                Billing details
              </p>
              <div className="mt-3 grid gap-2 md:grid-cols-2">
                <input
                  value={businessName}
                  onChange={(event) => setBusinessName(event.target.value)}
                  placeholder="Business Name"
                  className="h-11 rounded-lg border border-slate-300 px-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none"
                />
                <input
                  value={ownerName}
                  onChange={(event) => setOwnerName(event.target.value)}
                  placeholder="Owner Name"
                  className="h-11 rounded-lg border border-slate-300 px-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none"
                />
                <input
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="Email"
                  className="h-11 rounded-lg border border-slate-300 px-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none"
                />
                <input
                  value={phone}
                  onChange={(event) => setPhone(event.target.value)}
                  placeholder="Phone"
                  className="h-11 rounded-lg border border-slate-300 px-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none"
                />
                <input
                  value={gstin}
                  onChange={(event) => setGstin(event.target.value)}
                  placeholder="GSTIN (optional)"
                  className="h-11 rounded-lg border border-slate-300 px-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none md:col-span-2"
                />
              </div>
            </div>
          </div>

          <div className="space-y-4 xl:sticky xl:top-[5.5rem] xl:h-fit">
            <div className="rounded-2xl border border-slate-200 bg-white p-5">
              <p className="text-lg font-semibold text-slate-900">Order summary</p>
              <div className="mt-3 space-y-2 text-sm text-slate-700">
                <div className="flex items-center justify-between">
                  <span>Plan ({selectedPlan.name})</span>
                  <span>{formatCurrency(pricing.base)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Add-ons</span>
                  <span>{formatCurrency(pricing.addOnTotal)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Subtotal</span>
                  <span>{formatCurrency(pricing.subtotal)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>GST (18%)</span>
                  <span>{formatCurrency(pricing.gst)}</span>
                </div>
                <div className="mt-2 border-t border-slate-200 pt-2 text-base font-semibold text-slate-900">
                  <div className="flex items-center justify-between">
                    <span>Total</span>
                    <span>{formatCurrency(pricing.total)}</span>
                  </div>
                </div>
              </div>

              <motion.button
                type="button"
                whileTap={{ scale: 0.98 }}
                onClick={handlePlaceOrder}
                disabled={!canPlaceOrder || isPlacingOrder}
                className="mt-4 inline-flex h-11 w-full items-center justify-center rounded-lg bg-blue-600 text-sm font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-300"
              >
                {isPlacingOrder ? "Placing Order..." : "Proceed to Payment"}
              </motion.button>

              <p className="mt-2 text-xs text-slate-500">
                Demo mode: this is a UI flow. No payment is charged.
              </p>
            </div>

            {statusMessage ? (
              <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-700">
                <p className="inline-flex items-center gap-1 font-medium">
                  <CheckCircle2 className="h-4 w-4" aria-hidden />
                  {statusMessage}
                </p>
              </div>
            ) : null}
          </div>
        </div>
      </section>
    </div>
  );
}
