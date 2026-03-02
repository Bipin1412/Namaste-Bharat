const express = require("express");
const cors = require("cors");
const { env } = require("./config/env");
const authRoutes = require("./routes/auth.routes");
const listingRoutes = require("./routes/listing.routes");

const app = express();

function normalizeOrigin(value) {
  return String(value || "").trim().replace(/\/+$/, "");
}

app.use(
  cors({
    origin(origin, callback) {
      // Allow non-browser/server-to-server calls without Origin header.
      if (!origin) {
        return callback(null, true);
      }
      const normalizedOrigin = normalizeOrigin(origin);
      const isAllowed = env.frontendUrls.some((allowed) => normalizeOrigin(allowed) === normalizedOrigin);
      if (isAllowed) {
        return callback(null, true);
      }
      return callback(new Error(`CORS blocked for origin: ${origin}`));
    },
    methods: ["GET", "POST", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);
app.use(express.json());

app.get("/api/health", (_req, res) => {
  return res.json({ ok: true, service: "namastebharat-express-backend" });
});

app.use("/api/auth", authRoutes);
app.use("/api", listingRoutes);

module.exports = app;
