import { NextRequest, NextResponse } from "next/server";
import { createAdminUser } from "@/lib/server/admin-users";
import { requireAdminFromAuthHeader } from "@/lib/server/daily-inquiries";

export const runtime = "nodejs";

function getErrorResponse(error: unknown, fallbackMessage: string) {
  const message = error instanceof Error ? error.message : fallbackMessage;
  const status =
    typeof error === "object" &&
    error !== null &&
    "status" in error &&
    typeof (error as { status?: number }).status === "number"
      ? (error as { status: number }).status
      : 400;

  return NextResponse.json({ error: { message } }, { status });
}

export async function POST(request: NextRequest) {
  try {
    await requireAdminFromAuthHeader(request.headers.get("authorization") || "");

    const payload = (await request.json().catch(() => null)) as
      | {
          fullName?: string;
          email?: string;
          password?: string;
          phone?: string | null;
        }
      | null;

    const created = await createAdminUser({
      fullName: String(payload?.fullName || "").trim(),
      email: String(payload?.email || "").trim(),
      password: String(payload?.password || ""),
      phone: String(payload?.phone || "").trim() || null,
    });

    return NextResponse.json(
      {
        ok: true,
        user: created.user,
        profile: created.profile,
      },
      { status: 201 }
    );
  } catch (error) {
    return getErrorResponse(error, "Could not create admin user.");
  }
}
