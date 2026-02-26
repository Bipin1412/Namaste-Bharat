const { supabaseAdminClient, supabaseAuthClient } = require("../config/supabase");
const { env } = require("../config/env");
const { getProfile, upsertProfile } = require("../services/profile.service");
const {
  createAndSendOtp,
  findOrCreateUserByPhone,
  isTwilioConfigured,
  OTP_EXPIRY_MINUTES,
  shouldExposeOtpInResponse,
  verifyOtp,
} = require("../services/otp.service");
const { signAppToken } = require("../utils/app-token");
const {
  normalizeEmail,
  normalizePhone,
  sanitizeUser,
  validateEmail,
  validateOtp,
  validatePhone,
} = require("../utils/validators");

async function signup(req, res) {
  try {
    const fullName = String(req.body?.fullName || "").trim();
    const phone = String(req.body?.phone || "").trim();
    const email = normalizeEmail(req.body?.email);
    const password = String(req.body?.password || "");

    if (!fullName || !phone || !email || !password) {
      return res
        .status(400)
        .json({ error: { message: "fullName, phone, email and password are required." } });
    }
    if (!validateEmail(email)) {
      return res.status(400).json({ error: { message: "Enter a valid email address." } });
    }
    if (password.length < 6) {
      return res.status(400).json({ error: { message: "Password must be at least 6 characters." } });
    }

    const emailRedirectTo = `${env.frontendUrl.replace(/\/+$/, "")}/login?verified=1`;

    const { data, error } = await supabaseAuthClient.auth.signUp({
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
      return res.status(400).json({ error: { message: error.message } });
    }
    if (!data.user) {
      return res.status(400).json({ error: { message: "Signup succeeded but no user was returned." } });
    }

    const upsertResult = await upsertProfile(data.user.id, fullName, phone);
    if (!upsertResult.ok) {
      return res.status(400).json({ error: { message: upsertResult.error.message } });
    }

    const profileResult = await getProfile(data.user);
    if (!profileResult.ok) {
      return res.status(400).json({ error: { message: profileResult.error.message } });
    }

    return res.json({
      ok: true,
      user: sanitizeUser(data.user),
      profile: profileResult.profile,
      session: data.session
        ? {
            access_token: data.session.access_token,
            refresh_token: data.session.refresh_token,
            expires_at: data.session.expires_at,
          }
        : null,
      emailConfirmationRequired: !data.session,
    });
  } catch (error) {
    return res.status(500).json({
      error: { message: error instanceof Error ? error.message : "Could not sign up." },
    });
  }
}

async function login(req, res) {
  try {
    const email = normalizeEmail(req.body?.email);
    const password = String(req.body?.password || "");

    if (!email || !password) {
      return res.status(400).json({ error: { message: "email and password are required." } });
    }
    if (!validateEmail(email)) {
      return res.status(400).json({ error: { message: "Login email is invalid." } });
    }

    const { data, error } = await supabaseAuthClient.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      return res.status(401).json({ error: { message: error.message } });
    }
    if (!data.user || !data.session) {
      return res.status(401).json({
        error: { message: "Login failed. Please check your credentials." },
      });
    }

    const userMetadata = data.user.user_metadata || {};
    const fullName =
      typeof userMetadata.full_name === "string" ? userMetadata.full_name.trim() : null;
    const phone = typeof userMetadata.phone === "string" ? userMetadata.phone.trim() : null;

    const upsertResult = await upsertProfile(data.user.id, fullName, phone);
    if (!upsertResult.ok) {
      return res.status(400).json({ error: { message: upsertResult.error.message } });
    }

    const profileResult = await getProfile(data.user);
    if (!profileResult.ok) {
      return res.status(400).json({ error: { message: profileResult.error.message } });
    }

    return res.json({
      ok: true,
      user: sanitizeUser(data.user),
      profile: profileResult.profile,
      session: {
        access_token: data.session.access_token,
        refresh_token: data.session.refresh_token,
        expires_at: data.session.expires_at,
      },
    });
  } catch (error) {
    return res.status(500).json({
      error: { message: error instanceof Error ? error.message : "Could not login." },
    });
  }
}

async function me(req, res) {
  try {
    const profileResult = await getProfile(req.authUser);
    if (!profileResult.ok) {
      return res.status(400).json({ error: { message: profileResult.error.message } });
    }

    return res.json({
      ok: true,
      user: sanitizeUser(req.authUser),
      profile: profileResult.profile,
    });
  } catch (error) {
    return res.status(500).json({
      error: { message: error instanceof Error ? error.message : "Could not load session." },
    });
  }
}

async function logout(req, res) {
  try {
    const authHeader = req.headers.authorization || "";
    const token = authHeader.startsWith("Bearer ")
      ? authHeader.slice("Bearer ".length).trim()
      : "";

    if (token && req.authTokenType !== "app" && supabaseAdminClient) {
      await supabaseAdminClient.auth.admin.signOut(token).catch(() => null);
    }

    return res.json({ ok: true });
  } catch (error) {
    return res.status(500).json({
      error: { message: error instanceof Error ? error.message : "Could not logout." },
    });
  }
}

