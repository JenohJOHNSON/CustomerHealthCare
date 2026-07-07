import { Pool, type QueryResultRow } from "pg";

const globalForPg = globalThis as unknown as {
  pgPool?: Pool;
};

function normalizeConnectionString(connectionString: string) {
  if (connectionString.startsWith("postgres://")) {
    return `postgresql://${connectionString.slice("postgres://".length)}`;
  }

  return connectionString;
}

export function hasDatabaseUrl() {
  return Boolean(process.env.DATABASE_URL);
}

function getPool() {
  const connectionString = process.env.DATABASE_URL;

  if (!connectionString) {
    throw new Error("DATABASE_URL is missing");
  }

  if (!globalForPg.pgPool) {
    globalForPg.pgPool = new Pool({
      connectionString: normalizeConnectionString(connectionString),
      ssl: {
        rejectUnauthorized: false,
      },
    });
  }

  return globalForPg.pgPool;
}

export async function query<T extends QueryResultRow = QueryResultRow>(
  sql: string,
  params?: unknown[],
) {
  return getPool().query<T>(sql, params);
}
