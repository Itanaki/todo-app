import { publish } from "../../events/taskEvents";
import {
  createTaskRecord,
  deleteTaskRecord,
  fetchAllTasks,
  getTaskColumnByCode,
  getTaskColumnById,
  getNextSortIndexForStatus,
  renameTaskColumnLabelByCode,
  reorderByGlobalIds,
  reorderByStatus,
  updateTaskRecord,
} from "./tasks.repo";
import type {
  CreateTaskInput,
  TaskStatus,
  UpdateTaskInput,
} from "./tasks.schema";

export type EventActor = {
  id: string;
  name: string;
  color: string;
};

export const listTasks = async (ownerId: string) => {
  return fetchAllTasks(ownerId);
};

export const renameTaskColumnLabel = async (
  code: TaskStatus,
  label: string,
  ownerId?: string,
) => {
  const updatedCount = await renameTaskColumnLabelByCode(code, label, ownerId);

  if (updatedCount === 0) {
    return null;
  }

  // For per-user updates we can return the label requested (override),
  // for global updates fall back to fetching the canonical column.
  if (ownerId) {
    return {
      code,
      label,
    };
  }

  const updatedColumn = await getTaskColumnByCode(code);

  if (!updatedColumn) {
    return null;
  }

  return {
    code,
    label: updatedColumn.label,
  };
};

export const createTask = async (
  payload: CreateTaskInput,
  actor: EventActor,
  ownerId: string,
) => {
  const targetColumn =
    payload.columnId !== undefined
      ? await getTaskColumnById(payload.columnId)
      : await getTaskColumnByCode(payload.status ?? "todo");

  if (!targetColumn) {
    throw new Error("Task column not found");
  }

  const nextSortIndex = await getNextSortIndexForStatus(targetColumn.id, ownerId);

  const createdTask = await createTaskRecord({
    ownerId,
    title: payload.title,
    description: payload.description ?? null,
    dueDate: payload.dueDate ?? null,
    sortIndex: nextSortIndex,
    columnId: targetColumn.id,
  });

  const tasksSnapshot = await fetchAllTasks(ownerId);
  publish(ownerId, {
    type: "task-created",
    task: createdTask,
    tasks: tasksSnapshot,
    actor,
  });

  return createdTask;
};

export const updateTask = async (
  id: number,
  payload: UpdateTaskInput,
  actor: EventActor,
  ownerId: string,
) => {
  const targetColumn =
    payload.columnId !== undefined
      ? await getTaskColumnById(payload.columnId)
      : payload.status !== undefined
        ? await getTaskColumnByCode(payload.status)
        : null;

  if (payload.columnId !== undefined || payload.status !== undefined) {
    if (!targetColumn) {
      throw new Error("Task column not found");
    }
  }

  const updatedTask = await updateTaskRecord(id, ownerId, {
    title: payload.title,
    description: payload.description,
    dueDate: payload.dueDate,
    columnId: targetColumn?.id,
  });

  if (!updatedTask) return null;

  if (payload.orderedByStatus) {
    await reorderByStatus(ownerId, payload.orderedByStatus);
  } else if (payload.orderedTaskIds && payload.orderedTaskIds.length > 0) {
    await reorderByGlobalIds(ownerId, payload.orderedTaskIds);
  }

  const tasksSnapshot = await fetchAllTasks(ownerId);
  const eventType =
    payload.status !== undefined ? "task-moved" : "task-updated";
  const canonicalTask =
    tasksSnapshot.find((task) => task.id === id) ?? updatedTask;

  publish(ownerId, {
    type: eventType,
    task: canonicalTask,
    tasks: tasksSnapshot,
    actor,
    orderedTaskIds: payload.orderedTaskIds,
  });

  return canonicalTask;
};

export const deleteTask = async (id: number, actor: EventActor, ownerId: string) => {
  const deletedCount = await deleteTaskRecord(id, ownerId);
  if (deletedCount === 0) return 0;

  const tasksSnapshot = await fetchAllTasks(ownerId);
  publish(ownerId, {
    type: "task-deleted",
    taskId: id,
    tasks: tasksSnapshot,
    actor,
  });

  return deletedCount;
};
