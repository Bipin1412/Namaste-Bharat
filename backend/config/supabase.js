const dns = require("node:dns");
const { createClient } = require("@supabase/supabase-js");
const { env } = require("./env");

try {
  dns.setServers(["8.8.8.8", "1.1.1.1"]);
} catch {
  // Keep platform defaults if custom DNS cannot be applied.
}

const supabaseAuthClient = createClient(env.supabaseUrl, env.supabaseAnonKey, {
  auth: { persistSession: false },
});

const hasServiceRoleKey = Boolean(env.supabaseServiceRoleKey);

const supabaseAdminClient = hasServiceRoleKey
  ? createClient(env.supabaseUrl, env.supabaseServiceRoleKey, {
      auth: { persistSession: false },
    })
  : null;

module.exports = {
  supabaseAuthClient,
  supabaseAdminClient,
  hasServiceRoleKey,
};
