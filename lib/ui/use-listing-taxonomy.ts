"use client";

import { useCallback, useEffect, useState } from "react";

const LISTING_TAXONOMY_REFRESH_EVENT = "listing-taxonomy:refresh";

export function dispatchListingTaxonomyRefresh() {
  if (typeof window === "undefined") {
    return;
  }

  window.dispatchEvent(new CustomEvent(LISTING_TAXONOMY_REFRESH_EVENT));
}

export function useListingTaxonomy() {
  const [cities, setCities] = useState<string[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [isLoadingCities, setIsLoadingCities] = useState(true);
  const [isLoadingCategories, setIsLoadingCategories] = useState(true);
  const [refreshCounter, setRefreshCounter] = useState(0);

  const refreshTaxonomy = useCallback(() => {
    dispatchListingTaxonomyRefresh();
  }, []);

  useEffect(() => {
    function handleRefresh() {
      setRefreshCounter((current) => current + 1);
    }

    window.addEventListener(LISTING_TAXONOMY_REFRESH_EVENT, handleRefresh);
    return () => {
      window.removeEventListener(LISTING_TAXONOMY_REFRESH_EVENT, handleRefresh);
    };
  }, []);

  useEffect(() => {
    let mounted = true;

    async function loadTaxonomy() {
      setIsLoadingCities(true);
      setIsLoadingCategories(true);

      try {
        const [citiesResponse, categoriesResponse] = await Promise.all([
          fetch("/api/cities", { cache: "no-store" }),
          fetch("/api/categories", { cache: "no-store" }),
        ]);

        const citiesPayload = (await citiesResponse.json().catch(() => null)) as
          | { data?: string[] }
          | null;
        const categoriesPayload = (await categoriesResponse.json().catch(() => null)) as
          | { data?: Array<{ name?: string }> }
          | null;

        if (!mounted) {
          return;
        }

        setCities(
          Array.isArray(citiesPayload?.data)
            ? citiesPayload.data.map((entry) => String(entry || "").trim()).filter(Boolean)
            : []
        );
        setCategories(
          Array.isArray(categoriesPayload?.data)
            ? categoriesPayload.data
                .map((entry) => String(entry?.name || "").trim())
                .filter(Boolean)
            : []
        );
      } catch {
        if (!mounted) {
          return;
        }

        setCities([]);
        setCategories([]);
      } finally {
        if (mounted) {
          setIsLoadingCities(false);
          setIsLoadingCategories(false);
        }
      }
    }

    void loadTaxonomy();

    return () => {
      mounted = false;
    };
  }, [refreshCounter]);

  return {
    cities,
    categories,
    isLoadingCities,
    isLoadingCategories,
    refreshTaxonomy,
  };
}
