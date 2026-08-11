import { db } from "../../db";
import { mapTaskRow, type TaskDto, type TaskRow } from "./tasks.mapper";
import type { TaskStatus } from "./tasks.schema";

const baseTaskColumns = [
  "t.id",
  "t.owner_id",
  "t.title",
  "t.description",
  "t.due_date",
  "t.created_at",
  "t.sort_index",
  "t.column_id",
  "tc.code as column_code",
  // Note: column_label selection is built per-query to allow owner-specific overrides
] as const;

const baseTaskColumnColumns = ["id", "code", "label", "sort_index"] as const;

type TaskColumnRow = {
  id: number;
  code: string;
  label: string;
  sort_index: number;
};

const extractReturnedId = (row: unknown): number => {
  if (typeof row === "number") {
    return row;
  }

  if (row && typeof row === "object" && "id" in row) {
    const id = (row as { id: unknown }).id;
    if (typeof id === "number") {
      return id;
    }
  }

  throw new Error("Failed to read returned task id");
};

export const getTaskColumnByCode = async (
  code: TaskStatus,
): Promise<TaskColumnRow | null> => {
  const columnRow = await db("task_columns")
    .select(...baseTaskColumnColumns)
    .where({ code })
    .first();

  return (columnRow as TaskColumnRow | undefined) ?? null;
};

export const getTaskColumnById = async (
  id: number,
): Promise<TaskColumnRow | null> => {
  const columnRow = await db("task_columns")
    .select(...baseTaskColumnColumns)
    .where({ id })
    .first();

  return (columnRow as TaskColumnRow | undefined) ?? null;
};

export const renameTaskColumnLabelByCode = async (
  code: TaskStatus,
  label: string,
  ownerId?: string,
): Promise<number> => {
  if (ownerId) {
    // upsert per-user override
    await db("user_task_column_labels")
      .insert({ owner_id: ownerId, column_code: code, label })
      .onConflict(["owner_id", "column_code"]) // merge on composite PK
      .merge();

    return 1;
  }

  return db("task_columns").where({ code }).update({ label });
};

export const fetchAllTasks = async (ownerId: string): Promise<TaskDto[]> => {
  const rows = await db("tasks as t")
    .innerJoin("task_columns as tc", "tc.id", "t.column_id")
    .select(
      ...baseTaskColumns,
      db.raw(
        "coalesce((select label from user_task_column_labels u where u.owner_id = ? and u.column_code = tc.code), tc.label) as column_label",
        [ownerId],
      ),
    )
    .where("t.owner_id", ownerId)
    .orderBy("tc.sort_index", "asc")
    .orderBy("t.sort_index", "asc")
    .orderBy("t.id", "desc");

  return (rows as TaskRow[]).map(mapTaskRow);
};

export const fetchTaskColumns = async (viewerId: string | null) => {
  const rows = await db("task_columns as tc")
    .select(
      "tc.id",
      "tc.code",
      "tc.sort_index",
      db.raw(
        "coalesce((select label from user_task_column_labels u where u.owner_id = ? and u.column_code = tc.code), tc.label) as label",
        [viewerId],
      ),
    )
    .orderBy("tc.sort_index", "asc");

  return rows as Array<{ id: number; code: string; sort_index: number; label: string }>; 
};

const fetchTaskById = async (
  id: number,
  ownerId: string,
): Promise<TaskDto | null> => {
  const row = await db("tasks as t")
    .innerJoin("task_columns as tc", "tc.id", "t.column_id")
    .select(
      ...baseTaskColumns,
      db.raw(
        "coalesce((select label from user_task_column_labels u where u.owner_id = ? and u.column_code = tc.code), tc.label) as column_label",
        [ownerId],
      ),
    )
    .where("t.id", id)
    .andWhere("t.owner_id", ownerId)
    .first();

  if (!row) return null;

  return mapTaskRow(row as TaskRow);
};

export const getNextSortIndexForStatus = async (
  columnId: number,
  ownerId: string,
): Promise<number> => {
  const maxSortIndexInStatusRow = await db("tasks")
    .where({ column_id: columnId, owner_id: ownerId })
    .max("sort_index as maxSortIndex");

  const maxSortIndexValue = Number(
    (
      maxSortIndexInStatusRow[0] as
        | { maxSortIndex: number | string | null }
        | undefined
    )?.maxSortIndex ?? -1,
  );

  return maxSortIndexValue + 1;
};

export const createTaskRecord = async (payload: {
  ownerId: string;
  title: string;
  description: string | null;
  dueDate: string | null;
  sortIndex: number;
  columnId: number;
}): Promise<TaskDto> => {
  const insertedRows = await db("tasks")
    .insert({
      owner_id: payload.ownerId,
      title: payload.title,
      description: payload.description,
      due_date: payload.dueDate,
      sort_index: payload.sortIndex,
      column_id: payload.columnId,
    })
    .returning("id");

  const createdTaskId = extractReturnedId(insertedRows[0]);

  const createdTask = await fetchTaskById(createdTaskId, payload.ownerId);

  if (!createdTask) {
    throw new Error("Failed to load created task");
  }

  return createdTask;
};

export const updateTaskRecord = async (
  id: number,
  ownerId: string,
  payload: {
    title?: string;
    description?: string | null;
    dueDate?: string | null;
    columnId?: number;
  },
): Promise<TaskDto | null> => {
  const updatedRows = await db("tasks")
    .where({ id, owner_id: ownerId })
    .update({
      ...(payload.title !== undefined && { title: payload.title }),
      ...(payload.description !== undefined && {
        description: payload.description,
      }),
      ...(payload.dueDate !== undefined && { due_date: payload.dueDate }),
      ...(payload.columnId !== undefined && { column_id: payload.columnId }),
    })
    .returning("id");

  if (updatedRows.length === 0) return null;

  return fetchTaskById(extractReturnedId(updatedRows[0]), ownerId);
};

export const reorderByStatus = async (
  ownerId: string,
  orderedByStatus: {
    todo: number[];
    "in-progress": number[];
    complete: number[];
  },
) => {
  await db.transaction(async (trx) => {
    const statusGroups: Array<{ status: TaskStatus; ids: number[] }> = [
      { status: "todo", ids: orderedByStatus.todo },
      { status: "in-progress", ids: orderedByStatus["in-progress"] },
      { status: "complete", ids: orderedByStatus.complete },
    ];

    const columnRows = await trx("task_columns")
      .select("id", "code")
      .whereIn(
        "code",
        statusGroups.map((group) => group.status),
      );

    const columnIdByCode = new Map(
      columnRows.map((row: { id: number; code: string }) => [row.code, row.id]),
    );

    for (const group of statusGroups) {
      const columnId = columnIdByCode.get(group.status);

      if (columnId === undefined) {
        throw new Error(`Missing task column for status ${group.status}`);
      }

      for (let index = 0; index < group.ids.length; index += 1) {
        await trx("tasks").where({ id: group.ids[index], owner_id: ownerId }).update({
          column_id: columnId,
          sort_index: index,
        });
      }
    }
  });
};

export const reorderByGlobalIds = async (
  ownerId: string,
  orderedTaskIds: number[],
) => {
  await db.transaction(async (trx) => {
    for (let index = 0; index < orderedTaskIds.length; index += 1) {
      await trx("tasks")
        .where({ id: orderedTaskIds[index], owner_id: ownerId })
        .update({ sort_index: index });
    }
  });
};

export const deleteTaskRecord = async (
  id: number,
  ownerId: string,
): Promise<number> => {
  return db("tasks").where({ id, owner_id: ownerId }).del();
};
