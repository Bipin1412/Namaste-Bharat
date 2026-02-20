const { supabaseAuthClient, supabaseAdminClient } = require("../config/supabase");
const { verifyAppToken } = require("../utils/app-token");

async function resolveAppUserFromToken(token) {
  const verified = verifyAppToken(token);
  if (!verified.ok) {
    return { ok: false };
  }

  const userId = String(verified.payload?.sub || "").trim();
  if (!userId) {
    return { ok: false };
  }

  if (supabaseAdminClient) {
    const { data, error } = await supabaseAdminClient.auth.admin.getUserById(userId);
    if (!error && data?.user) {
      return {
        ok: true,
        user: data.user,
        tokenType: "app",
      };
    }
  }

  return {
    ok: true,
    tokenType: "app",
    user: {
      id: userId,
      email: verified.payload?.email || null,
      phone: verified.payload?.phone || null,
      created_at: null,
      user_metadata: {
        role: verified.payload?.role || "user",
      },
    },
  };
}

async function resolveAuthFromBearerToken(token) {
  const { data, error } = await supabaseAuthClient.auth.getUser(token);
  if (!error && data?.user) {
    return { ok: true, user: data.user, tokenType: "supabase" };
  }

  return resolveAppUserFromToken(token);
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

    if (!supabaseAdminClient) {
      return res.status(500).json({
        error: { message: "Server is missing SUPABASE_SERVICE_ROLE_KEY." },
      });
    }

    const { data, error } = await supabaseAdminClient
      .from("profiles")
      .select("role")
      .eq("id", req.authUser.id)
      .single();

    const message = String(error?.message || "").toLowerCase();
    if (error && message.includes("could not find the table") && message.includes("public.profiles")) {
      return res.status(403).json({ error: { message: "Admin access denied." } });
    }
    if (error) {
      return res.status(403).json({ error: { message: "Admin access denied." } });
    }
    if (String(data?.role || "").toLowerCase() !== "admin") {
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
