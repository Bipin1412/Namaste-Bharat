import { NextRequest, NextResponse } from "next/server";
import { hasMysqlConfig } from "@/lib/server/mysql";
import {
  buildSessionPayload,
  createEmailUser,
  findProfileByUserId,
  findUserByEmail,
  loginWithEmailPassword,
  resolveUserFromToken,
  sanitizeUser,
  toProfile,
} from "@/lib/server/mysql-auth";
import * as legacy from "./route-legacy";

export const runtime = "nodejs";

type RouteContext = {
  params: Promise<{ path: string[] }>;
};

function getErrorResponse(error: unknown, fallbackMessage: string, status = 500) {
  const message = error instanceof Error ? error.message : fallbackMessage;
  return NextResponse.json({ error: { message } }, { status });
}

async function handleMysqlLogin(request: NextRequest) {
  const body = (await request.json().catch(() => null)) as
    | { email?: string; password?: string }
    | null;
  const email = String(body?.email || "").trim().toLowerCase();
  const password = String(body?.password || "");

  if (!email || !password) {
    return getErrorResponse(new Error("email and password are required."), "Login failed.", 400);
  }

  const user = await loginWithEmailPassword(email, password);
  if (!user) {
    return getErrorResponse(
      new Error("Login failed. Please check your credentials."),
      "Login failed.",
      401
    );
  }

  const sessionPayload = await buildSessionPayload(user);
  return NextResponse.json({
    ok: true,
    user: sessionPayload.user,
    profile: sessionPayload.profile,
    session: sessionPayload.session,
  });
}

async function handleMysqlMe(request: NextRequest) {
  const authHeader = request.headers.get("authorization") || "";
  const token = authHeader.startsWith("Bearer ")
    ? authHeader.slice("Bearer ".length).trim()
    : "";

  if (!token) {
    return getErrorResponse(new Error("Missing bearer token."), "Unauthorized.", 401);
  }

  const user = await resolveUserFromToken(token);
  if (!user) {
    return getErrorResponse(new Error("Invalid or expired session."), "Unauthorized.", 401);
  }

  const profile = await findProfileByUserId(user.id);
  return NextResponse.json({
    ok: true,
    user: sanitizeUser(user),
    profile: toProfile(profile, user),
  });
}

async function handleMysqlLogout() {
  return NextResponse.json({ ok: true });
}

async function handleMysqlSignup(request: NextRequest) {
  const body = (await request.json().catch(() => null)) as
    | { fullName?: string; phone?: string; email?: string; password?: string }
    | null;

  const fullName = String(body?.fullName || "").trim();
  const phone = String(body?.phone || "").trim();
  const email = String(body?.email || "").trim().toLowerCase();
  const password = String(body?.password || "");

  if (!fullName || !phone || !email || !password) {
    return getErrorResponse(
      new Error("fullName, phone, email and password are required."),
      "Signup failed.",
      400
    );
  }

  if (password.length < 6) {
    return getErrorResponse(
      new Error("Password must be at least 6 characters."),
      "Signup failed.",
      400
    );
  }

  const existing = await findUserByEmail(email);
  if (existing) {
    return getErrorResponse(
      new Error("An account with this email already exists."),
      "Signup failed.",
      409
    );
  }

  const user = await createEmailUser({
    fullName,
    phone,
    email,
    password,
  });

  if (!user) {
    return getErrorResponse(
      new Error("Signup succeeded but no user was returned."),
      "Signup failed.",
      500
    );
  }

  const sessionPayload = await buildSessionPayload(user);
  return NextResponse.json({
    ok: true,
    user: sessionPayload.user,
    profile: sessionPayload.profile,
    session: sessionPayload.session,
    emailConfirmationRequired: false,
  });
}

async function handleMysqlPasswordResetRequest() {
  return NextResponse.json(
    {
      error: {
        message:
          "Password reset email is not configured for the MySQL deployment yet. Please contact the admin to reset your password.",
      },
    },
    { status: 501 }
  );
}

async function handleMysqlPasswordResetConfirm() {
  return NextResponse.json(
    {
      error: {
        message:
          "Password reset confirmation is not configured for the MySQL deployment yet. Please contact the admin to reset your password.",
      },
    },
    { status: 501 }
  );
}

async function routeGetMysql(request: NextRequest, path: string[]) {
  if (path.length === 1 && path[0] === "me") {
    return handleMysqlMe(request);
  }

  return NextResponse.json({ error: { message: "Not found." } }, { status: 404 });
}

async function routePostMysql(request: NextRequest, path: string[]) {
  if (path.length === 1 && path[0] === "login") {
    return handleMysqlLogin(request);
  }
  if (path.length === 1 && path[0] === "signup") {
    return handleMysqlSignup(request);
  }
  if (path.length === 1 && path[0] === "logout") {
    return handleMysqlLogout();
  }
  if (path.length === 3 && path[0] === "password" && path[1] === "reset" && path[2] === "request") {
    return handleMysqlPasswordResetRequest();
  }
  if (path.length === 3 && path[0] === "password" && path[1] === "reset" && path[2] === "confirm") {
    return handleMysqlPasswordResetConfirm();
  }

  return NextResponse.json({ error: { message: "Not found." } }, { status: 404 });
}

export async function GET(request: NextRequest, context: RouteContext) {
  if (!hasMysqlConfig()) {
    return legacy.GET(request, context);
  }

  const { path } = await context.params;
  try {
    return await routeGetMysql(request, path);
  } catch (error) {
    return getErrorResponse(error, "Authentication service is temporarily unavailable.", 502);
  }
}

export async function POST(request: NextRequest, context: RouteContext) {
  if (!hasMysqlConfig()) {
    return legacy.POST(request, context);
  }

  const { path } = await context.params;
  try {
    return await routePostMysql(request, path);
  } catch (error) {
    return getErrorResponse(error, "Authentication service is temporarily unavailable.", 502);
  }
}

export async function PATCH(request: NextRequest, context: RouteContext) {
  if (!hasMysqlConfig()) {
    return legacy.PATCH(request, context);
  }

  return NextResponse.json({ error: { message: "Not found." } }, { status: 404 });
}

export async function PUT(request: NextRequest, context: RouteContext) {
  if (!hasMysqlConfig()) {
    return legacy.PUT(request, context);
  }

  return NextResponse.json({ error: { message: "Not found." } }, { status: 404 });
}

export async function DELETE(request: NextRequest, context: RouteContext) {
  if (!hasMysqlConfig()) {
    return legacy.DELETE(request, context);
  }

  return NextResponse.json({ error: { message: "Not found." } }, { status: 404 });
}

export async function OPTIONS(request: NextRequest, context: RouteContext) {
  if (!hasMysqlConfig()) {
    return legacy.OPTIONS(request, context);
  }

  return new NextResponse(null, { status: 204 });
}
