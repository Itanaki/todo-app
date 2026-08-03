import type { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  const hasOwnerId = await knex.schema.hasColumn("tasks", "owner_id");

  if (!hasOwnerId) {
    await knex.schema.alterTable("tasks", (table) => {
      table.string("owner_id", 255).nullable();
      table.index(["owner_id"], "tasks_owner_id_index");
    });
  }
}

export async function down(knex: Knex): Promise<void> {
  const hasOwnerId = await knex.schema.hasColumn("tasks", "owner_id");

  if (hasOwnerId) {
    await knex.schema.alterTable("tasks", (table) => {
      table.dropIndex(["owner_id"], "tasks_owner_id_index");
      table.dropColumn("owner_id");
    });
  }
}