const app = require("./app");
const { env, validateEnv } = require("./config/env");

validateEnv();

app.listen(env.port, () => {
  console.log(`Backend running on http://localhost:${env.port}`);
});
