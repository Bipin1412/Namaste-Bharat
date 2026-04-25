import { hasMysqlConfig } from "@/lib/server/mysql";
import * as legacyService from "./service-legacy";
import * as mysqlService from "./service-mysql";
import type { Business } from "./types";

export type {
  BusinessFilters,
  ReelFilters,
  OfferFilters,
  CreateBusinessInput,
  UpdateBusinessInput,
  CreateLeadInput,
  CreateListingPlanInput,
  UpdateListingPlanInput,
} from "./service-legacy";

export type { Business, Lead, ListingPlanRecord, Offer, PaginatedResult, Reel } from "./types";

const mysqlAvailabilityErrorCodes = new Set([
  "ECONNREFUSED",
  "ECONNRESET",
  "ETIMEDOUT",
  "ENETUNREACH",
  "EHOSTUNREACH",
  "EAI_AGAIN",
  "PROTOCOL_CONNECTION_LOST",
  "ER_ACCESS_DENIED_ERROR",
  "ER_BAD_DB_ERROR",
]);

const mysqlFallbackTimeoutMs = 2500;
const mergedBusinessFetchLimit = 10000;
const businessCacheTtlMs = 30000;
const offerCacheTtlMs = 30000;

let cachedMergedBusinesses: Business[] | null = null;
let cachedMergedBusinessesAt = 0;
let pendingMergedBusinesses: Promise<Business[]> | null = null;

let cachedActiveOffers: Awaited<ReturnType<typeof legacyService.listOffers>> | null = null;
let cachedActiveOffersAt = 0;
let pendingActiveOffers: Promise<Awaited<ReturnType<typeof legacyService.listOffers>>> | null = null;

function invalidateBusinessCache() {
  cachedMergedBusinesses = null;
  cachedMergedBusinessesAt = 0;
  pendingMergedBusinesses = null;
}

function invalidateOfferCache() {
  cachedActiveOffers = null;
  cachedActiveOffersAt = 0;
  pendingActiveOffers = null;
}

function isMysqlAvailabilityError(error: unknown): boolean {
  if (!(error instanceof Error)) {
    return false;
  }

  const code = (error as Error & { code?: string }).code;
  if (code && mysqlAvailabilityErrorCodes.has(code)) {
    return true;
  }

  const message = error.message.toLowerCase();
  return (
    message.includes("mysql env vars are missing") ||
    message.includes("could not connect") ||
    message.includes("connect") && message.includes("mysql") ||
    message.includes("database is unavailable")
  );
}

async function withMysqlReadFallback<T>(
  mysqlFn: () => Promise<T>,
  legacyFn: () => Promise<T>
): Promise<T> {
  if (!hasMysqlConfig()) {
    return legacyFn();
  }

  let timeoutId: ReturnType<typeof setTimeout> | null = null;

  try {
    const mysqlPromise = mysqlFn();
    mysqlPromise.catch(() => undefined);

    return await Promise.race([
      mysqlPromise,
      new Promise<T>((_, reject) => {
        timeoutId = setTimeout(() => {
          const timeoutError = new Error("MySQL request timed out.");
          (timeoutError as Error & { code?: string }).code = "MYSQL_TIMEOUT";
          reject(timeoutError);
        }, mysqlFallbackTimeoutMs);
      }),
    ]);
  } catch (error) {
    if (
      isMysqlAvailabilityError(error) ||
      (error instanceof Error && (error as Error & { code?: string }).code === "MYSQL_TIMEOUT")
    ) {
      return legacyFn();
    }
    throw error;
  } finally {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
  }
}

async function withMysqlWrite<T>(
  mysqlFn: () => Promise<T>,
  legacyFn: () => Promise<T>
): Promise<T> {
  if (!hasMysqlConfig()) {
    return legacyFn();
  }

  return mysqlFn();
}

type BusinessFilters = Parameters<typeof legacyService.listBusinesses>[0];

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

