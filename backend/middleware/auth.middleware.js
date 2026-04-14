const { findProfileByUserId, resolveUserFromToken, sanitizeUser, toProfile } = require("../services/mysql-auth");

async function resolveAuthFromBearerToken(token) {
  const user = await resolveUserFromToken(token);
  if (!user) {
    return { ok: false };
  }

  const profile = await findProfileByUserId(user.id);
  const profileData = toProfile(profile, user);
  return {
    ok: true,
    user: {
      ...sanitizeUser(user),
      user_metadata: {
        ...sanitizeUser(user).user_metadata,
        role: profileData.role || "user",
        phone: profileData.phone || user.phone || null,
      },
    },
    tokenType: "app",
  };
}

async function requireAuth(req, res, next) {
  try {
    const authHeader = req.headers.authorization || "";
    const token = authHeader.startsWith("Bearer ")
      ? authHeader.slice("Bearer ".length).trim()
      : "";

    if (!token) {
      return res.status(401).json({ error: { message: "Missing bearer token." } });
    }

    const resolved = await resolveAuthFromBearerToken(token);
    if (!resolved.ok || !resolved.user) {
      return res.status(401).json({
        error: { message: "Invalid or expired session." },
      });
    }

    req.authToken = token;
    req.authTokenType = resolved.tokenType;
    req.authUser = resolved.user;
    return next();
  } catch (error) {
    return res.status(500).json({
      error: { message: error instanceof Error ? error.message : "Unauthorized." },
    });
  }
}

async function optionalAuth(req, _res, next) {
  try {
    const authHeader = req.headers.authorization || "";
    const token = authHeader.startsWith("Bearer ")
      ? authHeader.slice("Bearer ".length).trim()
      : "";

    if (!token) {
      req.authToken = "";
      req.authTokenType = "";
      req.authUser = null;
      return next();
    }

    const resolved = await resolveAuthFromBearerToken(token);
    if (!resolved.ok || !resolved.user) {
      req.authToken = "";
      req.authTokenType = "";
      req.authUser = null;
      return next();
    }

    req.authToken = token;
    req.authTokenType = resolved.tokenType;
    req.authUser = resolved.user;
    return next();
  } catch {
    req.authToken = "";
    req.authTokenType = "";
    req.authUser = null;
    return next();
  }
}

async function requireAdmin(req, res, next) {
  try {
    if (!req.authUser?.id) {
      return res.status(401).json({ error: { message: "Unauthorized." } });
    }

    const metadataRole = String(req.authUser?.user_metadata?.role || "").toLowerCase();
    if (metadataRole === "admin") {
      return next();
    }

    const profile = await findProfileByUserId(req.authUser.id);
    if (String(profile?.role || "").toLowerCase() !== "admin") {
      return res.status(403).json({ error: { message: "Admin access denied." } });
    }

    return next();
  } catch (error) {
    return res.status(500).json({
      error: { message: error instanceof Error ? error.message : "Admin check failed." },
    });
  }
}

module.exports = {
  requireAuth,
  optionalAuth,
  requireAdmin,
};
