const crypto = require("crypto");
const { env } = require("../config/env");

function base64UrlEncode(input) {
  return Buffer.from(input)
    .toString("base64")
    .replace(/=/g, "")
    .replace(/\+/g, "-")
    .replace(/\//g, "_");
}

function base64UrlDecode(input) {
  const normalized = input.replace(/-/g, "+").replace(/_/g, "/");
  const padded = normalized + "=".repeat((4 - (normalized.length % 4)) % 4);
  return Buffer.from(padded, "base64").toString("utf8");
}

function signHmac(data, secret) {
  return crypto.createHmac("sha256", secret).update(data).digest("base64")
    .replace(/=/g, "")
    .replace(/\+/g, "-")
    .replace(/\//g, "_");
}

function signAppToken(payload, expiresInSeconds = 60 * 60 * 24 * 7) {
  const secret = env.appJwtSecret;
  const now = Math.floor(Date.now() / 1000);

  const header = { alg: "HS256", typ: "JWT" };
  const body = {
    iss: "namastebharat-backend",
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

function verifyAppToken(token) {
  const secret = env.appJwtSecret;
  const parts = String(token || "").split(".");
  if (parts.length !== 3) {
    return { ok: false, error: "Invalid token format." };
  }

  const [encodedHeader, encodedBody, signature] = parts;
  const signingInput = `${encodedHeader}.${encodedBody}`;
  const expectedSignature = signHmac(signingInput, secret);

  const signatureBuffer = Buffer.from(signature);
  const expectedBuffer = Buffer.from(expectedSignature);
  if (signatureBuffer.length !== expectedBuffer.length) {
    return { ok: false, error: "Invalid token signature." };
  }

  if (!crypto.timingSafeEqual(signatureBuffer, expectedBuffer)) {
    return { ok: false, error: "Invalid token signature." };
  }

  let payload;
  try {
    payload = JSON.parse(base64UrlDecode(encodedBody));
  } catch {
    return { ok: false, error: "Invalid token payload." };
  }

  const now = Math.floor(Date.now() / 1000);
  if (!payload.exp || now >= payload.exp) {
    return { ok: false, error: "Token expired." };
  }

  return { ok: true, payload };
}

module.exports = {
  signAppToken,
  verifyAppToken,
};
