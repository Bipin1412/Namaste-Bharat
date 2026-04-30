"use client";

import { ChangeEvent, FormEvent, useEffect, useMemo, useRef, useState } from "react";
import { Check, CheckCircle2, ImagePlus, Loader2, X } from "lucide-react";
import { getAuthToken } from "@/lib/auth-client";
import { useListingPlans } from "@/lib/ui/use-listing-plans";
import { useListingTaxonomy } from "@/lib/ui/use-listing-taxonomy";

type ListingPayload = {
  name: string;
  category: string;
  locality: string;
  city: string;
  email: string;
  rating: number;
  reviewCount: number;
  isOpenNow: boolean;
  verified: boolean;
  phone: string;
  whatsappNumber: string;
  media?: {
    coverImages?: string[];
    gallery?: string[];
  };
  policies: {
    listingPlan: string;
  };
};

type SelectedShopImage = {
  id: string;
  file: File;
  previewUrl: string;
};

const MAX_SHOP_IMAGES = 5;
const MAX_SHOP_IMAGE_SIZE = 5 * 1024 * 1024;

type FreeListingFormProps = {
  adminMode?: boolean;
  onSuccess?: () => void | Promise<void>;
};

function normalizeIndianPhone(value: string): string {
  const digits = value.replace(/\D/g, "").slice(-10);
  if (digits.length === 0) {
    return "";
  }
  return `+91${digits}`;
}

