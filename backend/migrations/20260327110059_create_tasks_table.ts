import type { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable("tasks", (table) => {
    table.increments("id").primary();
    table.string("title", 255).notNullable();
    table.text("description").nullable();
    table.date("due_date").nullable();
    table.timestamp("created_at").defaultTo(knex.fn.now()).notNullable();
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists("tasks");
}
