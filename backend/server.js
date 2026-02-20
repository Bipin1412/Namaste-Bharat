const app = require("./app");
const { env, validateEnv } = require("./config/env");
const { hasServiceRoleKey } = require("./config/supabase");

validateEnv();

if (!hasServiceRoleKey) {
  console.warn(
    "SUPABASE_SERVICE_ROLE_KEY is missing. Profile table read/write is disabled."
  );
}

app.listen(env.port, () => {
  console.log(`Backend running on http://localhost:${env.port}`);
});
