const { buildSessionPayload, createEmailUser, findUserByEmail, loginWithEmailPassword, sanitizeUser } = require("../services/mysql-auth");
const { getProfile, upsertProfile } = require("../services/profile.service");
const {
  createAndSendOtp,
  isTwilioConfigured,
  OTP_EXPIRY_MINUTES,
  shouldExposeOtpInResponse,
  verifyOtp,
  findOrCreateUserByPhone,
} = require("../services/otp.service");
const { normalizeEmail, normalizePhone, validateEmail, validateOtp, validatePhone } = require("../utils/validators");

function getReadableAuthError(error, fallbackMessage) {
  const message = error instanceof Error ? error.message : fallbackMessage;
  return message || fallbackMessage;
}

async function signup(req, res) {
  try {
    const fullName = String(req.body?.fullName || "").trim();
    const phone = String(req.body?.phone || "").trim();
    const email = normalizeEmail(req.body?.email);
    const password = String(req.body?.password || "");

    if (!fullName || !phone || !email || !password) {
      return res.status(400).json({ error: { message: "fullName, phone, email and password are required." } });
    }
    if (!validateEmail(email)) {
      return res.status(400).json({ error: { message: "Enter a valid email address." } });
    }
    if (password.length < 6) {
      return res.status(400).json({ error: { message: "Password must be at least 6 characters." } });
    }

    const existing = await findUserByEmail(email);
    if (existing) {
      return res.status(409).json({ error: { message: "An account with this email already exists." } });
    }

    const user = await createEmailUser({
      fullName,
      phone,
      email,
      password,
      role: "user",
    });

    if (!user) {
      return res.status(500).json({ error: { message: "Signup succeeded but no user was returned." } });
    }

    const sessionPayload = await buildSessionPayload(user);
    return res.json({
      ok: true,
      user: sessionPayload.user,
      profile: sessionPayload.profile,
      session: sessionPayload.session,
      emailConfirmationRequired: false,
    });
  } catch (error) {
    return res.status(500).json({
      error: { message: getReadableAuthError(error, "Could not sign up.") },
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

    const user = await loginWithEmailPassword(email, password);
    if (!user) {
      return res.status(401).json({ error: { message: "Login failed. Please check your credentials." } });
    }

    const sessionPayload = await buildSessionPayload(user);
    return res.json({
      ok: true,
      user: sessionPayload.user,
      profile: sessionPayload.profile,
      session: sessionPayload.session,
    });
  } catch (error) {
    return res.status(500).json({
      error: { message: getReadableAuthError(error, "Could not login.") },
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
      error: { message: getReadableAuthError(error, "Could not load session.") },
    });
  }
}

async function logout(_req, res) {
  try {
    return res.json({ ok: true });
  } catch (error) {
    return res.status(500).json({
      error: { message: getReadableAuthError(error, "Could not logout.") },
    });
  }
}

async function requestPasswordReset(req, res) {
  try {
    const email = normalizeEmail(req.body?.email);
    if (!email || !validateEmail(email)) {
      return res.status(400).json({ error: { message: "Enter a valid email address." } });
    }

    return res.status(501).json({
      error: {
        message:
          "Password reset email is not configured for the MySQL deployment yet. Please contact the admin to reset your password.",
      },
    });
  } catch (error) {
    return res.status(500).json({
      error: { message: getReadableAuthError(error, "Could not request password reset.") },
    });
  }
}

async function confirmPasswordReset(req, res) {
  try {
    const password = String(req.body?.password || "");
    if (password.length < 6) {
      return res.status(400).json({ error: { message: "Password must be at least 6 characters." } });
    }

    return res.status(501).json({
      error: {
        message:
          "Password reset confirmation is not configured for the MySQL deployment yet. Please contact the admin to reset your password.",
      },
    });
  } catch (error) {
    return res.status(500).json({
      error: { message: getReadableAuthError(error, "Could not reset password.") },
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

    return res.status(500).json({
      error: { message: getReadableAuthError(error, "Could not send OTP.") },
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
    if (!user) {
      return res.status(500).json({ error: { message: "Could not load or create user for OTP login." } });
    }

    await upsertProfile(user.id, user.full_name || null, phone);
    const sessionPayload = await buildSessionPayload(user);

    return res.json({
      ok: true,
      user: sessionPayload.user,
      profile: sessionPayload.profile,
      session: sessionPayload.session,
    });
  } catch (error) {
    return res.status(500).json({
      error: { message: getReadableAuthError(error, "Could not verify OTP.") },
    });
  }
}

module.exports = {
  signup,
  login,
  me,
  logout,
  requestPasswordReset,
  confirmPasswordReset,
  sendPhoneOtp,
  verifyPhoneOtp,
};
