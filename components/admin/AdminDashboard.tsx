"use client";

import Link from "next/link";
import { type Dispatch, type SetStateAction, useCallback, useEffect, useMemo, useState } from "react";
import { CheckCircle2, Loader2, Pencil, Plus, ShieldAlert, Trash2, XCircle } from "lucide-react";
import { getAuthToken } from "@/lib/auth-client";
import FreeListingForm from "@/components/FreeListingForm";
import type { ListingPlan } from "@/lib/ui/listing-plans";
import { useListingTaxonomy } from "@/lib/ui/use-listing-taxonomy";

type SessionPayload = {
  user?: { id?: string; email?: string | null };
  profile?: { role?: string | null; full_name?: string | null };
};

type AdminListing = {
  id: string;
  name: string;
  category: string;
  locality: string;
  city: string;
  phone: string;
  listingPlan: string | "unknown";
  listingStatus: "pending" | "active" | "rejected";
  verified: boolean;
  createdAt: string;
  rejectedReason?: string | null;
  media?: {
    coverImages?: string[];
    gallery?: string[];
  };
};

type StatusFilter = "all" | "pending" | "active" | "rejected";
type PlanFilter = "all" | string;
type DailyInquiry = {
  id: string;
  inquiryDate: string;
  description: string;
  createdAt: string;
  updatedAt?: string;
};

type PlanFormState = {
  id: string;
  name: string;
  shortLabel: string;
  priceLabel: string;
  description: string;
  featuresText: string;
};

const emptyPlanForm: PlanFormState = {
  id: "",
  name: "",
  shortLabel: "",
  priceLabel: "",
  description: "",
  featuresText: "",
};

