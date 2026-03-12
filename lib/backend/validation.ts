import type {
  CreateBusinessInput,
  CreateLeadInput,
  UpdateBusinessInput,
} from "./service";
import type {
  BusinessFaq,
  BusinessHour,
  BusinessMedia,
  BusinessPolicies,
  BusinessService,
  BusinessSocialLinks,
  BusinessVerification,
} from "./types";

type ValidationResult<T> =
  | { ok: true; data: T }
  | { ok: false; errors: string[] };

const SOURCE_VALUES = ["search", "reel", "profile"] as const;

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function getTrimmedString(
  input: Record<string, unknown>,
  key: string
): string | null {
  const value = input[key];
  if (typeof value !== "string") {
    return null;
  }

  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

function getOptionalTrimmedString(
  input: Record<string, unknown>,
  key: string
): string | undefined {
  if (!(key in input)) {
    return undefined;
  }

  const value = input[key];
  if (value === null || value === undefined) {
    return undefined;
  }

  if (typeof value !== "string") {
    return undefined;
  }

  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}

function getOptionalBoolean(
  input: Record<string, unknown>,
  key: string
): boolean | undefined {
  if (!(key in input)) {
    return undefined;
  }

  const value = input[key];
  return typeof value === "boolean" ? value : undefined;
}

function getOptionalNumber(
  input: Record<string, unknown>,
  key: string
): number | undefined {
  if (!(key in input)) {
    return undefined;
  }

  const value = input[key];
  return typeof value === "number" && Number.isFinite(value) ? value : undefined;
}

function sanitizePhone(value: string): string {
  return value.replace(/[^\d+]/g, "");
}

function parseStringArray(value: unknown): string[] | null {
  if (!Array.isArray(value)) {
    return null;
  }

  const items: string[] = [];
  for (const entry of value) {
    if (typeof entry !== "string") {
      return null;
    }
    const trimmed = entry.trim();
    if (trimmed.length > 0) {
      items.push(trimmed);
    }
  }

  return items;
}

function parseServices(value: unknown): BusinessService[] | null {
  if (!Array.isArray(value)) {
    return null;
  }

  const services: BusinessService[] = [];
  for (const entry of value) {
    if (!isObject(entry)) {
      return null;
    }

    const name = typeof entry.name === "string" ? entry.name.trim() : "";
    if (!name) {
      return null;
    }

    const service: BusinessService = { name };

    if ("priceLabel" in entry && entry.priceLabel !== undefined && entry.priceLabel !== null) {
      if (typeof entry.priceLabel !== "string") {
        return null;
      }
      const priceLabel = entry.priceLabel.trim();
      if (priceLabel) {
        service.priceLabel = priceLabel;
      }
    }

    if (
      "description" in entry &&
      entry.description !== undefined &&
      entry.description !== null
    ) {
      if (typeof entry.description !== "string") {
        return null;
      }
      const description = entry.description.trim();
      if (description) {
        service.description = description;
      }
    }

    services.push(service);
  }

  return services;
}

function parseBusinessHours(value: unknown): BusinessHour[] | null {
  if (!Array.isArray(value)) {
    return null;
  }

  const hours: BusinessHour[] = [];
  for (const entry of value) {
    if (!isObject(entry)) {
      return null;
    }

    const day = typeof entry.day === "string" ? entry.day.trim() : "";
    if (!day) {
      return null;
    }

    const closed = typeof entry.closed === "boolean" ? entry.closed : false;
    if (closed) {
      hours.push({ day, closed: true });
      continue;
    }

    const open = typeof entry.open === "string" ? entry.open.trim() : "";
    const close = typeof entry.close === "string" ? entry.close.trim() : "";
    if (!open || !close) {
      return null;
    }

    hours.push({
      day,
      open,
      close,
      closed: false,
    });
  }

  return hours;
}

function parseFaqs(value: unknown): BusinessFaq[] | null {
  if (!Array.isArray(value)) {
    return null;
  }

  const faqs: BusinessFaq[] = [];
  for (const entry of value) {
    if (!isObject(entry)) {
      return null;
    }

    const question =
      typeof entry.question === "string" ? entry.question.trim() : "";
    const answer = typeof entry.answer === "string" ? entry.answer.trim() : "";
    if (!question || !answer) {
      return null;
    }

    faqs.push({ question, answer });
  }

  return faqs;
}

function parseMedia(value: unknown): BusinessMedia | null {
  if (!isObject(value)) {
    return null;
  }

  const media: BusinessMedia = {};

  if ("logo" in value && value.logo !== undefined && value.logo !== null) {
    if (typeof value.logo !== "string") {
      return null;
    }
    const logo = value.logo.trim();
    if (logo) {
      media.logo = logo;
    }
  }

  const listKeys = ["coverImages", "gallery", "videos", "certificates"] as const;
  for (const key of listKeys) {
    if (!(key in value) || value[key] === undefined || value[key] === null) {
      continue;
    }

    const parsed = parseStringArray(value[key]);
    if (!parsed) {
      return null;
    }
    media[key] = parsed;
  }

  return media;
}

function parsePolicies(value: unknown): BusinessPolicies | null {
  if (!isObject(value)) {
    return null;
  }

  const policies: BusinessPolicies = {};

  if ("listingPlan" in value && value.listingPlan !== undefined && value.listingPlan !== null) {
    if (typeof value.listingPlan !== "string") {
      return null;
    }
    const listingPlan = value.listingPlan.trim().toLowerCase();
    if (listingPlan !== "basic" && listingPlan !== "premium") {
      return null;
    }
    policies.listingPlan = listingPlan;
  }

  if (
    "paymentMethods" in value &&
    value.paymentMethods !== undefined &&
    value.paymentMethods !== null
  ) {
    const parsed = parseStringArray(value.paymentMethods);
    if (!parsed) {
      return null;
    }
    policies.paymentMethods = parsed;
  }

  const boolKeys = ["homeService", "emergencyService", "appointmentRequired"] as const;
  for (const key of boolKeys) {
    if (!(key in value) || value[key] === undefined || value[key] === null) {
      continue;
    }
    if (typeof value[key] !== "boolean") {
      return null;
    }
    policies[key] = value[key];
  }

  if (
    "cancellationPolicy" in value &&
    value.cancellationPolicy !== undefined &&
    value.cancellationPolicy !== null
  ) {
    if (typeof value.cancellationPolicy !== "string") {
      return null;
    }
    const cancellationPolicy = value.cancellationPolicy.trim();
    if (cancellationPolicy) {
      policies.cancellationPolicy = cancellationPolicy;
    }
  }

  return policies;
}

function parseSocialLinks(value: unknown): BusinessSocialLinks | null {
  if (!isObject(value)) {
    return null;
  }

  const social: BusinessSocialLinks = {};
  const keys = ["instagram", "facebook", "youtube"] as const;

  for (const key of keys) {
    if (!(key in value) || value[key] === undefined || value[key] === null) {
      continue;
    }
    if (typeof value[key] !== "string") {
      return null;
    }
    const link = value[key].trim();
    if (link) {
      social[key] = link;
    }
  }

  return social;
}

function parseVerification(value: unknown): BusinessVerification | null {
  if (!isObject(value)) {
    return null;
  }

  const verification: BusinessVerification = {};
  const keys = ["gstNumber", "licenseNumber", "verifiedOn"] as const;

  for (const key of keys) {
    if (!(key in value) || value[key] === undefined || value[key] === null) {
      continue;
    }
    if (typeof value[key] !== "string") {
      return null;
    }
    const content = value[key].trim();
    if (content) {
      verification[key] = content;
    }
  }

  return verification;
}

function parseProfileEnhancements(
  payload: Record<string, unknown>,
  errors: string[]
): Partial<CreateBusinessInput> {
  const enhancements: Partial<CreateBusinessInput> = {};

  const optionalStringKeys = [
    "tagline",
    "description",
    "ownerName",
    "addressLine1",
    "addressLine2",
    "pincode",
    "email",
    "website",
  ] as const;

  for (const key of optionalStringKeys) {
    if (!(key in payload) || payload[key] === undefined || payload[key] === null) {
      continue;
    }

    if (typeof payload[key] !== "string") {
      errors.push(`\`${key}\` must be a string.`);
      continue;
    }

    const trimmed = payload[key].trim();
    if (trimmed) {
      enhancements[key] = trimmed;
    }
  }

  if (
    "establishedYear" in payload &&
    payload.establishedYear !== undefined &&
    payload.establishedYear !== null
  ) {
    const value = payload.establishedYear;
    if (typeof value !== "number" || !Number.isInteger(value)) {
      errors.push("`establishedYear` must be an integer.");
    } else if (value < 1900 || value > new Date().getFullYear() + 1) {
      errors.push("`establishedYear` must be in a valid year range.");
    } else {
      enhancements.establishedYear = value;
    }
  }

  const stringArrayKeys = ["serviceAreas", "languages", "keywords", "highlights"] as const;
  for (const key of stringArrayKeys) {
    if (!(key in payload) || payload[key] === undefined || payload[key] === null) {
      continue;
    }

    const parsed = parseStringArray(payload[key]);
    if (!parsed) {
      errors.push(`\`${key}\` must be an array of strings.`);
      continue;
    }

    enhancements[key] = parsed;
  }

  if ("services" in payload && payload.services !== undefined && payload.services !== null) {
    const parsed = parseServices(payload.services);
    if (!parsed) {
      errors.push("`services` must be an array of valid service objects.");
    } else {
      enhancements.services = parsed;
    }
  }

  if (
    "businessHours" in payload &&
    payload.businessHours !== undefined &&
    payload.businessHours !== null
  ) {
    const parsed = parseBusinessHours(payload.businessHours);
    if (!parsed) {
      errors.push("`businessHours` must be an array of valid day/time objects.");
    } else {
      enhancements.businessHours = parsed;
    }
  }

  if ("faqs" in payload && payload.faqs !== undefined && payload.faqs !== null) {
    const parsed = parseFaqs(payload.faqs);
    if (!parsed) {
      errors.push("`faqs` must be an array of valid question/answer pairs.");
    } else {
      enhancements.faqs = parsed;
    }
  }

  if ("media" in payload && payload.media !== undefined && payload.media !== null) {
    const parsed = parseMedia(payload.media);
    if (!parsed) {
      errors.push("`media` must be a valid media object.");
    } else {
      enhancements.media = parsed;
    }
  }

  if ("policies" in payload && payload.policies !== undefined && payload.policies !== null) {
    const parsed = parsePolicies(payload.policies);
    if (!parsed) {
      errors.push("`policies` must be a valid policies object.");
    } else {
      enhancements.policies = parsed;
    }
  }

  if (
    "socialLinks" in payload &&
    payload.socialLinks !== undefined &&
    payload.socialLinks !== null
  ) {
    const parsed = parseSocialLinks(payload.socialLinks);
    if (!parsed) {
      errors.push("`socialLinks` must be a valid social links object.");
    } else {
      enhancements.socialLinks = parsed;
    }
  }

  if (
    "verification" in payload &&
    payload.verification !== undefined &&
    payload.verification !== null
  ) {
    const parsed = parseVerification(payload.verification);
    if (!parsed) {
      errors.push("`verification` must be a valid verification object.");
    } else {
      enhancements.verification = parsed;
    }
  }

  return enhancements;
}

export function validateCreateBusinessPayload(
  payload: unknown
): ValidationResult<CreateBusinessInput> {
  if (!isObject(payload)) {
    return { ok: false, errors: ["Payload must be a JSON object."] };
  }

  const errors: string[] = [];

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

  const ratingValue = getOptionalNumber(payload, "rating") ?? 0;
  const reviewCountValue = getOptionalNumber(payload, "reviewCount") ?? 0;
  const isOpenNow = getOptionalBoolean(payload, "isOpenNow") ?? false;
  const verified = getOptionalBoolean(payload, "verified") ?? false;

  if (ratingValue < 0 || ratingValue > 5) {
    errors.push("`rating` must be between 0 and 5.");
  }

  if (!Number.isInteger(reviewCountValue) || reviewCountValue < 0) {
    errors.push("`reviewCount` must be a non-negative integer.");
  }

  const sanitizedPhone = phone ? sanitizePhone(phone) : "";
  const sanitizedWhatsapp = whatsappNumber ? sanitizePhone(whatsappNumber) : "";
  if (sanitizedPhone.length < 10 || sanitizedPhone.length > 15) {
    errors.push("`phone` must contain 10 to 15 digits.");
  }
  if (sanitizedWhatsapp.length < 10 || sanitizedWhatsapp.length > 15) {
    errors.push("`whatsappNumber` must contain 10 to 15 digits.");
  }

  const enhancements = parseProfileEnhancements(payload, errors);

  if (errors.length > 0) {
    return { ok: false, errors };
  }

  return {
    ok: true,
    data: {
      name: name!,
      category: category!,
      locality: locality!,
      city: city!,
      rating: Number(ratingValue.toFixed(1)),
      reviewCount: reviewCountValue,
      isOpenNow,
      verified,
      phone: sanitizedPhone,
      whatsappNumber: sanitizedWhatsapp,
      ...enhancements,
    },
  };
}

export function validateUpdateBusinessPayload(
  payload: unknown
): ValidationResult<UpdateBusinessInput> {
  if (!isObject(payload)) {
    return { ok: false, errors: ["Payload must be a JSON object."] };
  }

  const candidate: UpdateBusinessInput = {};
  const errors: string[] = [];

  const stringKeys = [
    "name",
    "category",
    "locality",
    "city",
    "phone",
    "whatsappNumber",
  ] as const;

  for (const key of stringKeys) {
    if (!(key in payload) || payload[key] === undefined || payload[key] === null) {
      continue;
    }

    if (typeof payload[key] !== "string" || !payload[key].trim()) {
      errors.push(`\`${key}\` must be a non-empty string.`);
      continue;
    }

    const value = payload[key].trim();
    if (key === "phone" || key === "whatsappNumber") {
      candidate[key] = sanitizePhone(value);
    } else {
      candidate[key] = value;
    }
  }

  const rating = getOptionalNumber(payload, "rating");
  if (rating !== undefined) {
    if (rating < 0 || rating > 5) {
      errors.push("`rating` must be between 0 and 5.");
    } else {
      candidate.rating = Number(rating.toFixed(1));
    }
  } else if ("rating" in payload && payload.rating !== undefined) {
    errors.push("`rating` must be a number.");
  }

  const reviewCount = getOptionalNumber(payload, "reviewCount");
  if (reviewCount !== undefined) {
    if (!Number.isInteger(reviewCount) || reviewCount < 0) {
      errors.push("`reviewCount` must be a non-negative integer.");
    } else {
      candidate.reviewCount = reviewCount;
    }
  } else if ("reviewCount" in payload && payload.reviewCount !== undefined) {
    errors.push("`reviewCount` must be a number.");
  }

  const isOpenNow = getOptionalBoolean(payload, "isOpenNow");
  if (isOpenNow !== undefined) {
    candidate.isOpenNow = isOpenNow;
  } else if ("isOpenNow" in payload && payload.isOpenNow !== undefined) {
    errors.push("`isOpenNow` must be a boolean.");
  }

  const verified = getOptionalBoolean(payload, "verified");
  if (verified !== undefined) {
    candidate.verified = verified;
  } else if ("verified" in payload && payload.verified !== undefined) {
    errors.push("`verified` must be a boolean.");
  }

  Object.assign(candidate, parseProfileEnhancements(payload, errors));

  if (errors.length > 0) {
    return { ok: false, errors };
  }

  if (Object.keys(candidate).length === 0) {
    return { ok: false, errors: ["At least one field must be provided."] };
  }

  return { ok: true, data: candidate };
}

export function validateCreateLeadPayload(
  payload: unknown
): ValidationResult<CreateLeadInput> {
  if (!isObject(payload)) {
    return { ok: false, errors: ["Payload must be a JSON object."] };
  }

  const errors: string[] = [];

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
  } else if (!SOURCE_VALUES.includes(source as (typeof SOURCE_VALUES)[number])) {
    errors.push("`source` must be one of: search, reel, profile.");
  }

  const sanitizedPhone = phone ? sanitizePhone(phone) : "";
  if (sanitizedPhone.length < 10 || sanitizedPhone.length > 15) {
    errors.push("`phone` must contain 10 to 15 digits.");
  }

  if (errors.length > 0) {
    return { ok: false, errors };
  }

  return {
    ok: true,
    data: {
      businessId: businessId!,
      name: name!,
      phone: sanitizedPhone,
      message: message!,
      source: source as CreateLeadInput["source"],
    },
  };
}
