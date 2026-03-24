export type ListingPlan = {
  id: string;
  name: string;
  priceLabel: string;
  shortLabel: string;
  description: string;
  features: string[];
};

export const defaultListingPlans: ListingPlan[] = [
  {
    id: "basic",
    name: "Basic listing",
    priceLabel: "Listing at Rs 120/-",
    shortLabel: "Basic",
    description: "A starter plan for local visibility on Namaste Bharat.",
    features: ["Listing on Namaste Bharat Portal", "Basic Marketing Tools"],
  },
  {
    id: "premium",
    name: "Premium listing",
    priceLabel: "Rs 3,000 / 1 year",
    shortLabel: "Premium",
    description: "A promotion-focused plan for stronger reach and lead flow.",
    features: [
      "Business listing on the Namaste Bharat portal",
      "100+ customer leads",
      "Customer enquiries directly on WhatsApp",
      "Effective digital promotion",
      "Mini website facility",
      "Trusted and secure service",
    ],
  },
];

function sanitizePlanId(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "") || "plan";
}

export function normalizeListingPlan(input: Partial<ListingPlan>): ListingPlan | null {
  const name = String(input.name || "").trim();
  const shortLabel = String(input.shortLabel || "").trim();
  const description = String(input.description || "").trim();
  const priceLabel = String(input.priceLabel || "").trim();
  const features = Array.isArray(input.features)
    ? input.features.map((item) => String(item || "").trim()).filter(Boolean)
    : [];
  const id = sanitizePlanId(String(input.id || name || shortLabel));

  if (!name || !shortLabel || !description || !priceLabel || features.length === 0) {
    return null;
  }

  return {
    id,
    name,
    shortLabel,
    description,
    priceLabel,
    features,
  };
}

export function normalizeListingPlans(input: unknown): ListingPlan[] {
  if (!Array.isArray(input)) {
    return defaultListingPlans;
  }

  const normalized = input
    .map((entry) => (typeof entry === "object" && entry !== null ? normalizeListingPlan(entry as Partial<ListingPlan>) : null))
    .filter((entry): entry is ListingPlan => Boolean(entry));

  return normalized.length > 0 ? normalized : defaultListingPlans;
}
