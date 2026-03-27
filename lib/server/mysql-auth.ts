import crypto from "node:crypto";
import { executeResult, queryRows } from "@/lib/server/mysql";

type UserRow = {
  id: string;
  full_name: string | null;
  phone: string | null;
  email: string;
  password_hash: string;
  created_at: string | null;
  updated_at: string | null;
};

type ProfileRow = {
  id: string;
  full_name: string | null;
  phone: string | null;
  role: string | null;
};

type AppTokenPayload = {
  sub: string;
  email?: string | null;
  phone?: string | null;
  role?: string | null;
  exp?: number;
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

function normalizeEmail(value: unknown) {
  return String(value || "").trim().toLowerCase();
}

function base64UrlEncode(input: string) {
  return Buffer.from(input)
    .toString("base64")
    .replace(/=/g, "")
    .replace(/\+/g, "-")
    .replace(/\//g, "_");
}

function base64UrlDecode(input: string) {
  const normalized = input.replace(/-/g, "+").replace(/_/g, "/");
  const padded = normalized + "=".repeat((4 - (normalized.length % 4)) % 4);
  return Buffer.from(padded, "base64").toString("utf8");
}

function signHmac(data: string, secret: string) {
  return crypto
    .createHmac("sha256", secret)
    .update(data)
    .digest("base64")
    .replace(/=/g, "")
    .replace(/\+/g, "-")
    .replace(/\//g, "_");
}

export function signAppToken(payload: AppTokenPayload, expiresInSeconds = 60 * 60 * 24 * 7) {
  const secret = requireEnv("APP_JWT_SECRET");
  const now = Math.floor(Date.now() / 1000);
  const header = { alg: "HS256", typ: "JWT" };
  const body = {
    iss: "namastebharat-next",
    aud: "namastebharat-client",
    iat: now,
    exp: now + expiresInSeconds,
    ...payload,
  };

  const encodedHeader = base64UrlEncode(JSON.stringify(header));
  const encodedBody = base64UrlEncode(JSON.stringify(body));
  const signingInput = `${encodedHeader}.${encodedBody}`;
  const signature = signHmac(signingInput, secret);
  return `${signingInput}.${signature}`;
}

export function verifyAppToken(token: string) {
  const secret = requireEnv("APP_JWT_SECRET");
  const parts = String(token || "").split(".");
  if (parts.length !== 3) {
    return { ok: false as const };
  }

  const [encodedHeader, encodedBody, signature] = parts;
  const expectedSignature = signHmac(`${encodedHeader}.${encodedBody}`, secret);
  const signatureBuffer = Buffer.from(signature);
  const expectedBuffer = Buffer.from(expectedSignature);

  if (signatureBuffer.length !== expectedBuffer.length) {
    return { ok: false as const };
  }
  if (!crypto.timingSafeEqual(signatureBuffer, expectedBuffer)) {
    return { ok: false as const };
  }

  try {
    const payload = JSON.parse(base64UrlDecode(encodedBody)) as AppTokenPayload;
    const now = Math.floor(Date.now() / 1000);
    if (!payload.exp || now >= payload.exp || !payload.sub) {
      return { ok: false as const };
    }
    return { ok: true as const, payload };
  } catch {
    return { ok: false as const };
  }
}

function hashPassword(password: string) {
  const salt = crypto.randomBytes(16).toString("hex");
  const derivedKey = crypto.scryptSync(password, salt, 64);
  return `scrypt$64$${salt}$${derivedKey.toString("hex")}`;
}

function verifyPassword(password: string, encodedHash: string) {
  const [algorithm, keyLengthRaw, salt, expectedHash] = String(encodedHash || "").split("$");
  if (algorithm !== "scrypt" || !keyLengthRaw || !salt || !expectedHash) {
    return false;
  }

  const keyLength = Number(keyLengthRaw || "64");
  if (!Number.isFinite(keyLength) || keyLength <= 0) {
    return false;
  }

  const derivedKey = crypto.scryptSync(password, salt, keyLength).toString("hex");
  const derivedBuffer = Buffer.from(derivedKey, "hex");
  const expectedBuffer = Buffer.from(expectedHash, "hex");
  if (derivedBuffer.length !== expectedBuffer.length) {
    return false;
  }

  return crypto.timingSafeEqual(derivedBuffer, expectedBuffer);
}

export function sanitizeUser(row: UserRow) {
  return {
    id: row.id,
    email: row.email ?? null,
    phone: row.phone ?? null,
    created_at: row.created_at ?? null,
    user_metadata: {
      full_name: row.full_name ?? null,
    },
  };
}

export function toProfile(row: ProfileRow | null, user?: UserRow | null) {
  return {
    id: row?.id || user?.id || "",
    full_name: row?.full_name ?? user?.full_name ?? null,
    phone: row?.phone ?? user?.phone ?? null,
    role: row?.role ?? "user",
  };
}

export async function findUserByEmail(email: string) {
  const normalized = normalizeEmail(email);
  const rows = await queryRows<UserRow>(
    `SELECT id, full_name, phone, email, password_hash, created_at, updated_at
     FROM users
     WHERE email = ?
     LIMIT 1`,
    [normalized]
  );

  return rows[0] ?? null;
}

export async function findUserById(id: string) {
  const rows = await queryRows<UserRow>(
    `SELECT id, full_name, phone, email, password_hash, created_at, updated_at
     FROM users
     WHERE id = ?
     LIMIT 1`,
    [id]
  );

  return rows[0] ?? null;
}

export async function findProfileByUserId(id: string) {
  const rows = await queryRows<ProfileRow>(
    `SELECT id, full_name, phone, role
     FROM profiles
     WHERE id = ?
     LIMIT 1`,
    [id]
  );

  return rows[0] ?? null;
}

export async function upsertProfile(userId: string, fullName: string | null, phone: string | null) {
  await executeResult(
    `INSERT INTO profiles (id, full_name, phone, role)
     VALUES (?, ?, ?, 'user')
     ON DUPLICATE KEY UPDATE
       full_name = VALUES(full_name),
       phone = VALUES(phone)`,
    [userId, fullName, phone]
  );
}

export async function createEmailUser(input: {
  fullName: string;
  phone: string;
  email: string;
  password: string;
}) {
  const id = crypto.randomUUID();
  const email = normalizeEmail(input.email);
  const passwordHash = hashPassword(input.password);

  await executeResult(
    `INSERT INTO users (id, full_name, phone, email, password_hash)
     VALUES (?, ?, ?, ?, ?)`,
    [id, input.fullName, input.phone, email, passwordHash]
  );

  await executeResult(
    `INSERT INTO profiles (id, full_name, phone, role)
     VALUES (?, ?, ?, 'user')`,
    [id, input.fullName, input.phone]
  );

  return findUserById(id);
}

export async function loginWithEmailPassword(email: string, password: string) {
  const user = await findUserByEmail(email);
  if (!user || !verifyPassword(password, user.password_hash)) {
    return null;
  }

  await executeResult(`UPDATE users SET last_login_at = CURRENT_TIMESTAMP WHERE id = ?`, [user.id]);
  return findUserById(user.id);
}

export async function resolveUserFromToken(token: string) {
  const verified = verifyAppToken(token);
  if (!verified.ok) {
    return null;
  }

  return findUserById(verified.payload.sub);
}

export async function buildSessionPayload(user: UserRow) {
  const profile = await findProfileByUserId(user.id);
  const effectiveProfile = toProfile(profile, user);
  const accessToken = signAppToken({
    sub: user.id,
    email: user.email,
    phone: effectiveProfile.phone,
    role: effectiveProfile.role,
  });

  return {
    user: sanitizeUser(user),
    profile: effectiveProfile,
    session: {
      access_token: accessToken,
      refresh_token: null,
      expires_at: Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 7,
    },
    tokenType: "app",
  };
}
