const crypto = require("crypto");
const { supabaseAdminClient } = require("../config/supabase");
const { env } = require("../config/env");

const OTP_EXPIRY_MINUTES = Number(process.env.OTP_EXPIRY_MINUTES || 5);
const OTP_RESEND_COOLDOWN_SECONDS = Number(process.env.OTP_RESEND_COOLDOWN_SECONDS || 45);
const OTP_MAX_ATTEMPTS = Number(process.env.OTP_MAX_ATTEMPTS || 5);

function ensureAdminClient() {
  if (!supabaseAdminClient) {
    const error = new Error("Server is missing SUPABASE_SERVICE_ROLE_KEY for custom OTP flow.");
    error.status = 500;
    throw error;
  }
}

function getOtpSecret() {
  return env.otpSecret || env.appJwtSecret;
}

function hashOtp(phone, otp) {
  const secret = getOtpSecret();
  return crypto
    .createHash("sha256")
    .update(`${phone}:${otp}:${secret}`)
    .digest("hex");
}

function generateOtp() {
  return String(crypto.randomInt(100000, 1000000));
}

async function getLatestOtpRow(phone) {
  ensureAdminClient();
  const { data, error } = await supabaseAdminClient
    .from("phone_otps")
    .select("*")
    .eq("phone", phone)
    .is("used_at", null)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    throw error;
  }

  return data || null;
}

async function storeOtp(phone, otp) {
  ensureAdminClient();
  const otpHash = hashOtp(phone, otp);
  const expiresAt = new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000).toISOString();

  const { error } = await supabaseAdminClient.from("phone_otps").insert({
    phone,
    otp_hash: otpHash,
    expires_at: expiresAt,
    attempts: 0,
    max_attempts: OTP_MAX_ATTEMPTS,
  });

  if (error) {
    throw error;
  }
}

async function incrementAttempts(rowId, nextAttempts) {
  ensureAdminClient();
  const update = { attempts: nextAttempts };
  if (nextAttempts >= OTP_MAX_ATTEMPTS) {
    update.used_at = new Date().toISOString();
  }

  const { error } = await supabaseAdminClient.from("phone_otps").update(update).eq("id", rowId);
  if (error) {
    throw error;
  }
}

async function markOtpUsed(rowId) {
  ensureAdminClient();
  const { error } = await supabaseAdminClient
    .from("phone_otps")
    .update({ used_at: new Date().toISOString() })
    .eq("id", rowId);

  if (error) {
    throw error;
  }
}

function buildTwilioAuthHeader() {
  const sid = process.env.TWILIO_ACCOUNT_SID || "";
  const token = process.env.TWILIO_AUTH_TOKEN || "";
  if (!sid || !token) {
    return null;
  }
  return `Basic ${Buffer.from(`${sid}:${token}`).toString("base64")}`;
}

function isTwilioConfigured() {
  return Boolean(process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN && process.env.TWILIO_FROM_NUMBER);
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

function shouldExposeOtpInResponse() {
  return process.env.NODE_ENV !== "production";
}

async function createAndSendOtp(phone) {
  const latest = await getLatestOtpRow(phone);
  if (latest) {
    const createdAt = new Date(latest.created_at).getTime();
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

  if (latest.attempts >= OTP_MAX_ATTEMPTS) {
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

async function findOrCreateUserByPhone(phone) {
  ensureAdminClient();
  const usersResult = await supabaseAdminClient.auth.admin.listUsers({ page: 1, perPage: 1000 });
  if (usersResult.error) {
    throw usersResult.error;
  }

  const existing = (usersResult.data?.users || []).find(
    (user) => String(user.phone || "") === phone
  );

  if (existing) {
    return existing;
  }

  const created = await supabaseAdminClient.auth.admin.createUser({
    phone,
    phone_confirm: true,
    user_metadata: {
      phone,
    },
  });

  if (created.error || !created.data.user) {
    throw created.error || new Error("Could not create user for phone OTP.");
  }

  return created.data.user;
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
