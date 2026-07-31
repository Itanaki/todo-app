import type { Knex } from "knex";
import "dotenv/config";
import { env } from "node:process";

function createSslConfig() {
  if (env.DB_SSL !== "true") {
    return undefined;
  }

  return {
    rejectUnauthorized: env.DB_SSL_REJECT_UNAUTHORIZED === "true",
  };
}

function createConnection() {
  if (env.DATABASE_URL) {
    const databaseUrl = new URL(env.DATABASE_URL);

    return {
      host: databaseUrl.hostname,
      port: Number(databaseUrl.port || 5432),
      user: decodeURIComponent(databaseUrl.username),
      password: decodeURIComponent(databaseUrl.password || ""),
      database: databaseUrl.pathname.replace(/^\//, ""),
      ssl: createSslConfig(),
    };
  }

  return {
    host: env.DB_HOST,
    port: Number(env.DB_PORT || 5432),
    user: env.DB_USER,
    password: env.DB_PASSWORD ?? "",
    database: env.DB_NAME,
    ssl: createSslConfig(),
  };
}

function validateConnection() {
  if (!env.DATABASE_URL) {
    const missing = ["DB_HOST", "DB_USER", "DB_NAME"].filter(
      (key) => !env[key as keyof NodeJS.ProcessEnv],
    );

    if (missing.length > 0) {
      throw new Error(
        `Missing required Postgres environment variables: ${missing.join(
          ", ",
        )}. Set DATABASE_URL or the discrete DB_* values before running migrations.`,
      );
    }
  }
}

const config: Knex.Config = {
  client: "pg",
  connection: createConnection(),
  pool: { min: 0, max: 10 },
  migrations: { directory: "./migrations", extension: "ts" },
  seeds: { directory: "./seeds", extension: "ts" },
};

validateConnection();

export default { development: config, production: config };