export default function AdminDashboard() {
  const [isLoading, setIsLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [message, setMessage] = useState("");
  const [listings, setListings] = useState<AdminListing[]>([]);
  const [workingId, setWorkingId] = useState("");
  const [dailyWorkingId, setDailyWorkingId] = useState("");
  const [dailyInquiries, setDailyInquiries] = useState<DailyInquiry[]>([]);
  const [dailyInquiryDate, setDailyInquiryDate] = useState("");
  const [dailyInquiryDescription, setDailyInquiryDescription] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [planFilter, setPlanFilter] = useState<PlanFilter>("all");
  const [searchText, setSearchText] = useState("");
  const [listingPlans, setListingPlans] = useState<ListingPlan[]>([]);
  const [editId, setEditId] = useState("");
  const [editName, setEditName] = useState("");
  const [editCategory, setEditCategory] = useState("");
  const [editCity, setEditCity] = useState("");
  const [editLocality, setEditLocality] = useState("");
  const [editPhone, setEditPhone] = useState("");
  const [editListingPlan, setEditListingPlan] = useState("basic");
  const [editCoverImage, setEditCoverImage] = useState("");
  const [planWorkingId, setPlanWorkingId] = useState("");
  const [planEditId, setPlanEditId] = useState("");
  const [newPlan, setNewPlan] = useState<PlanFormState>(emptyPlanForm);
  const [editPlanForm, setEditPlanForm] = useState<PlanFormState>(emptyPlanForm);
  const [newCity, setNewCity] = useState("");
  const [newCategory, setNewCategory] = useState("");
  const [taxonomyWorkingType, setTaxonomyWorkingType] = useState<"" | "city" | "category">("");
  const [newAdminFullName, setNewAdminFullName] = useState("");
  const [newAdminEmail, setNewAdminEmail] = useState("");
  const [newAdminPhone, setNewAdminPhone] = useState("");
  const [newAdminPassword, setNewAdminPassword] = useState("");
  const [isCreatingAdminUser, setIsCreatingAdminUser] = useState(false);
  const [adminUserMessage, setAdminUserMessage] = useState("");
  const [isAdminUserSuccess, setIsAdminUserSuccess] = useState(false);
  const {
    cities: listingCities,
    categories: listingCategories,
    isLoadingCities,
    isLoadingCategories,
    refreshTaxonomy,
  } = useListingTaxonomy();

  const token = useMemo(() => getAuthToken(), []);

  async function localPatchBusiness(id: string, body: Record<string, unknown>) {
    if (!token) {
      throw new Error("Missing auth token.");
    }
    const response = await fetch(`/api/businesses/${id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(body),
    });
    if (!response.ok) {
      const payload = (await response.json().catch(() => null)) as
        | { error?: { message?: string } }
        | null;
      throw new Error(payload?.error?.message || "Could not update listing.");
    }
  }

  async function localDeleteBusiness(id: string) {
    if (!token) {
      throw new Error("Missing auth token.");
    }
    const response = await fetch(`/api/businesses/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!response.ok) {
      const payload = (await response.json().catch(() => null)) as
        | { error?: { message?: string } }
        | null;
      throw new Error(payload?.error?.message || "Could not delete listing.");
    }
  }

  const loadListings = useCallback(async () => {
    if (!token) {
      setListings([]);
      return;
    }

    const response = await fetch("/api/businesses?sort=newest&page=1&limit=500&includeInactive=true", {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    }).catch(() => null);

    if (!response || !response.ok) {
      setListings([]);
      return;
    }

    const localPayload = (await response.json().catch(() => null)) as
      | { data?: Array<Record<string, unknown>> }
      | null;

    const localAll = (localPayload?.data || [])
      .map((entry) => ({
        id: String(entry.id || ""),
        name: String(entry.name || "Unnamed"),
        category: String(entry.category || "Unknown"),
        locality: String(entry.locality || ""),
        city: String(entry.city || ""),
        phone: String(entry.phone || ""),
        listingPlan:
          (() => {
            const rawPlan = String(
            entry.policies &&
              typeof entry.policies === "object" &&
              "listingPlan" in entry.policies
              ? (entry.policies as { listingPlan?: string }).listingPlan || ""
              : ""
            ).trim();
            return rawPlan || ("unknown" as const);
          })(),
        listingStatus:
          String(entry.listingStatus || "").toLowerCase() === "active"
            ? ("active" as const)
            : String(entry.listingStatus || "").toLowerCase() === "rejected"
            ? ("rejected" as const)
            : Boolean(entry.verified)
            ? ("active" as const)
            : ("pending" as const),
        verified: Boolean(entry.verified),
        createdAt: String(entry.createdAt || new Date().toISOString()),
        rejectedReason: String(entry.rejectedReason || ""),
        media:
          entry.media && typeof entry.media === "object"
            ? (entry.media as { coverImages?: string[]; gallery?: string[] })
            : undefined,
      }))
      .filter((entry) => entry.id);

    setListings(localAll);
  }, [token]);

  const loadDailyInquiries = useCallback(async () => {
    if (!token) {
      setDailyInquiries([]);
      return;
    }

    const response = await fetch("/api/admin/daily-inquiries", {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    }).catch(() => null);

    if (!response || !response.ok) {
      setDailyInquiries([]);
      return;
    }

    const payload = (await response.json().catch(() => null)) as
      | { data?: DailyInquiry[] }
      | null;
    setDailyInquiries(Array.isArray(payload?.data) ? payload.data : []);
  }, [token]);

  const loadListingPlans = useCallback(async () => {
    try {
      const authHeader = token ? { Authorization: `Bearer ${token}` } : undefined;
      const response = await fetch("/api/admin/plans", {
        headers: authHeader,
        cache: "no-store",
      }).catch(() => null);

      if (!response || !response.ok) {
        const fallback = await fetch("/api/plans", { cache: "no-store" }).catch(() => null);
        const fallbackPayload = (await fallback?.json().catch(() => null)) as
          | { data?: ListingPlan[] }
          | null;
        setListingPlans(Array.isArray(fallbackPayload?.data) ? fallbackPayload.data : []);
        return;
      }

      const payload = (await response.json().catch(() => null)) as
        | { data?: ListingPlan[] }
        | null;
      setListingPlans(Array.isArray(payload?.data) ? payload.data : []);
    } catch {
      setListingPlans([]);
    }
  }, [token]);

  useEffect(() => {
    let mounted = true;

    async function boot() {
      if (!token) {
        if (!mounted) return;
        setIsLoading(false);
        setIsAdmin(false);
        return;
      }

      const response = await fetch(`/api/auth/me`, {
        headers: { Authorization: `Bearer ${token}` },
      }).catch(() => null);

      if (!response || !response.ok) {
        if (!mounted) return;
        setIsLoading(false);
        setIsAdmin(false);
        return;
      }

      const payload = (await response.json().catch(() => null)) as SessionPayload | null;
      const role = String(payload?.profile?.role || "").toLowerCase();

      if (!mounted) return;

      if (role !== "admin") {
        setIsLoading(false);
        setIsAdmin(false);
        return;
      }

      setIsAdmin(true);
      await loadListings();
      await loadDailyInquiries();
      await loadListingPlans();
      setIsLoading(false);
    }

    void boot();
    return () => {
      mounted = false;
    };
  }, [loadDailyInquiries, loadListingPlans, loadListings, token]);

  async function activateListing(id: string) {
    if (!token || workingId) return;
    setWorkingId(id);
    setMessage("");

    try {
      await localPatchBusiness(id, {
        verified: true,
        listingStatus: "active",
        activatedAt: new Date().toISOString(),
        rejectedReason: null,
      });

      setMessage("Listing activated successfully.");
      await loadListings();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Could not activate listing.");
    } finally {
      setWorkingId("");
    }
  }

  async function rejectListing(id: string) {
    if (!token || workingId) return;
    const reason = window.prompt("Reason for rejection (optional):", "Insufficient listing details");
    if (reason === null) return;

    setWorkingId(id);
    setMessage("");

    try {
      await localPatchBusiness(id, {
        verified: false,
        listingStatus: "rejected",
        rejectedReason: reason.trim() || "Rejected by admin",
      });

      setMessage("Listing rejected.");
      await loadListings();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Could not reject listing.");
    } finally {
      setWorkingId("");
    }
  }

  function startEdit(item: AdminListing) {
    setEditId(item.id);
    setEditName(item.name);
    setEditCategory(item.category);
    setEditCity(item.city);
    setEditLocality(item.locality);
    setEditPhone(item.phone);
    setEditListingPlan(item.listingPlan === "unknown" ? listingPlans[0]?.id || "basic" : item.listingPlan);
    setEditCoverImage(item.media?.coverImages?.[0] || "");
  }

  function updatePlanForm(
    setter: Dispatch<SetStateAction<PlanFormState>>,
    key: keyof PlanFormState,
    value: string
  ) {
    setter((current) => ({ ...current, [key]: value }));
  }

  function toFeatures(text: string) {
    return text
      .split("\n")
      .map((item) => item.trim())
      .filter(Boolean);
  }

  function startPlanEdit(plan: ListingPlan) {
    setPlanEditId(plan.id);
    setEditPlanForm({
      id: plan.id,
      name: plan.name,
      shortLabel: plan.shortLabel,
      priceLabel: plan.priceLabel,
      description: plan.description,
      featuresText: plan.features.join("\n"),
    });
  }

  async function createPlan() {
    if (!token || planWorkingId) return;
    setPlanWorkingId("create");
    setMessage("");

    try {
      const response = await fetch("/api/admin/plans", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          id: newPlan.id.trim() || undefined,
          name: newPlan.name.trim(),
          shortLabel: newPlan.shortLabel.trim(),
          priceLabel: newPlan.priceLabel.trim(),
          description: newPlan.description.trim(),
          features: toFeatures(newPlan.featuresText),
        }),
      });

      const payload = (await response.json().catch(() => null)) as
        | { error?: { message?: string } }
        | null;

      if (!response.ok) {
        throw new Error(payload?.error?.message || "Could not create listing plan.");
      }

      setNewPlan(emptyPlanForm);
      setMessage("Listing plan created.");
      await loadListingPlans();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Could not create listing plan.");
    } finally {
      setPlanWorkingId("");
    }
  }

  async function savePlan(id: string) {
    if (!token || planWorkingId) return;
    setPlanWorkingId(id);
    setMessage("");

    try {
      const response = await fetch(`/api/admin/plans/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: editPlanForm.name.trim(),
          shortLabel: editPlanForm.shortLabel.trim(),
          priceLabel: editPlanForm.priceLabel.trim(),
          description: editPlanForm.description.trim(),
          features: toFeatures(editPlanForm.featuresText),
        }),
      });

      const payload = (await response.json().catch(() => null)) as
        | { error?: { message?: string } }
        | null;

      if (!response.ok) {
        throw new Error(payload?.error?.message || "Could not update listing plan.");
      }

      setPlanEditId("");
      setEditPlanForm(emptyPlanForm);
      setMessage("Listing plan updated.");
      await loadListingPlans();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Could not update listing plan.");
    } finally {
      setPlanWorkingId("");
    }
  }

  async function createTaxonomyEntry(type: "city" | "category") {
    if (!token || taxonomyWorkingType) return;

    const value = type === "city" ? newCity.trim() : newCategory.trim();
    if (!value) {
      setMessage(type === "city" ? "City name is required." : "Category name is required.");
      return;
    }

    setTaxonomyWorkingType(type);
    setMessage("");

    try {
      const response = await fetch("/api/admin/taxonomy", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ type, value }),
      });

      const payload = (await response.json().catch(() => null)) as
        | { error?: { message?: string } }
        | null;

      if (!response.ok) {
        throw new Error(payload?.error?.message || "Could not update listing taxonomy.");
      }

      if (type === "city") {
        setNewCity("");
        setMessage("New city added. Listing forms are updated.");
      } else {
        setNewCategory("");
        setMessage("New category added. Listing forms are updated.");
      }

      refreshTaxonomy();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Could not update listing taxonomy.");
    } finally {
      setTaxonomyWorkingType("");
    }
  }

  async function createAdminUserAccount() {
    if (!token || isCreatingAdminUser) return;

    setAdminUserMessage("");
    setIsAdminUserSuccess(false);

    if (!newAdminFullName.trim() || !newAdminEmail.trim() || newAdminPassword.length < 6) {
      setAdminUserMessage("Full name, email, and password are required. Password must be at least 6 characters.");
      return;
    }

    setIsCreatingAdminUser(true);

    try {
      const response = await fetch("/api/admin/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          fullName: newAdminFullName.trim(),
          email: newAdminEmail.trim().toLowerCase(),
          phone: newAdminPhone.trim() || null,
          password: newAdminPassword,
        }),
      });

      const payload = (await response.json().catch(() => null)) as
        | { error?: { message?: string } }
        | null;

      if (!response.ok) {
        throw new Error(payload?.error?.message || "Could not create admin user.");
      }

      setNewAdminFullName("");
      setNewAdminEmail("");
      setNewAdminPhone("");
      setNewAdminPassword("");
      setIsAdminUserSuccess(true);
      setAdminUserMessage("New admin user created. They can now login from the normal login page.");
    } catch (error) {
      setIsAdminUserSuccess(false);
      setAdminUserMessage(
        error instanceof Error ? error.message : "Could not create admin user."
      );
    } finally {
      setIsCreatingAdminUser(false);
    }
  }

  async function onPickImageFile(file: File | null) {
    if (!file) return;
    const reader = new FileReader();
    const loaded = await new Promise<string>((resolve, reject) => {
      reader.onload = () => resolve(String(reader.result || ""));
      reader.onerror = () => reject(new Error("Could not read image file."));
      reader.readAsDataURL(file);
    }).catch(() => "");

    if (!loaded) return;
    setEditCoverImage(loaded);
  }

  async function saveEdit(id: string) {
    if (!token || workingId) return;
    setWorkingId(id);
    setMessage("");

    try {
      await localPatchBusiness(id, {
        name: editName.trim(),
        category: editCategory.trim(),
        city: editCity.trim(),
        locality: editLocality.trim(),
        phone: editPhone.trim(),
        whatsappNumber: editPhone.trim(),
        policies: {
          listingPlan: editListingPlan,
        },
        media: editCoverImage.trim()
          ? {
              coverImages: [editCoverImage.trim()],
              gallery: [editCoverImage.trim()],
            }
          : undefined,
      });

      setEditId("");
      setMessage("Listing updated successfully.");
      await loadListings();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Could not update listing.");
    } finally {
      setWorkingId("");
    }
  }

  async function deleteListing(id: string) {
    if (!token || workingId) return;
    if (!window.confirm("Delete this listing permanently?")) return;

    setWorkingId(id);
    setMessage("");

    try {
      await localDeleteBusiness(id);

      setMessage("Listing deleted.");
      await loadListings();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Could not delete listing.");
    } finally {
      setWorkingId("");
    }
  }

  async function createDailyInquiryPost() {
    if (!token || dailyWorkingId) return;
    setMessage("");

    if (!dailyInquiryDate.trim() || !dailyInquiryDescription.trim()) {
      setMessage("Date and description are required.");
      return;
    }

    setDailyWorkingId("creating");
    try {
      const response = await fetch("/api/admin/daily-inquiries", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          inquiryDate: dailyInquiryDate,
          description: dailyInquiryDescription.trim(),
        }),
      });

      if (!response.ok) {
        const payload = (await response.json().catch(() => null)) as
          | { error?: { message?: string } }
          | null;
        throw new Error(payload?.error?.message || "Could not create daily inquiry post.");
      }

      setDailyInquiryDate("");
      setDailyInquiryDescription("");
      setMessage("Daily inquiry post created.");
      await loadDailyInquiries();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Could not create daily inquiry post.");
    } finally {
      setDailyWorkingId("");
    }
  }

  async function deleteDailyInquiryItem(id: string) {
    if (!token || dailyWorkingId) return;
    if (!window.confirm("Delete this daily inquiry post?")) return;

    setDailyWorkingId(id);
    setMessage("");

    try {
      const response = await fetch(`/api/admin/daily-inquiries/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) {
        const payload = (await response.json().catch(() => null)) as
          | { error?: { message?: string } }
          | null;
        throw new Error(payload?.error?.message || "Could not delete daily inquiry.");
      }

      setMessage("Daily inquiry deleted.");
      await loadDailyInquiries();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Could not delete daily inquiry.");
    } finally {
      setDailyWorkingId("");
    }
  }

  const filteredListings = useMemo(() => {
    const query = searchText.trim().toLowerCase();
    return listings.filter((item) => {
      if (statusFilter !== "all" && item.listingStatus !== statusFilter) {
        return false;
      }
      if (planFilter !== "all" && item.listingPlan !== planFilter) {
        return false;
      }
      if (!query) return true;
      const haystack = `${item.name} ${item.category} ${item.locality} ${item.city} ${item.phone} ${item.listingPlan}`.toLowerCase();
      return haystack.includes(query);
    });
  }, [listings, planFilter, searchText, statusFilter]);

  const availablePlanFilters = useMemo(
    () => ["all", ...listingPlans.map((plan) => plan.id)],
    [listingPlans]
  );

  const counts = useMemo(() => {
    const pending = listings.filter((item) => item.listingStatus === "pending").length;
    const active = listings.filter((item) => item.listingStatus === "active").length;
    const rejected = listings.filter((item) => item.listingStatus === "rejected").length;
    return { pending, active, rejected, total: listings.length };
  }, [listings]);

  if (isLoading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center text-slate-600">
        <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Loading admin dashboard...
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="mx-auto max-w-3xl rounded-2xl border border-rose-200 bg-rose-50 p-6 text-rose-800">
        <p className="inline-flex items-center gap-2 text-lg font-semibold">
          <ShieldAlert className="h-5 w-5" /> Admin access only
        </p>
        <p className="mt-2 text-sm">
          This dashboard is restricted. Login with an account where `profiles.role` is `admin`.
        </p>
        <Link
          href="/login?next=/admin"
          className="mt-4 inline-flex h-10 items-center rounded-lg bg-slate-900 px-4 text-sm font-semibold text-white"
        >
          Go to Login
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl space-y-4 px-4 pb-24 pt-4 md:px-6 lg:px-8">
      <section className="rounded-2xl bg-slate-900 p-6 text-white">
        <p className="text-xs uppercase tracking-[0.14em] text-slate-300">Admin Dashboard</p>
        <h1 className="mt-2 text-3xl font-semibold">Welcome, Namaste Bharat Admin</h1>
        <p className="mt-2 text-sm text-slate-200">
          Review pending listing requests and activate approved businesses.
        </p>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-5">
        <div className="mb-4">
          <p className="text-lg font-semibold text-slate-900">Create Admin User</p>
          <p className="mt-1 text-sm text-slate-600">
            Create another login with role <span className="font-semibold">admin</span> so they can access the admin page.
          </p>
        </div>

        <div className="grid gap-3 md:grid-cols-2">
          <input
            value={newAdminFullName}
            onChange={(event) => setNewAdminFullName(event.target.value)}
            placeholder="Full name"
            className="h-10 rounded-lg border border-slate-300 px-3 text-sm"
          />
          <input
            value={newAdminEmail}
            onChange={(event) => setNewAdminEmail(event.target.value)}
            placeholder="Email"
            type="email"
            className="h-10 rounded-lg border border-slate-300 px-3 text-sm"
          />
          <input
            value={newAdminPhone}
            onChange={(event) => setNewAdminPhone(event.target.value)}
            placeholder="Phone (optional)"
            className="h-10 rounded-lg border border-slate-300 px-3 text-sm"
          />
          <input
            value={newAdminPassword}
            onChange={(event) => setNewAdminPassword(event.target.value)}
            placeholder="Password"
            type="password"
            className="h-10 rounded-lg border border-slate-300 px-3 text-sm"
          />
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-3">
          <span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.12em] text-amber-700">
            Role: admin
          </span>
          <button
            type="button"
            disabled={isCreatingAdminUser}
            onClick={() => void createAdminUserAccount()}
            className="h-10 rounded-lg bg-blue-600 px-4 text-sm font-semibold text-white disabled:opacity-60"
          >
            {isCreatingAdminUser ? "Creating admin..." : "Create admin user"}
          </button>
        </div>

        {adminUserMessage ? (
          <p
            className={`mt-3 rounded-lg px-3 py-2 text-sm ${
              isAdminUserSuccess
                ? "bg-emerald-50 text-emerald-700"
                : "bg-amber-50 text-amber-700"
            }`}
          >
            {adminUserMessage}
          </p>
        ) : null}
      </section>

      <section className="rounded-2xl border border-slate-200 bg-slate-50 p-3 md:p-4">
        <div className="mb-4">
          <p className="text-lg font-semibold text-slate-900">Create Listing For Customer</p>
          <p className="mt-1 text-sm text-slate-600">
            Use the same front listing form here when a customer needs admin assistance.
          </p>
        </div>
        <FreeListingForm adminMode onSuccess={loadListings} />
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-5">
        <div className="mb-4">
          <p className="text-lg font-semibold text-slate-900">Manage Cities and Categories</p>
          <p className="mt-1 text-sm text-slate-600">
            Add new cities and categories here. The admin listing form and public listing form
            will use these updated options.
          </p>
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
            <p className="inline-flex items-center gap-2 text-base font-semibold text-slate-900">
              <Plus className="h-4 w-4 text-blue-600" /> Add City
            </p>
            <div className="mt-3 flex gap-2">
              <input
                value={newCity}
                onChange={(event) => setNewCity(event.target.value)}
                placeholder="Enter new city"
                className="h-10 flex-1 rounded-lg border border-slate-300 px-3 text-sm"
              />
              <button
                type="button"
                disabled={taxonomyWorkingType === "city"}
                onClick={() => void createTaxonomyEntry("city")}
                className="h-10 rounded-lg bg-blue-600 px-3 text-sm font-semibold text-white disabled:opacity-60"
              >
                {taxonomyWorkingType === "city" ? "Adding..." : "Add city"}
              </button>
            </div>

            <div className="mt-4 rounded-lg border border-slate-200 bg-white p-3">
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
                Available Cities
              </p>
              {isLoadingCities ? (
                <p className="mt-2 text-sm text-slate-500">Loading cities...</p>
              ) : (
                <div className="mt-3 flex max-h-48 flex-wrap gap-2 overflow-y-auto">
                  {listingCities.map((city) => (
                    <span
                      key={city}
                      className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700"
                    >
                      {city}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
            <p className="inline-flex items-center gap-2 text-base font-semibold text-slate-900">
              <Plus className="h-4 w-4 text-blue-600" /> Add Category
            </p>
            <div className="mt-3 flex gap-2">
              <input
                value={newCategory}
                onChange={(event) => setNewCategory(event.target.value)}
                placeholder="Enter new category"
                className="h-10 flex-1 rounded-lg border border-slate-300 px-3 text-sm"
              />
              <button
                type="button"
                disabled={taxonomyWorkingType === "category"}
                onClick={() => void createTaxonomyEntry("category")}
                className="h-10 rounded-lg bg-blue-600 px-3 text-sm font-semibold text-white disabled:opacity-60"
              >
                {taxonomyWorkingType === "category" ? "Adding..." : "Add category"}
              </button>
            </div>

            <div className="mt-4 rounded-lg border border-slate-200 bg-white p-3">
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
                Available Categories
              </p>
              {isLoadingCategories ? (
                <p className="mt-2 text-sm text-slate-500">Loading categories...</p>
              ) : (
                <div className="mt-3 flex max-h-48 flex-wrap gap-2 overflow-y-auto">
                  {listingCategories.map((category) => (
                    <span
                      key={category}
                      className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700"
                    >
                      {category}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-5">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <p className="text-lg font-semibold text-slate-900">Manage Listing Plans</p>
            <p className="mt-1 text-sm text-slate-600">
              Create new plans and update the existing ones used across listing forms.
            </p>
          </div>
          <button
            type="button"
            onClick={() => void loadListingPlans()}
            className="h-9 rounded-lg border border-slate-300 px-3 text-sm font-medium text-slate-700"
          >
            Refresh
          </button>
        </div>

        <div className="grid gap-4 lg:grid-cols-[1.05fr,1.4fr]">
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
            <p className="inline-flex items-center gap-2 text-base font-semibold text-slate-900">
              <Plus className="h-4 w-4 text-blue-600" /> Add New Plan
            </p>
            <div className="mt-3 grid gap-2">
              <input
                value={newPlan.id}
                onChange={(event) => updatePlanForm(setNewPlan, "id", event.target.value)}
                placeholder="Plan id (optional, e.g. gold-listing)"
                className="h-10 rounded-lg border border-slate-300 px-3 text-sm"
              />
              <input
                value={newPlan.name}
                onChange={(event) => updatePlanForm(setNewPlan, "name", event.target.value)}
                placeholder="Plan name"
                className="h-10 rounded-lg border border-slate-300 px-3 text-sm"
              />
              <input
                value={newPlan.shortLabel}
                onChange={(event) => updatePlanForm(setNewPlan, "shortLabel", event.target.value)}
                placeholder="Short label"
                className="h-10 rounded-lg border border-slate-300 px-3 text-sm"
              />
              <input
                value={newPlan.priceLabel}
                onChange={(event) => updatePlanForm(setNewPlan, "priceLabel", event.target.value)}
                placeholder="Price label"
                className="h-10 rounded-lg border border-slate-300 px-3 text-sm"
              />
              <textarea
                value={newPlan.description}
                onChange={(event) => updatePlanForm(setNewPlan, "description", event.target.value)}
                placeholder="Plan description"
                rows={3}
                className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
              />
              <textarea
                value={newPlan.featuresText}
                onChange={(event) => updatePlanForm(setNewPlan, "featuresText", event.target.value)}
                placeholder={"Features, one per line\nFeatured business profile\nPriority listing placement"}
                rows={5}
                className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
              />
              <button
                type="button"
                disabled={planWorkingId === "create"}
                onClick={() => void createPlan()}
                className="h-10 rounded-lg bg-blue-600 px-3 text-sm font-semibold text-white disabled:opacity-60"
              >
                {planWorkingId === "create" ? "Creating..." : "Create plan"}
              </button>
            </div>
          </div>

          <div className="space-y-3">
            {listingPlans.length === 0 ? (
              <p className="rounded-lg bg-slate-50 px-3 py-2 text-sm text-slate-600">
                No listing plans available.
              </p>
            ) : (
              listingPlans.map((plan) => (
                <article key={plan.id} className="rounded-xl border border-slate-200 p-4">
                  {planEditId === plan.id ? (
                    <div className="grid gap-2">
                      <input
                        value={editPlanForm.name}
                        onChange={(event) => updatePlanForm(setEditPlanForm, "name", event.target.value)}
                        className="h-10 rounded-lg border border-slate-300 px-3 text-sm"
                      />
                      <div className="grid gap-2 md:grid-cols-2">
                        <input
                          value={editPlanForm.shortLabel}
                          onChange={(event) => updatePlanForm(setEditPlanForm, "shortLabel", event.target.value)}
                          className="h-10 rounded-lg border border-slate-300 px-3 text-sm"
                        />
                        <input
                          value={editPlanForm.priceLabel}
                          onChange={(event) => updatePlanForm(setEditPlanForm, "priceLabel", event.target.value)}
                          className="h-10 rounded-lg border border-slate-300 px-3 text-sm"
                        />
                      </div>
                      <textarea
                        value={editPlanForm.description}
                        onChange={(event) => updatePlanForm(setEditPlanForm, "description", event.target.value)}
                        rows={3}
                        className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
                      />
                      <textarea
                        value={editPlanForm.featuresText}
                        onChange={(event) => updatePlanForm(setEditPlanForm, "featuresText", event.target.value)}
                        rows={5}
                        className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
                      />
                    </div>
                  ) : (
                    <>
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div>
                          <p className="text-base font-semibold text-slate-900">{plan.name}</p>
                          <p className="mt-1 text-sm font-medium text-blue-700">{plan.priceLabel}</p>
                          <p className="mt-1 text-sm text-slate-600">{plan.description}</p>
                        </div>
                        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-slate-600">
                          {plan.shortLabel}
                        </span>
                      </div>
                      <ul className="mt-3 space-y-1 text-sm text-slate-700">
                        {plan.features.map((feature) => (
                          <li key={feature}>- {feature}</li>
                        ))}
                      </ul>
                    </>
                  )}

                  <div className="mt-3 flex gap-2">
                    {planEditId === plan.id ? (
                      <>
                        <button
                          type="button"
                          disabled={planWorkingId === plan.id}
                          onClick={() => void savePlan(plan.id)}
                          className="inline-flex h-9 items-center gap-1 rounded-lg bg-blue-600 px-3 text-xs font-semibold text-white disabled:opacity-60"
                        >
                          Save plan
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setPlanEditId("");
                            setEditPlanForm(emptyPlanForm);
                          }}
                          className="inline-flex h-9 items-center gap-1 rounded-lg border border-slate-300 px-3 text-xs font-semibold text-slate-700"
                        >
                          Cancel
                        </button>
                      </>
                    ) : (
                      <button
                        type="button"
                        onClick={() => startPlanEdit(plan)}
                        className="inline-flex h-9 items-center gap-1 rounded-lg border border-slate-300 px-3 text-xs font-semibold text-slate-700"
                      >
                        <Pencil className="h-3.5 w-3.5" /> Edit plan
                      </button>
                    )}
                  </div>
                </article>
              ))
            )}
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-5">
        <div className="mb-3 flex items-center justify-between">
          <p className="text-lg font-semibold text-slate-900">All Listings ({filteredListings.length})</p>
          <button
            type="button"
            onClick={() => void loadListings()}
            className="h-9 rounded-lg border border-slate-300 px-3 text-sm font-medium text-slate-700"
          >
            Refresh
          </button>
        </div>
        <div className="mb-3 grid gap-2 sm:grid-cols-4">
          <div className="rounded-lg bg-slate-50 px-3 py-2 text-sm text-slate-700">Total: {counts.total}</div>
          <div className="rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-800">Pending: {counts.pending}</div>
          <div className="rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-800">Active: {counts.active}</div>
          <div className="rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-800">Rejected: {counts.rejected}</div>
        </div>

        <div className="mb-3 flex flex-wrap items-center gap-2">
          {(["all", "pending", "active", "rejected"] as StatusFilter[]).map((status) => (
            <button
              key={status}
              type="button"
              onClick={() => setStatusFilter(status)}
              className={`h-8 rounded-full px-3 text-xs font-semibold ${
                statusFilter === status
                  ? "bg-slate-900 text-white"
                  : "border border-slate-300 bg-white text-slate-700"
              }`}
            >
              {status[0].toUpperCase() + status.slice(1)}
            </button>
          ))}
          {availablePlanFilters.map((plan) => (
            <button
              key={plan}
              type="button"
              onClick={() => setPlanFilter(plan)}
              className={`h-8 rounded-full px-3 text-xs font-semibold ${
                planFilter === plan
                  ? "bg-blue-600 text-white"
                  : "border border-slate-300 bg-white text-slate-700"
              }`}
            >
              {plan === "all"
                ? "All plans"
                : listingPlans.find((item) => item.id === plan)?.name || plan}
            </button>
          ))}
          <input
            value={searchText}
            onChange={(event) => setSearchText(event.target.value)}
            placeholder="Search name, category, city, phone"
            className="h-9 min-w-[220px] rounded-lg border border-slate-300 px-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none"
          />
        </div>

        {filteredListings.length === 0 ? (
          <p className="rounded-lg bg-slate-50 px-3 py-2 text-sm text-slate-600">No pending requests.</p>
        ) : (
          <div className="space-y-2">
            {filteredListings.map((item) => (
              <article key={item.id} className="rounded-xl border border-slate-200 p-3">
                {editId === item.id ? (
                  <div className="grid gap-2 md:grid-cols-2">
                    <input value={editName} onChange={(event) => setEditName(event.target.value)} className="h-9 rounded-lg border border-slate-300 px-3 text-sm" />
                    <input value={editCategory} onChange={(event) => setEditCategory(event.target.value)} className="h-9 rounded-lg border border-slate-300 px-3 text-sm" />
                    <input value={editLocality} onChange={(event) => setEditLocality(event.target.value)} className="h-9 rounded-lg border border-slate-300 px-3 text-sm" />
                    <input value={editCity} onChange={(event) => setEditCity(event.target.value)} className="h-9 rounded-lg border border-slate-300 px-3 text-sm" />
                    <input value={editPhone} onChange={(event) => setEditPhone(event.target.value)} className="h-9 rounded-lg border border-slate-300 px-3 text-sm md:col-span-2" />
                    <select
                      value={editListingPlan}
                      onChange={(event) => setEditListingPlan(event.target.value)}
                      className="h-9 rounded-lg border border-slate-300 bg-white px-3 text-sm md:col-span-2"
                    >
                      {listingPlans.map((plan) => (
                        <option key={plan.id} value={plan.id}>
                          {plan.name}
                        </option>
                      ))}
                    </select>
                    <input
                      value={editCoverImage}
                      onChange={(event) => setEditCoverImage(event.target.value)}
                      placeholder="Cover image URL/path"
                      className="h-9 rounded-lg border border-slate-300 px-3 text-sm md:col-span-2"
                    />
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(event) => void onPickImageFile(event.target.files?.[0] || null)}
                      className="h-9 rounded-lg border border-slate-300 px-2 text-xs md:col-span-2"
                    />
                    {editCoverImage ? (
                      <img
                        src={editCoverImage}
                        alt="Preview"
                        className="h-24 w-24 rounded-lg border border-slate-200 object-cover md:col-span-2"
                      />
                    ) : null}
                  </div>
                ) : (
                  <>
                    <p className="text-sm font-semibold text-slate-900">{item.name}</p>
                    <p className="text-xs text-slate-600">
                      {item.category} | {item.locality}, {item.city} | {item.phone}
                    </p>
                    <p className="mt-1 text-xs font-medium text-blue-700">
                      Plan: {item.listingPlan === "unknown"
                        ? "Not selected"
                        : listingPlans.find((plan) => plan.id === item.listingPlan)?.name || item.listingPlan}
                    </p>
                    <p className="mt-1 text-xs text-slate-500">
                      Status: <span className="font-semibold">{item.listingStatus}</span> | Submitted: {new Date(item.createdAt).toLocaleString("en-IN")}
                    </p>
                  </>
                )}

                <div className="mt-3 flex gap-2">
                  {item.listingStatus !== "active" ? (
                    <button
                      type="button"
                      disabled={workingId === item.id}
                      onClick={() => void activateListing(item.id)}
                      className="inline-flex h-9 items-center gap-1 rounded-lg bg-emerald-600 px-3 text-xs font-semibold text-white disabled:opacity-60"
                    >
                      {workingId === item.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <CheckCircle2 className="h-3.5 w-3.5" />}
                      Activate
                    </button>
                  ) : null}

                  {item.listingStatus !== "rejected" ? (
                    <button
                      type="button"
                      disabled={workingId === item.id}
                      onClick={() => void rejectListing(item.id)}
                      className="inline-flex h-9 items-center gap-1 rounded-lg bg-rose-600 px-3 text-xs font-semibold text-white disabled:opacity-60"
                    >
                      <XCircle className="h-3.5 w-3.5" /> Reject
                    </button>
                  ) : null}

                  {editId === item.id ? (
                    <>
                      <button
                        type="button"
                        disabled={workingId === item.id}
                        onClick={() => void saveEdit(item.id)}
                        className="inline-flex h-9 items-center gap-1 rounded-lg bg-blue-600 px-3 text-xs font-semibold text-white disabled:opacity-60"
                      >
                        Save
                      </button>
                      <button
                        type="button"
                        onClick={() => setEditId("")}
                        className="inline-flex h-9 items-center gap-1 rounded-lg border border-slate-300 px-3 text-xs font-semibold text-slate-700"
                      >
                        Cancel
                      </button>
                    </>
                  ) : (
                    <button
                      type="button"
                      disabled={workingId === item.id}
                      onClick={() => startEdit(item)}
                      className="inline-flex h-9 items-center gap-1 rounded-lg border border-slate-300 px-3 text-xs font-semibold text-slate-700 disabled:opacity-60"
                    >
                      <Pencil className="h-3.5 w-3.5" /> Edit
                    </button>
                  )}

                  <button
                    type="button"
                    disabled={workingId === item.id}
                    onClick={() => void deleteListing(item.id)}
                    className="inline-flex h-9 items-center gap-1 rounded-lg bg-slate-900 px-3 text-xs font-semibold text-white disabled:opacity-60"
                  >
                    <Trash2 className="h-3.5 w-3.5" /> Delete
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}

        {message ? <p className="mt-3 text-sm text-slate-700">{message}</p> : null}
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-5">
        <div className="mb-3 flex items-center justify-between">
          <p className="text-lg font-semibold text-slate-900">
            Daily Inquiry Posts ({dailyInquiries.length})
          </p>
          <button
            type="button"
            onClick={() => void loadDailyInquiries()}
            className="h-9 rounded-lg border border-slate-300 px-3 text-sm font-medium text-slate-700"
          >
            Refresh
          </button>
        </div>

        <div className="mb-4 grid gap-2 md:grid-cols-[180px,1fr,120px]">
          <input
            type="date"
            value={dailyInquiryDate}
            onChange={(event) => setDailyInquiryDate(event.target.value)}
            className="h-10 rounded-lg border border-slate-300 px-3 text-sm"
          />
          <input
            value={dailyInquiryDescription}
            onChange={(event) => setDailyInquiryDescription(event.target.value)}
            placeholder="Description"
            className="h-10 rounded-lg border border-slate-300 px-3 text-sm"
          />
          <button
            type="button"
            disabled={dailyWorkingId === "creating"}
            onClick={() => void createDailyInquiryPost()}
            className="h-10 rounded-lg bg-blue-600 px-3 text-sm font-semibold text-white disabled:opacity-60"
          >
            {dailyWorkingId === "creating" ? "Posting..." : "Post"}
          </button>
        </div>

        {dailyInquiries.length === 0 ? (
          <p className="rounded-lg bg-slate-50 px-3 py-2 text-sm text-slate-600">
            No daily inquiry posts available.
          </p>
        ) : (
          <div className="space-y-2">
            {dailyInquiries.map((item) => (
              <article key={item.id} className="rounded-xl border border-slate-200 p-3">
                <p className="text-sm font-semibold text-slate-900">{item.inquiryDate}</p>
                <p className="mt-1 text-sm text-slate-700">{item.description}</p>
                <p className="mt-1 text-xs text-slate-500">
                  Posted: {new Date(item.createdAt).toLocaleString("en-IN")}
                </p>

                <div className="mt-3">
                  <button
                    type="button"
                    disabled={dailyWorkingId === item.id}
                    onClick={() => void deleteDailyInquiryItem(item.id)}
                    className="inline-flex h-9 items-center gap-1 rounded-lg bg-slate-900 px-3 text-xs font-semibold text-white disabled:opacity-60"
                  >
                    <Trash2 className="h-3.5 w-3.5" /> Delete
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
