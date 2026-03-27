import mysql, {
  type Pool,
  type PoolOptions,
  type ResultSetHeader,
} from "mysql2/promise";

export type MysqlResult = ResultSetHeader;

let pool: Pool | null = null;

function getEnv(name: string): string {
  return String(process.env[name] || "").trim();
}

export function hasMysqlConfig() {
  return Boolean(
    getEnv("MYSQL_HOST") &&
      getEnv("MYSQL_USER") &&
      getEnv("MYSQL_PASSWORD") &&
      getEnv("MYSQL_DATABASE")
  );
}

function createPoolInstance() {
  const config: PoolOptions = {
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

export function getMysqlPool() {
  if (!hasMysqlConfig()) {
    throw new Error("MySQL env vars are missing.");
  }

  return pool ?? createPoolInstance();
}

export async function queryRows<T>(
  sql: string,
  params: any[] = []
): Promise<T[]> {
  const [rows] = await getMysqlPool().query(sql, params);
  return rows as T[];
}

export async function executeResult(
  sql: string,
  params: any[] = []
): Promise<MysqlResult> {
  const [result] = await getMysqlPool().execute(sql, params);
  return result as MysqlResult;
}

export function parseJsonField<T>(value: unknown, fallback: T): T {
  if (value === null || value === undefined || value === "") {
    return fallback;
  }

  if (typeof value === "object") {
    return value as T;
  }

  try {
    return JSON.parse(String(value)) as T;
  } catch {
    return fallback;
  }
}

export function toIsoString(value: unknown): string {
  if (!value) {
    return new Date().toISOString();
  }

  const raw = String(value);
  if (raw.includes("T")) {
    return raw;
  }

  return `${raw.replace(" ", "T")}Z`;
}

export function toMysqlDateTime(value: string | null | undefined): string | null {
  if (!value) {
    return null;
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return null;
  }

  return date.toISOString().slice(0, 19).replace("T", " ");
}
