import { promises as fs } from "node:fs";
import path from "node:path";
import { seedDatabase } from "./seed";
import type { DatabaseShape } from "./types";
import { normalizeListingPlans } from "@/lib/ui/listing-plans";

const dataDirectory = path.join(process.cwd(), "data");
const databasePath = path.join(dataDirectory, "db.json");
const tempDatabasePath = path.join(dataDirectory, "db.json.tmp");

let writeQueue: Promise<void> = Promise.resolve();

async function ensureDatabaseFile() {
  await fs.mkdir(dataDirectory, { recursive: true });

  try {
    await fs.access(databasePath);
  } catch {
    await fs.writeFile(
      databasePath,
      JSON.stringify(seedDatabase, null, 2),
      "utf8"
    );
  }
}

export async function readDatabase(): Promise<DatabaseShape> {
  await ensureDatabaseFile();
  const raw = await fs.readFile(databasePath, "utf8");

  try {
    const parsed = JSON.parse(raw) as Partial<DatabaseShape>;
    return {
      businesses: Array.isArray(parsed.businesses) ? parsed.businesses : seedDatabase.businesses,
      reels: Array.isArray(parsed.reels) ? parsed.reels : seedDatabase.reels,
      offers: Array.isArray(parsed.offers) ? parsed.offers : seedDatabase.offers,
      leads: Array.isArray(parsed.leads) ? parsed.leads : seedDatabase.leads,
      listingPlans: normalizeListingPlans(parsed.listingPlans),
    };
  } catch {
    await fs.writeFile(
      databasePath,
      JSON.stringify(seedDatabase, null, 2),
      "utf8"
    );
    return structuredClone(seedDatabase);
  }
}

export async function writeDatabase(nextData: DatabaseShape): Promise<void> {
  await ensureDatabaseFile();

  writeQueue = writeQueue
    .catch(() => undefined)
    .then(async () => {
      await fs.writeFile(
        tempDatabasePath,
        JSON.stringify(nextData, null, 2),
        "utf8"
      );
      await fs.rename(tempDatabasePath, databasePath);
    });

  return writeQueue;
}

export async function mutateDatabase(
  mutator: (draft: DatabaseShape) => void
): Promise<DatabaseShape> {
  const current = await readDatabase();
  const draft = structuredClone(current);

  mutator(draft);
  await writeDatabase(draft);

  return draft;
}
