import type { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  const hasStatusColumn = await knex.schema.hasColumn("tasks", "status");
  if (!hasStatusColumn) {
    await knex.schema.alterTable("tasks", (table) => {
      table.string("status", 20).notNullable().defaultTo("todo");
    });
  }

  await knex("tasks").whereNull("status").update({ status: "todo" });
}

export async function down(knex: Knex): Promise<void> {
  const hasStatusColumn = await knex.schema.hasColumn("tasks", "status");
  if (hasStatusColumn) {
    await knex.schema.alterTable("tasks", (table) => {
      table.dropColumn("status");
    });
  }
}
