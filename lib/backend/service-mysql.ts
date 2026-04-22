import { randomUUID } from "node:crypto";
import masterCategories from "@/data/master-categories.json";
import type {
  BusinessFilters,
  CreateBusinessInput,
  CreateLeadInput,
  CreateListingPlanInput,
  OfferFilters,
  ReelFilters,
  UpdateBusinessInput,
  UpdateListingPlanInput,
} from "./service-legacy";
import type {
  Business,
  Lead,
  ListingPlanRecord,
  Offer,
  PaginatedResult,
  Reel,
} from "./types";
import { normalizeListingPlan, normalizeListingPlans, type ListingPlan } from "@/lib/ui/listing-plans";
import { executeResult, parseJsonField, queryRows, toIsoString, toMysqlDateTime } from "@/lib/server/mysql";

type PaginationInput = {
  page?: number;
  limit?: number;
};

type BusinessRow = {
  id: string;
  name: string;
  category: string;
  tagline: string | null;
  description: string | null;
  locality: string;
  city: string;
  address_line_1: string | null;
  address_line_2: string | null;
  pincode: string | null;
  owner_name: string | null;
  established_year: number | null;
  email: string | null;
  website: string | null;
  rating: number | string | null;
  review_count: number | string | null;
  is_open_now: number | boolean | null;
  verified: number | boolean | null;
  listing_status: string | null;
  activated_at: string | null;
  rejected_reason: string | null;
  phone: string;
  whatsapp_number: string;
  service_areas: unknown;
  languages: unknown;
  keywords: unknown;
  highlights: unknown;
  services: unknown;
  business_hours: unknown;
  media: unknown;
  faqs: unknown;
  policies: unknown;
  social_links: unknown;
  verification: unknown;
  created_at: string | null;
  updated_at: string | null;
};

type ReelRow = {
  id: string;
  business_id: string;
  vendor_name: string;
  handle: string;
  description: string;
  city: string;
  verified: number | boolean | null;
  created_at: string | null;
};

type OfferRow = {
  id: string;
  title: string;
  subtitle: string;
  badge: string;
  active: number | boolean | null;
  created_at: string | null;
  updated_at: string | null;
};

type LeadRow = {
  id: string;
  business_id: string;
  name: string;
  phone: string;
  message: string;
  source: "search" | "reel" | "profile";
  created_at: string | null;
};

type ListingPlanRow = {
  id: string;
  name: string;
  price_label: string;
  short_label: string;
  description: string;
  features: unknown;
};

type CountRow = {
  total: number;
};

function normalizeText(value?: string): string {
  return (value ?? "").trim().toLowerCase();
}

function normalizeSearchText(value?: string): string {
  return normalizeText(value).replace(/[^a-z0-9]+/g, " ").replace(/\s+/g, " ").trim();
}

function tokenizeQuery(query: string): string[] {
  const tokens = normalizeSearchText(query).split(" ").filter((token) => token.length >= 2);
  return [...new Set(tokens)];
}

function getPageAndLimit(input: PaginationInput): { page: number; limit: number } {
  const page = Number.isFinite(input.page) && input.page && input.page > 0
    ? Math.floor(input.page)
    : 1;
  const limit =
    Number.isFinite(input.limit) && input.limit && input.limit > 0
      ? Math.min(Math.floor(input.limit), 50)
      : 12;

  return { page, limit };
}

function paginate<T>(entries: T[], input: PaginationInput): PaginatedResult<T> {
  const { page, limit } = getPageAndLimit(input);
  const total = entries.length;
  const totalPages = Math.max(1, Math.ceil(total / limit));
  const safePage = Math.min(page, totalPages);
  const start = (safePage - 1) * limit;
  const end = start + limit;

  return {
    data: entries.slice(start, end),
    meta: {
      page: safePage,
      limit,
      total,
      totalPages,
    },
  };
}

