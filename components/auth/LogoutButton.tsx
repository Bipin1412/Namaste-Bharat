"use client";

import { useState } from "react";
import { Loader2, LogOut } from "lucide-react";
import { clearAuthToken, getAuthToken, getBackendBaseUrl } from "@/lib/auth-client";

export default function LogoutButton() {
  const [isLoading, setIsLoading] = useState(false);

  async function handleLogout() {
    if (isLoading) {
      return;
    }
    setIsLoading(true);

    try {
      const token = getAuthToken();
      await fetch(`${getBackendBaseUrl()}/api/auth/logout`, {
        method: "POST",
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      }).catch(() => null);
      clearAuthToken();
      window.location.assign("/profile");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <button
      type="button"
      onClick={handleLogout}
      disabled={isLoading}
      className="inline-flex h-10 items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-70"
    >
      {isLoading ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
          Logging out...
        </>
      ) : (
        <>
          <LogOut className="h-4 w-4" aria-hidden />
          Logout
        </>
      )}
    </button>
  );
}
