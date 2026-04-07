import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function GET() {
  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:4000";

  return NextResponse.json({
    service: "namastebharat-api",
    version: "1.0.0",
    endpoints: {
      health: "/api/health",
      home: "/api/home",
      businesses: "/api/businesses",
      businessById: "/api/businesses/:id",
      reels: "/api/reels",
      offers: "/api/offers",
      categories: "/api/categories",
      cities: "/api/cities",
      leads: "/api/leads",
      authBackendHealth: `${backendUrl}/api/health`,
      authBackendSignup: `${backendUrl}/api/auth/signup`,
      authBackendLogin: `${backendUrl}/api/auth/login`,
      authBackendMe: `${backendUrl}/api/auth/me`,
      authBackendLogout: `${backendUrl}/api/auth/logout`,
    },
    note: "Frontend business APIs are here. Auth APIs are served by Express backend.",
  });
}
