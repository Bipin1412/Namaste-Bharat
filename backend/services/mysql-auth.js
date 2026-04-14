const crypto = require("crypto");
const { env } = require("../config/env");
const {
  executeResult,
  queryRows,
} = require("../lib/mysql");
const { signAppToken, verifyAppToken } = require("../utils/app-token");

function normalizeEmail(value) {
  return String(value || "").trim().toLowerCase();
}

function normalizePhone(value) {
  return String(value || "").trim();
}

function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString("hex");
  const derivedKey = crypto.scryptSync(password, salt, 64);
  return `scrypt$64$${salt}$${derivedKey.toString("hex")}`;
}

function verifyPassword(password, encodedHash) {
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

function sanitizeUser(row) {
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

function toProfile(row, user) {
  return {
    id: (row && row.id) || (user && user.id) || "",
    full_name: (row && row.full_name) ?? (user && user.full_name) ?? null,
    phone: (row && row.phone) ?? (user && user.phone) ?? null,
    role: (row && row.role) ?? "user",
  };
}

async function findUserByEmail(email) {
  const normalized = normalizeEmail(email);
  const rows = await queryRows(
    `SELECT id, full_name, phone, email, password_hash, created_at, updated_at
     FROM users
     WHERE email = ?
     LIMIT 1`,
    [normalized]
  );

  return rows[0] || null;
}

async function findUserByPhone(phone) {
  const normalized = normalizePhone(phone);
  const rows = await queryRows(
    `SELECT id, full_name, phone, email, password_hash, created_at, updated_at
     FROM users
     WHERE phone = ?
     LIMIT 1`,
    [normalized]
  );

  return rows[0] || null;
}

async function findUserById(id) {
  const rows = await queryRows(
    `SELECT id, full_name, phone, email, password_hash, created_at, updated_at
     FROM users
     WHERE id = ?
     LIMIT 1`,
    [id]
  );

  return rows[0] || null;
}

async function findProfileByUserId(id) {
  const rows = await queryRows(
    `SELECT id, full_name, phone, role
     FROM profiles
     WHERE id = ?
     LIMIT 1`,
    [id]
  );

  return rows[0] || null;
}

async function upsertProfile(userId, fullName, phone) {
  await executeResult(
    `INSERT INTO profiles (id, full_name, phone, role)
     VALUES (?, ?, ?, 'user')
     ON DUPLICATE KEY UPDATE
       full_name = VALUES(full_name),
       phone = VALUES(phone)`,
    [userId, fullName || null, phone || null]
  );
}

async function createEmailUser(input) {
  const id = crypto.randomUUID();
  const email = normalizeEmail(input.email);
  const passwordHash = hashPassword(input.password);
  const role = String(input.role || "user").trim().toLowerCase() || "user";
  const phone = input.phone ? normalizePhone(input.phone) : null;

  await executeResult(
    `INSERT INTO users (id, full_name, phone, email, password_hash, email_verified_at)
     VALUES (?, ?, ?, ?, ?, CURRENT_TIMESTAMP)`,
    [id, input.fullName, phone, email, passwordHash]
  );

  await executeResult(
    `INSERT INTO profiles (id, full_name, phone, role)
     VALUES (?, ?, ?, ?)`,
    [id, input.fullName, phone, role]
  );

  return findUserById(id);
}

async function findOrCreateUserByPhone(phone) {
  const normalizedPhone = normalizePhone(phone);
  const existing = await findUserByPhone(normalizedPhone);
  if (existing) {
    return existing;
  }

  const id = crypto.randomUUID();
  const phoneDigits = normalizedPhone.replace(/\D/g, "");
  const syntheticEmail = `phone.${phoneDigits || id}@namastebharat.local`;
  const passwordHash = hashPassword(crypto.randomBytes(24).toString("hex"));

  await executeResult(
    `INSERT INTO users (id, full_name, phone, email, password_hash, email_verified_at)
     VALUES (?, NULL, ?, ?, ?, CURRENT_TIMESTAMP)`,
    [id, normalizedPhone, syntheticEmail, passwordHash]
  );

  await executeResult(
    `INSERT INTO profiles (id, full_name, phone, role)
     VALUES (?, NULL, ?, 'user')`,
    [id, normalizedPhone]
  );

  return findUserById(id);
}

async function loginWithEmailPassword(email, password) {
  const user = await findUserByEmail(email);
  if (!user || !verifyPassword(password, user.password_hash)) {
    return null;
  }

  await executeResult(`UPDATE users SET last_login_at = CURRENT_TIMESTAMP WHERE id = ?`, [user.id]);
  return findUserById(user.id);
}

async function resolveUserFromToken(token) {
  const verified = verifyAppToken(token);
  if (!verified.ok) {
    return null;
  }

  return findUserById(verified.payload.sub);
}

async function buildSessionPayload(user) {
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

module.exports = {
  normalizeEmail,
  normalizePhone,
  sanitizeUser,
  toProfile,
  findUserByEmail,
  findUserByPhone,
  findUserById,
  findProfileByUserId,
  upsertProfile,
  createEmailUser,
  findOrCreateUserByPhone,
  loginWithEmailPassword,
  resolveUserFromToken,
  buildSessionPayload,
};
