// @ts-nocheck
import { NextRequest, NextResponse } from "next/server";
import { createClient, type User } from "@supabase/supabase-js";
import { Resolver } from "node:dns";
import { Agent, fetch as undiciFetch } from "undici";

export const runtime = "nodejs";

type RouteContext = {
  params: Promise<{ path: string[] }>;
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

const resolver = new Resolver();
resolver.setServers(["8.8.8.8", "1.1.1.1"]);

const dispatcher = new Agent({
  connect: {
    lookup(hostname, _options, callback) {
      resolver.resolve4(hostname, (error, addresses) => {
        if (!error && Array.isArray(addresses) && addresses.length > 0) {
          callback(null, addresses[0], 4);
          return;
        }

        resolver.resolve6(hostname, (ipv6Error, ipv6Addresses) => {
          if (!ipv6Error && Array.isArray(ipv6Addresses) && ipv6Addresses.length > 0) {
            callback(null, ipv6Addresses[0], 6);
            return;
          }

          callback(error || ipv6Error || new Error(`DNS lookup failed for ${hostname}`));
        });
      });
    },
  },
});

function customFetch(input: string | URL | Request, init?: RequestInit) {
  return undiciFetch(input, {
    ...init,
    dispatcher,
  });
}

function createAnonClient() {
  return createClient(
    requireEnv("NEXT_PUBLIC_SUPABASE_URL"),
    requireEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY"),
    { auth: { persistSession: false }, global: { fetch: customFetch } }
  );
}

function createAdminClient() {
  const serviceKey = getEnv("SUPABASE_SERVICE_ROLE_KEY");
  if (!serviceKey) {
    return null;
  }

  return createClient(requireEnv("NEXT_PUBLIC_SUPABASE_URL"), serviceKey, {
    auth: { persistSession: false },
    global: { fetch: customFetch },
  });
}

function sanitizeUser(user: User) {
  return {
    id: user.id,
    email: user.email ?? null,
    phone: user.phone ?? null,
    created_at: user.created_at ?? null,
    user_metadata: user.user_metadata ?? {},
  };
}

function fallbackProfileFromUser(user: User) {
  const metadata = user.user_metadata || {};
  return {
    id: user.id,
    full_name: typeof metadata.full_name === "string" ? metadata.full_name : null,
    phone: typeof metadata.phone === "string" ? metadata.phone : null,
    role: typeof metadata.role === "string" ? metadata.role : null,
  };
}

async function getProfile(user: User) {
  const adminClient = createAdminClient();
  if (!adminClient) {
    return fallbackProfileFromUser(user);
  }

  const { data, error } = await adminClient
    .from("profiles")
    .select("id, full_name, phone, role")
    .eq("id", user.id)
    .single();

  if (error || !data) {
    return fallbackProfileFromUser(user);
  }

  return data;
}

async function upsertProfile(userId: string, fullName: string | null, phone: string | null) {
  const adminClient = createAdminClient();
  if (!adminClient || !userId) {
    return;
  }

  const payload: Record<string, string> = { id: userId };
  if (fullName) payload.full_name = fullName;
  if (phone) payload.phone = phone;

  try {
    await adminClient.from("profiles").upsert(payload);
  } catch {
    // Best-effort profile sync; auth should still succeed if this write fails.
  }
}

function getFrontendUrl() {
  return getEnv("FRONTEND_URL") || "http://localhost:3000";
}

function getErrorResponse(error: unknown, fallbackMessage: string, status = 500) {
  const message = error instanceof Error ? error.message : fallbackMessage;
  return NextResponse.json({ error: { message } }, { status });
}

async function handleLogin(request: NextRequest) {
  try {
    const body = (await request.json().catch(() => null)) as
      | { email?: string; password?: string }
      | null;
    const email = String(body?.email || "").trim().toLowerCase();
    const password = String(body?.password || "");

    if (!email || !password) {
      return getErrorResponse(new Error("email and password are required."), "Login failed.", 400);
    }

    const supabase = createAnonClient();
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      return getErrorResponse(new Error(error.message), "Login failed.", 401);
    }
    if (!data.user || !data.session) {
      return getErrorResponse(
        new Error("Login failed. Please check your credentials."),
        "Login failed.",
        401
      );
    }

    const metadata = data.user.user_metadata || {};
    const fullName = typeof metadata.full_name === "string" ? metadata.full_name.trim() : null;
    const phone = typeof metadata.phone === "string" ? metadata.phone.trim() : null;
    await upsertProfile(data.user.id, fullName, phone);
    const profile = await getProfile(data.user);

    return NextResponse.json({
      ok: true,
      user: sanitizeUser(data.user),
      profile,
      session: {
        access_token: data.session.access_token,
        refresh_token: data.session.refresh_token,
        expires_at: data.session.expires_at,
      },
    });
  } catch {
    return NextResponse.json(
      {
        error: {
          message: "Authentication service is temporarily unavailable.",
        },
      },
      { status: 502 }
    );
  }
}

