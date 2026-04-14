const path = require("path");
const dotenv = require("dotenv");

dotenv.config({
  path: path.resolve(__dirname, "../../.env.local"),
});

const env = {
  port: Number(process.env.BACKEND_PORT || process.env.PORT || 4000),
  frontendUrl: process.env.FRONTEND_URL || "http://localhost:3000",
  frontendUrls: (process.env.FRONTEND_URLS || process.env.FRONTEND_URL || "http://localhost:3000")
    .split(",")
    .map((value) => value.trim().replace(/\/+$/, ""))
    .filter(Boolean),
  mysqlHost: process.env.MYSQL_HOST || "",
  mysqlPort: Number(process.env.MYSQL_PORT || 3306),
  mysqlDatabase: process.env.MYSQL_DATABASE || "",
  mysqlUser: process.env.MYSQL_USER || "",
  mysqlPassword: process.env.MYSQL_PASSWORD || "",
  mysqlConnectionLimit: Number(process.env.MYSQL_CONNECTION_LIMIT || 10),
  appJwtSecret: process.env.APP_JWT_SECRET || "dev-app-jwt-secret-change-me",
  otpSecret: process.env.OTP_SECRET || "",
};

function validateEnv() {
  const missing = [];
  if (!env.mysqlHost) {
    missing.push("MYSQL_HOST");
  }
  if (!env.mysqlUser) {
    missing.push("MYSQL_USER");
  }
  if (!env.mysqlPassword) {
    missing.push("MYSQL_PASSWORD");
  }
  if (!env.mysqlDatabase) {
    missing.push("MYSQL_DATABASE");
  }
  if (!env.appJwtSecret) {
    missing.push("APP_JWT_SECRET");
  }
  if (missing.length > 0) {
    throw new Error(`Missing required env vars: ${missing.join(", ")}`);
  }
}

module.exports = {
  env,
  validateEnv,
};
