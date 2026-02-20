const { createClient } = require("@supabase/supabase-js");
const { env } = require("./env");

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