async function handleMe(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization") || "";
    const token = authHeader.startsWith("Bearer ")
      ? authHeader.slice("Bearer ".length).trim()
      : "";

    if (!token) {
      return getErrorResponse(new Error("Missing bearer token."), "Unauthorized.", 401);
    }

    const supabase = createAnonClient();
    const { data, error } = await supabase.auth.getUser(token);
    if (error || !data.user) {
      return getErrorResponse(new Error("Invalid or expired session."), "Unauthorized.", 401);
    }

    const profile = await getProfile(data.user);
    return NextResponse.json({
      ok: true,
      user: sanitizeUser(data.user),
      profile,
    });
  } catch {
    return NextResponse.json(
      {
        error: {
          message: "Authentication service is temporarily unavailable.",
        },
      },
      { status: 502 }
    );
  }
}

async function handleLogout() {
  return NextResponse.json({ ok: true });
}

async function handleSignup(request: NextRequest) {
  try {
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

    const supabase = createAnonClient();
    const emailRedirectTo = `${getFrontendUrl().replace(/\/+$/, "")}/login?verified=1`;
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo,
        data: {
          full_name: fullName,
          phone,
        },
      },
    });

    if (error) {
      return getErrorResponse(new Error(error.message), "Signup failed.", 400);
    }
    if (!data.user) {
      return getErrorResponse(
        new Error("Signup succeeded but no user was returned."),
        "Signup failed.",
        400
      );
    }

    await upsertProfile(data.user.id, fullName, phone);
    const profile = await getProfile(data.user);

    return NextResponse.json({
      ok: true,
      user: sanitizeUser(data.user),
      profile,
      session: data.session
        ? {
            access_token: data.session.access_token,
            refresh_token: data.session.refresh_token,
            expires_at: data.session.expires_at,
          }
        : null,
      emailConfirmationRequired: !data.session,
    });
  } catch {
    return NextResponse.json(
      {
        error: {
          message: "Authentication service is temporarily unavailable.",
        },
      },
      { status: 502 }
    );
  }
}

async function handlePasswordResetRequest(request: NextRequest) {
  try {
    const body = (await request.json().catch(() => null)) as { email?: string } | null;
    const email = String(body?.email || "").trim().toLowerCase();
    if (!email) {
      return getErrorResponse(new Error("Enter a valid email address."), "Request failed.", 400);
    }

    const supabase = createAnonClient();
    const redirectTo = `${getFrontendUrl().replace(/\/+$/, "")}/reset-password`;
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo,
    });

    if (error) {
      return getErrorResponse(new Error(error.message), "Request failed.", 400);
    }

    return NextResponse.json({
      ok: true,
      message: "Password reset link has been sent to your email.",
    });
  } catch {
    return NextResponse.json(
      {
        error: {
          message: "Authentication service is temporarily unavailable.",
        },
      },
      { status: 502 }
    );
  }
}

