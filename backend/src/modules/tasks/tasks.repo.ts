import { db } from "../../db";
import { mapTaskRow, type TaskDto, type TaskRow } from "./tasks.mapper";
import type { TaskStatus } from "./tasks.schema";

const baseTaskColumns = [
  "id",
  "title",
  "description",
  "due_date",
  "created_at",
  "status",
  "sort_index",
] as const;

export const fetchAllTasks = async (): Promise<TaskDto[]> => {
  const rows = await db("tasks")
    .select(...baseTaskColumns)
    .orderByRaw(
      "CASE status WHEN 'todo' THEN 0 WHEN 'in-progress' THEN 1 WHEN 'complete' THEN 2 ELSE 3 END",
    )
    .orderBy("sort_index", "asc")
    .orderBy("id", "desc");

  return (rows as TaskRow[]).map(mapTaskRow);
};

export const getNextSortIndexForStatus = async (
  status: TaskStatus,
): Promise<number> => {
  const maxSortIndexInStatusRow = await db("tasks")
    .where({ status })
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
  title: string;
  description: string | null;
  dueDate: string | null;
  status: TaskStatus;
  sortIndex: number;
}): Promise<TaskDto> => {
  const insertedRows = await db("tasks")
    .insert({
      title: payload.title,
      description: payload.description,
      due_date: payload.dueDate,
      status: payload.status,
      sort_index: payload.sortIndex,
    })
    .returning(baseTaskColumns);

  return mapTaskRow(insertedRows[0] as TaskRow);
};

export const updateTaskRecord = async (
  id: number,
  payload: {
    title?: string;
    description?: string | null;
    dueDate?: string | null;
    status?: TaskStatus;
  },
): Promise<TaskDto | null> => {
  const updatedRows = await db("tasks")
    .where({ id })
    .update({
      ...(payload.title !== undefined && { title: payload.title }),
      ...(payload.description !== undefined && {
        description: payload.description,
      }),
      ...(payload.dueDate !== undefined && { due_date: payload.dueDate }),
      ...(payload.status !== undefined && { status: payload.status }),
    })
    .returning(baseTaskColumns);

  if (updatedRows.length === 0) return null;
  return mapTaskRow(updatedRows[0] as TaskRow);
};

export const reorderByStatus = async (orderedByStatus: {
  todo: number[];
  "in-progress": number[];
  complete: number[];
}) => {
  await db.transaction(async (trx) => {
    const statusGroups: Array<{ status: TaskStatus; ids: number[] }> = [
      { status: "todo", ids: orderedByStatus.todo },
      { status: "in-progress", ids: orderedByStatus["in-progress"] },
      { status: "complete", ids: orderedByStatus.complete },
    ];

    for (const group of statusGroups) {
      for (let index = 0; index < group.ids.length; index += 1) {
        await trx("tasks").where({ id: group.ids[index] }).update({
          status: group.status,
          sort_index: index,
        });
      }
    }
  });
};

export const reorderByGlobalIds = async (orderedTaskIds: number[]) => {
  await db.transaction(async (trx) => {
    for (let index = 0; index < orderedTaskIds.length; index += 1) {
      await trx("tasks")
        .where({ id: orderedTaskIds[index] })
        .update({ sort_index: index });
    }
  });
};

export const deleteTaskRecord = async (id: number): Promise<number> => {
  return db("tasks").where({ id }).del();
};
