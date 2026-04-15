import { randomUUID } from "node:crypto";
import { executeResult, queryRows, toIsoString } from "@/lib/server/mysql";
import { findProfileByUserId, resolveUserFromToken } from "@/lib/server/mysql-auth";

type DailyInquiryRow = {
  id: string;
  inquiry_date: string;
  description: string;
  created_at: string | null;
  updated_at: string | null;
};

type ResolvedUser = {
  id: string;
  email?: string | null;
  phone?: string | null;
  user_metadata?: {
    role?: string | null;
  } | null;
};

function mapDailyInquiry(row: DailyInquiryRow) {
  return {
    id: row.id,
    inquiryDate: row.inquiry_date,
    description: row.description,
    createdAt: toIsoString(row.created_at),
    updatedAt: toIsoString(row.updated_at),
  };
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

  const user = await resolveUserFromToken(token);
  if (!user?.id) {
    const error = new Error("Invalid or expired session.");
    (error as Error & { status?: number }).status = 401;
    throw error;
  }

  const profile = await findProfileByUserId(user.id);
  if (String(profile?.role || "").toLowerCase() !== "admin") {
    const denied = new Error("Admin access denied.");
    (denied as Error & { status?: number }).status = 403;
    throw denied;
  }

  return {
    id: user.id,
    email: user.email ?? null,
    phone: user.phone ?? null,
    user_metadata: {
      role: profile?.role ?? "user",
    },
  } satisfies ResolvedUser;
}

export async function listDailyInquiryPosts(filterDate: string | null) {
  const rows = filterDate
    ? await queryRows<DailyInquiryRow>(
        `SELECT id, inquiry_date, description, created_at, updated_at
         FROM daily_inquiry_posts
         WHERE inquiry_date = ?
         ORDER BY inquiry_date DESC, created_at DESC`,
        [filterDate]
      )
    : await queryRows<DailyInquiryRow>(
        `SELECT id, inquiry_date, description, created_at, updated_at
         FROM daily_inquiry_posts
         ORDER BY inquiry_date DESC, created_at DESC`
      );

  return rows.map(mapDailyInquiry);
}

export async function createDailyInquiryPost(input: {
  inquiryDate: string;
  description: string;
}) {
  const id = randomUUID();
  await executeResult(
    `INSERT INTO daily_inquiry_posts (id, inquiry_date, description)
     VALUES (?, ?, ?)`,
    [id, input.inquiryDate, input.description]
  );

  const rows = await queryRows<DailyInquiryRow>(
    `SELECT id, inquiry_date, description, created_at, updated_at
     FROM daily_inquiry_posts
     WHERE id = ?
     LIMIT 1`,
    [id]
  );

  if (!rows[0]) {
    throw new Error("Daily inquiry post was created but could not be loaded.");
  }

  return mapDailyInquiry(rows[0]);
}

export async function deleteDailyInquiryPost(id: string) {
  const result = await executeResult("DELETE FROM daily_inquiry_posts WHERE id = ?", [id]);
  return result.affectedRows > 0;
}
