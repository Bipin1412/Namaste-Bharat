const express = require("express");
const cors = require("cors");
const { env } = require("./config/env");
const authRoutes = require("./routes/auth.routes");
const listingRoutes = require("./routes/listing.routes");

const app = express();

app.use(
  cors({
    origin: env.frontendUrl,
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
