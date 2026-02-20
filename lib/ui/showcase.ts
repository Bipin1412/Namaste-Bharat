export type ShowcaseCard = {
  title: string;
  subtitle: string;
  image: string;
  href: string;
};

const businessImageMap: Record<string, string> = {
  "b-1": "/showcase/business-electrical.svg",
  "b-2": "/showcase/business-fabrication.svg",
  "b-3": "/showcase/business-diagnostics.svg",
  "s-1": "/showcase/business-logistics.svg",
  "s-2": "/showcase/business-clinic.svg",
  "s-3": "/showcase/business-hardware.svg",
  "s-4": "/showcase/business-ac-repair.svg",
  "s-5": "/showcase/business-education.svg",
  "b-4": "/showcase/business-catering.svg",
  "b-5": "/showcase/business-garage.svg",
};

export function getBusinessImage(id: string): string {
  return businessImageMap[id] ?? "/showcase/business-default.svg";
}

export const homeShowcaseCards: ShowcaseCard[] = [
  {
    title: "Home and Repairs",
    subtitle: "Electrician, plumber, AC service",
    image: "/showcase/service-home.svg",
    href: "/search?q=home%20repair",
  },
  {
    title: "Health and Wellness",
    subtitle: "Clinics, diagnostics, pharmacies",
    image: "/showcase/service-health.svg",
    href: "/search?q=clinic",
  },
  {
    title: "Food and Catering",
    subtitle: "Events, parties, bulk orders",
    image: "/showcase/service-food.svg",
    href: "/search?q=catering",
  },
  {
    title: "Business Services",
    subtitle: "CA, legal, consulting support",
    image: "/showcase/service-professional.svg",
    href: "/search?q=business",
  },
];

export const storyShowcaseCards: ShowcaseCard[] = [
  {
    title: "Anjali Home Bakers",
    subtitle: "3.4x customer growth in 90 days",
    image: "/showcase/story-bakers.svg",
    href: "/stories",
  },
  {
    title: "Ritika Dental Care",
    subtitle: "82% bookings via WhatsApp inquiries",
    image: "/showcase/story-dental.svg",
    href: "/stories",
  },
  {
    title: "Aarav Electricals",
    subtitle: "Reached top local ranking in 45 days",
    image: "/showcase/story-electrical.svg",
    href: "/stories",
  },
];

export const offerShowcaseCards: ShowcaseCard[] = [
  {
    title: "Festival Lead Booster",
    subtitle: "Up to 35% more listing visibility",
    image: "/showcase/offer-festival.svg",
    href: "/offers",
  },
  {
    title: "Local Growth Package",
    subtitle: "Featured slots across search and reels",
    image: "/showcase/offer-growth.svg",
    href: "/offers",
  },
];
