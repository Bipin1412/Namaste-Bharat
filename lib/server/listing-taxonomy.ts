import { promises as fs } from "node:fs";
import path from "node:path";
import masterCategories from "@/data/master-categories.json";
import {
  defaultSupportedCities,
  mergeTaxonomyValues,
  normalizeTaxonomyValues,
} from "@/lib/ui/listing-taxonomy";

type StoredListingTaxonomy = {
  cities: string[];
  categories: string[];
  updatedAt: string;
};

const dataDirectory = path.join(process.cwd(), "data");
const taxonomyPath = path.join(dataDirectory, "listing-taxonomy.json");
const tempTaxonomyPath = path.join(dataDirectory, "listing-taxonomy.json.tmp");

const emptyTaxonomy: StoredListingTaxonomy = {
  cities: [],
  categories: [],
  updatedAt: new Date().toISOString(),
};

let writeQueue: Promise<void> = Promise.resolve();

function normalizeStoredTaxonomy(input: unknown): StoredListingTaxonomy {
  if (!input || typeof input !== "object") {
    return emptyTaxonomy;
  }

  const candidate = input as Partial<StoredListingTaxonomy>;

  return {
    cities: normalizeTaxonomyValues(candidate.cities),
    categories: normalizeTaxonomyValues(candidate.categories),
    updatedAt: String(candidate.updatedAt || new Date().toISOString()),
  };
}

async function ensureTaxonomyFile() {
  await fs.mkdir(dataDirectory, { recursive: true });

  try {
    await fs.access(taxonomyPath);
  } catch {
    await fs.writeFile(taxonomyPath, JSON.stringify(emptyTaxonomy, null, 2), "utf8");
  }
}

async function readStoredTaxonomy(): Promise<StoredListingTaxonomy> {
  await ensureTaxonomyFile();
  const raw = await fs.readFile(taxonomyPath, "utf8");

  try {
    return normalizeStoredTaxonomy(JSON.parse(raw));
  } catch {
    await fs.writeFile(taxonomyPath, JSON.stringify(emptyTaxonomy, null, 2), "utf8");
    return emptyTaxonomy;
  }
}

async function writeStoredTaxonomy(nextData: StoredListingTaxonomy) {
  await ensureTaxonomyFile();

  writeQueue = writeQueue
    .catch(() => undefined)
    .then(async () => {
      await fs.writeFile(tempTaxonomyPath, JSON.stringify(nextData, null, 2), "utf8");
      await fs.rename(tempTaxonomyPath, taxonomyPath);
    });

  return writeQueue;
}

async function mutateStoredTaxonomy(
  mutator: (draft: StoredListingTaxonomy) => void
): Promise<StoredListingTaxonomy> {
  const current = await readStoredTaxonomy();
  const draft = structuredClone(current);

  mutator(draft);
  draft.cities = normalizeTaxonomyValues(draft.cities);
  draft.categories = normalizeTaxonomyValues(draft.categories);
  draft.updatedAt = new Date().toISOString();

  await writeStoredTaxonomy(draft);

  return draft;
}

export async function listListingCities(): Promise<string[]> {
  const stored = await readStoredTaxonomy();
  return mergeTaxonomyValues(defaultSupportedCities, stored.cities);
}

export async function listCustomListingCategories(): Promise<string[]> {
  const stored = await readStoredTaxonomy();
  return stored.categories;
}

export async function listBaseListingCategories(): Promise<string[]> {
  return normalizeTaxonomyValues(masterCategories);
}

export async function addListingCity(value: string): Promise<string[]> {
  const nextValue = String(value || "").trim();
  if (!nextValue) {
    throw new Error("City name is required.");
  }

  const existingCities = await listListingCities();
  if (existingCities.some((entry) => entry.toLowerCase() === nextValue.toLowerCase())) {
    throw new Error("This city already exists.");
  }

  const updated = await mutateStoredTaxonomy((draft) => {
    draft.cities.push(nextValue);
  });

  return mergeTaxonomyValues(defaultSupportedCities, updated.cities);
}

export async function addListingCategory(value: string): Promise<string[]> {
  const nextValue = String(value || "").trim();
  if (!nextValue) {
    throw new Error("Category name is required.");
  }

  const existingCategories = mergeTaxonomyValues(
    masterCategories,
    (await listCustomListingCategories()) || []
  );
  if (existingCategories.some((entry) => entry.toLowerCase() === nextValue.toLowerCase())) {
    throw new Error("This category already exists.");
  }

  const updated = await mutateStoredTaxonomy((draft) => {
    draft.categories.push(nextValue);
  });

  return updated.categories;
}
