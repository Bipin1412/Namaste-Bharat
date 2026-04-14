const crypto = require("crypto");
const { env } = require("../config/env");
const { executeResult, queryRows, toMysqlDateTime } = require("../lib/mysql");
const { findOrCreateUserByPhone } = require("./mysql-auth");

const OTP_EXPIRY_MINUTES = Number(process.env.OTP_EXPIRY_MINUTES || 5);
const OTP_RESEND_COOLDOWN_SECONDS = Number(process.env.OTP_RESEND_COOLDOWN_SECONDS || 45);
const OTP_MAX_ATTEMPTS = Number(process.env.OTP_MAX_ATTEMPTS || 5);

function getOtpSecret() {
  return env.otpSecret || env.appJwtSecret;
}

function hashOtp(phone, otp) {
  const secret = getOtpSecret();
  return crypto.createHash("sha256").update(`${phone}:${otp}:${secret}`).digest("hex");
}

function generateOtp() {
  return String(crypto.randomInt(100000, 1000000));
}

function isTwilioConfigured() {
  return Boolean(process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN && process.env.TWILIO_FROM_NUMBER);
}

function shouldExposeOtpInResponse() {
  return process.env.NODE_ENV !== "production";
}

function buildTwilioAuthHeader() {
  const sid = process.env.TWILIO_ACCOUNT_SID || "";
  const token = process.env.TWILIO_AUTH_TOKEN || "";
  if (!sid || !token) {
    return null;
  }
  return `Basic ${Buffer.from(`${sid}:${token}`).toString("base64")}`;
}

async function sendOtpSms(phone, otp) {
  const authHeader = buildTwilioAuthHeader();
  const from = process.env.TWILIO_FROM_NUMBER || "";
  const sid = process.env.TWILIO_ACCOUNT_SID || "";

  if (!authHeader || !from || !sid) {
    return { ok: false, skipped: true, reason: "TWILIO_NOT_CONFIGURED" };
  }

  const body = new URLSearchParams({
    To: phone,
    From: from,
    Body: `Your Namaste Bharat OTP is ${otp}. It is valid for ${OTP_EXPIRY_MINUTES} minutes.`,
  });

  const response = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${sid}/Messages.json`, {
    method: "POST",
    headers: {
      Authorization: authHeader,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body,
  });

  const payload = await response.json().catch(() => null);
  if (!response.ok) {
    return {
      ok: false,
      skipped: false,
      reason: payload?.message || "Failed to send SMS.",
    };
  }

  return {
    ok: true,
    sid: payload?.sid || null,
  };
}

async function getLatestOtpRow(phone) {
  const rows = await queryRows(
    `SELECT *
     FROM phone_otps
     WHERE phone = ? AND used_at IS NULL
     ORDER BY created_at DESC
     LIMIT 1`,
    [phone]
  );

  return rows[0] || null;
}

async function storeOtp(phone, otp) {
  const otpHash = hashOtp(phone, otp);
  const expiresAt = toMysqlDateTime(new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000).toISOString());
  await executeResult(
    `INSERT INTO phone_otps (id, phone, otp_hash, expires_at, attempts, max_attempts)
     VALUES (?, ?, ?, ?, 0, ?)`,
    [crypto.randomUUID(), phone, otpHash, expiresAt, OTP_MAX_ATTEMPTS]
  );
}

async function incrementAttempts(rowId, nextAttempts) {
  const update = { attempts: nextAttempts };
  if (nextAttempts >= OTP_MAX_ATTEMPTS) {
    update.used_at = toMysqlDateTime(new Date().toISOString());
  }

  const sets = Object.keys(update).map((key) => `${key} = ?`);
  await executeResult(
    `UPDATE phone_otps SET ${sets.join(", ")} WHERE id = ?`,
    [...Object.values(update), rowId]
  );
}

async function markOtpUsed(rowId) {
  await executeResult(`UPDATE phone_otps SET used_at = ? WHERE id = ?`, [
    toMysqlDateTime(new Date().toISOString()),
    rowId,
  ]);
}

async function createAndSendOtp(phone) {
  const latest = await getLatestOtpRow(phone);
  if (latest) {
    const createdAt = new Date(String(latest.created_at || "").replace(" ", "T")).getTime();
    const now = Date.now();
    const diffSeconds = Math.floor((now - createdAt) / 1000);

    if (diffSeconds < OTP_RESEND_COOLDOWN_SECONDS) {
      const error = new Error(
        `Please wait ${OTP_RESEND_COOLDOWN_SECONDS - diffSeconds}s before requesting another OTP.`
      );
      error.status = 429;
      throw error;
    }
  }

  const otp = generateOtp();
  await storeOtp(phone, otp);

  const smsResult = await sendOtpSms(phone, otp);
  return {
    otp,
    smsResult,
  };
}

async function verifyOtp(phone, otp) {
  const latest = await getLatestOtpRow(phone);
  if (!latest) {
    return { ok: false, message: "No active OTP found. Please request a new OTP." };
  }

  if (new Date(latest.expires_at).getTime() < Date.now()) {
    await markOtpUsed(latest.id);
    return { ok: false, message: "OTP has expired. Please request a new OTP." };
  }

  if (Number(latest.attempts || 0) >= OTP_MAX_ATTEMPTS) {
    return { ok: false, message: "Too many attempts. Please request a new OTP." };
  }

  const submittedHash = hashOtp(phone, otp);
  if (submittedHash !== latest.otp_hash) {
    await incrementAttempts(latest.id, Number(latest.attempts || 0) + 1);
    return { ok: false, message: "Invalid OTP. Please try again." };
  }

  await markOtpUsed(latest.id);
  return { ok: true };
}

module.exports = {
  OTP_EXPIRY_MINUTES,
  OTP_MAX_ATTEMPTS,
  isTwilioConfigured,
  shouldExposeOtpInResponse,
  createAndSendOtp,
  verifyOtp,
  findOrCreateUserByPhone,
};
