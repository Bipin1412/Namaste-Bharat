export const defaultSupportedCities = [
  "Mumbai City",
  "Mumbai Suburban",
  "Thane",
  "Palghar",
  "Raigad",
  "Ratnagiri",
  "Sindhudurg",
  "Pune",
  "Satara",
  "Sangli",
  "Kolhapur",
  "Solapur",
  "Nashik",
  "Dhule",
  "Nandurbar",
  "Jalgaon",
  "Ahmednagar",
  "Chhatrapati Sambhaji Nagar (Aurangabad)",
  "Jalna",
  "Parbhani",
  "Hingoli",
  "Beed",
  "Dharashiv (Osmanabad)",
  "Nanded",
  "Latur",
  "Amravati",
  "Akola",
  "Buldhana",
  "Washim",
  "Yavatmal",
  "Nagpur",
  "Wardha",
  "Bhandara",
  "Gondia",
  "Chandrapur",
  "Gadchiroli",
] as const;

export function normalizeTaxonomyValues(input: unknown): string[] {
  if (!Array.isArray(input)) {
    return [];
  }

  const uniqueValues = new Map<string, string>();

  for (const entry of input) {
    const value = String(entry || "").trim();
    if (!value) {
      continue;
    }

    const key = value.toLowerCase();
    if (!uniqueValues.has(key)) {
      uniqueValues.set(key, value);
    }
  }

  return [...uniqueValues.values()].sort((a, b) =>
    a.localeCompare(b, undefined, { sensitivity: "base" })
  );
}

export function mergeTaxonomyValues(...groups: Array<readonly string[] | string[]>): string[] {
  return normalizeTaxonomyValues(groups.flatMap((group) => [...group]));
}
