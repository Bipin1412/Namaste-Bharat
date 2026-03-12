export type ListingPlanId = "basic" | "premium";

export type ListingPlan = {
  id: ListingPlanId;
  name: string;
  priceLabel: string;
  shortLabel: string;
  description: string;
  features: string[];
};

export const listingPlans: ListingPlan[] = [
  {
    id: "basic",
    name: "Basic listing",
    priceLabel: "Listing at Rs 120/-",
    shortLabel: "Basic",
    description: "A starter plan for local visibility on Namaste Bharat.",
    features: [
      "Listing on Namaste Bharat Portal",
      "Basic Marketing Tools",
    ],
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
