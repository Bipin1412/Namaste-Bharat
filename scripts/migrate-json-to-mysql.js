/**
 * One-time migration: imports businesses from data/db.json into MySQL.
 * Run this ONCE on the server after setting up the database.
 * Usage:  node scripts/migrate-json-to-mysql.js
 */

const path = require("path");
const fs = require("fs");
const dotenv = require("dotenv");
const { getMysqlPool, toMysqlDateTime } = require("../backend/lib/mysql");

dotenv.config({ path: path.resolve(__dirname, "../.env.local") });

const dbPath = path.resolve(__dirname, "../data/db.json");

async function main() {
  if (!fs.existsSync(dbPath)) {
    console.log("No data/db.json found — nothing to migrate.");
    process.exit(0);
  }

  const raw = fs.readFileSync(dbPath, "utf8");
  let db;
  try {
    db = JSON.parse(raw);
  } catch {
    console.error("data/db.json is not valid JSON. Aborting.");
    process.exit(1);
  }

  const businesses = Array.isArray(db.businesses) ? db.businesses : [];
  if (businesses.length === 0) {
    console.log("No businesses in db.json — nothing to migrate.");
    process.exit(0);
  }

  console.log(`Found ${businesses.length} businesses in db.json. Migrating to MySQL...`);

  const pool = getMysqlPool();
  let inserted = 0;
  let skipped = 0;

  for (const b of businesses) {
    if (!b.id || !b.name) {
      skipped++;
      continue;
    }

    const createdAt = toMysqlDateTime(b.createdAt) || toMysqlDateTime(new Date().toISOString());
    const updatedAt = toMysqlDateTime(b.updatedAt) || toMysqlDateTime(new Date().toISOString());

    try {
      await pool.execute(
        `INSERT IGNORE INTO businesses (
          id, name, category, tagline, description,
          locality, city, address_line1, address_line2, pincode,
          owner_name, established_year, email, website,
          rating, review_count, is_open_now, verified, listing_status,
          activated_at, rejected_reason,
          phone, whatsapp_number,
          service_areas, languages, keywords, highlights,
          services, business_hours, media, faqs,
          policies, social_links, verification,
          created_at, updated_at
        ) VALUES (
          ?, ?, ?, ?, ?,
          ?, ?, ?, ?, ?,
          ?, ?, ?, ?,
          ?, ?, ?, ?, ?,
          ?, ?,
          ?, ?,
          ?, ?, ?, ?,
          ?, ?, ?, ?,
          ?, ?, ?,
          ?, ?
        )`,
        [
          b.id,
          b.name || "",
          b.category || "",
          b.tagline || null,
          b.description || null,
          b.locality || "",
          b.city || "",
          b.addressLine1 || null,
          b.addressLine2 || null,
          b.pincode || null,
          b.ownerName || null,
          b.establishedYear || null,
          b.email || null,
          b.website || null,
          Number(b.rating) || 0,
          Number(b.reviewCount) || 0,
          b.isOpenNow ? 1 : 0,
          b.verified ? 1 : 0,
          b.listingStatus || "active",
          toMysqlDateTime(b.activatedAt) || null,
          b.rejectedReason || null,
          b.phone || "",
          b.whatsappNumber || "",
          JSON.stringify(b.serviceAreas || []),
          JSON.stringify(b.languages || []),
          JSON.stringify(b.keywords || []),
          JSON.stringify(b.highlights || []),
          JSON.stringify(b.services || []),
          JSON.stringify(b.businessHours || []),
          JSON.stringify(b.media || {}),
          JSON.stringify(b.faqs || []),
          JSON.stringify(b.policies || {}),
          JSON.stringify(b.socialLinks || {}),
          JSON.stringify(b.verification || {}),
          createdAt,
          updatedAt,
        ]
      );
      inserted++;
      process.stdout.write(`  ✓ ${b.name}\n`);
    } catch (err) {
      console.error(`  ✗ Failed to insert "${b.name}" (${b.id}): ${err.message}`);
      skipped++;
    }
  }

  await pool.end();

  console.log(`\nMigration complete.`);
  console.log(`  Inserted: ${inserted}`);
  console.log(`  Skipped:  ${skipped}`);
  console.log(`\nYou can now delete or archive data/db.json on the server.`);
}

main().catch((err) => {
  console.error("Migration failed:", err.message);
  process.exit(1);
});
