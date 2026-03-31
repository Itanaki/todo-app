import type { Knex } from "knex";

type TaskIdRow = { id: number };

export async function up(knex: Knex): Promise<void> {
  const hasSortIndex = await knex.schema.hasColumn("tasks", "sort_index");

  if (!hasSortIndex) {
    await knex.schema.alterTable("tasks", (table) => {
      table.integer("sort_index").notNullable().defaultTo(0);
    });
  }

  const tasks = await knex("tasks")
    .select<TaskIdRow[]>("id")
    .orderBy("id", "desc");

  for (let index = 0; index < tasks.length; index += 1) {
    await knex("tasks")
      .where({ id: tasks[index].id })
      .update({ sort_index: index });
  }
}

export async function down(knex: Knex): Promise<void> {
  const hasSortIndex = await knex.schema.hasColumn("tasks", "sort_index");

  if (hasSortIndex) {
    await knex.schema.alterTable("tasks", (table) => {
      table.dropColumn("sort_index");
    });
  }
}
