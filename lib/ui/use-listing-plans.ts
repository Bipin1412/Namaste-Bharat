"use client";

import { useEffect, useState } from "react";
import { defaultListingPlans, normalizeListingPlans, type ListingPlan } from "@/lib/ui/listing-plans";

export function useListingPlans() {
  const [plans, setPlans] = useState<ListingPlan[]>(defaultListingPlans);
  const [isLoadingPlans, setIsLoadingPlans] = useState(true);

  useEffect(() => {
    let mounted = true;

    async function loadPlans() {
      try {
        const response = await fetch("/api/plans", {
          cache: "no-store",
        });
        const payload = (await response.json().catch(() => null)) as
          | { data?: unknown }
          | null;

        if (!mounted) return;
        setPlans(normalizeListingPlans(payload?.data));
      } catch {
        if (!mounted) return;
        setPlans(defaultListingPlans);
      } finally {
        if (mounted) {
          setIsLoadingPlans(false);
        }
      }
    }

    void loadPlans();

    return () => {
      mounted = false;
    };
  }, []);

  return { plans, isLoadingPlans };
}
