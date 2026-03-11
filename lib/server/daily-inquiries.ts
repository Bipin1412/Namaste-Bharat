import crypto from "node:crypto";
import { createClient } from "@supabase/supabase-js";

type DailyInquiryRow = {
  id: string;
  inquiry_date: string;
  description: string;
  created_at: string;
  updated_at: string;
};

type ResolvedUser = {
  id: string;
  email?: string | null;
  phone?: string | null;
  user_metadata?: {
    role?: string | null;
  } | null;
};

function getEnv(name: string): string {
  return String(process.env[name] || "").trim();
}

function requireEnv(name: string): string {
  const value = getEnv(name);
  if (!value) {
    throw new Error(`Missing required env var: ${name}`);
  }
  return value;
}

function createAnonClient() {
  return createClient(
    requireEnv("NEXT_PUBLIC_SUPABASE_URL"),
    requireEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY"),
    { auth: { persistSession: false } }
  );
}

function createAdminClient() {
  return createClient(
    requireEnv("NEXT_PUBLIC_SUPABASE_URL"),
    requireEnv("SUPABASE_SERVICE_ROLE_KEY"),
    { auth: { persistSession: false } }
  );
}

function mapDailyInquiry(row: DailyInquiryRow) {
  return {
    id: row.id,
    inquiryDate: row.inquiry_date,
    description: row.description,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function base64UrlDecode(input: string): string {
  const normalized = input.replace(/-/g, "+").replace(/_/g, "/");
  const padded = normalized + "=".repeat((4 - (normalized.length % 4)) % 4);
  return Buffer.from(padded, "base64").toString("utf8");
}

function signHmac(data: string, secret: string): string {
  return crypto
    .createHmac("sha256", secret)
    .update(data)
    .digest("base64")
    .replace(/=/g, "")
    .replace(/\+/g, "-")
    .replace(/\//g, "_");
}

function verifyAppToken(token: string) {
  const secret = requireEnv("APP_JWT_SECRET");
  const parts = String(token || "").split(".");
  if (parts.length !== 3) {
    return { ok: false as const };
  }

  const [encodedHeader, encodedBody, signature] = parts;
  const signingInput = `${encodedHeader}.${encodedBody}`;
  const expectedSignature = signHmac(signingInput, secret);
  const signatureBuffer = Buffer.from(signature);
  const expectedBuffer = Buffer.from(expectedSignature);

  if (signatureBuffer.length !== expectedBuffer.length) {
    return { ok: false as const };
  }
  if (!crypto.timingSafeEqual(signatureBuffer, expectedBuffer)) {
    return { ok: false as const };
  }

  try {
    const payload = JSON.parse(base64UrlDecode(encodedBody)) as {
      sub?: string;
      email?: string | null;
      phone?: string | null;
      role?: string | null;
      exp?: number;
    };
    const now = Math.floor(Date.now() / 1000);
    if (!payload.exp || now >= payload.exp || !payload.sub) {
      return { ok: false as const };
    }

    return {
      ok: true as const,
      user: {
        id: payload.sub,
        email: payload.email ?? null,
        phone: payload.phone ?? null,
        user_metadata: {
          role: payload.role ?? "user",
        },
      } satisfies ResolvedUser,
    };
  } catch {
    return { ok: false as const };
  }
}

export async function requireAdminFromAuthHeader(authHeader: string) {
  const token = authHeader.startsWith("Bearer ")
    ? authHeader.slice("Bearer ".length).trim()
    : "";

  if (!token) {
    const error = new Error("Missing bearer token.");
    (error as Error & { status?: number }).status = 401;
    throw error;
  }

  let user: ResolvedUser | null = null;

  try {
    const anonClient = createAnonClient();
    const { data, error } = await anonClient.auth.getUser(token);
    if (!error && data.user) {
      user = {
        id: data.user.id,
        email: data.user.email ?? null,
        phone: data.user.phone ?? null,
        user_metadata: data.user.user_metadata as ResolvedUser["user_metadata"],
      };
    }
  } catch {
    user = null;
  }

  if (!user) {
    const verified = verifyAppToken(token);
    if (verified.ok) {
      user = verified.user;
    }
  }

  if (!user?.id) {
    const error = new Error("Invalid or expired session.");
    (error as Error & { status?: number }).status = 401;
    throw error;
  }

  const metadataRole = String(user.user_metadata?.role || "").toLowerCase();
  if (metadataRole === "admin") {
    return user;
  }

  const adminClient = createAdminClient();
  const { data, error } = await adminClient
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (error || String(data?.role || "").toLowerCase() !== "admin") {
    const denied = new Error("Admin access denied.");
    (denied as Error & { status?: number }).status = 403;
    throw denied;
  }

  return user;
}

export async function listDailyInquiryPosts(filterDate: string | null) {
  const adminClient = createAdminClient();
  let query = adminClient
    .from("daily_inquiry_posts")
    .select("*")
    .order("inquiry_date", { ascending: false })
    .order("created_at", { ascending: false });

  if (filterDate) {
    query = query.eq("inquiry_date", filterDate);
  }

  const { data, error } = await query;
  if (error) {
    throw error;
  }

  const rows = (data || []) as DailyInquiryRow[];
  return rows.map(mapDailyInquiry);
}

export async function createDailyInquiryPost(input: {
  inquiryDate: string;
  description: string;
}) {
  const adminClient = createAdminClient();
  const { data, error } = await adminClient
    .from("daily_inquiry_posts")
    .insert({
      inquiry_date: input.inquiryDate,
      description: input.description,
    })
    .select("*")
    .single();

  if (error) {
    throw error;
  }

  return mapDailyInquiry(data as DailyInquiryRow);
}

export async function deleteDailyInquiryPost(id: string) {
  const adminClient = createAdminClient();
  const { error, count } = await adminClient
    .from("daily_inquiry_posts")
    .delete({ count: "exact" })
    .eq("id", id);

  if (error) {
    throw error;
  }

  return Boolean(count);
}
