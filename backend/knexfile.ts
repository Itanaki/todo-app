import type { Knex } from "knex";
import "dotenv/config";

const config: Knex.Config = {
  client: "mssql",
  connection: {
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT || 1433),
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    options: {
      encrypt: process.env.DB_ENCRYPT === "true",
      trustServerCertificate: process.env.DB_TRUST_CERT === "true",
    },
  },
  pool: { min: 0, max: 10 },
  migrations: { directory: "./migrations", extension: "ts" },
  seeds: { directory: "./seeds", extension: "ts" },
};

export default { development: config, production: config };
