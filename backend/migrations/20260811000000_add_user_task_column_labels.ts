import type { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  const hasTable = await knex.schema.hasTable("user_task_column_labels");

  if (!hasTable) {
    await knex.schema.createTable("user_task_column_labels", (table) => {
      table.string("owner_id", 255).notNullable();
      table.string("column_code", 50).notNullable();
      table.string("label", 100).notNullable();
      table.timestamp("created_at").defaultTo(knex.fn.now()).notNullable();
      table.primary(["owner_id", "column_code"]);
    });
  }
}

export async function down(knex: Knex): Promise<void> {
  const hasTable = await knex.schema.hasTable("user_task_column_labels");

  if (hasTable) {
    await knex.schema.dropTableIfExists("user_task_column_labels");
  }
}