function buildBusinessSearchText(entry: Business): string {
  const servicesText =
    entry.services?.flatMap((service) => [
      service.name,
      service.priceLabel ?? "",
      service.description ?? "",
    ]) ?? [];

  const faqText =
    entry.faqs?.flatMap((faq) => [faq.question, faq.answer]) ?? [];

  const hourText =
    entry.businessHours?.map((slot) =>
      slot.closed
        ? `${slot.day} closed`
        : `${slot.day} ${slot.open ?? ""} ${slot.close ?? ""}`
    ) ?? [];

  return [
    entry.name,
    entry.category,
    entry.tagline ?? "",
    entry.description ?? "",
    entry.locality,
    entry.city,
    entry.addressLine1 ?? "",
    entry.addressLine2 ?? "",
    entry.pincode ?? "",
    entry.ownerName ?? "",
    entry.email ?? "",
    entry.website ?? "",
    ...(entry.serviceAreas ?? []),
    ...(entry.languages ?? []),
    ...(entry.keywords ?? []),
    ...(entry.highlights ?? []),
    ...(entry.policies?.paymentMethods ?? []),
    entry.policies?.cancellationPolicy ?? "",
    entry.verification?.gstNumber ?? "",
    entry.verification?.licenseNumber ?? "",
    ...servicesText,
    ...faqText,
    ...hourText,
  ]
    .join(" ")
    .toLowerCase();
}

function scoreField(fieldValue: string, tokens: string[], weight: number): number {
  const normalized = normalizeSearchText(fieldValue);
  if (!normalized) return 0;
  const words = normalized.split(" ").filter(Boolean);
  let score = 0;

  for (const token of tokens) {
    if (words.some((word) => word === token)) {
      score += weight * 3;
      continue;
    }
    if (token.length <= 3) {
      continue;
    }
    if (words.some((word) => word.startsWith(token))) {
      score += weight * 2;
      continue;
    }
    if (token.length >= 4 && normalized.includes(token)) {
      score += weight;
    }
  }

  return score;
}

function tokenMatchesEntry(entry: Business, token: string): boolean {
  const fields = [
    entry.name,
    entry.category,
    ...(entry.keywords ?? []),
    ...(entry.highlights ?? []),
    entry.tagline ?? "",
    entry.description ?? "",
    entry.locality,
    entry.city,
    entry.addressLine1 ?? "",
    entry.addressLine2 ?? "",
    entry.ownerName ?? "",
  ];

  return fields.some((field) => {
    const normalized = normalizeSearchText(field);
    if (!normalized) return false;
    const words = normalized.split(" ").filter(Boolean);
    if (words.some((word) => word === token)) {
      return true;
    }
    if (token.length <= 3) {
      return false;
    }
    if (words.some((word) => word.startsWith(token))) {
      return true;
    }
    return token.length >= 4 && normalized.includes(token);
  });
}

function getBusinessRelevanceScore(entry: Business, tokens: string[]): number {
  const servicesText = entry.services?.map((service) => service.name).join(" ") ?? "";
  return (
    scoreField(entry.name, tokens, 8) +
    scoreField(entry.category, tokens, 7) +
    scoreField((entry.keywords ?? []).join(" "), tokens, 6) +
    scoreField(servicesText, tokens, 5) +
    scoreField((entry.highlights ?? []).join(" "), tokens, 4) +
    scoreField(entry.tagline ?? "", tokens, 3) +
    scoreField(entry.description ?? "", tokens, 2) +
    scoreField(entry.locality, tokens, 2) +
    scoreField(entry.city, tokens, 2) +
    scoreField(entry.addressLine1 ?? "", tokens, 1) +
    scoreField(entry.addressLine2 ?? "", tokens, 1) +
    scoreField(entry.ownerName ?? "", tokens, 1)
  );
}

function compareBusinessesBySort(
  a: Business,
  b: Business,
  sort: "rating_desc" | "rating_asc" | "reviews_desc" | "newest"
): number {
  if (sort === "rating_desc") {
    return b.rating - a.rating;
  }
  if (sort === "rating_asc") {
    return a.rating - b.rating;
  }
  if (sort === "reviews_desc") {
    return b.reviewCount - a.reviewCount;
  }
  return b.createdAt.localeCompare(a.createdAt);
}

