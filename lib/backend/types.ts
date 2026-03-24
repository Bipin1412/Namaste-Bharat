export type BusinessService = {
  name: string;
  priceLabel?: string;
  description?: string;
};

export type BusinessHour = {
  day: string;
  open?: string;
  close?: string;
  closed?: boolean;
};

export type BusinessFaq = {
  question: string;
  answer: string;
};

export type BusinessMedia = {
  logo?: string;
  coverImages?: string[];
  gallery?: string[];
  videos?: string[];
  certificates?: string[];
};

export type BusinessPolicies = {
  listingPlan?: string;
  paymentMethods?: string[];
  homeService?: boolean;
  emergencyService?: boolean;
  appointmentRequired?: boolean;
  cancellationPolicy?: string;
};

export type BusinessSocialLinks = {
  instagram?: string;
  facebook?: string;
  youtube?: string;
};

export type BusinessVerification = {
  gstNumber?: string;
  licenseNumber?: string;
  verifiedOn?: string;
};

export type Business = {
  id: string;
  name: string;
  category: string;
  tagline?: string;
  description?: string;
  locality: string;
  city: string;
  addressLine1?: string;
  addressLine2?: string;
  pincode?: string;
  ownerName?: string;
  establishedYear?: number;
  email?: string;
  website?: string;
  rating: number;
  reviewCount: number;
  isOpenNow: boolean;
  verified: boolean;
  phone: string;
  whatsappNumber: string;
  serviceAreas?: string[];
  languages?: string[];
  keywords?: string[];
  highlights?: string[];
  services?: BusinessService[];
  businessHours?: BusinessHour[];
  media?: BusinessMedia;
  faqs?: BusinessFaq[];
  policies?: BusinessPolicies;
  socialLinks?: BusinessSocialLinks;
  verification?: BusinessVerification;
  createdAt: string;
  updatedAt: string;
};

export type Reel = {
  id: string;
  businessId: string;
  vendorName: string;
  handle: string;
  description: string;
  city: string;
  verified: boolean;
  createdAt: string;
};

export type Offer = {
  id: string;
  title: string;
  subtitle: string;
  badge: string;
  active: boolean;
  createdAt: string;
  updatedAt: string;
};

export type Lead = {
  id: string;
  businessId: string;
  name: string;
  phone: string;
  message: string;
  source: "search" | "reel" | "profile";
  createdAt: string;
};

export type ListingPlanRecord = {
  id: string;
  name: string;
  priceLabel: string;
  shortLabel: string;
  description: string;
  features: string[];
};

export type DatabaseShape = {
  businesses: Business[];
  reels: Reel[];
  offers: Offer[];
  leads: Lead[];
  listingPlans: ListingPlanRecord[];
};

export type PaginatedResult<T> = {
  data: T[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
};
