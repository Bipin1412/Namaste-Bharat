import { createClient } from "@supabase/supabase-js";
import { hasMysqlConfig } from "@/lib/server/mysql";
import { createEmailUser, findProfileByUserId, findUserByEmail, sanitizeUser, toProfile } from "@/lib/server/mysql-auth";

type CreateAdminUserInput = {
  fullName: string;
  email: string;
  password: string;
  phone?: string | null;
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

function createSupabaseAdminClient() {
  return createClient(
    requireEnv("NEXT_PUBLIC_SUPABASE_URL"),
    requireEnv("SUPABASE_SERVICE_ROLE_KEY"),
    { auth: { persistSession: false } }
  );
}

function normalizeEmail(value: string) {
  return String(value || "").trim().toLowerCase();
}

function normalizeOptionalPhone(value: string | null | undefined) {
  const trimmed = String(value || "").trim();
  return trimmed || null;
}

export async function createAdminUser(input: CreateAdminUserInput) {
  const fullName = String(input.fullName || "").trim();
  const email = normalizeEmail(input.email);
  const password = String(input.password || "");
  const phone = normalizeOptionalPhone(input.phone);

  if (!fullName || !email || !password) {
    const error = new Error("Full name, email, and password are required.");
    (error as Error & { status?: number }).status = 400;
    throw error;
  }

  if (password.length < 6) {
    const error = new Error("Password must be at least 6 characters.");
    (error as Error & { status?: number }).status = 400;
    throw error;
  }

  if (hasMysqlConfig()) {
    const existingUser = await findUserByEmail(email);
    if (existingUser) {
      const error = new Error("An account with this email already exists.");
      (error as Error & { status?: number }).status = 409;
      throw error;
    }

    const user = await createEmailUser({
      fullName,
      email,
      password,
      phone,
      role: "admin",
    });

    if (!user) {
      throw new Error("Admin user was created but could not be loaded.");
    }

    const profile = await findProfileByUserId(user.id);
    return {
      user: sanitizeUser(user),
      profile: toProfile(profile, user),
    };
  }

  const adminClient = createSupabaseAdminClient();
  const { data, error } = await adminClient.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: {
      full_name: fullName,
      phone,
      role: "admin",
    },
  });

  if (error) {
    const mapped = new Error(error.message || "Could not create admin user.");
    (mapped as Error & { status?: number }).status =
      /already/i.test(error.message || "") ? 409 : 400;
    throw mapped;
  }

  if (!data.user) {
    throw new Error("Admin user was created but no user was returned.");
  }

  const { error: profileError } = await adminClient.from("profiles").upsert({
    id: data.user.id,
    full_name: fullName,
    phone,
    role: "admin",
  });

  if (profileError) {
    const mapped = new Error(profileError.message || "Could not assign admin role.");
    (mapped as Error & { status?: number }).status = 400;
    throw mapped;
  }

  return {
    user: {
      id: data.user.id,
      email: data.user.email ?? null,
      phone: data.user.phone ?? null,
      created_at: data.user.created_at ?? null,
      user_metadata: data.user.user_metadata ?? {},
    },
    profile: {
      id: data.user.id,
      full_name: fullName,
      phone,
      role: "admin",
    },
  };
}