function applyBusinessFilters(
  businesses: Business[],
  filters: BusinessFilters
): Business[] {
  const query = normalizeText(filters.q);
  const queryTokens = tokenizeQuery(query);
  const category = normalizeText(filters.category);
  const city = normalizeText(filters.city);

  const scored = businesses.flatMap((entry) => {
    if (!filters.includeInactive && entry.listingStatus && entry.listingStatus !== "active") {
      return [];
    }

    if (queryTokens.length > 0) {
      const allTokensMatch = queryTokens.every((token) => tokenMatchesEntry(entry, token));
      if (!allTokensMatch) {
        return [];
      }
    }

    if (query) {
      const haystack = buildBusinessSearchText(entry);
      if (!haystack.includes(query)) {
        return [];
      }
    }

    if (category && normalizeText(entry.category) !== category) {
      return [];
    }

    if (city && normalizeText(entry.city) !== city) {
      return [];
    }

    if (typeof filters.verified === "boolean" && entry.verified !== filters.verified) {
      return [];
    }

    if (typeof filters.openNow === "boolean" && entry.isOpenNow !== filters.openNow) {
      return [];
    }

    const relevanceScore =
      queryTokens.length > 0 ? getBusinessRelevanceScore(entry, queryTokens) : 0;

    if (queryTokens.length > 0 && relevanceScore < 3) {
      return [];
    }

    return [{ entry, relevanceScore }];
  });

  const sort = filters.sort ?? "rating_desc";
  const sorted = scored.sort((a, b) => {
    if (queryTokens.length > 0 && b.relevanceScore !== a.relevanceScore) {
      return b.relevanceScore - a.relevanceScore;
    }
    return compareBusinessesBySort(a.entry, b.entry, sort);
  });

  return sorted.map((item) => item.entry);
}

function applyReelFilters(reels: Reel[], filters: ReelFilters): Reel[] {
  const query = normalizeText(filters.q);
  const city = normalizeText(filters.city);

  return reels.filter((entry) => {
    if (query) {
      const haystack =
        `${entry.vendorName} ${entry.description} ${entry.handle} ${entry.city}`.toLowerCase();
      if (!haystack.includes(query)) {
        return false;
      }
    }

    if (city && normalizeText(entry.city) !== city) {
      return false;
    }

    if (typeof filters.verified === "boolean" && entry.verified !== filters.verified) {
      return false;
    }

    return true;
  });
}

function mapBusiness(row: BusinessRow): Business {
  return {
    id: row.id,
    name: row.name,
    category: row.category,
    tagline: row.tagline ?? undefined,
    description: row.description ?? undefined,
    locality: row.locality,
    city: row.city,
    addressLine1: row.address_line_1 ?? undefined,
    addressLine2: row.address_line_2 ?? undefined,
    pincode: row.pincode ?? undefined,
    ownerName: row.owner_name ?? undefined,
    establishedYear: row.established_year ?? undefined,
    email: row.email ?? undefined,
    website: row.website ?? undefined,
    rating: Number(row.rating || 0),
    reviewCount: Number(row.review_count || 0),
    isOpenNow: Boolean(row.is_open_now),
    verified: Boolean(row.verified),
    listingStatus: (row.listing_status as Business["listingStatus"]) || "active",
    activatedAt: row.activated_at ? toIsoString(row.activated_at) : null,
    rejectedReason: row.rejected_reason ?? null,
    phone: row.phone,
    whatsappNumber: row.whatsapp_number,
    serviceAreas: parseJsonField(row.service_areas, []),
    languages: parseJsonField(row.languages, []),
    keywords: parseJsonField(row.keywords, []),
    highlights: parseJsonField(row.highlights, []),
    services: parseJsonField(row.services, []),
    businessHours: parseJsonField(row.business_hours, []),
    media: parseJsonField(row.media, {}),
    faqs: parseJsonField(row.faqs, []),
    policies: parseJsonField(row.policies, {}),
    socialLinks: parseJsonField(row.social_links, {}),
    verification: parseJsonField(row.verification, {}),
    createdAt: toIsoString(row.created_at),
    updatedAt: toIsoString(row.updated_at),
  };
}