async function handlePasswordResetConfirm(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization") || "";
    const token = authHeader.startsWith("Bearer ")
      ? authHeader.slice("Bearer ".length).trim()
      : "";
    const body = (await request.json().catch(() => null)) as { password?: string } | null;
    const password = String(body?.password || "");

    if (!token) {
      return getErrorResponse(new Error("Reset token is required."), "Reset failed.", 401);
    }
    if (password.length < 6) {
      return getErrorResponse(
        new Error("Password must be at least 6 characters."),
        "Reset failed.",
        400
      );
    }

    const adminClient = createAdminClient();
    if (!adminClient) {
      return getErrorResponse(
        new Error("Server is missing SUPABASE_SERVICE_ROLE_KEY for password reset."),
        "Reset failed.",
        500
      );
    }

    const supabase = createAnonClient();
    const { data, error } = await supabase.auth.getUser(token);
    if (error || !data.user) {
      return getErrorResponse(
        new Error(error?.message || "Reset token is invalid or expired."),
        "Reset failed.",
        401
      );
    }

    const { error: updateError } = await adminClient.auth.admin.updateUserById(data.user.id, {
      password,
    });
    if (updateError) {
      return getErrorResponse(new Error(updateError.message), "Reset failed.", 400);
    }

    return NextResponse.json({
      ok: true,
      message: "Password has been updated. Please login again.",
    });
  } catch {
    return NextResponse.json(
      {
        error: {
          message: "Authentication service is temporarily unavailable.",
        },
      },
      { status: 502 }
    );
  }
}

async function proxy(request: NextRequest, path: string[]) {
  const raw = process.env.BACKEND_URL || process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:4000";
  const backendBaseUrl = raw.replace(/\/+$/, "");
  const pathname = path.join("/");
  const upstreamUrl = `${backendBaseUrl}/api/auth/${pathname}${request.nextUrl.search}`;
  const method = request.method.toUpperCase();
  const body =
    method === "GET" || method === "HEAD" ? undefined : await request.arrayBuffer();

  try {
    const upstream = await fetch(upstreamUrl, {
      method,
      headers: request.headers,
      body: body && body.byteLength > 0 ? body : undefined,
      cache: "no-store",
    });

    const responseBody = await upstream.arrayBuffer();
    return new NextResponse(responseBody, {
      status: upstream.status,
      headers: upstream.headers,
    });
  } catch {
    return NextResponse.json(
      {
        error: {
          message: "Authentication service is temporarily unavailable.",
        },
      },
      { status: 502 }
    );
  }
}

async function routeGet(request: NextRequest, path: string[]) {
  if (path.length === 1 && path[0] === "me") {
    return handleMe(request);
  }
  return proxy(request, path);
}

async function routePost(request: NextRequest, path: string[]) {
  if (path.length === 1 && path[0] === "login") {
    return handleLogin(request);
  }
  if (path.length === 1 && path[0] === "signup") {
    return handleSignup(request);
  }
  if (path.length === 3 && path[0] === "password" && path[1] === "reset" && path[2] === "request") {
    return handlePasswordResetRequest(request);
  }
  if (path.length === 3 && path[0] === "password" && path[1] === "reset" && path[2] === "confirm") {
    return handlePasswordResetConfirm(request);
  }
  if (path.length === 1 && path[0] === "logout") {
    return handleLogout();
  }
  return proxy(request, path);
}

export async function GET(request: NextRequest, context: RouteContext) {
  const { path } = await context.params;
  return routeGet(request, path);
}

export async function POST(request: NextRequest, context: RouteContext) {
  const { path } = await context.params;
  return routePost(request, path);
}

export async function PATCH(request: NextRequest, context: RouteContext) {
  const { path } = await context.params;
  return proxy(request, path);
}

export async function PUT(request: NextRequest, context: RouteContext) {
  const { path } = await context.params;
  return proxy(request, path);
}

export async function DELETE(request: NextRequest, context: RouteContext) {
  const { path } = await context.params;
  return proxy(request, path);
}

export async function OPTIONS(request: NextRequest, context: RouteContext) {
  const { path } = await context.params;
  return proxy(request, path);
}