export default function FreeListingForm({
  adminMode = false,
  onSuccess,
}: FreeListingFormProps) {
  const [businessName, setBusinessName] = useState("");
  const [mobile, setMobile] = useState("");
  const [email, setEmail] = useState("");
  const [city, setCity] = useState("");
  const [isCityConfirmed, setIsCityConfirmed] = useState(false);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [isCategoryMenuOpen, setIsCategoryMenuOpen] = useState(false);
  const [locality, setLocality] = useState("");
  const { plans: listingPlans, isLoadingPlans } = useListingPlans();
  const {
    cities: availableCities,
    categories: availableCategories,
    isLoadingCities,
    isLoadingCategories,
  } = useListingTaxonomy();
  const [selectedPlan, setSelectedPlan] = useState("basic");
  const [agreeTerms, setAgreeTerms] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);
  const [shopImages, setShopImages] = useState<SelectedShopImage[]>([]);
  const [shopImageError, setShopImageError] = useState("");
  const categoryMenuRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    function handleOutsideClick(event: MouseEvent) {
      if (!categoryMenuRef.current) return;
      if (categoryMenuRef.current.contains(event.target as Node)) return;
      setIsCategoryMenuOpen(false);
    }

    document.addEventListener("mousedown", handleOutsideClick);
    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, []);

  useEffect(() => {
    return () => {
      for (const image of shopImages) {
        URL.revokeObjectURL(image.previewUrl);
      }
    };
  }, [shopImages]);

  const selectedCategoryText = useMemo(() => {
    if (selectedCategories.length === 0) {
      return "Select category/categories";
    }
    return selectedCategories.join(", ");
  }, [selectedCategories]);

  const canSubmit = useMemo(() => {
    return (
      businessName.trim().length > 2 &&
      mobile.replace(/\D/g, "").length >= 10 &&
      email.trim().length > 4 &&
      city.trim().length > 1 &&
      isCityConfirmed &&
      selectedCategories.length > 0 &&
      locality.trim().length > 1 &&
      agreeTerms
    );
  }, [
    agreeTerms,
    businessName,
    city,
    email,
    isCityConfirmed,
    locality,
    mobile,
    selectedCategories.length,
  ]);

  useEffect(() => {
    if (listingPlans.length === 0) return;
    if (listingPlans.some((plan) => plan.id === selectedPlan)) return;
    setSelectedPlan(listingPlans[0].id);
  }, [listingPlans, selectedPlan]);

  function handleShopImageSelection(event: ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.target.files ?? []);
    event.target.value = "";

    if (files.length === 0) {
      return;
    }

    const remainingSlots = MAX_SHOP_IMAGES - shopImages.length;
    if (remainingSlots <= 0) {
      setShopImageError(`You can upload up to ${MAX_SHOP_IMAGES} shop images.`);
      return;
    }

    const acceptedFiles: SelectedShopImage[] = [];
    const rejectedFiles: string[] = [];

    for (const file of files.slice(0, remainingSlots)) {
      if (!file.type.startsWith("image/")) {
        rejectedFiles.push(file.name);
        continue;
      }

      if (file.size > MAX_SHOP_IMAGE_SIZE) {
        rejectedFiles.push(file.name);
        continue;
      }

      acceptedFiles.push({
        id: `${file.name}-${file.lastModified}-${crypto.randomUUID()}`,
        file,
        previewUrl: URL.createObjectURL(file),
      });
    }

    if (acceptedFiles.length > 0) {
      setShopImages((current) => [...current, ...acceptedFiles]);
      setShopImageError("");
    }

    if (files.length > remainingSlots) {
      rejectedFiles.push("extra files");
    }

    if (rejectedFiles.length > 0) {
      setShopImageError(
        `Only image files up to 5 MB are allowed. You can add ${remainingSlots} more photo${
          remainingSlots === 1 ? "" : "s"
        }.`
      );
    }
  }

  function removeShopImage(id: string) {
    setShopImages((current) => current.filter((image) => image.id !== id));
    setShopImageError("");
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!canSubmit || isSubmitting) {
      return;
    }

    setIsSubmitting(true);
    setMessage("");
    setIsSuccess(false);
    setShopImageError("");

    const phone = normalizeIndianPhone(mobile);
    let uploadedImageUrls: string[] = [];

    try {
      if (shopImages.length > 0) {
        const uploadFormData = new FormData();
        for (const image of shopImages) {
          uploadFormData.append("images", image.file);
        }

        const uploadResponse = await fetch("/api/uploads/business-images", {
          method: "POST",
          body: uploadFormData,
        });

        if (!uploadResponse.ok) {
          const errorPayload = (await uploadResponse.json().catch(() => null)) as
            | { error?: { message?: string } }
            | null;
          throw new Error(
            errorPayload?.error?.message ?? "Could not upload shop images."
          );
        }

        const uploadPayload = (await uploadResponse.json()) as {
          data?: Array<{ url?: string }>;
        };

        uploadedImageUrls =
          uploadPayload.data?.map((item) => item.url).filter((url): url is string => Boolean(url)) ??
          [];

        if (uploadedImageUrls.length !== shopImages.length) {
          throw new Error("Some shop images could not be saved.");
        }
      }
    } catch (error) {
      setIsSubmitting(false);
      setIsSuccess(false);
      setMessage(
        error instanceof Error ? error.message : "Could not upload shop images."
      );
      return;
    }

    const payload: ListingPayload = {
      name: businessName.trim(),
      category: selectedCategories.join(", "),
      locality: locality.trim(),
      city: city.trim(),
      rating: 0,
      reviewCount: 0,
      isOpenNow: true,
      verified: adminMode,
      phone,
      whatsappNumber: phone,
      email: email.trim(),
      ...(uploadedImageUrls.length > 0
        ? {
            media: {
              coverImages: uploadedImageUrls,
              gallery: uploadedImageUrls,
            },
          }
        : {}),
      policies: {
        listingPlan: selectedPlan,
      },
    };

    try {
      const authToken = adminMode ? getAuthToken() : "";
      const response = await fetch("/api/businesses", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorPayload = (await response.json().catch(() => null)) as
          | { error?: { message?: string } }
          | null;
        throw new Error(
          errorPayload?.error?.message ?? "Could not submit listing."
        );
      }

      setIsSuccess(true);
      setMessage(
        adminMode
          ? "Listing created from admin panel."
          : "Listing request submitted. Our team will verify and activate it."
      );
      setBusinessName("");
      setMobile("");
      setEmail("");
      setCity("");
      setIsCityConfirmed(false);
      setSelectedCategories([]);
      setLocality("");
      setSelectedPlan(listingPlans[0]?.id || "basic");
      setShopImages([]);
      setShopImageError("");
      await onSuccess?.();
    } catch (error) {
      setIsSuccess(false);
      setMessage(
        error instanceof Error
          ? error.message
          : "Something went wrong. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-2xl border border-slate-200 bg-white p-4 shadow-[0_16px_30px_-20px_rgba(15,23,42,0.35)]"
    >
      <div className="mb-3">
        <p className="text-lg font-semibold text-slate-900">
          List Your Business
        </p>
        <p className="text-sm text-slate-600">
          Reach local customers on search, reels, and WhatsApp.
        </p>
      </div>

      <div className="grid gap-2">
        <input
          value={businessName}
          onChange={(event) => setBusinessName(event.target.value)}
          placeholder="Business name"
          className="h-11 rounded-lg border border-slate-300 px-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none"
        />
        <input
          value={mobile}
          onChange={(event) => setMobile(event.target.value)}
          placeholder="Mobile number"
          inputMode="numeric"
          className="h-11 rounded-lg border border-slate-300 px-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none"
        />
        <input
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder="Email ID"
          type="email"
          className="h-11 rounded-lg border border-slate-300 px-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none"
        />
        <div className="grid gap-2 sm:grid-cols-2">
          <div className="space-y-2">
            <select
              value={city}
              onChange={(event) => {
                setCity(event.target.value);
                setIsCityConfirmed(false);
              }}
              disabled={isLoadingCities}
              className="h-11 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-900 focus:border-blue-500 focus:outline-none"
            >
              <option value="">
                {isLoadingCities ? "Loading cities..." : "Select city"}
              </option>
              {availableCities.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
            <label className="inline-flex items-center gap-2 text-xs text-slate-600">
              <input
                type="checkbox"
                checked={isCityConfirmed}
                onChange={(event) => setIsCityConfirmed(event.target.checked)}
                disabled={!city}
                className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
              />
              Confirm selected city
            </label>
          </div>
          <input
            value={locality}
            onChange={(event) => setLocality(event.target.value)}
            placeholder="Area / Locality"
            className="h-11 rounded-lg border border-slate-300 px-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none"
          />
        </div>

        <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <p className="text-sm font-semibold text-slate-900">Shop images</p>
              <p className="text-xs text-slate-500">
                Optional. Upload up to {MAX_SHOP_IMAGES} photos, each up to 5 MB.
              </p>
            </div>
            <label className="inline-flex h-10 cursor-pointer items-center gap-2 rounded-lg bg-white px-3 text-sm font-medium text-blue-700 ring-1 ring-inset ring-blue-200 transition-colors hover:bg-blue-50">
              <ImagePlus className="h-4 w-4" aria-hidden />
              Add images
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handleShopImageSelection}
                className="hidden"
              />
            </label>
          </div>

          {shopImages.length > 0 ? (
            <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {shopImages.map((image) => (
                <div
                  key={image.id}
                  className="group relative overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm"
                >
                  <div className="relative h-32 w-full bg-slate-100">
                    <img
                      src={image.previewUrl}
                      alt={image.file.name}
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => removeShopImage(image.id)}
                    className="absolute right-2 top-2 inline-flex h-8 w-8 items-center justify-center rounded-full bg-slate-900/80 text-white opacity-90 transition-opacity hover:opacity-100"
                    aria-label={`Remove ${image.file.name}`}
                  >
                    <X className="h-4 w-4" aria-hidden />
                  </button>
                  <div className="border-t border-slate-100 px-3 py-2">
                    <p className="truncate text-xs font-medium text-slate-700">
                      {image.file.name}
                    </p>
                    <p className="text-[11px] text-slate-500">
                      {(image.file.size / (1024 * 1024)).toFixed(1)} MB
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="mt-3 text-xs text-slate-500">
              Add storefront, menu, product, or shop-front photos to make the listing
              stronger.
            </p>
          )}

          {shopImageError ? (
            <p className="mt-2 text-xs font-medium text-rose-600">{shopImageError}</p>
          ) : null}
        </div>
        <div ref={categoryMenuRef} className="relative">
          <button
            type="button"
            onClick={() => setIsCategoryMenuOpen((current) => !current)}
            className="flex h-11 w-full items-center justify-between rounded-lg border border-slate-300 bg-white px-3 text-left text-sm text-slate-900 focus:border-blue-500 focus:outline-none"
          >
            <span
              className={
                selectedCategories.length > 0 ? "text-slate-900" : "text-slate-400"
              }
            >
              {selectedCategoryText}
            </span>
            <span className="text-xs text-slate-500">{isCategoryMenuOpen ? "Hide" : "Select"}</span>
          </button>

          {isCategoryMenuOpen ? (
            <div className="absolute z-20 mt-1 w-full rounded-lg border border-slate-200 bg-white p-2 shadow-lg">
              {isLoadingCategories ? (
                <p className="px-2 py-1 text-sm text-slate-500">Loading categories...</p>
              ) : availableCategories.length === 0 ? (
                <p className="px-2 py-1 text-sm text-slate-500">No categories available.</p>
              ) : (
                <div className="max-h-52 space-y-1 overflow-y-auto">
                  {availableCategories.map((option) => {
                    const checked = selectedCategories.includes(option);
                    return (
                      <label
                        key={option}
                        className="flex cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 text-sm text-slate-700 hover:bg-slate-50"
                      >
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={(event) => {
                            setSelectedCategories((current) => {
                              if (event.target.checked) {
                                return [...current, option];
                              }
                              return current.filter((item) => item !== option);
                            });
                          }}
                          className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span>{option}</span>
                      </label>
                    );
                  })}
                </div>
              )}
            </div>
          ) : null}
        </div>
      </div>

      <div className="mt-3 space-y-2">
        <div>
          <p className="text-sm font-semibold text-slate-900">Choose Listing Plan</p>
          <p className="text-xs text-slate-500">
            Select one plan before submitting your business details.
          </p>
        </div>
        <div className="grid gap-3 md:grid-cols-2">
          {isLoadingPlans ? (
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-500 md:col-span-2">
              Loading plans...
            </div>
          ) : null}
          {listingPlans.map((plan) => {
            const isActive = selectedPlan === plan.id;
            return (
              <button
                key={plan.id}
                type="button"
                onClick={() => setSelectedPlan(plan.id)}
                className={`flex w-full flex-col items-start justify-start rounded-2xl border p-4 text-left align-top transition-colors ${
                  isActive
                    ? "border-blue-500 bg-blue-50 shadow-[0_12px_24px_-18px_rgba(37,99,235,0.55)]"
                    : "border-slate-200 bg-slate-50 hover:border-blue-200 hover:bg-white"
                }`}
              >
                <div className="flex w-full items-start justify-between gap-3">
                  <div>
                    <p className="text-xl font-semibold text-slate-900">{plan.name}</p>
                    <p className="mt-1 text-sm font-semibold text-blue-700">{plan.priceLabel}</p>
                  </div>
                  <span
                    className={`inline-flex h-5 w-5 items-center justify-center rounded-full border text-[10px] font-bold ${
                      isActive
                        ? "border-blue-500 bg-blue-600 text-white"
                        : "border-slate-300 text-transparent"
                    }`}
                  >
                    <Check className="h-3 w-3" aria-hidden />
                  </span>
                </div>
                <ul className="mt-3 space-y-1.5 text-sm text-slate-700">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-center gap-2">
                      <span className="inline-flex h-4 w-4 items-center justify-center rounded-full border border-emerald-500 text-[10px] font-bold text-emerald-600">
                        <Check className="h-3 w-3" aria-hidden />
                      </span>
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
                <p className="mt-3 text-sm font-semibold text-blue-700">
                  {isActive ? "Selected Plan" : "Choose Plan ->"}
                </p>
              </button>
            );
          })}
        </div>
      </div>

      <label className="mt-3 inline-flex items-center gap-2 text-sm text-slate-600">
        <input
          type="checkbox"
          checked={agreeTerms}
          onChange={(event) => setAgreeTerms(event.target.checked)}
          className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
        />
        I agree to terms and privacy policy.
      </label>

      <button
        type="submit"
        disabled={!canSubmit || isSubmitting}
        className="mt-3 inline-flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 text-sm font-semibold text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-300"
      >
        {isSubmitting ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
            Submitting...
          </>
        ) : (
          adminMode ? "Create Listing" : "Submit Listing"
        )}
      </button>

      {message ? (
        <p
          className={`mt-2 inline-flex items-center gap-1 rounded-md px-2 py-1 text-sm ${
            isSuccess ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"
          }`}
        >
          {isSuccess ? <CheckCircle2 className="h-4 w-4" aria-hidden /> : null}
          {message}
        </p>
      ) : null}
    </form>
  );
}