function mapReel(row: ReelRow): Reel {
  return {
    id: row.id,
    businessId: row.business_id,
    vendorName: row.vendor_name,
    handle: row.handle,
    description: row.description,
    city: row.city,
    verified: Boolean(row.verified),
    createdAt: toIsoString(row.created_at),
  };
}

function mapOffer(row: OfferRow): Offer {
  return {
    id: row.id,
    title: row.title,
    subtitle: row.subtitle,
    badge: row.badge,
    active: Boolean(row.active),
    createdAt: toIsoString(row.created_at),
    updatedAt: toIsoString(row.updated_at),
  };
}

function mapLead(row: LeadRow): Lead {
  return {
    id: row.id,
    businessId: row.business_id,
    name: row.name,
    phone: row.phone,
    message: row.message,
    source: row.source,
    createdAt: toIsoString(row.created_at),
  };
}

function mapListingPlan(row: ListingPlanRow): ListingPlanRecord {
  return {
    id: row.id,
    name: row.name,
    priceLabel: row.price_label,
    shortLabel: row.short_label,
    description: row.description,
    features: parseJsonField(row.features, []),
  };
}

function toBusinessDbPayload(input: UpdateBusinessInput | CreateBusinessInput) {
  const payload: Record<string, unknown> = {
    name: input.name,
    category: input.category,
    tagline: input.tagline,
    description: input.description,
    locality: input.locality,
    city: input.city,
    address_line_1: input.addressLine1,
    address_line_2: input.addressLine2,
    pincode: input.pincode,
    owner_name: input.ownerName,
    established_year: input.establishedYear,
    email: input.email,
    website: input.website,
    rating: input.rating,
    review_count: input.reviewCount,
    is_open_now: input.isOpenNow,
    verified: input.verified,
    listing_status: input.listingStatus,
    activated_at: toMysqlDateTime(input.activatedAt),
    rejected_reason: input.rejectedReason,
    phone: input.phone,
    whatsapp_number: input.whatsappNumber,
    service_areas: input.serviceAreas ? JSON.stringify(input.serviceAreas) : undefined,
    languages: input.languages ? JSON.stringify(input.languages) : undefined,
    keywords: input.keywords ? JSON.stringify(input.keywords) : undefined,
    highlights: input.highlights ? JSON.stringify(input.highlights) : undefined,
    services: input.services ? JSON.stringify(input.services) : undefined,
    business_hours: input.businessHours ? JSON.stringify(input.businessHours) : undefined,
    media: input.media ? JSON.stringify(input.media) : undefined,
    faqs: input.faqs ? JSON.stringify(input.faqs) : undefined,
    policies: input.policies ? JSON.stringify(input.policies) : undefined,
    social_links: input.socialLinks ? JSON.stringify(input.socialLinks) : undefined,
    verification: input.verification ? JSON.stringify(input.verification) : undefined,
  };

  for (const key of Object.keys(payload)) {
    if (payload[key] === undefined) {
      delete payload[key];
    }
  }

  return payload;
}

function withCreateBusinessDefaults(
  input: CreateBusinessInput
): CreateBusinessInput {
  return {
    ...input,
    serviceAreas: input.serviceAreas ?? [],
    languages: input.languages ?? [],
    keywords: input.keywords ?? [],
    highlights: input.highlights ?? [],
    services: input.services ?? [],
    businessHours: input.businessHours ?? [],
    media: input.media ?? {},
    faqs: input.faqs ?? [],
    policies: input.policies ?? {},
    socialLinks: input.socialLinks ?? {},
    verification: input.verification ?? {},
  };
}

async function fetchAllBusinesses() {
  const rows = await queryRows<BusinessRow>("SELECT * FROM businesses");
  return rows.map(mapBusiness);
}

export async function listBusinesses(
  filters: BusinessFilters
): Promise<PaginatedResult<Business>> {
  const businesses = await fetchAllBusinesses();
  const filtered = applyBusinessFilters(businesses, filters);
  return paginate(filtered, filters);
}

