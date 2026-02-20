function normalizeEmail(input) {
  return String(input || "").trim().toLowerCase();
}

function validateEmail(input) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(input || ""));
}

function normalizePhone(input) {
  const raw = String(input || "").trim();
  if (!raw) {
    return "";
  }
  if (raw.startsWith("+")) {
    return `+${raw.slice(1).replace(/\D/g, "")}`;
  }
  const digits = raw.replace(/\D/g, "");
  return digits ? `+${digits}` : "";
}

function validatePhone(input) {
  return /^\+[1-9]\d{9,14}$/.test(String(input || ""));
}

function validateOtp(input) {
  return /^\d{4,8}$/.test(String(input || "").trim());
}

function sanitizeUser(user) {
  if (!user) {
    return null;
  }
  return {
    id: user.id,
    email: user.email || null,
    phone: user.phone || null,
    created_at: user.created_at || null,
    user_metadata: user.user_metadata || {},
  };
}

module.exports = {
  normalizeEmail,
  validateEmail,
  normalizePhone,
  validatePhone,
  validateOtp,
  sanitizeUser,
};
