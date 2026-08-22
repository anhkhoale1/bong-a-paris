import pg from "pg";

const { Pool, types } = pg;

types.setTypeParser(types.builtins.INT8, (value) => Number(value));

export function createDatabasePool(
  connectionString = process.env.DATABASE_URL,
) {
  if (!connectionString) throw new Error("Thiếu biến môi trường DATABASE_URL.");
  return new Pool({
    connectionString,
    max: 5,
    idleTimeoutMillis: 30_000,
    connectionTimeoutMillis: 10_000,
  });
}