export async function getBusinessById(id: string): Promise<Business | null> {
  const rows = await queryRows<BusinessRow>(
    "SELECT * FROM businesses WHERE id = ? LIMIT 1",
    [id]
  );
  const row = rows[0];
  if (!row) {
    return null;
  }
  return mapBusiness(row);
}

export async function createBusiness(input: CreateBusinessInput): Promise<Business> {
  const id = randomUUID();
  const now = new Date().toISOString();
  const verified = input.verified === true;
  const listingStatus =
    input.listingStatus || (verified ? "active" : "pending");
  const activatedAt =
    listingStatus === "active" ? input.activatedAt || now : null;

  const payload = toBusinessDbPayload({
    ...withCreateBusinessDefaults(input),
    verified,
    listingStatus,
    activatedAt,
    rejectedReason: null,
  });

  const entries = Object.entries(payload);
  const columns = ["id", ...entries.map(([key]) => key), "created_at", "updated_at"];
  const placeholders = columns.map(() => "?").join(", ");
  const values = [
    id,
    ...entries.map(([, value]) => value),
    toMysqlDateTime(now),
    toMysqlDateTime(now),
  ];

  await executeResult(
    `INSERT INTO businesses (${columns.join(", ")}) VALUES (${placeholders})`,
    values
  );

  const created = await getBusinessById(id);
  if (!created) {
    throw new Error("Business was created but could not be loaded.");
  }
  return created;
}

export async function updateBusiness(
  id: string,
  input: UpdateBusinessInput
): Promise<Business | null> {
  const payload = toBusinessDbPayload(input);
  const entries = Object.entries(payload);

  if (entries.length === 0) {
    return getBusinessById(id);
  }

  const setClauses = entries.map(([key]) => `${key} = ?`);
  const values = entries.map(([, value]) => value);
  setClauses.push("updated_at = CURRENT_TIMESTAMP");

  const result = await executeResult(
    `UPDATE businesses SET ${setClauses.join(", ")} WHERE id = ?`,
    [...values, id]
  );

  if (result.affectedRows === 0) {
    return null;
  }

  return getBusinessById(id);
}

export async function deleteBusiness(id: string): Promise<boolean> {
  const result = await executeResult("DELETE FROM businesses WHERE id = ?", [id]);
  return result.affectedRows > 0;
}

export async function listReels(filters: ReelFilters): Promise<PaginatedResult<Reel>> {
  const rows = await queryRows<ReelRow>(
    "SELECT * FROM reels ORDER BY created_at DESC"
  );
  const filtered = applyReelFilters(rows.map(mapReel), filters);
  return paginate(filtered, filters);
}

export async function listOffers(filters: OfferFilters = {}): Promise<Offer[]> {
  const activeOnly = filters.activeOnly ?? true;
  const rows = await queryRows<OfferRow>(
    `SELECT * FROM offers ${activeOnly ? "WHERE active = 1" : ""} ORDER BY updated_at DESC`
  );
  return rows.map(mapOffer);
}

