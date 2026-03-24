const { Resolver } = require("node:dns");
const { createClient } = require("@supabase/supabase-js");
const { Agent, fetch: undiciFetch } = require("undici");
const { env } = require("./env");

const resolver = new Resolver();
resolver.setServers(["8.8.8.8", "1.1.1.1"]);

const dispatcher = new Agent({
  connect: {
    lookup(hostname, _options, callback) {
      resolver.resolve4(hostname, (error, addresses) => {
        if (!error && Array.isArray(addresses) && addresses.length > 0) {
          callback(null, addresses[0], 4);
          return;
        }

        resolver.resolve6(hostname, (ipv6Error, ipv6Addresses) => {
          if (!ipv6Error && Array.isArray(ipv6Addresses) && ipv6Addresses.length > 0) {
            callback(null, ipv6Addresses[0], 6);
            return;
          }

          callback(error || ipv6Error || new Error(`DNS lookup failed for ${hostname}`));
        });
      });
    },
  },
});

function customFetch(input, init) {
  return undiciFetch(input, {
    ...init,
    dispatcher,
  });
}

const supabaseAuthClient = createClient(env.supabaseUrl, env.supabaseAnonKey, {
  auth: { persistSession: false },
  global: { fetch: customFetch },
});

const hasServiceRoleKey = Boolean(env.supabaseServiceRoleKey);

const supabaseAdminClient = hasServiceRoleKey
  ? createClient(env.supabaseUrl, env.supabaseServiceRoleKey, {
      auth: { persistSession: false },
      global: { fetch: customFetch },
    })
  : null;

module.exports = {
  supabaseAuthClient,
  supabaseAdminClient,
  hasServiceRoleKey,
};
