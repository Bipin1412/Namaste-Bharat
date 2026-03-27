const fs = require("node:fs");
const path = require("node:path");

const projectRoot = path.resolve(__dirname, "..");
const dataDir = path.join(projectRoot, "data");
const outputPath = path.join(projectRoot, "backend", "sql", "import_mysql_data.sql");

const fallbackListingPlans = [
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

function readJson(relativePath) {
  const filePath = path.join(projectRoot, relativePath);
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

function sqlString(value) {
  if (value === null || value === undefined) return "NULL";
  return `'${String(value)
    .replace(/\\/g, "\\\\")
    .replace(/'/g, "''")
    .replace(/\u0000/g, "")}'`;
}

function sqlDateTime(value) {
  if (!value) return "NULL";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return sqlString(value);
  }
  const iso = date.toISOString().slice(0, 19).replace("T", " ");
  return sqlString(iso);
}

function sqlDate(value) {
  if (!value) return "NULL";
  return sqlString(String(value).slice(0, 10));
}

function sqlBool(value) {
  return value ? "1" : "0";
}

function sqlNumber(value, fallback = 0) {
  if (value === null || value === undefined || value === "") return String(fallback);
  const numeric = Number(value);
  return Number.isFinite(numeric) ? String(numeric) : String(fallback);
}

function sqlJson(value, fallback) {
  const normalized = value === undefined ? fallback : value;
  return sqlString(JSON.stringify(normalized ?? fallback));
}

function chunk(items, size) {
  const result = [];
  for (let i = 0; i < items.length; i += size) {
    result.push(items.slice(i, i + size));
  }
  return result;
}

function buildInsert(tableName, columns, rows) {
  if (!rows.length) return "";
  return [
    `INSERT INTO ${tableName} (${columns.join(", ")}) VALUES`,
    rows.map((row) => `  (${row.join(", ")})`).join(",\n"),
    "ON DUPLICATE KEY UPDATE",
    columns
      .filter((column) => !["id", "token"].includes(column))
      .map((column) => `  ${column} = VALUES(${column})`)
      .join(",\n"),
    ";",
    "",
  ].join("\n");
}

function main() {
  const db = readJson("data/db.json");
  const auth = readJson("data/auth.json");
  const listingPlans = Array.isArray(db.listingPlans) && db.listingPlans.length > 0
    ? db.listingPlans
    : fallbackListingPlans;
  const businessIds = new Set((db.businesses || []).map((item) => item.id));

  const statements = [];

  statements.push("-- Generated MySQL import for Namaste Bharat");
  statements.push("-- Source files: data/db.json, data/auth.json");
  statements.push("SET NAMES utf8mb4;");
  statements.push("SET FOREIGN_KEY_CHECKS = 0;");
  statements.push("");

  const userColumns = [
    "id",
    "full_name",
    "phone",
    "email",
    "password_hash",
    "email_verified_at",
    "last_login_at",
    "created_at",
    "updated_at",
  ];
  const userRows = (auth.users || []).map((user) => [
    sqlString(user.id),
    sqlString(user.fullName || null),
    sqlString(user.phone || null),
    sqlString(user.email),
    sqlString(user.passwordHash),
    "NULL",
    sqlDateTime(user.lastLoginAt),
    sqlDateTime(user.createdAt),
    sqlDateTime(user.updatedAt),
  ]);
  statements.push(buildInsert("users", userColumns, userRows));

  const profileColumns = ["id", "full_name", "phone", "role", "created_at", "updated_at"];
  const profileRows = (auth.users || []).map((user) => [
    sqlString(user.id),
    sqlString(user.fullName || null),
    sqlString(user.phone || null),
    sqlString("user"),
    sqlDateTime(user.createdAt),
    sqlDateTime(user.updatedAt),
  ]);
  statements.push(buildInsert("profiles", profileColumns, profileRows));

  const sessionColumns = ["token", "user_id", "created_at", "expires_at"];
  const sessionRows = (auth.sessions || []).map((session) => [
    sqlString(session.token),
    sqlString(session.userId),
    sqlDateTime(session.createdAt),
    sqlDateTime(session.expiresAt),
  ]);
  statements.push(buildInsert("user_sessions", sessionColumns, sessionRows));

  const businessColumns = [
    "id",
    "name",
    "category",
    "tagline",
    "description",
    "locality",
    "city",
    "address_line_1",
    "address_line_2",
    "pincode",
    "owner_name",
    "established_year",
    "email",
    "website",
    "rating",
    "review_count",
    "is_open_now",
    "verified",
    "listing_status",
    "activated_at",
    "rejected_reason",
    "phone",
    "whatsapp_number",
    "service_areas",
    "languages",
    "keywords",
    "highlights",
    "services",
    "business_hours",
    "media",
    "faqs",
    "policies",
    "social_links",
    "verification",
    "created_at",
    "updated_at",
  ];
  const businessRows = (db.businesses || []).map((item) => [
    sqlString(item.id),
    sqlString(item.name),
    sqlString(item.category),
    sqlString(item.tagline || null),
    sqlString(item.description || null),
    sqlString(item.locality),
    sqlString(item.city),
    sqlString(item.addressLine1 || null),
    sqlString(item.addressLine2 || null),
    sqlString(item.pincode || null),
    sqlString(item.ownerName || null),
    item.establishedYear ? sqlNumber(item.establishedYear) : "NULL",
    sqlString(item.email || null),
    sqlString(item.website || null),
    sqlNumber(item.rating, 0),
    sqlNumber(item.reviewCount, 0),
    sqlBool(item.isOpenNow),
    sqlBool(item.verified),
    sqlString(item.listingStatus || (item.verified ? "active" : "pending")),
    sqlDateTime(item.activatedAt),
    sqlString(item.rejectedReason || null),
    sqlString(item.phone),
    sqlString(item.whatsappNumber),
    sqlJson(item.serviceAreas, []),
    sqlJson(item.languages, []),
    sqlJson(item.keywords, []),
    sqlJson(item.highlights, []),
    sqlJson(item.services, []),
    sqlJson(item.businessHours, []),
    sqlJson(item.media, {}),
    sqlJson(item.faqs, []),
    sqlJson(item.policies, {}),
    sqlJson(item.socialLinks, {}),
    sqlJson(item.verification, {}),
    sqlDateTime(item.createdAt),
    sqlDateTime(item.updatedAt),
  ]);
  chunk(businessRows, 100).forEach((rows) => {
    statements.push(buildInsert("businesses", businessColumns, rows));
  });

  const reelColumns = ["id", "business_id", "vendor_name", "handle", "description", "city", "verified", "created_at"];
  const reelRows = (db.reels || []).map((item) => [
    sqlString(item.id),
    sqlString(item.businessId),
    sqlString(item.vendorName),
    sqlString(item.handle),
    sqlString(item.description),
    sqlString(item.city),
    sqlBool(item.verified),
    sqlDateTime(item.createdAt),
  ]);
  statements.push(buildInsert("reels", reelColumns, reelRows));

  const offerColumns = ["id", "title", "subtitle", "badge", "active", "created_at", "updated_at"];
  const offerRows = (db.offers || []).map((item) => [
    sqlString(item.id),
    sqlString(item.title),
    sqlString(item.subtitle),
    sqlString(item.badge),
    sqlBool(item.active),
    sqlDateTime(item.createdAt),
    sqlDateTime(item.updatedAt),
  ]);
  statements.push(buildInsert("offers", offerColumns, offerRows));

  const leadColumns = ["id", "business_id", "name", "phone", "message", "source", "created_at"];
  const validLeads = (db.leads || []).filter((item) => businessIds.has(item.businessId));
  const leadRows = validLeads.map((item) => [
    sqlString(item.id),
    sqlString(item.businessId),
    sqlString(item.name),
    sqlString(item.phone),
    sqlString(item.message),
    sqlString(item.source),
    sqlDateTime(item.createdAt),
  ]);
  chunk(leadRows, 200).forEach((rows) => {
    statements.push(buildInsert("leads", leadColumns, rows));
  });

  const planColumns = ["id", "name", "price_label", "short_label", "description", "features"];
  const planRows = listingPlans.map((item) => [
    sqlString(item.id),
    sqlString(item.name),
    sqlString(item.priceLabel),
    sqlString(item.shortLabel),
    sqlString(item.description),
    sqlJson(item.features, []),
  ]);
  statements.push(buildInsert("listing_plans", planColumns, planRows));

  statements.push("SET FOREIGN_KEY_CHECKS = 1;");
  statements.push("");

  fs.writeFileSync(outputPath, statements.filter(Boolean).join("\n"), "utf8");

  const summary = {
    users: (auth.users || []).length,
    sessions: (auth.sessions || []).length,
    businesses: (db.businesses || []).length,
    reels: (db.reels || []).length,
    offers: (db.offers || []).length,
    leads: validLeads.length,
    listingPlans: listingPlans.length,
  };

  console.log(`Wrote ${outputPath}`);
  console.log(JSON.stringify(summary, null, 2));
}

main();