export async function createLead(input: CreateLeadInput): Promise<Lead> {
  const id = randomUUID();
  await executeResult(
    `INSERT INTO leads (id, business_id, name, phone, message, source)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [id, input.businessId, input.name, input.phone, input.message, input.source]
  );

  const rows = await queryRows<LeadRow>(
    "SELECT * FROM leads WHERE id = ? LIMIT 1",
    [id]
  );

  if (!rows[0]) {
    throw new Error("Lead was created but could not be loaded.");
  }

  return mapLead(rows[0]);
}

export async function listLeads(input: PaginationInput = {}): Promise<PaginatedResult<Lead>> {
  const rows = await queryRows<LeadRow>(
    "SELECT * FROM leads ORDER BY created_at DESC"
  );
  return paginate(rows.map(mapLead), input);
}

export async function getHomeSnapshot(): Promise<{
  featuredBusinesses: Business[];
  offers: Offer[];
  categories: Array<{ name: string; count: number }>;
  quickFilters: string[];
}> {
  const [businessPayload, offers] = await Promise.all([
    listBusinesses({ page: 1, limit: 1000, sort: "rating_desc" }),
    listOffers({ activeOnly: true }),
  ]);

  const featuredBusinesses = [...businessPayload.data]
    .sort((a, b) => b.rating - a.rating || b.reviewCount - a.reviewCount)
    .slice(0, 8);

  const categoryCounter = new Map<string, number>();
  for (const business of businessPayload.data) {
    categoryCounter.set(
      business.category,
      (categoryCounter.get(business.category) ?? 0) + 1
    );
  }

  const mergedCategories = new Map<string, { name: string; count: number }>();
  for (const [name, count] of categoryCounter.entries()) {
    const key = normalizeText(name);
    if (!key) continue;
    mergedCategories.set(key, { name, count });
  }

  for (const category of masterCategories) {
    const key = normalizeText(category);
    if (!key || mergedCategories.has(key)) {
      continue;
    }
    mergedCategories.set(key, { name: category, count: 0 });
  }

  const categories = [...mergedCategories.values()]
    .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name));

  return {
    featuredBusinesses,
    offers: offers.slice(0, 3),
    categories,
    quickFilters: [
      "Plumber near me",
      "Electrician",
      "Packers and Movers",
      "Clinic",
      "CA Office",
      "Hardware shop",
    ],
  };
}

export async function getDatabaseStats(): Promise<{
  businesses: number;
  reels: number;
  offers: number;
  leads: number;
  updatedAt: string;
}> {
  const [businesses, reels, offers, leads] = await Promise.all([
    queryRows<CountRow>("SELECT COUNT(*) AS total FROM businesses"),
    queryRows<CountRow>("SELECT COUNT(*) AS total FROM reels"),
    queryRows<CountRow>("SELECT COUNT(*) AS total FROM offers"),
    queryRows<CountRow>("SELECT COUNT(*) AS total FROM leads"),
  ]);

  return {
    businesses: Number(businesses[0]?.total || 0),
    reels: Number(reels[0]?.total || 0),
    offers: Number(offers[0]?.total || 0),
    leads: Number(leads[0]?.total || 0),
    updatedAt: new Date().toISOString(),
  };
}

export async function listListingPlans(): Promise<ListingPlan[]> {
  const rows = await queryRows<ListingPlanRow>(
    "SELECT id, name, price_label, short_label, description, features FROM listing_plans ORDER BY name ASC"
  );
  return normalizeListingPlans(rows.map(mapListingPlan));
}

export async function createListingPlan(input: CreateListingPlanInput): Promise<ListingPlan> {
  const next = normalizeListingPlan(input);
  if (!next) {
    throw new Error("Invalid listing plan payload.");
  }

  await executeResult(
    `INSERT INTO listing_plans (id, name, price_label, short_label, description, features)
     VALUES (?, ?, ?, ?, ?, ?)
     ON DUPLICATE KEY UPDATE
       name = VALUES(name),
       price_label = VALUES(price_label),
       short_label = VALUES(short_label),
       description = VALUES(description),
       features = VALUES(features)`,
    [
      next.id,
      next.name,
      next.priceLabel,
      next.shortLabel,
      next.description,
      JSON.stringify(next.features),
    ]
  );

  return next;
}

export async function updateListingPlan(
  id: string,
  input: UpdateListingPlanInput
): Promise<ListingPlan | null> {
  const existingPlans = await listListingPlans();
  const existing = existingPlans.find((plan) => plan.id === id);
  if (!existing) {
    return null;
  }

  const updated = normalizeListingPlan({
    ...existing,
    ...input,
    id,
  });

  if (!updated) {
    throw new Error("Invalid listing plan payload.");
  }

  await executeResult(
    `UPDATE listing_plans
     SET name = ?, price_label = ?, short_label = ?, description = ?, features = ?
     WHERE id = ?`,
    [
      updated.name,
      updated.priceLabel,
      updated.shortLabel,
      updated.description,
      JSON.stringify(updated.features),
      id,
    ]
  );

  return updated;
}
