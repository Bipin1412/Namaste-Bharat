const mysql = require("mysql2/promise");

let pool = null;

function getEnv(name) {
  return String(process.env[name] || "").trim();
}

function hasMysqlConfig() {
  return Boolean(
    getEnv("MYSQL_HOST") &&
      getEnv("MYSQL_USER") &&
      getEnv("MYSQL_PASSWORD") &&
      getEnv("MYSQL_DATABASE")
  );
}

function createPoolInstance() {
  const config = {
    host: getEnv("MYSQL_HOST"),
    port: Number(getEnv("MYSQL_PORT") || "3306"),
    user: getEnv("MYSQL_USER"),
    password: getEnv("MYSQL_PASSWORD"),
    database: getEnv("MYSQL_DATABASE"),
    waitForConnections: true,
    connectionLimit: Number(getEnv("MYSQL_CONNECTION_LIMIT") || "10"),
    queueLimit: 0,
    charset: "utf8mb4",
    dateStrings: true,
  };

  pool = mysql.createPool(config);
  return pool;
}

function getMysqlPool() {
  if (!hasMysqlConfig()) {
    throw new Error("MySQL env vars are missing.");
  }

  return pool || createPoolInstance();
}

async function queryRows(sql, params = []) {
  const [rows] = await getMysqlPool().query(sql, params);
  return rows;
}

async function executeResult(sql, params = []) {
  const [result] = await getMysqlPool().execute(sql, params);
  return result;
}

function parseJsonField(value, fallback) {
  if (value === null || value === undefined || value === "") {
    return fallback;
  }

  if (typeof value === "object") {
    return value;
  }

  try {
    return JSON.parse(String(value));
  } catch {
    return fallback;
  }
}

function toIsoString(value) {
  if (!value) {
    return new Date().toISOString();
  }

  const raw = String(value);
  if (raw.includes("T")) {
    return raw;
  }

  return `${raw.replace(" ", "T")}Z`;
}

function toMysqlDateTime(value) {
  if (!value) {
    return null;
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return null;
  }

  return date.toISOString().slice(0, 19).replace("T", " ");
}

module.exports = {
  hasMysqlConfig,
  getMysqlPool,
  queryRows,
  executeResult,
  parseJsonField,
  toIsoString,
  toMysqlDateTime,
};
