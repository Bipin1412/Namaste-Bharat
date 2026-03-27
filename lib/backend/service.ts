import { hasMysqlConfig } from "@/lib/server/mysql";
import * as legacy from "./service-legacy";
import * as mysql from "./service-mysql";

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

function getService() {
  return hasMysqlConfig() ? mysql : legacy;
}

export async function listBusinesses(...args: Parameters<typeof legacy.listBusinesses>) {
  return getService().listBusinesses(...args);
}

export async function getBusinessById(...args: Parameters<typeof legacy.getBusinessById>) {
  return getService().getBusinessById(...args);
}

export async function createBusiness(...args: Parameters<typeof legacy.createBusiness>) {
  return getService().createBusiness(...args);
}

export async function updateBusiness(...args: Parameters<typeof legacy.updateBusiness>) {
  return getService().updateBusiness(...args);
}

export async function deleteBusiness(...args: Parameters<typeof legacy.deleteBusiness>) {
  return getService().deleteBusiness(...args);
}

export async function listReels(...args: Parameters<typeof legacy.listReels>) {
  return getService().listReels(...args);
}

export async function listOffers(...args: Parameters<typeof legacy.listOffers>) {
  return getService().listOffers(...args);
}

export async function createLead(...args: Parameters<typeof legacy.createLead>) {
  return getService().createLead(...args);
}

export async function listLeads(...args: Parameters<typeof legacy.listLeads>) {
  return getService().listLeads(...args);
}

export async function getHomeSnapshot(...args: Parameters<typeof legacy.getHomeSnapshot>) {
  return getService().getHomeSnapshot(...args);
}

export async function getDatabaseStats(...args: Parameters<typeof legacy.getDatabaseStats>) {
  return getService().getDatabaseStats(...args);
}

export async function listListingPlans(...args: Parameters<typeof legacy.listListingPlans>) {
  return getService().listListingPlans(...args);
}

export async function createListingPlan(...args: Parameters<typeof legacy.createListingPlan>) {
  return getService().createListingPlan(...args);
}

export async function updateListingPlan(...args: Parameters<typeof legacy.updateListingPlan>) {
  return getService().updateListingPlan(...args);
}
