import type { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  const hasStatusColumn = await knex.schema.hasColumn("tasks", "status");

  if (hasStatusColumn) {
    await knex.schema.alterTable("tasks", (table) => {
      table.dropColumn("status");
    });
  }
}

export async function down(knex: Knex): Promise<void> {
  const hasStatusColumn = await knex.schema.hasColumn("tasks", "status");

  if (!hasStatusColumn) {
    await knex.schema.alterTable("tasks", (table) => {
      table.string("status", 50).nullable();
    });

    await knex.raw(`
      UPDATE t
      SET t.status = tc.code
      FROM tasks t
      LEFT JOIN task_columns tc ON tc.id = t.column_id
      WHERE t.status IS NULL
    `);

    await knex("tasks").whereNull("status").update({ status: "todo" });

    await knex.schema.alterTable("tasks", (table) => {
      table.string("status", 50).notNullable().defaultTo("todo").alter();
    });
  }
}
