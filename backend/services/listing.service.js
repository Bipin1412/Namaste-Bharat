const { supabaseAdminClient } = require("../config/supabase");
const { normalizeText } = require("../utils/listing.validators");
const masterCategories = require("../data/master-categories.json");

function ensureAdminClient() {
  if (!supabaseAdminClient) {
    const error = new Error("Server is missing SUPABASE_SERVICE_ROLE_KEY for marketplace APIs.");
    error.status = 500;
    throw error;
  }
}

function paginate(items, page, limit) {
  const total = items.length;
  const totalPages = Math.max(1, Math.ceil(total / limit));
  const safePage = Math.min(page, totalPages);
  const start = (safePage - 1) * limit;
  return {
    data: items.slice(start, start + limit),
    meta: {
      page: safePage,
      limit,
      total,
      totalPages,
    },
  };
}

function normalizeSearchText(value) {
  return normalizeText(value).replace(/[^a-z0-9]+/g, " ").replace(/\s+/g, " ").trim();
}

function tokenizeQuery(query) {
  const tokens = normalizeSearchText(query).split(" ").filter((token) => token.length >= 2);
  return [...new Set(tokens)];
}

function scoreField(fieldValue, tokens, weight) {
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

function tokenMatchesRow(entry, token) {
  const fields = [
    entry.name,
    entry.category,
    ...(entry.keywords || []),
    ...(entry.highlights || []),
    entry.tagline || "",
    entry.description || "",
    entry.locality,
    entry.city,
    entry.address_line_1,
    entry.address_line_2,
    entry.owner_name,
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

function getBusinessRelevanceScore(entry, tokens) {
  const servicesText = (entry.services || [])
    .map((service) => String(service?.name || ""))
    .join(" ");

  return (
    scoreField(entry.name, tokens, 8) +
    scoreField(entry.category, tokens, 7) +
    scoreField((entry.keywords || []).join(" "), tokens, 6) +
    scoreField(servicesText, tokens, 5) +
    scoreField((entry.highlights || []).join(" "), tokens, 4) +
    scoreField(entry.tagline || "", tokens, 3) +
    scoreField(entry.description || "", tokens, 2) +
    scoreField(entry.locality || "", tokens, 2) +
    scoreField(entry.city || "", tokens, 2) +
    scoreField(entry.address_line_1 || "", tokens, 1) +
    scoreField(entry.address_line_2 || "", tokens, 1) +
    scoreField(entry.owner_name || "", tokens, 1)
  );
}

function compareBySort(a, b, sort) {
  switch (sort) {
    case "rating_asc":
      return Number(a.rating || 0) - Number(b.rating || 0);
    case "reviews_desc":
      return Number(b.review_count || 0) - Number(a.review_count || 0);
    case "newest":
      return String(b.created_at).localeCompare(String(a.created_at));
    default:
      return Number(b.rating || 0) - Number(a.rating || 0);
  }
}

function applyBusinessFilters(businesses, filters) {
  const query = normalizeText(filters.q);
  const queryTokens = tokenizeQuery(query);
  const category = normalizeText(filters.category);
  const city = normalizeText(filters.city);

  const scored = businesses.flatMap((entry) => {
    if (!filters.includeInactive && entry.listing_status && entry.listing_status !== "active") {
      return [];
    }

    if (queryTokens.length > 0) {
      const allTokensMatch = queryTokens.every((token) => tokenMatchesRow(entry, token));
      if (!allTokensMatch) {
        return [];
      }
    }

    if (query) {
      const haystack = [
        entry.name,
        entry.category,
        entry.tagline,
        entry.description,
        entry.locality,
        entry.city,
        entry.address_line_1,
        entry.address_line_2,
        entry.owner_name,
        entry.email,
        entry.website,
        ...(entry.keywords || []),
        ...(entry.highlights || []),
        ...(entry.service_areas || []),
        ...(entry.languages || []),
      ]
        .join(" ")
        .toLowerCase();

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
    if (typeof filters.verified === "boolean" && Boolean(entry.verified) !== filters.verified) {
      return [];
    }
    if (typeof filters.openNow === "boolean" && Boolean(entry.is_open_now) !== filters.openNow) {
      return [];
    }

    const relevanceScore =
      queryTokens.length > 0 ? getBusinessRelevanceScore(entry, queryTokens) : 0;
    if (queryTokens.length > 0 && relevanceScore < 3) {
      return [];
    }

    return [{ entry, relevanceScore }];
  });

  const sort = filters.sort || "rating_desc";
  const sorted = scored.sort((a, b) => {
    if (queryTokens.length > 0 && b.relevanceScore !== a.relevanceScore) {
      return b.relevanceScore - a.relevanceScore;
    }
    return compareBySort(a.entry, b.entry, sort);
  });

  return sorted.map((item) => item.entry);
}

function mapBusiness(row) {
  return {
    id: row.id,
    name: row.name,
    category: row.category,
    tagline: row.tagline,
    description: row.description,
    locality: row.locality,
    city: row.city,
    addressLine1: row.address_line_1,
    addressLine2: row.address_line_2,
    pincode: row.pincode,
    ownerName: row.owner_name,
    establishedYear: row.established_year,
    email: row.email,
    website: row.website,
    rating: Number(row.rating || 0),
    reviewCount: Number(row.review_count || 0),
    isOpenNow: Boolean(row.is_open_now),
    verified: Boolean(row.verified),
    listingStatus: row.listing_status || "active",
    activatedAt: row.activated_at || null,
    rejectedReason: row.rejected_reason || null,
    phone: row.phone,
    whatsappNumber: row.whatsapp_number,
    serviceAreas: row.service_areas || [],
    languages: row.languages || [],
    keywords: row.keywords || [],
    highlights: row.highlights || [],
    services: row.services || [],
    businessHours: row.business_hours || [],
    media: row.media || {},
    faqs: row.faqs || [],
    policies: row.policies || {},
    socialLinks: row.social_links || {},
    verification: row.verification || {},
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function mapReel(row) {
  return {
    id: row.id,
    businessId: row.business_id,
    vendorName: row.vendor_name,
    handle: row.handle,
    description: row.description,
    city: row.city,
    verified: Boolean(row.verified),
    createdAt: row.created_at,
  };
}

function mapOffer(row) {
  return {
    id: row.id,
    title: row.title,
    subtitle: row.subtitle,
    badge: row.badge,
    active: Boolean(row.active),
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function mapLead(row) {
  return {
    id: row.id,
    businessId: row.business_id,
    name: row.name,
    phone: row.phone,
    message: row.message,
    source: row.source,
    createdAt: row.created_at,
  };
}

function mapReview(row) {
  return {
    id: row.id,
    businessId: row.business_id,
    userId: row.user_id,
    reviewerName: row.reviewer_name,
    rating: Number(row.rating || 0),
    comment: row.comment,
    createdAt: row.created_at,
  };
}

function mapDailyInquiry(row) {
  return {
    id: row.id,
    cityName: row.city_name,
    inquiryDate: row.inquiry_date,
    shortDescription: row.short_description,
    phoneNumber: row.phone_number,
    createdAt: row.created_at,
  };
}

function maskPhoneNumber(phoneNumber) {
  const digits = String(phoneNumber || "").replace(/\D/g, "");
  if (digits.length <= 4) return digits;
  return `${digits.slice(0, 2)}${"*".repeat(digits.length - 4)}${digits.slice(-2)}`;
}

async function listBusinesses(filters) {
  ensureAdminClient();
  const { data, error } = await supabaseAdminClient.from("businesses").select("*");
  if (error) throw error;

  const filtered = applyBusinessFilters(data || [], filters);
  const paginated = paginate(filtered, filters.page, filters.limit);
  return {
    data: paginated.data.map(mapBusiness),
    meta: paginated.meta,
  };
}

async function listAdminListings(filters) {
  return listBusinesses({
    ...filters,
    includeInactive: true,
  });
}

async function getBusinessById(id, options = {}) {
  ensureAdminClient();
  const { data, error } = await supabaseAdminClient
    .from("businesses")
    .select("*")
    .eq("id", id)
    .single();

  if (error && error.code !== "PGRST116") throw error;
  if (!data) return null;
  if (!options.includeInactive && data.listing_status && data.listing_status !== "active") {
    return null;
  }
  return mapBusiness(data);
}

function toBusinessDbPayload(input) {
  const payload = {
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
    activated_at: input.activatedAt,
    rejected_reason: input.rejectedReason,
    phone: input.phone,
    whatsapp_number: input.whatsappNumber,
    service_areas: input.serviceAreas,
    languages: input.languages,
    keywords: input.keywords,
    highlights: input.highlights,
    services: input.services,
    business_hours: input.businessHours,
    media: input.media,
    faqs: input.faqs,
    policies: input.policies,
    social_links: input.socialLinks,
    verification: input.verification,
  };

  Object.keys(payload).forEach((key) => {
    if (payload[key] === undefined) {
      delete payload[key];
    }
  });

  return payload;
}

async function createBusiness(input) {
  ensureAdminClient();
  const { data, error } = await supabaseAdminClient
    .from("businesses")
    .insert(
      toBusinessDbPayload({
        ...input,
        verified: false,
        listingStatus: "pending",
        activatedAt: null,
        rejectedReason: null,
      })
    )
    .select("*")
    .single();

  if (error) throw error;
  return mapBusiness(data);
}

async function updateBusiness(id, input) {
  ensureAdminClient();
  const { data, error } = await supabaseAdminClient
    .from("businesses")
    .update(toBusinessDbPayload(input))
    .eq("id", id)
    .select("*")
    .single();

  if (error && error.code !== "PGRST116") throw error;
  if (!data) return null;
  return mapBusiness(data);
}

async function activateListing(id) {
  return updateBusiness(id, {
    verified: true,
    listingStatus: "active",
    activatedAt: new Date().toISOString(),
    rejectedReason: null,
  });
}

async function rejectListing(id, reason) {
  return updateBusiness(id, {
    verified: false,
    listingStatus: "rejected",
    rejectedReason: reason || "Rejected by admin",
  });
}

async function deleteBusiness(id) {
  ensureAdminClient();
  const { error, count } = await supabaseAdminClient
    .from("businesses")
    .delete({ count: "exact" })
    .eq("id", id);

  if (error) throw error;
  return Boolean(count);
}

async function listReels(filters) {
  ensureAdminClient();
  const { data, error } = await supabaseAdminClient
    .from("reels")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) throw error;

  const query = normalizeText(filters.q);
  const city = normalizeText(filters.city);
  const filtered = (data || []).filter((entry) => {
    if (query) {
      const haystack = `${entry.vendor_name} ${entry.description} ${entry.handle} ${entry.city}`.toLowerCase();
      if (!haystack.includes(query)) return false;
    }
    if (city && normalizeText(entry.city) !== city) return false;
    if (typeof filters.verified === "boolean" && Boolean(entry.verified) !== filters.verified) {
      return false;
    }
    return true;
  });

  const paginated = paginate(filtered, filters.page, filters.limit);
  return {
    data: paginated.data.map(mapReel),
    meta: paginated.meta,
  };
}

async function listOffers(activeOnly) {
  ensureAdminClient();
  let query = supabaseAdminClient.from("offers").select("*").order("updated_at", {
    ascending: false,
  });

  if (activeOnly) {
    query = query.eq("active", true);
  }

  const { data, error } = await query;
  if (error) throw error;
  return (data || []).map(mapOffer);
}

async function createLead(input) {
  ensureAdminClient();
  const { data, error } = await supabaseAdminClient
    .from("leads")
    .insert({
      business_id: input.businessId,
      name: input.name,
      phone: input.phone,
      message: input.message,
      source: input.source,
    })
    .select("*")
    .single();

  if (error) throw error;
  return mapLead(data);
}

async function listLeads(page, limit) {
  ensureAdminClient();
  const { data, error } = await supabaseAdminClient
    .from("leads")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) throw error;
  const paginated = paginate(data || [], page, limit);
  return {
    data: paginated.data.map(mapLead),
    meta: paginated.meta,
  };
}

async function listReviews(businessId, page, limit) {
  ensureAdminClient();
  let query = supabaseAdminClient
    .from("reviews")
    .select("*")
    .order("created_at", { ascending: false });

  if (businessId) {
    query = query.eq("business_id", businessId);
  }

  const { data, error } = await query;
  if (error) throw error;

  const paginated = paginate(data || [], page, limit);
  return {
    data: paginated.data.map(mapReview),
    meta: paginated.meta,
  };
}

async function createReview(input, userId) {
  ensureAdminClient();

  const { data, error } = await supabaseAdminClient
    .from("reviews")
    .insert({
      business_id: input.businessId,
      user_id: userId || null,
      reviewer_name: input.reviewerName,
      rating: input.rating,
      comment: input.comment,
    })
    .select("*")
    .single();

  if (error) throw error;

  const { data: aggregate, error: aggregateError } = await supabaseAdminClient
    .from("reviews")
    .select("rating")
    .eq("business_id", input.businessId);

  if (!aggregateError) {
    const ratings = (aggregate || []).map((row) => Number(row.rating || 0)).filter((n) => n > 0);
    const total = ratings.length;
    const avg = total > 0 ? ratings.reduce((a, b) => a + b, 0) / total : 0;

    await supabaseAdminClient
      .from("businesses")
      .update({
        rating: Number(avg.toFixed(1)),
        review_count: total,
      })
      .eq("id", input.businessId);
  }

  return mapReview(data);
}

async function getHomeSnapshot() {
  const [businessesPayload, offersPayload] = await Promise.all([
    listBusinesses({ page: 1, limit: 1000, sort: "rating_desc", includeInactive: false }),
    listOffers(true),
  ]);

  const featuredBusinesses = businessesPayload.data
    .sort((a, b) => b.rating - a.rating || b.reviewCount - a.reviewCount)
    .slice(0, 8);

  const categoriesMap = new Map();
  for (const business of businessesPayload.data) {
    categoriesMap.set(
      business.category,
      (categoriesMap.get(business.category) || 0) + 1
    );
  }

  const mergedCategories = new Map();
  for (const [name, count] of categoriesMap.entries()) {
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
    offers: offersPayload.slice(0, 3),
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

async function getSellerAnalytics(businessId) {
  ensureAdminClient();

  const [{ data: leadRows, error: leadError }, { data: reviewRows, error: reviewError }] = await Promise.all([
    supabaseAdminClient.from("leads").select("id, source, created_at").eq("business_id", businessId),
    supabaseAdminClient.from("reviews").select("id, rating, created_at").eq("business_id", businessId),
  ]);

  if (leadError) throw leadError;
  if (reviewError) throw reviewError;

  const leads = leadRows || [];
  const reviews = reviewRows || [];

  const leadsBySource = {
    search: leads.filter((entry) => entry.source === "search").length,
    reel: leads.filter((entry) => entry.source === "reel").length,
    profile: leads.filter((entry) => entry.source === "profile").length,
  };

  const averageRating = reviews.length
    ? Number(
        (
          reviews.reduce((sum, entry) => sum + Number(entry.rating || 0), 0) /
          reviews.length
        ).toFixed(1)
      )
    : 0;

  return {
    businessId,
    totalLeads: leads.length,
    leadsBySource,
    totalReviews: reviews.length,
    averageRating,
    generatedAt: new Date().toISOString(),
  };
}

async function listDailyInquiries() {
  ensureAdminClient();
  const { data, error } = await supabaseAdminClient
    .from("daily_inquiries")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data || []).map(mapDailyInquiry);
}

async function createDailyInquiry(input) {
  ensureAdminClient();
  const { data, error } = await supabaseAdminClient
    .from("daily_inquiries")
    .insert({
      city_name: input.cityName,
      inquiry_date: input.inquiryDate,
      short_description: input.shortDescription,
      phone_number: input.phoneNumber,
    })
    .select("*")
    .single();

  if (error) throw error;
  return mapDailyInquiry(data);
}

async function deleteDailyInquiry(id) {
  ensureAdminClient();
  const { error, count } = await supabaseAdminClient
    .from("daily_inquiries")
    .delete({ count: "exact" })
    .eq("id", id);

  if (error) throw error;
  return Boolean(count);
}

module.exports = {
  listBusinesses,
  listAdminListings,
  getBusinessById,
  createBusiness,
  updateBusiness,
  activateListing,
  rejectListing,
  deleteBusiness,
  listReels,
  listOffers,
  createLead,
  listLeads,
  listReviews,
  createReview,
  getHomeSnapshot,
  getSellerAnalytics,
  listDailyInquiries,
  createDailyInquiry,
  deleteDailyInquiry,
  maskPhoneNumber,
};
