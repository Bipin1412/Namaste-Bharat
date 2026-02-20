"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { CheckCircle2, Loader2, ShieldAlert, XCircle } from "lucide-react";
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
};

export default function AdminDashboard() {
  const [isLoading, setIsLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [adminName, setAdminName] = useState("Admin");
  const [message, setMessage] = useState("");
  const [listings, setListings] = useState<AdminListing[]>([]);
  const [workingId, setWorkingId] = useState("");
  const [usingLocalFallback, setUsingLocalFallback] = useState(false);

  const token = useMemo(() => getAuthToken(), []);

  const loadListings = useCallback(async () => {
    if (!token) {
      setListings([]);
      return;
    }

    const response = await fetch(`${getBackendBaseUrl()}/api/admin/listings?status=pending`, {
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

    const localPending = (localPayload?.data || [])
      .filter((entry) => !entry.verified)
      .map((entry) => ({
        id: String(entry.id || ""),
        name: String(entry.name || "Unnamed"),
        category: String(entry.category || "Unknown"),
        locality: String(entry.locality || ""),
        city: String(entry.city || ""),
        phone: String(entry.phone || ""),
        listingStatus: "pending" as const,
        verified: false,
        createdAt: String(entry.createdAt || new Date().toISOString()),
      }))
      .filter((entry) => entry.id);

    setListings(localPending);
    setUsingLocalFallback(true);
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

      const response = await fetch(`${getBackendBaseUrl()}/api/auth/me`, {
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
      setIsLoading(false);
    }

    void boot();
    return () => {
      mounted = false;
    };
  }, [loadListings, token]);

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
        if (usingLocalFallback) {
          const localUpdate = await fetch(`/api/businesses/${id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ verified: true }),
          });
          if (!localUpdate.ok) {
            throw new Error("Could not activate listing.");
          }
        } else {
          const payload = (await response.json().catch(() => null)) as
            | { error?: { message?: string } }
            | null;
          throw new Error(payload?.error?.message || "Could not activate listing.");
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
        if (usingLocalFallback) {
          const localDelete = await fetch(`/api/businesses/${id}`, {
            method: "DELETE",
          });
          if (!localDelete.ok) {
            throw new Error("Could not reject listing.");
          }
        } else {
          const payload = (await response.json().catch(() => null)) as
            | { error?: { message?: string } }
            | null;
          throw new Error(payload?.error?.message || "Could not reject listing.");
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
          <p className="text-lg font-semibold text-slate-900">Pending Listings ({listings.length})</p>
          <button
            type="button"
            onClick={() => void loadListings()}
            className="h-9 rounded-lg border border-slate-300 px-3 text-sm font-medium text-slate-700"
          >
            Refresh
          </button>
        </div>
        {usingLocalFallback ? (
          <p className="mb-3 rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-800">
            Showing local pending requests fallback. Run Supabase marketplace SQL tables to use central admin queue.
          </p>
        ) : null}

        {listings.length === 0 ? (
          <p className="rounded-lg bg-slate-50 px-3 py-2 text-sm text-slate-600">No pending requests.</p>
        ) : (
          <div className="space-y-2">
            {listings.map((item) => (
              <article key={item.id} className="rounded-xl border border-slate-200 p-3">
                <p className="text-sm font-semibold text-slate-900">{item.name}</p>
                <p className="text-xs text-slate-600">
                  {item.category} | {item.locality}, {item.city} | {item.phone}
                </p>
                <p className="mt-1 text-xs text-slate-500">
                  Submitted: {new Date(item.createdAt).toLocaleString("en-IN")}
                </p>
                <div className="mt-3 flex gap-2">
                  <button
                    type="button"
                    disabled={workingId === item.id}
                    onClick={() => void activateListing(item.id)}
                    className="inline-flex h-9 items-center gap-1 rounded-lg bg-emerald-600 px-3 text-xs font-semibold text-white disabled:opacity-60"
                  >
                    {workingId === item.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <CheckCircle2 className="h-3.5 w-3.5" />}
                    Activate
                  </button>
                  <button
                    type="button"
                    disabled={workingId === item.id}
                    onClick={() => void rejectListing(item.id)}
                    className="inline-flex h-9 items-center gap-1 rounded-lg bg-rose-600 px-3 text-xs font-semibold text-white disabled:opacity-60"
                  >
                    <XCircle className="h-3.5 w-3.5" /> Reject
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}

        {message ? <p className="mt-3 text-sm text-slate-700">{message}</p> : null}
      </section>
    </div>
  );
}
