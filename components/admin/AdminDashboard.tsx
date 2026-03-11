"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { CheckCircle2, Loader2, Pencil, ShieldAlert, Trash2, XCircle } from "lucide-react";
import { getAuthToken, getBackendBaseUrl } from "@/lib/auth-client";

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
type DailyInquiry = {
  id: string;
  inquiryDate: string;
  description: string;
  createdAt: string;
  updatedAt?: string;
};

export default function AdminDashboard() {
  const [isLoading, setIsLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [adminName, setAdminName] = useState("Admin");
  const [message, setMessage] = useState("");
  const [listings, setListings] = useState<AdminListing[]>([]);
  const [workingId, setWorkingId] = useState("");
  const [dailyWorkingId, setDailyWorkingId] = useState("");
  const [usingLocalFallback, setUsingLocalFallback] = useState(false);
  const [dailyInquiries, setDailyInquiries] = useState<DailyInquiry[]>([]);
  const [dailyInquiryDate, setDailyInquiryDate] = useState("");
  const [dailyInquiryDescription, setDailyInquiryDescription] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [searchText, setSearchText] = useState("");
  const [editId, setEditId] = useState("");
  const [editName, setEditName] = useState("");
  const [editCategory, setEditCategory] = useState("");
  const [editCity, setEditCity] = useState("");
  const [editLocality, setEditLocality] = useState("");
  const [editPhone, setEditPhone] = useState("");
  const [editCoverImage, setEditCoverImage] = useState("");

  const token = useMemo(() => getAuthToken(), []);
  const missingBusinessesTableMsg = "could not find the table 'public.businesses'";

  function shouldUseLocalFallback(message: string): boolean {
    return message.toLowerCase().includes(missingBusinessesTableMsg);
  }

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

    const response = await fetch(`${getBackendBaseUrl()}/api/admin/listings?page=1&limit=500`, {
      headers: { Authorization: `Bearer ${token}` },
    }).catch(() => null);

    if (response && response.ok) {
      const payload = (await response.json().catch(() => null)) as
        | { data?: AdminListing[] }
        | null;
      setListings(Array.isArray(payload?.data) ? payload.data : []);
      setUsingLocalFallback(false);
      return;
    }

    const localResponse = await fetch("/api/businesses?sort=newest&page=1&limit=200", {
      cache: "no-store",
    }).catch(() => null);

    if (!localResponse || !localResponse.ok) {
      setListings([]);
      setUsingLocalFallback(false);
      return;
    }

    const localPayload = (await localResponse.json().catch(() => null)) as
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
    setUsingLocalFallback(true);
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

      setAdminName(payload?.profile?.full_name || "Admin");
      setIsAdmin(true);
      await loadListings();
      await loadDailyInquiries();
      setIsLoading(false);
    }

    void boot();
    return () => {
      mounted = false;
    };
  }, [loadDailyInquiries, loadListings, token]);

  async function activateListing(id: string) {
    if (!token || workingId) return;
    setWorkingId(id);
    setMessage("");

    try {
      const response = await fetch(`${getBackendBaseUrl()}/api/admin/listings/${id}/activate`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) {
        const payload = (await response.json().catch(() => null)) as
          | { error?: { message?: string } }
          | null;
        const backendMessage = payload?.error?.message || "Could not activate listing.";
        if (shouldUseLocalFallback(backendMessage)) {
          await localPatchBusiness(id, {
            verified: true,
            listingStatus: "active",
          });
        } else {
          throw new Error(backendMessage);
        }
      }

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
      const response = await fetch(`${getBackendBaseUrl()}/api/admin/listings/${id}/reject`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ reason: reason.trim() }),
      });
      if (!response.ok) {
        const payload = (await response.json().catch(() => null)) as
          | { error?: { message?: string } }
          | null;
        const backendMessage = payload?.error?.message || "Could not reject listing.";
        if (shouldUseLocalFallback(backendMessage)) {
          await localPatchBusiness(id, {
            verified: false,
            listingStatus: "rejected",
            rejectedReason: reason.trim() || "Rejected by admin",
          });
        } else {
          throw new Error(backendMessage);
        }
      }

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
    setEditCoverImage(item.media?.coverImages?.[0] || "");
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
      const response = await fetch(`${getBackendBaseUrl()}/api/businesses/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: editName.trim(),
          category: editCategory.trim(),
          city: editCity.trim(),
          locality: editLocality.trim(),
          phone: editPhone.trim(),
          whatsappNumber: editPhone.trim(),
          media: editCoverImage.trim()
            ? {
                coverImages: [editCoverImage.trim()],
                gallery: [editCoverImage.trim()],
              }
            : undefined,
        }),
      });

      if (!response.ok) {
        const payload = (await response.json().catch(() => null)) as
          | { error?: { message?: string } }
          | null;
        const backendMessage = payload?.error?.message || "Could not update listing.";
        if (shouldUseLocalFallback(backendMessage)) {
          await localPatchBusiness(id, {
            name: editName.trim(),
            category: editCategory.trim(),
            city: editCity.trim(),
            locality: editLocality.trim(),
            phone: editPhone.trim(),
            whatsappNumber: editPhone.trim(),
            media: editCoverImage.trim()
              ? {
                  coverImages: [editCoverImage.trim()],
                  gallery: [editCoverImage.trim()],
                }
              : undefined,
          });
        } else {
          throw new Error(backendMessage);
        }
      }

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
      const response = await fetch(`${getBackendBaseUrl()}/api/businesses/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) {
        const payload = (await response.json().catch(() => null)) as
          | { error?: { message?: string } }
          | null;
        const backendMessage = payload?.error?.message || "Could not delete listing.";
        if (shouldUseLocalFallback(backendMessage)) {
          await localDeleteBusiness(id);
        } else {
          throw new Error(backendMessage);
        }
      }

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
      if (!query) return true;
      const haystack = `${item.name} ${item.category} ${item.locality} ${item.city} ${item.phone}`.toLowerCase();
      return haystack.includes(query);
    });
  }, [listings, searchText, statusFilter]);

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
        <h1 className="mt-2 text-3xl font-semibold">Welcome, {adminName}</h1>
        <p className="mt-2 text-sm text-slate-200">
          Review pending listing requests and activate approved businesses.
        </p>
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
