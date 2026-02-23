const path = require("path");
const dotenv = require("dotenv");

dotenv.config({
  path: path.resolve(__dirname, "../../.env.local"),
});

const env = {
  port: Number(process.env.BACKEND_PORT || process.env.PORT || 4000),
  frontendUrl: process.env.FRONTEND_URL || "http://localhost:3000",
  supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL || "",
  supabaseAnonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "",
  supabaseServiceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY || "",
  appJwtSecret: process.env.APP_JWT_SECRET || "dev-app-jwt-secret-change-me",
  otpSecret: process.env.OTP_SECRET || "",
};

function validateEnv() {
  const missing = [];
  if (!env.supabaseUrl) {
    missing.push("NEXT_PUBLIC_SUPABASE_URL");
  }
  if (!env.supabaseAnonKey) {
    missing.push("NEXT_PUBLIC_SUPABASE_ANON_KEY");
  }
  if (missing.length > 0) {
    throw new Error(`Missing required env vars: ${missing.join(", ")}`);
  }
}

module.exports = {
  env,
  validateEnv,
};
