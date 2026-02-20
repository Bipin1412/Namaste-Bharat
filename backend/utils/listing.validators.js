const SOURCE_VALUES = ["search", "reel", "profile"];

function isObject(value) {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function getTrimmedString(input, key) {
  const value = input[key];
  if (typeof value !== "string") {
    return null;
  }
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

function normalizeText(value) {
  return String(value || "").trim().toLowerCase();
}

function parseNumberParam(value, fallback, min, max) {
  if (value === undefined || value === null || value === "") {
    return fallback;
  }
  const parsed = Number.parseInt(String(value), 10);
  if (!Number.isFinite(parsed)) {
    return fallback;
  }
  return Math.min(Math.max(parsed, min), max);
}

function parseBooleanParam(value) {
  if (value === undefined || value === null || value === "") {
    return undefined;
  }
  const normalized = normalizeText(value);
  if (normalized === "true" || normalized === "1") {
    return true;
  }
  if (normalized === "false" || normalized === "0") {
    return false;
  }
  return undefined;
}

function sanitizePhone(value) {
  return String(value || "").replace(/[^\d+]/g, "");
}

function validateCreateBusinessPayload(payload) {
  if (!isObject(payload)) {
    return { ok: false, errors: ["Payload must be a JSON object."] };
  }

  const errors = [];
  const name = getTrimmedString(payload, "name");
  const category = getTrimmedString(payload, "category");
  const locality = getTrimmedString(payload, "locality");
  const city = getTrimmedString(payload, "city");
  const phone = getTrimmedString(payload, "phone");
  const whatsappNumber = getTrimmedString(payload, "whatsappNumber");

  if (!name) errors.push("`name` is required.");
  if (!category) errors.push("`category` is required.");
  if (!locality) errors.push("`locality` is required.");
  if (!city) errors.push("`city` is required.");
  if (!phone) errors.push("`phone` is required.");
  if (!whatsappNumber) errors.push("`whatsappNumber` is required.");

  const rating = typeof payload.rating === "number" ? payload.rating : 0;
  const reviewCount = typeof payload.reviewCount === "number" ? payload.reviewCount : 0;
  const isOpenNow = typeof payload.isOpenNow === "boolean" ? payload.isOpenNow : false;
  const verified = typeof payload.verified === "boolean" ? payload.verified : false;

  if (rating < 0 || rating > 5) {
    errors.push("`rating` must be between 0 and 5.");
  }
  if (!Number.isInteger(reviewCount) || reviewCount < 0) {
    errors.push("`reviewCount` must be a non-negative integer.");
  }

  const sanitizedPhone = sanitizePhone(phone || "");
  const sanitizedWhatsapp = sanitizePhone(whatsappNumber || "");
  if (sanitizedPhone.length < 10 || sanitizedPhone.length > 15) {
    errors.push("`phone` must contain 10 to 15 digits.");
  }
  if (sanitizedWhatsapp.length < 10 || sanitizedWhatsapp.length > 15) {
    errors.push("`whatsappNumber` must contain 10 to 15 digits.");
  }

  if (errors.length > 0) {
    return { ok: false, errors };
  }

  return {
    ok: true,
    data: {
      name,
      category,
      locality,
      city,
      phone: sanitizedPhone,
      whatsappNumber: sanitizedWhatsapp,
      tagline: getTrimmedString(payload, "tagline") || null,
      description: getTrimmedString(payload, "description") || null,
      addressLine1: getTrimmedString(payload, "addressLine1") || null,
      addressLine2: getTrimmedString(payload, "addressLine2") || null,
      pincode: getTrimmedString(payload, "pincode") || null,
      ownerName: getTrimmedString(payload, "ownerName") || null,
      email: getTrimmedString(payload, "email") || null,
      website: getTrimmedString(payload, "website") || null,
      rating: Number(rating.toFixed(1)),
      reviewCount,
      isOpenNow,
      verified,
      establishedYear:
        typeof payload.establishedYear === "number" && Number.isInteger(payload.establishedYear)
          ? payload.establishedYear
          : null,
      serviceAreas: Array.isArray(payload.serviceAreas) ? payload.serviceAreas : [],
      languages: Array.isArray(payload.languages) ? payload.languages : [],
      keywords: Array.isArray(payload.keywords) ? payload.keywords : [],
      highlights: Array.isArray(payload.highlights) ? payload.highlights : [],
      services: Array.isArray(payload.services) ? payload.services : [],
      businessHours: Array.isArray(payload.businessHours) ? payload.businessHours : [],
      media: isObject(payload.media) ? payload.media : {},
      faqs: Array.isArray(payload.faqs) ? payload.faqs : [],
      policies: isObject(payload.policies) ? payload.policies : {},
      socialLinks: isObject(payload.socialLinks) ? payload.socialLinks : {},
      verification: isObject(payload.verification) ? payload.verification : {},
    },
  };
}

function validateUpdateBusinessPayload(payload) {
  if (!isObject(payload)) {
    return { ok: false, errors: ["Payload must be a JSON object."] };
  }

  const allowed = [
    "name",
    "category",
    "tagline",
    "description",
    "locality",
    "city",
    "addressLine1",
    "addressLine2",
    "pincode",
    "ownerName",
    "establishedYear",
    "email",
    "website",
    "rating",
    "reviewCount",
    "isOpenNow",
    "verified",
    "phone",
    "whatsappNumber",
    "serviceAreas",
    "languages",
    "keywords",
    "highlights",
    "services",
    "businessHours",
    "media",
    "faqs",
    "policies",
    "socialLinks",
    "verification",
  ];

  const data = {};
  for (const key of allowed) {
    if (payload[key] !== undefined) {
      data[key] = payload[key];
    }
  }

  if (typeof data.phone === "string") {
    data.phone = sanitizePhone(data.phone);
  }
  if (typeof data.whatsappNumber === "string") {
    data.whatsappNumber = sanitizePhone(data.whatsappNumber);
  }

  if (Object.keys(data).length === 0) {
    return { ok: false, errors: ["At least one field must be provided."] };
  }

  return { ok: true, data };
}

function validateCreateLeadPayload(payload) {
  if (!isObject(payload)) {
    return { ok: false, errors: ["Payload must be a JSON object."] };
  }

  const errors = [];
  const businessId = getTrimmedString(payload, "businessId");
  const name = getTrimmedString(payload, "name");
  const phone = getTrimmedString(payload, "phone");
  const message = getTrimmedString(payload, "message");
  const source = getTrimmedString(payload, "source");

  if (!businessId) errors.push("`businessId` is required.");
  if (!name) errors.push("`name` is required.");
  if (!phone) errors.push("`phone` is required.");
  if (!message) errors.push("`message` is required.");
  if (!source) {
    errors.push("`source` is required.");
  } else if (!SOURCE_VALUES.includes(source)) {
    errors.push("`source` must be one of: search, reel, profile.");
  }

  const sanitizedPhone = sanitizePhone(phone || "");
  if (sanitizedPhone.length < 10 || sanitizedPhone.length > 15) {
    errors.push("`phone` must contain 10 to 15 digits.");
  }

  if (errors.length > 0) {
    return { ok: false, errors };
  }

  return {
    ok: true,
    data: {
      businessId,
      name,
      phone: sanitizedPhone,
      message,
      source,
    },
  };
}

function validateCreateReviewPayload(payload) {
  if (!isObject(payload)) {
    return { ok: false, errors: ["Payload must be a JSON object."] };
  }

  const errors = [];
  const businessId = getTrimmedString(payload, "businessId");
  const comment = getTrimmedString(payload, "comment") || "";
  const reviewerName = getTrimmedString(payload, "reviewerName") || "Anonymous";
  const rating = typeof payload.rating === "number" ? payload.rating : NaN;

  if (!businessId) errors.push("`businessId` is required.");
  if (!Number.isFinite(rating) || rating < 1 || rating > 5) {
    errors.push("`rating` must be between 1 and 5.");
  }

  if (errors.length > 0) {
    return { ok: false, errors };
  }

  return {
    ok: true,
    data: {
      businessId,
      rating: Number(rating.toFixed(1)),
      comment,
      reviewerName,
    },
  };
}

module.exports = {
  parseNumberParam,
  parseBooleanParam,
  normalizeText,
  validateCreateBusinessPayload,
  validateUpdateBusinessPayload,
  validateCreateLeadPayload,
  validateCreateReviewPayload,
};
