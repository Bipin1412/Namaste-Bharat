const { randomUUID } = require("crypto");
const masterCategories = require("../data/master-categories.json");
const { normalizeText } = require("../utils/listing.validators");
const {
  executeResult,
  parseJsonField,
  queryRows,
  toIsoString,
  toMysqlDateTime,
} = require("../lib/mysql");

const defaultListingPlans = [
  {
    id: "basic",
    name: "Basic listing",
    priceLabel: "Listing at Rs 120/-",
    shortLabel: "Basic",
    description: "A starter plan for local visibility on Namaste Bharat.",
    features: ["Listing on Namaste Bharat Portal", "Basic Marketing Tools"],
  },
  {
    id: "premium",
    name: "Premium listing",
    priceLabel: "Rs 3,000 / 1 year",
    shortLabel: "Premium",
    description: "A promotion-focused plan for stronger reach and lead flow.",
    features: [
      "Business listing on the Namaste Bharat portal",
      "100+ customer leads",
      "Customer enquiries directly on WhatsApp",
      "Effective digital promotion",
      "Mini website facility",
      "Trusted and secure service",
    ],
  },
];

function normalizeListingPlanId(value) {
  return (
    String(value || "")
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "") || "plan"
  );
}

function normalizeListingPlan(input) {
  const name = String(input.name || "").trim();
  const shortLabel = String(input.shortLabel || "").trim();
  const description = String(input.description || "").trim();
  const priceLabel = String(input.priceLabel || "").trim();
  const features = Array.isArray(input.features)
    ? input.features.map((item) => String(item || "").trim()).filter(Boolean)
    : [];
  const id = normalizeListingPlanId(String(input.id || name || shortLabel));

  if (!name || !shortLabel || !description || !priceLabel || features.length === 0) {
    return null;
  }

  return {
    id,
    name,
    shortLabel,
    description,
    priceLabel,
    features,
  };
}

function normalizeListingPlans(input) {
  if (!Array.isArray(input)) {
    return defaultListingPlans;
  }

  const normalized = input
    .map((entry) => (typeof entry === "object" && entry !== null ? normalizeListingPlan(entry) : null))
    .filter(Boolean);

  return normalized.length > 0 ? normalized : defaultListingPlans;
}

function paginate(entries, page, limit) {
  const safePage = Number.isFinite(page) && page > 0 ? Math.floor(page) : 1;
  const safeLimit = Number.isFinite(limit) && limit > 0 ? Math.min(Math.floor(limit), 100) : 12;
  const total = entries.length;
  const totalPages = Math.max(1, Math.ceil(total / safeLimit));
  const currentPage = Math.min(safePage, totalPages);
  const start = (currentPage - 1) * safeLimit;
  const end = start + safeLimit;

  return {
    data: entries.slice(start, end),
    meta: {
      page: currentPage,
      limit: safeLimit,
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

function buildBusinessSearchText(entry) {
  const servicesText =
    entry.services?.flatMap((service) => [service.name, service.priceLabel || "", service.description || ""]) || [];
  const faqText = entry.faqs?.flatMap((faq) => [faq.question, faq.answer]) || [];
  const hourText =
    entry.businessHours?.map((slot) =>
      slot.closed ? `${slot.day} closed` : `${slot.day} ${slot.open || ""} ${slot.close || ""}`
    ) || [];

  return [
    entry.name,
    entry.category,
    entry.tagline || "",
    entry.description || "",
    entry.locality,
    entry.city,
    entry.addressLine1 || "",
    entry.addressLine2 || "",
    entry.pincode || "",
    entry.ownerName || "",
    entry.email || "",
    entry.website || "",
    ...(entry.serviceAreas || []),
    ...(entry.languages || []),
    ...(entry.keywords || []),
    ...(entry.highlights || []),
    ...(entry.policies?.paymentMethods || []),
    entry.policies?.cancellationPolicy || "",
    entry.verification?.gstNumber || "",
    entry.verification?.licenseNumber || "",
    ...servicesText,
    ...faqText,
    ...hourText,
  ]
    .join(" ")
    .toLowerCase();
}

function getBusinessRelevanceScore(entry, tokens) {
  const servicesText = entry.services?.map((service) => service.name).join(" ") || "";
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
    scoreField(entry.addressLine1 || "", tokens, 1) +
    scoreField(entry.addressLine2 || "", tokens, 1) +
    scoreField(entry.ownerName || "", tokens, 1)
  );
}

function compareBusinessesBySort(a, b, sort) {
  switch (sort) {
    case "rating_asc":
      return a.rating - b.rating;
    case "reviews_desc":
      return b.reviewCount - a.reviewCount;
    case "newest":
      return b.createdAt.localeCompare(a.createdAt);
    case "rating_desc":
    default:
      return b.rating - a.rating;
  }
}

function applyBusinessFilters(businesses, filters) {
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

    const relevanceScore = queryTokens.length > 0 ? getBusinessRelevanceScore(entry, queryTokens) : 0;
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
    return compareBusinessesBySort(a.entry, b.entry, sort);
  });

  return sorted.map((item) => item.entry);
}

