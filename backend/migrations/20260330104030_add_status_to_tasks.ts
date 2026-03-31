import type { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  const hasStatusColumn = await knex.schema.hasColumn("tasks", "status");
  if (!hasStatusColumn) {
    await knex.schema.alterTable("tasks", (table) => {
      table.string("status", 50).notNullable().defaultTo("todo");
    });
  }
}

export async function down(knex: Knex): Promise<void> {
  const hasStatusColumn = await knex.schema.hasColumn("tasks", "status");
  if (hasStatusColumn) {
    await knex.schema.alterTable("tasks", (table) => {
      table.dropColumn("status");
    });
  }
}
