import { createEmailUser, findProfileByUserId, findUserByEmail, sanitizeUser, toProfile } from "@/lib/server/mysql-auth";

type CreateAdminUserInput = {
  fullName: string;
  email: string;
  password: string;
  phone?: string | null;
};

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