async function requestPasswordReset(req, res) {
  try {
    const email = normalizeEmail(req.body?.email);
    if (!email || !validateEmail(email)) {
      return res.status(400).json({ error: { message: "Enter a valid email address." } });
    }

    const redirectTo = `${env.frontendUrl.replace(/\/+$/, "")}/reset-password`;

    if (!supabaseAdminClient) {
      return res.status(500).json({
        error: { message: "Server is missing SUPABASE_SERVICE_ROLE_KEY for password reset." },
      });
    }

    const usersResult = await supabaseAdminClient.auth.admin.listUsers({ page: 1, perPage: 1000 });
    if (usersResult.error) {
      return res.status(500).json({ error: { message: usersResult.error.message } });
    }

    const matchedUser = (usersResult.data?.users || []).find(
      (user) => String(user.email || "").toLowerCase() === email
    );
    if (!matchedUser) {
      return res.status(400).json({
        error: {
          message:
            "No account found with this email. Please signup using email/password first.",
        },
      });
    }

    const { error } = await supabaseAuthClient.auth.resetPasswordForEmail(email, {
      redirectTo,
    });

    if (error) {
      return res.status(400).json({ error: { message: error.message } });
    }

    return res.json({
      ok: true,
      message: "Password reset link has been sent to your email.",
    });
  } catch (error) {
    return res.status(500).json({
      error: { message: error instanceof Error ? error.message : "Could not request password reset." },
    });
  }
}

async function confirmPasswordReset(req, res) {
  try {
    const authHeader = req.headers.authorization || "";
    const token = authHeader.startsWith("Bearer ")
      ? authHeader.slice("Bearer ".length).trim()
      : "";
    const password = String(req.body?.password || "");

    if (!token) {
      return res.status(401).json({ error: { message: "Reset token is required." } });
    }
    if (password.length < 6) {
      return res.status(400).json({ error: { message: "Password must be at least 6 characters." } });
    }
    if (!supabaseAdminClient) {
      return res.status(500).json({
        error: { message: "Server is missing SUPABASE_SERVICE_ROLE_KEY for password reset." },
      });
    }

    const { data: userData, error: getUserError } = await supabaseAuthClient.auth.getUser(token);
    if (getUserError || !userData.user) {
      return res.status(401).json({
        error: { message: getUserError?.message || "Reset token is invalid or expired." },
      });
    }

    const { error: updateError } = await supabaseAdminClient.auth.admin.updateUserById(
      userData.user.id,
      { password }
    );
    if (updateError) {
      return res.status(400).json({ error: { message: updateError.message } });
    }

    return res.json({ ok: true, message: "Password has been updated. Please login again." });
  } catch (error) {
    return res.status(500).json({
      error: { message: error instanceof Error ? error.message : "Could not reset password." },
    });
  }
}

async function sendPhoneOtp(req, res) {
  try {
    const phone = normalizePhone(req.body?.phone);
    if (!phone || !validatePhone(phone)) {
      return res.status(400).json({
        error: {
          message: "Enter a valid phone in international format, e.g. +919876543210.",
        },
      });
    }

    const otpResult = await createAndSendOtp(phone);
    const response = {
      ok: true,
      message: "OTP sent to your phone number.",
      phone,
      expiresInMinutes: OTP_EXPIRY_MINUTES,
      smsProvider: isTwilioConfigured() ? "twilio" : "local-dev",
    };

    if (shouldExposeOtpInResponse()) {
      response.devOtp = otpResult.otp;
      if (!isTwilioConfigured()) {
        response.message =
          "OTP generated. Twilio is not configured, so OTP is returned in devOtp for local testing.";
      }
    }

    return res.json(response);
  } catch (error) {
    if (error?.status === 429) {
      return res.status(429).json({
        error: { message: error.message || "Too many OTP requests. Please wait and try again." },
      });
    }
    const message =
      typeof error?.message === "string"
        ? error.message
        : "Could not send OTP.";
    return res.status(500).json({
      error: { message },
    });
  }
}

async function verifyPhoneOtp(req, res) {
  try {
    const phone = normalizePhone(req.body?.phone);
    const otp = String(req.body?.otp || "").trim();

    if (!phone || !validatePhone(phone)) {
      return res.status(400).json({
        error: {
          message: "Enter a valid phone in international format, e.g. +919876543210.",
        },
      });
    }
    if (!validateOtp(otp)) {
      return res.status(400).json({ error: { message: "Enter a valid numeric OTP." } });
    }

    const verificationResult = await verifyOtp(phone, otp);
    if (!verificationResult.ok) {
      return res.status(401).json({
        error: { message: verificationResult.message || "OTP verification failed." },
      });
    }

    const user = await findOrCreateUserByPhone(phone);
    const userMetadata = user.user_metadata || {};
    const fullName =
      typeof userMetadata.full_name === "string" ? userMetadata.full_name.trim() : null;
    const profilePhone =
      typeof userMetadata.phone === "string" ? userMetadata.phone.trim() : user.phone || phone;

    const upsertResult = await upsertProfile(user.id, fullName, profilePhone);
    if (!upsertResult.ok) {
      return res.status(400).json({ error: { message: upsertResult.error.message } });
    }

    const profileResult = await getProfile(user);
    if (!profileResult.ok) {
      return res.status(400).json({ error: { message: profileResult.error.message } });
    }

    const appAccessToken = signAppToken({
      sub: user.id,
      phone: user.phone || phone,
      email: user.email || null,
      role: profileResult.profile?.role || "user",
    });

    return res.json({
      ok: true,
      user: sanitizeUser(user),
      profile: profileResult.profile,
      session: {
        access_token: appAccessToken,
        refresh_token: null,
        expires_at: Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 7,
      },
      tokenType: "app",
    });
  } catch (error) {
    const message =
      typeof error?.message === "string"
        ? error.message
        : "Could not verify OTP.";
    return res.status(500).json({
      error: { message },
    });
  }
}

module.exports = {
  signup,
  login,
  requestPasswordReset,
  confirmPasswordReset,
  sendPhoneOtp,
  verifyPhoneOtp,
  me,
  logout,
};