function buildBusinessSearchText(entry: Business): string {
  const servicesText =
    entry.services?.flatMap((service) => [
      service.name,
      service.priceLabel ?? "",
      service.description ?? "",
    ]) ?? [];

  const faqText = entry.faqs?.flatMap((faq) => [faq.question, faq.answer]) ?? [];
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

function getPageAndLimit(input: { page?: number; limit?: number }): { page: number; limit: number } {
  const page = Number.isFinite(input.page) && input.page && input.page > 0
    ? Math.floor(input.page)
    : 1;
  const limit =
    Number.isFinite(input.limit) && input.limit && input.limit > 0
      ? Math.min(Math.floor(input.limit), mergedBusinessFetchLimit)
      : 12;

  return { page, limit };
}

function paginate<T>(entries: T[], input: { page?: number; limit?: number }) {
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

function applyBusinessFilters(businesses: Business[], filters: BusinessFilters): Business[] {
  const query = normalizeText(filters.q);
  const queryTokens = tokenizeQuery(query);
  const category = normalizeText(filters.category);
  const city = normalizeText(filters.city);

  const scored = businesses.flatMap((entry) => {
    const isPubliclyActive = entry.listingStatus === "active" || entry.verified === true;

    if (!filters.includeInactive && !isPubliclyActive) {
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

function mergeBusinesses(primary: Business[], secondary: Business[]): Business[] {
  const merged = new Map<string, Business>();
  for (const entry of primary) {
    merged.set(entry.id, entry);
  }
  for (const entry of secondary) {
    if (!merged.has(entry.id)) {
      merged.set(entry.id, entry);
    }
  }
  return [...merged.values()];
}

async function loadAllBusinessesFromStores(): Promise<Business[]> {
  const now = Date.now();
  if (cachedMergedBusinesses && now - cachedMergedBusinessesAt < businessCacheTtlMs) {
    return cachedMergedBusinesses;
  }

  if (pendingMergedBusinesses) {
    return pendingMergedBusinesses;
  }

  pendingMergedBusinesses = (async () => {
    const mysqlQueryWithTimeout = hasMysqlConfig()
      ? Promise.race([
          mysqlService.listBusinesses({
            page: 1,
            limit: mergedBusinessFetchLimit,
            includeInactive: true,
            sort: "newest",
          }),
          new Promise<null>((resolve) =>
            setTimeout(() => resolve(null), mysqlFallbackTimeoutMs)
          ),
        ]).catch(() => null)
      : Promise.resolve(null);

    // When MySQL responds successfully, use it exclusively.
    // Only fall back to the JSON store if MySQL is unavailable/timed out.
    const mysqlPayload = await mysqlQueryWithTimeout;
    const mysqlResponded = mysqlPayload !== null;

    if (mysqlResponded) {
      return mysqlPayload?.data ?? [];
    }

    const legacyPayload = await legacyService.listBusinesses({
      page: 1,
      limit: mergedBusinessFetchLimit,
      includeInactive: true,
      sort: "newest",
    });

    return legacyPayload.data ?? [];
  })().finally(() => {
    pendingMergedBusinesses = null;
  });

  const merged = await pendingMergedBusinesses;
  cachedMergedBusinesses = merged;
  cachedMergedBusinessesAt = Date.now();
  return merged;
}

export async function listBusinesses(filters: BusinessFilters) {
  const allBusinesses = await loadAllBusinessesFromStores();
  const filtered = applyBusinessFilters(allBusinesses, filters);
  return paginate(filtered, filters);
}

export async function getBusinessById(...args: Parameters<typeof mysqlService.getBusinessById>) {
  return withMysqlReadFallback(
    () => mysqlService.getBusinessById(...args),
    () => legacyService.getBusinessById(...args)
  );
}

export async function createBusiness(...args: Parameters<typeof mysqlService.createBusiness>) {
  const result = await withMysqlWrite(
    () => mysqlService.createBusiness(...args),
    () => legacyService.createBusiness(...args)
  );
  invalidateBusinessCache();
  return result;
}

export async function updateBusiness(...args: Parameters<typeof mysqlService.updateBusiness>) {
  const result = await withMysqlWrite(
    () => mysqlService.updateBusiness(...args),
    () => legacyService.updateBusiness(...args)
  );
  invalidateBusinessCache();
  return result;
}

export async function deleteBusiness(...args: Parameters<typeof mysqlService.deleteBusiness>) {
  const result = await withMysqlWrite(
    () => mysqlService.deleteBusiness(...args),
    () => legacyService.deleteBusiness(...args)
  );
  invalidateBusinessCache();
  return result;
}

export async function listReels(...args: Parameters<typeof mysqlService.listReels>) {
  return withMysqlReadFallback(
    () => mysqlService.listReels(...args),
    () => legacyService.listReels(...args)
  );
}

export async function listOffers(...args: Parameters<typeof mysqlService.listOffers>) {
  const activeOnly = args[0]?.activeOnly ?? true;
  if (!activeOnly) {
    return withMysqlReadFallback(
      () => mysqlService.listOffers(...args),
      () => legacyService.listOffers(...args)
    );
  }

  const now = Date.now();
  if (cachedActiveOffers && now - cachedActiveOffersAt < offerCacheTtlMs) {
    return cachedActiveOffers;
  }

  if (pendingActiveOffers) {
    return pendingActiveOffers;
  }

  pendingActiveOffers = withMysqlReadFallback(
    () => mysqlService.listOffers(...args),
    () => legacyService.listOffers(...args)
  ).finally(() => {
    pendingActiveOffers = null;
  });

  const offers = await pendingActiveOffers;
  cachedActiveOffers = offers;
  cachedActiveOffersAt = Date.now();
  return offers;
}

export async function createLead(...args: Parameters<typeof mysqlService.createLead>) {
  return withMysqlWrite(
    () => mysqlService.createLead(...args),
    () => legacyService.createLead(...args)
  );
}

export async function listLeads(...args: Parameters<typeof mysqlService.listLeads>) {
  return withMysqlReadFallback(
    () => mysqlService.listLeads(...args),
    () => legacyService.listLeads(...args)
  );
}

export async function getHomeSnapshot() {
  const [businessPayload, offers] = await Promise.all([
    listBusinesses({ page: 1, limit: mergedBusinessFetchLimit, sort: "rating_desc" }),
    withMysqlReadFallback(
      () => mysqlService.listOffers({ activeOnly: true }),
      () => legacyService.listOffers({ activeOnly: true })
    ),
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

  for (const category of ["Plumber near me", "Electrician", "Packers and Movers", "Clinic", "CA Office", "Hardware shop"]) {
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

export async function getDatabaseStats() {
  const [businesses, stats] = await Promise.all([
    listBusinesses({ page: 1, limit: mergedBusinessFetchLimit, includeInactive: true, sort: "newest" }),
    withMysqlReadFallback(
      () => mysqlService.getDatabaseStats(),
      () => legacyService.getDatabaseStats()
    ),
  ]);

  return {
    ...stats,
    businesses: businesses.meta.total,
    updatedAt: new Date().toISOString(),
  };
}

export async function listListingPlans(...args: Parameters<typeof mysqlService.listListingPlans>) {
  return withMysqlReadFallback(
    () => mysqlService.listListingPlans(...args),
    () => legacyService.listListingPlans(...args)
  );
}

export async function createListingPlan(
  ...args: Parameters<typeof mysqlService.createListingPlan>
) {
  return withMysqlWrite(
    () => mysqlService.createListingPlan(...args),
    () => legacyService.createListingPlan(...args)
  );
}

export async function updateListingPlan(
  ...args: Parameters<typeof mysqlService.updateListingPlan>
) {
  return withMysqlWrite(
    () => mysqlService.updateListingPlan(...args),
    () => legacyService.updateListingPlan(...args)
  );
}
