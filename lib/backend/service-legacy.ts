import { randomUUID } from "node:crypto";
import { mutateDatabase, readDatabase } from "./store";
import masterCategories from "@/data/master-categories.json";
import { normalizeListingPlan, normalizeListingPlans, type ListingPlan } from "@/lib/ui/listing-plans";
import type {
  Business,
  DatabaseShape,
  Lead,
  ListingPlanRecord,
  Offer,
  PaginatedResult,
  Reel,
} from "./types";

type PaginationInput = {
  page?: number;
  limit?: number;
};

export type BusinessFilters = PaginationInput & {
  q?: string;
  category?: string;
  city?: string;
  verified?: boolean;
  openNow?: boolean;
  sort?: "rating_desc" | "rating_asc" | "reviews_desc" | "newest";
  includeInactive?: boolean;
};

export type ReelFilters = PaginationInput & {
  q?: string;
  city?: string;
  verified?: boolean;
};

export type OfferFilters = {
  activeOnly?: boolean;
};

export type CreateBusinessInput = Omit<
  Business,
  "id" | "createdAt" | "updatedAt"
>;

export type UpdateBusinessInput = Partial<CreateBusinessInput>;

export type CreateLeadInput = Omit<Lead, "id" | "createdAt">;
export type CreateListingPlanInput = Omit<ListingPlanRecord, "id"> & { id?: string };
export type UpdateListingPlanInput = Partial<Omit<ListingPlanRecord, "id">>;

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
      ? Math.min(Math.floor(input.limit), 10000)
      : 12;

  return { page, limit };
}

function paginate<T>(
  entries: T[],
  input: PaginationInput
): PaginatedResult<T> {
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
    // Keep contains-match strict for short tokens (e.g. "car" should not match "healthcare").
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

export async function listBusinesses(
  filters: BusinessFilters
): Promise<PaginatedResult<Business>> {
  const db = await readDatabase();
  const filtered = applyBusinessFilters(db.businesses, filters);
  return paginate(filtered, filters);
}

export async function getBusinessById(id: string): Promise<Business | null> {
  const db = await readDatabase();
  return db.businesses.find((entry) => entry.id === id) ?? null;
}

export async function createBusiness(input: CreateBusinessInput): Promise<Business> {
  const now = new Date().toISOString();
  const next: Business = {
    ...input,
    id: randomUUID(),
    createdAt: now,
    updatedAt: now,
  };

  await mutateDatabase((draft) => {
    draft.businesses.push(next);
  });

  return next;
}

export async function updateBusiness(
  id: string,
  input: UpdateBusinessInput
): Promise<Business | null> {
  let updatedBusiness: Business | null = null;

  await mutateDatabase((draft) => {
    const index = draft.businesses.findIndex((entry) => entry.id === id);
    if (index < 0) {
      return;
    }

    const current = draft.businesses[index];
    const updated: Business = {
      ...current,
      ...input,
      id: current.id,
      updatedAt: new Date().toISOString(),
    };

    draft.businesses[index] = updated;
    updatedBusiness = updated;
  });

  return updatedBusiness;
}

export async function deleteBusiness(id: string): Promise<boolean> {
  let removed = false;

  await mutateDatabase((draft) => {
    const before = draft.businesses.length;
    draft.businesses = draft.businesses.filter((entry) => entry.id !== id);
    draft.reels = draft.reels.filter((entry) => entry.businessId !== id);
    draft.leads = draft.leads.filter((entry) => entry.businessId !== id);
    removed = draft.businesses.length !== before;
  });

  return removed;
}

export async function listReels(
  filters: ReelFilters
): Promise<PaginatedResult<Reel>> {
  const db = await readDatabase();
  const filtered = applyReelFilters(db.reels, filters).sort((a, b) =>
    b.createdAt.localeCompare(a.createdAt)
  );

  return paginate(filtered, filters);
}

export async function listOffers(filters: OfferFilters = {}): Promise<Offer[]> {
  const db = await readDatabase();
  const activeOnly = filters.activeOnly ?? true;

  return db.offers
    .filter((entry) => (activeOnly ? entry.active : true))
    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
}

export async function createLead(input: CreateLeadInput): Promise<Lead> {
  const lead: Lead = {
    ...input,
    id: randomUUID(),
    createdAt: new Date().toISOString(),
  };

  await mutateDatabase((draft) => {
    draft.leads.push(lead);
  });

  return lead;
}

export async function listLeads(
  input: PaginationInput = {}
): Promise<PaginatedResult<Lead>> {
  const db = await readDatabase();
  const sorted = [...db.leads].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  return paginate(sorted, input);
}

export async function getHomeSnapshot(): Promise<{
  featuredBusinesses: Business[];
  offers: Offer[];
  categories: Array<{ name: string; count: number }>;
  quickFilters: string[];
}> {
  const db = await readDatabase();
  const featuredBusinesses = [...db.businesses]
    .sort((a, b) => b.rating - a.rating || b.reviewCount - a.reviewCount)
    .slice(0, 8);

  const offers = db.offers
    .filter((entry) => entry.active)
    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
    .slice(0, 3);

  const categoryCounter = new Map<string, number>();
  for (const business of db.businesses) {
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

  const quickFilters = [
    "Plumber near me",
    "Electrician",
    "Packers and Movers",
    "Clinic",
    "CA Office",
    "Hardware shop",
  ];

  return {
    featuredBusinesses,
    offers,
    categories,
    quickFilters,
  };
}

export async function getDatabaseStats(): Promise<{
  businesses: number;
  reels: number;
  offers: number;
  leads: number;
  updatedAt: string;
}> {
  const db: DatabaseShape = await readDatabase();
  return {
    businesses: db.businesses.length,
    reels: db.reels.length,
    offers: db.offers.length,
    leads: db.leads.length,
    updatedAt: new Date().toISOString(),
  };
}

export async function listListingPlans(): Promise<ListingPlan[]> {
  const db = await readDatabase();
  return normalizeListingPlans(db.listingPlans);
}

export async function createListingPlan(input: CreateListingPlanInput): Promise<ListingPlan> {
  const next = normalizeListingPlan(input);
  if (!next) {
    throw new Error("Invalid listing plan payload.");
  }

  await mutateDatabase((draft) => {
    draft.listingPlans = normalizeListingPlans(draft.listingPlans).filter(
      (plan) => plan.id !== next.id
    );
    draft.listingPlans.push(next);
  });

  return next;
}

export async function updateListingPlan(
  id: string,
  input: UpdateListingPlanInput
): Promise<ListingPlan | null> {
  const db = await readDatabase();
  const existing = normalizeListingPlans(db.listingPlans).find((plan) => plan.id === id);
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

  await mutateDatabase((draft) => {
    draft.listingPlans = normalizeListingPlans(draft.listingPlans).map((plan) =>
      plan.id === id ? updated : plan
    );
  });

  return updated;
}
