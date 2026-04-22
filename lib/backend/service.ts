import { hasMysqlConfig } from "@/lib/server/mysql";
import * as legacyService from "./service-legacy";
import * as mysqlService from "./service-mysql";

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

async function withMysqlFallback<T>(
  mysqlFn: () => Promise<T>,
  legacyFn: () => Promise<T>
): Promise<T> {
  if (!hasMysqlConfig()) {
    return legacyFn();
  }

  let timeoutId: ReturnType<typeof setTimeout> | null = null;

  try {
    return await Promise.race([
      mysqlFn(),
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

export async function listBusinesses(...args: Parameters<typeof mysqlService.listBusinesses>) {
  return withMysqlFallback(
    () => mysqlService.listBusinesses(...args),
    () => legacyService.listBusinesses(...args)
  );
}

export async function getBusinessById(...args: Parameters<typeof mysqlService.getBusinessById>) {
  return withMysqlFallback(
    () => mysqlService.getBusinessById(...args),
    () => legacyService.getBusinessById(...args)
  );
}

export async function createBusiness(...args: Parameters<typeof mysqlService.createBusiness>) {
  return withMysqlFallback(
    () => mysqlService.createBusiness(...args),
    () => legacyService.createBusiness(...args)
  );
}

export async function updateBusiness(...args: Parameters<typeof mysqlService.updateBusiness>) {
  return withMysqlFallback(
    () => mysqlService.updateBusiness(...args),
    () => legacyService.updateBusiness(...args)
  );
}

export async function deleteBusiness(...args: Parameters<typeof mysqlService.deleteBusiness>) {
  return withMysqlFallback(
    () => mysqlService.deleteBusiness(...args),
    () => legacyService.deleteBusiness(...args)
  );
}

export async function listReels(...args: Parameters<typeof mysqlService.listReels>) {
  return withMysqlFallback(
    () => mysqlService.listReels(...args),
    () => legacyService.listReels(...args)
  );
}

export async function listOffers(...args: Parameters<typeof mysqlService.listOffers>) {
  return withMysqlFallback(
    () => mysqlService.listOffers(...args),
    () => legacyService.listOffers(...args)
  );
}

export async function createLead(...args: Parameters<typeof mysqlService.createLead>) {
  return withMysqlFallback(
    () => mysqlService.createLead(...args),
    () => legacyService.createLead(...args)
  );
}

export async function listLeads(...args: Parameters<typeof mysqlService.listLeads>) {
  return withMysqlFallback(
    () => mysqlService.listLeads(...args),
    () => legacyService.listLeads(...args)
  );
}

export async function getHomeSnapshot(...args: Parameters<typeof mysqlService.getHomeSnapshot>) {
  return withMysqlFallback(
    () => mysqlService.getHomeSnapshot(...args),
    () => legacyService.getHomeSnapshot(...args)
  );
}

export async function getDatabaseStats(...args: Parameters<typeof mysqlService.getDatabaseStats>) {
  return withMysqlFallback(
    () => mysqlService.getDatabaseStats(...args),
    () => legacyService.getDatabaseStats(...args)
  );
}

export async function listListingPlans(...args: Parameters<typeof mysqlService.listListingPlans>) {
  return withMysqlFallback(
    () => mysqlService.listListingPlans(...args),
    () => legacyService.listListingPlans(...args)
  );
}

export async function createListingPlan(
  ...args: Parameters<typeof mysqlService.createListingPlan>
) {
  return withMysqlFallback(
    () => mysqlService.createListingPlan(...args),
    () => legacyService.createListingPlan(...args)
  );
}

export async function updateListingPlan(
  ...args: Parameters<typeof mysqlService.updateListingPlan>
) {
  return withMysqlFallback(
    () => mysqlService.updateListingPlan(...args),
    () => legacyService.updateListingPlan(...args)
  );
}
