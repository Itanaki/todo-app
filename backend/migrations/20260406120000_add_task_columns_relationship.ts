import type { Knex } from "knex";

const TASK_COLUMN_ROWS = [
  { code: "todo", label: "Todo", sort_index: 0 },
  { code: "in-progress", label: "In Progress", sort_index: 1 },
  { code: "complete", label: "Complete", sort_index: 2 },
];

export async function up(knex: Knex): Promise<void> {
  const hasTaskColumnsTable = await knex.schema.hasTable("task_columns");

  if (!hasTaskColumnsTable) {
    await knex.schema.createTable("task_columns", (table) => {
      table.increments("id").primary();
      table.string("code", 50).notNullable().unique();
      table.string("label", 100).notNullable();
      table.integer("sort_index").notNullable().defaultTo(0);
      table.timestamp("created_at").defaultTo(knex.fn.now()).notNullable();
    });
  }

  for (const columnRow of TASK_COLUMN_ROWS) {
    const existingColumn = await knex("task_columns")
      .where({ code: columnRow.code })
      .first();

    if (!existingColumn) {
      await knex("task_columns").insert(columnRow);
    }
  }

  const hasColumnId = await knex.schema.hasColumn("tasks", "column_id");

  // since I am creating this when I have existing or presumming that I already have existing tasks which dont have column_id yet
  // This code block populates it before making it required for the new tasks. That's why it is nullable initially.
  if (!hasColumnId) {
    await knex.schema.alterTable("tasks", (table) => {
      table.integer("column_id").unsigned().nullable();
    });
  }

  const columns = await knex("task_columns").select<
    Array<{ id: number; code: string }>
  >("id", "code");

  const columnIdByCode = new Map(
    columns.map((column) => [column.code, column.id]),
  );

  const fallbackColumnId = columnIdByCode.get("todo");

  if (fallbackColumnId === undefined) {
    throw new Error("Missing fallback task column");
  }

  const tasksWithoutColumn = await knex("tasks")
    .select<{ id: number; status: string | null }[]>("id", "status")
    .whereNull("column_id");

  for (const taskRow of tasksWithoutColumn) {
    //If task has a status that matches a column → use it
    const resolvedColumnId =
      (taskRow.status ? columnIdByCode.get(taskRow.status) : undefined) ??
      fallbackColumnId;

    await knex("tasks")
      .where({ id: taskRow.id })
      .update({ column_id: resolvedColumnId });
  }

  await knex.schema.alterTable("tasks", (table) => {
    table.integer("column_id").unsigned().notNullable().alter();
    table
      .foreign("column_id")
      .references("id")
      .inTable("task_columns")
      .onDelete("CASCADE");
    table.index(["column_id"], "tasks_column_id_index");
  });
}

export async function down(knex: Knex): Promise<void> {
  const hasColumnId = await knex.schema.hasColumn("tasks", "column_id");

  if (hasColumnId) {
    await knex.schema.alterTable("tasks", (table) => {
      table.dropForeign(["column_id"]);
      table.dropIndex(["column_id"], "tasks_column_id_index");
      table.dropColumn("column_id");
    });
  }

  const hasTaskColumnsTable = await knex.schema.hasTable("task_columns");

  if (hasTaskColumnsTable) {
    await knex.schema.dropTableIfExists("task_columns");
  }
}
