const {
  parseBooleanParam,
  parseNumberParam,
  validateCreateBusinessPayload,
  validateUpdateBusinessPayload,
  validateCreateLeadPayload,
  validateCreateReviewPayload,
  validateCreateDailyInquiryPostPayload,
} = require("../utils/listing.validators");
const {
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
} = require("../services/listing.service");

function handleError(res, error, fallbackMessage) {
  const message = error?.message || fallbackMessage;
  const status = error?.status || (error?.code === "PGRST116" ? 404 : 500);
  return res.status(status).json({ error: { message } });
}

async function home(_req, res) {
  try {
    const snapshot = await getHomeSnapshot();
    return res.json(snapshot);
  } catch (error) {
    return handleError(res, error, "Could not load home snapshot.");
  }
}

async function categories(_req, res) {
  try {
    const snapshot = await getHomeSnapshot();
    return res.json({
      data: snapshot.categories,
      meta: { total: snapshot.categories.length },
    });
  } catch (error) {
    return handleError(res, error, "Could not load categories.");
  }
}

async function businesses(req, res) {
  try {
    const payload = await listBusinesses({
      q: req.query.q,
      category: req.query.category,
      city: req.query.city,
      verified: parseBooleanParam(req.query.verified),
      openNow: parseBooleanParam(req.query.openNow),
      sort: req.query.sort || "rating_desc",
      page: parseNumberParam(req.query.page, 1, 1, 10000),
      limit: parseNumberParam(req.query.limit, 12, 1, 50),
    });

    return res.json(payload);
  } catch (error) {
    return handleError(res, error, "Could not load businesses.");
  }
}

async function businessById(req, res) {
  try {
    const business = await getBusinessById(req.params.id);
    if (!business) {
      return res.status(404).json({ error: { message: "Business not found." } });
    }

    return res.json(business);
  } catch (error) {
    return handleError(res, error, "Could not load business.");
  }
}

async function createBusinessHandler(req, res) {
  const validation = validateCreateBusinessPayload(req.body);
  if (!validation.ok) {
    return res.status(400).json({ error: { message: "Invalid business payload.", details: validation.errors } });
  }

  try {
    const created = await createBusiness(validation.data);
    return res.status(201).json(created);
  } catch (error) {
    return handleError(res, error, "Could not create business.");
  }
}

async function updateBusinessHandler(req, res) {
  const validation = validateUpdateBusinessPayload(req.body);
  if (!validation.ok) {
    return res.status(400).json({ error: { message: "Invalid business payload.", details: validation.errors } });
  }

  try {
    const updated = await updateBusiness(req.params.id, validation.data);
    if (!updated) {
      return res.status(404).json({ error: { message: "Business not found." } });
    }
    return res.json(updated);
  } catch (error) {
    return handleError(res, error, "Could not update business.");
  }
}

async function adminListings(req, res) {
  try {
    const status = String(req.query.status || "").trim().toLowerCase();
    const payload = await listAdminListings({
      sort: "newest",
      page: parseNumberParam(req.query.page, 1, 1, 10000),
      limit: parseNumberParam(req.query.limit, 50, 1, 100),
      includeInactive: true,
    });

    const data =
      status && ["pending", "active", "rejected"].includes(status)
        ? payload.data.filter((item) => item.listingStatus === status)
        : payload.data;

    return res.json({
      data,
      meta: {
        ...payload.meta,
        total: data.length,
      },
    });
  } catch (error) {
    return handleError(res, error, "Could not load admin listings.");
  }
}

async function activateListingHandler(req, res) {
  try {
    const updated = await activateListing(req.params.id);
    if (!updated) {
      return res.status(404).json({ error: { message: "Listing not found." } });
    }
    return res.json({
      ok: true,
      message: "Listing activated successfully.",
      listing: updated,
    });
  } catch (error) {
    return handleError(res, error, "Could not activate listing.");
  }
}

async function rejectListingHandler(req, res) {
  try {
    const reason =
      typeof req.body?.reason === "string" && req.body.reason.trim()
        ? req.body.reason.trim()
        : "Rejected by admin";

    const updated = await rejectListing(req.params.id, reason);
    if (!updated) {
      return res.status(404).json({ error: { message: "Listing not found." } });
    }
    return res.json({
      ok: true,
      message: "Listing rejected.",
      listing: updated,
    });
  } catch (error) {
    return handleError(res, error, "Could not reject listing.");
  }
}

async function deleteBusinessHandler(req, res) {
  try {
    const removed = await deleteBusiness(req.params.id);
    if (!removed) {
      return res.status(404).json({ error: { message: "Business not found." } });
    }
    return res.json({ ok: true });
  } catch (error) {
    return handleError(res, error, "Could not delete business.");
  }
}

async function reels(req, res) {
  try {
    const payload = await listReels({
      q: req.query.q,
      city: req.query.city,
      verified: parseBooleanParam(req.query.verified),
      page: parseNumberParam(req.query.page, 1, 1, 10000),
      limit: parseNumberParam(req.query.limit, 12, 1, 50),
    });

    return res.json(payload);
  } catch (error) {
    return handleError(res, error, "Could not load reels.");
  }
}