function tokenMatchesEntry(entry, token) {
  const fields = [
    entry.name,
    entry.category,
    ...(entry.keywords || []),
    ...(entry.highlights || []),
    entry.tagline || "",
    entry.description || "",
    entry.locality,
    entry.city,
    entry.addressLine1 || "",
    entry.addressLine2 || "",
    entry.ownerName || "",
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

function applyReelFilters(reels, filters) {
  const query = normalizeText(filters.q);
  const city = normalizeText(filters.city);

  return reels.filter((entry) => {
    if (query) {
      const haystack = `${entry.vendorName} ${entry.description} ${entry.handle} ${entry.city}`.toLowerCase();
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

function mapBusiness(row) {
  return {
    id: row.id,
    name: row.name,
    category: row.category,
    tagline: row.tagline || undefined,
    description: row.description || undefined,
    locality: row.locality,
    city: row.city,
    addressLine1: row.address_line_1 || undefined,
    addressLine2: row.address_line_2 || undefined,
    pincode: row.pincode || undefined,
    ownerName: row.owner_name || undefined,
    establishedYear: row.established_year || undefined,
    email: row.email || undefined,
    website: row.website || undefined,
    rating: Number(row.rating || 0),
    reviewCount: Number(row.review_count || 0),
    isOpenNow: Boolean(row.is_open_now),
    verified: Boolean(row.verified),
    listingStatus: row.listing_status || "active",
    activatedAt: row.activated_at ? toIsoString(row.activated_at) : null,
    rejectedReason: row.rejected_reason || null,
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

function mapReel(row) {
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

function mapOffer(row) {
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

function mapLead(row) {
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

function mapReview(row) {
  return {
    id: row.id,
    businessId: row.business_id,
    userId: row.user_id,
    reviewerName: row.reviewer_name,
    rating: Number(row.rating || 0),
    comment: row.comment,
    createdAt: toIsoString(row.created_at),
  };
}

function mapDailyInquiryPost(row) {
  return {
    id: row.id,
    inquiryDate: row.inquiry_date,
    description: row.description,
    createdAt: toIsoString(row.created_at),
    updatedAt: toIsoString(row.updated_at),
  };
}

function mapListingPlan(row) {
  return {
    id: row.id,
    name: row.name,
    priceLabel: row.price_label,
    shortLabel: row.short_label,
    description: row.description,
    features: parseJsonField(row.features, []),
  };
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

async function fetchAllBusinesses() {
  const rows = await queryRows("SELECT * FROM businesses");
  return rows.map(mapBusiness);
}

async function listBusinesses(filters) {
  const businesses = await fetchAllBusinesses();
  const filtered = applyBusinessFilters(businesses, filters);
  return paginate(filtered, filters.page, filters.limit);
}

async function listAdminListings(filters) {
  return listBusinesses({
    ...filters,
    includeInactive: true,
  });
}

async function getBusinessById(id, options = {}) {
  const rows = await queryRows("SELECT * FROM businesses WHERE id = ? LIMIT 1", [id]);
  const row = rows[0];
  if (!row) {
    return null;
  }

  if (!options.includeInactive && row.listing_status && row.listing_status !== "active") {
    return null;
  }

  return mapBusiness(row);
}

async function createBusiness(input) {
  const id = randomUUID();
  const now = new Date().toISOString();
  const verified = input.verified === true;
  const listingStatus = input.listingStatus || (verified ? "active" : "pending");
  const activatedAt = listingStatus === "active" ? input.activatedAt || now : null;

  const payload = toBusinessDbPayload({
    ...input,
    verified,
    listingStatus,
    activatedAt,
    rejectedReason: null,
  });

  const entries = Object.entries(payload);
  const columns = ["id", ...entries.map(([key]) => key), "created_at", "updated_at"];
  const placeholders = columns.map(() => "?").join(", ");
  const values = [id, ...entries.map(([, value]) => value), toMysqlDateTime(now), toMysqlDateTime(now)];

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

async function updateBusiness(id, input) {
  const payload = toBusinessDbPayload(input);
  const entries = Object.entries(payload);

  if (entries.length === 0) {
    return getBusinessById(id, { includeInactive: true });
  }

  const setClauses = entries.map(([key]) => `${key} = ?`);
  const values = entries.map(([, value]) => value);
  setClauses.push("updated_at = CURRENT_TIMESTAMP");

  const result = await executeResult(
    `UPDATE businesses SET ${setClauses.join(", ")} WHERE id = ?`,
    [...values, id]
  );

  if (!result.affectedRows) {
    return null;
  }

  return getBusinessById(id, { includeInactive: true });
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
  const result = await executeResult("DELETE FROM businesses WHERE id = ?", [id]);
  return result.affectedRows > 0;
}

async function listReels(filters) {
  const rows = await queryRows("SELECT * FROM reels ORDER BY created_at DESC");
  const filtered = applyReelFilters(rows.map(mapReel), filters);
  return paginate(filtered, filters.page, filters.limit);
}

async function listOffers(activeOnly = true) {
  const rows = await queryRows(
    `SELECT * FROM offers ${activeOnly ? "WHERE active = 1" : ""} ORDER BY updated_at DESC`
  );
  return rows.map(mapOffer);
}

async function createLead(input) {
  const id = randomUUID();
  await executeResult(
    `INSERT INTO leads (id, business_id, name, phone, message, source)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [id, input.businessId, input.name, input.phone, input.message, input.source]
  );

  const rows = await queryRows("SELECT * FROM leads WHERE id = ? LIMIT 1", [id]);
  if (!rows[0]) {
    throw new Error("Lead was created but could not be loaded.");
  }

  return mapLead(rows[0]);
}

async function listLeads(page = 1, limit = 20) {
  const rows = await queryRows("SELECT * FROM leads ORDER BY created_at DESC");
  return paginate(rows.map(mapLead), page, limit);
}

async function listReviews(businessId, page = 1, limit = 20) {
  const rows = businessId
    ? await queryRows(
        `SELECT * FROM reviews WHERE business_id = ? ORDER BY created_at DESC`,
        [businessId]
      )
    : await queryRows("SELECT * FROM reviews ORDER BY created_at DESC");

  return paginate(rows.map(mapReview), page, limit);
}

async function createReview(input, userId) {
  const id = randomUUID();
  await executeResult(
    `INSERT INTO reviews (id, business_id, user_id, reviewer_name, rating, comment)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [id, input.businessId, userId || null, input.reviewerName, input.rating, input.comment || null]
  );

  const ratingsRows = await queryRows(
    `SELECT rating FROM reviews WHERE business_id = ?`,
    [input.businessId]
  );
  const ratings = ratingsRows.map((row) => Number(row.rating || 0)).filter((value) => value > 0);
  const total = ratings.length;
  const average = total > 0 ? ratings.reduce((sum, value) => sum + value, 0) / total : 0;

  await executeResult(
    `UPDATE businesses SET rating = ?, review_count = ? WHERE id = ?`,
    [Number(average.toFixed(1)), total, input.businessId]
  );

  const rows = await queryRows("SELECT * FROM reviews WHERE id = ? LIMIT 1", [id]);
  if (!rows[0]) {
    throw new Error("Review was created but could not be loaded.");
  }

  return mapReview(rows[0]);
}

async function getHomeSnapshot() {
  const [businessPayload, offers] = await Promise.all([
    listBusinesses({ page: 1, limit: 1000, sort: "rating_desc", includeInactive: false }),
    listOffers(true),
  ]);

  const featuredBusinesses = [...businessPayload.data]
    .sort((a, b) => b.rating - a.rating || b.reviewCount - a.reviewCount)
    .slice(0, 8);

  const categoryCounter = new Map();
  for (const business of businessPayload.data) {
    categoryCounter.set(business.category, (categoryCounter.get(business.category) || 0) + 1);
  }

  const mergedCategories = new Map();
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

  const categories = [...mergedCategories.values()].sort(
    (a, b) => b.count - a.count || a.name.localeCompare(b.name)
  );

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

async function getSellerAnalytics(businessId) {
  const [leadRows, reviewRows] = await Promise.all([
    queryRows(`SELECT id, source, created_at FROM leads WHERE business_id = ?`, [businessId]),
    queryRows(`SELECT id, rating, created_at FROM reviews WHERE business_id = ?`, [businessId]),
  ]);

  const leads = leadRows || [];
  const reviews = reviewRows || [];

  const leadsBySource = {
    search: leads.filter((entry) => entry.source === "search").length,
    reel: leads.filter((entry) => entry.source === "reel").length,
    profile: leads.filter((entry) => entry.source === "profile").length,
  };

  const averageRating = reviews.length
    ? Number((reviews.reduce((sum, entry) => sum + Number(entry.rating || 0), 0) / reviews.length).toFixed(1))
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

async function listListingPlans() {
  const rows = await queryRows(
    "SELECT id, name, price_label, short_label, description, features FROM listing_plans ORDER BY name ASC"
  );
  return normalizeListingPlans(rows.map(mapListingPlan));
}

async function createListingPlan(input) {
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
    [next.id, next.name, next.priceLabel, next.shortLabel, next.description, JSON.stringify(next.features)]
  );

  return next;
}

async function updateListingPlan(id, input) {
  const existingPlans = await listListingPlans();
  const existing = existingPlans.find((plan) => plan.id === id);
  if (!existing) {
    return null;
  }

  const updated = normalizeListingPlan({ ...existing, ...input, id });
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

async function listDailyInquiryPosts(filterDate) {
  const rows = filterDate
    ? await queryRows(
        `SELECT id, inquiry_date, description, created_at, updated_at
         FROM daily_inquiry_posts
         WHERE inquiry_date = ?
         ORDER BY inquiry_date DESC, created_at DESC`,
        [filterDate]
      )
    : await queryRows(
        `SELECT id, inquiry_date, description, created_at, updated_at
         FROM daily_inquiry_posts
         ORDER BY inquiry_date DESC, created_at DESC`
      );

  return rows.map(mapDailyInquiryPost);
}

async function createDailyInquiryPost(input) {
  const id = randomUUID();
  await executeResult(
    `INSERT INTO daily_inquiry_posts (id, inquiry_date, description)
     VALUES (?, ?, ?)`,
    [id, input.inquiryDate, input.description]
  );

  const rows = await queryRows(
    `SELECT id, inquiry_date, description, created_at, updated_at
     FROM daily_inquiry_posts
     WHERE id = ?
     LIMIT 1`,
    [id]
  );

  if (!rows[0]) {
    throw new Error("Daily inquiry post was created but could not be loaded.");
  }

  return mapDailyInquiryPost(rows[0]);
}

async function deleteDailyInquiryPost(id) {
  const result = await executeResult("DELETE FROM daily_inquiry_posts WHERE id = ?", [id]);
  return result.affectedRows > 0;
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
  listDailyInquiryPosts,
  createDailyInquiryPost,
  deleteDailyInquiryPost,
};
