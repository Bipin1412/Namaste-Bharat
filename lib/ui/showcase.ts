import type { StaticImageData } from "next/image";

import balajiKitchenImage from "../../assests/stories/Balaji Kitchen.jpeg";
import omPropertyImage from "../../assests/stories/Om property.jpeg";
import poojaBoutiqueImage from "../../assests/stories/pooja boutique.jpeg";
import rajCabServicesImage from "../../assests/stories/Raj car servies.jpeg";
import saiElectricalsImage from "../../assests/stories/Shree Electrical.jpeg";
import smartFixImage from "../../assests/stories/smart fix.jpeg";
import spiceBowlImage from "../../assests/stories/Spice Boul.jpeg";

export type ShowcaseCard = {
  title: string;
  subtitle: string;
  image: string;
  href: string;
};

export type StoryShowcaseCard = {
  category: string;
  title: string;
  summary: string;
  outcomes: string[];
  quote: string;
  accent: string;
  image?: StaticImageData;
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

export const storyShowcaseCards: StoryShowcaseCard[] = [
  {
    category: "Local Tiffin Service",
    title: "Balaji Kitchen (Pune)",
    summary:
      "Sayali started her small tiffin service from home but struggled to find customers with the brand name Balaji Kitchen. After enrolling on Namaste Bharat, she started receiving regular customer enquiries within just 10 days.",
    outcomes: ["50+ monthly orders", "3x increase in income", "Expanded to office catering"],
    quote: "Namaste Bharat gave my business a new identity and steady customers!",
    accent: "from-amber-500 via-orange-500 to-rose-500",
    image: balajiKitchenImage,
    href: "/stories",
  },
  {
    category: "Cab Service Owner",
    title: "Raj Cab Services",
    summary:
      "Raj had 2 cars but no consistent bookings. After joining Namaste Bharat, his business started getting daily travel enquiries.",
    outcomes: ["100+ customer leads in 2 months", "Fleet expanded from 2 to 5 cars", "Regular airport bookings"],
    quote: "Now I don't worry about finding customers. Namaste Bharat does it for me.",
    accent: "from-cyan-500 via-sky-500 to-blue-600",
    image: rajCabServicesImage,
    href: "/stories",
  },
  {
    category: "Ladies Boutique",
    title: "Pooja Fashion Boutique",
    summary:
      "Pooja had great designs but low visibility. After listing on Namaste Bharat, her boutique reached more local customers online.",
    outcomes: ["70% increase in walk-ins", "Custom order bookings doubled", "Strong local brand presence"],
    quote: "My boutique is now known in my area thanks to Namaste Bharat.",
    accent: "from-fuchsia-500 via-pink-500 to-rose-500",
    image: poojaBoutiqueImage,
    href: "/stories",
  },
  {
    category: "Cloud Kitchen",
    title: "Spice Bowl Kitchen",
    summary:
      "Struggling with online orders, they joined Namaste Bharat and saw fast growth.",
    outcomes: ["80+ orders per week", "Better online visibility", "Repeat customers increased"],
    quote: "Namaste Bharat helped us grow faster than expected!",
    accent: "from-emerald-500 via-teal-500 to-cyan-500",
    image: spiceBowlImage,
    href: "/stories",
  },
  {
    category: "Electrician Service",
    title: "Sai Electrical Services",
    summary:
      "Before joining, Sai depended only on word-of-mouth. After joining Namaste Bharat, the business started getting consistent local discovery.",
    outcomes: ["Daily service enquiries", "Increased monthly income by 2x", "Built a loyal customer base"],
    quote: "Now customers find me easily online!",
    accent: "from-indigo-600 via-blue-600 to-sky-500",
    image: saiElectricalsImage,
    href: "/stories",
  },
  {
    category: "Mobile Repair Shop",
    title: "SmartFix Mobile Care",
    summary:
      "Before joining Namaste Bharat, this shop depended only on walk-in customers. After listing, the team began receiving direct repair requests online.",
    outcomes: ["40+ repair enquiries per week", "Increased revenue by 2.5x", "Started doorstep repair service"],
    quote: "Now customers contact us directly from online searches!",
    accent: "from-violet-600 via-purple-600 to-fuchsia-500",
    image: smartFixImage,
    href: "/stories",
  },
  {
    category: "Real Estate Agent",
    title: "Om Properties",
    summary:
      "Struggling to find genuine buyers, they joined Namaste Bharat and started getting quality leads.",
    outcomes: ["20+ property enquiries per month", "Faster deal closures", "Strong client network"],
    quote: "We now get serious buyers regularly!",
    accent: "from-slate-700 via-indigo-700 to-blue-700",
    image: omPropertyImage,
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
