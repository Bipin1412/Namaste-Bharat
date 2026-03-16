import type { DatabaseShape } from "./types";

const now = new Date().toISOString();

export const seedDatabase: DatabaseShape = {
  businesses: [
    {
      id: "b-3",
      name: "Arogya Diagnostics",
      category: "Diagnostic Center",
      locality: "Shivaji Nagar",
      city: "Nagpur",
      rating: 4.8,
      reviewCount: 214,
      isOpenNow: false,
      verified: false,
      phone: "+918889990011",
      whatsappNumber: "+918889990011",
      createdAt: now,
      updatedAt: now,
    },
  ],
  reels: [],
  offers: [
    {
      id: "o-1",
      title: "Up to 30% Off Home Services",
      subtitle: "Limited time launch discount on selected verified vendors.",
      badge: "Launch Deal",
      active: true,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: "o-2",
      title: "Quote on Bulk Orders",
      subtitle: "Manufacturing and logistics suppliers can respond within 15 mins.",
      badge: "B2B",
      active: true,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: "o-3",
      title: "Clinic Booking Week",
      subtitle: "Healthcare listings get priority placement for local patients.",
      badge: "Healthcare",
      active: true,
      createdAt: now,
      updatedAt: now,
    },
  ],
  leads: [],
};

