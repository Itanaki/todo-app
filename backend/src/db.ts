import knex from "knex";
import knexConfig from "../knexfile";

const env =
  process.env.NODE_ENV === "production" ? "production" : "development";
export const db = knex(knexConfig[env]);