async function offers(req, res) {
  try {
    const activeOnly = parseBooleanParam(req.query.activeOnly);
    const data = await listOffers(activeOnly !== false);
    return res.json({ data, meta: { total: data.length } });
  } catch (error) {
    return handleError(res, error, "Could not load offers.");
  }
}

async function createLeadHandler(req, res) {
  const validation = validateCreateLeadPayload(req.body);
  if (!validation.ok) {
    return res.status(400).json({ error: { message: "Invalid lead payload.", details: validation.errors } });
  }

  try {
    const business = await getBusinessById(validation.data.businessId);
    if (!business) {
      return res.status(404).json({ error: { message: "Business for lead not found." } });
    }

    const created = await createLead(validation.data);
    return res.status(201).json(created);
  } catch (error) {
    return handleError(res, error, "Could not create lead.");
  }
}

async function leads(req, res) {
  try {
    const payload = await listLeads(
      parseNumberParam(req.query.page, 1, 1, 10000),
      parseNumberParam(req.query.limit, 20, 1, 100)
    );
    return res.json(payload);
  } catch (error) {
    return handleError(res, error, "Could not load leads.");
  }
}

async function reviews(req, res) {
  try {
    const payload = await listReviews(
      req.query.businessId,
      parseNumberParam(req.query.page, 1, 1, 10000),
      parseNumberParam(req.query.limit, 20, 1, 100)
    );
    return res.json(payload);
  } catch (error) {
    return handleError(res, error, "Could not load reviews.");
  }
}

async function createReviewHandler(req, res) {
  const validation = validateCreateReviewPayload(req.body);
  if (!validation.ok) {
    return res.status(400).json({ error: { message: "Invalid review payload.", details: validation.errors } });
  }

  try {
    const business = await getBusinessById(validation.data.businessId);
    if (!business) {
      return res.status(404).json({ error: { message: "Business for review not found." } });
    }

    const reviewerName = validation.data.reviewerName || req.authUser?.user_metadata?.full_name || "Anonymous";
    const created = await createReview({ ...validation.data, reviewerName }, req.authUser?.id || null);
    return res.status(201).json(created);
  } catch (error) {
    return handleError(res, error, "Could not create review.");
  }
}

async function sellerAnalytics(req, res) {
  const businessId = String(req.query.businessId || "").trim();
  if (!businessId) {
    return res.status(400).json({ error: { message: "businessId is required." } });
  }

  try {
    const business = await getBusinessById(businessId);
    if (!business) {
      return res.status(404).json({ error: { message: "Business not found." } });
    }

    const analytics = await getSellerAnalytics(businessId);
    return res.json(analytics);
  } catch (error) {
    return handleError(res, error, "Could not load seller analytics.");
  }
}

async function dailyInquiries(req, res) {
  try {
    const filterDate =
      typeof req.query.date === "string" && req.query.date.trim()
        ? req.query.date.trim()
        : "";
    const data = await listDailyInquiryPosts(filterDate || null);
    return res.json({
      data,
      meta: { total: data.length },
    });
  } catch (error) {
    return handleError(res, error, "Could not load daily inquiries.");
  }
}

async function createDailyInquiryHandler(req, res) {
  const validation = validateCreateDailyInquiryPostPayload(req.body);
  if (!validation.ok) {
    return res.status(400).json({
      error: { message: "Invalid daily inquiry payload.", details: validation.errors },
    });
  }

  try {
    const created = await createDailyInquiryPost(validation.data);
    return res.status(201).json(created);
  } catch (error) {
    return handleError(res, error, "Could not create daily inquiry.");
  }
}

async function adminDailyInquiries(req, res) {
  try {
    const filterDate =
      typeof req.query.date === "string" && req.query.date.trim()
        ? req.query.date.trim()
        : "";
    const data = await listDailyInquiryPosts(filterDate || null);
    return res.json({
      data,
      meta: { total: data.length },
    });
  } catch (error) {
    return handleError(res, error, "Could not load admin daily inquiries.");
  }
}

async function deleteDailyInquiryHandler(req, res) {
  try {
    const removed = await deleteDailyInquiryPost(req.params.id);
    if (!removed) {
      return res.status(404).json({ error: { message: "Daily inquiry not found." } });
    }
    return res.json({ ok: true });
  } catch (error) {
    return handleError(res, error, "Could not delete daily inquiry.");
  }
}

module.exports = {
  home,
  categories,
  businesses,
  businessById,
  createBusinessHandler,
  updateBusinessHandler,
  adminListings,
  activateListingHandler,
  rejectListingHandler,
  deleteBusinessHandler,
  reels,
  offers,
  leads,
  createLeadHandler,
  reviews,
  createReviewHandler,
  sellerAnalytics,
  dailyInquiries,
  createDailyInquiryHandler,
  adminDailyInquiries,
  deleteDailyInquiryHandler,
};
