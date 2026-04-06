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

export const listTasks = async () => {
  return fetchAllTasks();
};

export const renameTaskColumnLabel = async (
  code: TaskStatus,
  label: string,
) => {
  const updatedCount = await renameTaskColumnLabelByCode(code, label);

  if (updatedCount === 0) {
    return null;
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
) => {
  const targetColumn =
    payload.columnId !== undefined
      ? await getTaskColumnById(payload.columnId)
      : await getTaskColumnByCode(payload.status ?? "todo");

  if (!targetColumn) {
    throw new Error("Task column not found");
  }

  const targetStatus = targetColumn.code as TaskStatus;

  const nextSortIndex = await getNextSortIndexForStatus(targetStatus);

  const createdTask = await createTaskRecord({
    title: payload.title,
    description: payload.description ?? null,
    dueDate: payload.dueDate ?? null,
    status: targetStatus,
    sortIndex: nextSortIndex,
    columnId: targetColumn.id,
  });

  const tasksSnapshot = await fetchAllTasks();
  publish({
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

  const updatedTask = await updateTaskRecord(id, {
    title: payload.title,
    description: payload.description,
    dueDate: payload.dueDate,
    status: targetColumn?.code as TaskStatus | undefined,
    columnId: targetColumn?.id,
  });

  if (!updatedTask) return null;

  if (payload.orderedByStatus) {
    await reorderByStatus(payload.orderedByStatus);
  } else if (payload.orderedTaskIds && payload.orderedTaskIds.length > 0) {
    await reorderByGlobalIds(payload.orderedTaskIds);
  }

  const tasksSnapshot = await fetchAllTasks();
  const eventType =
    payload.status !== undefined ? "task-moved" : "task-updated";
  const canonicalTask =
    tasksSnapshot.find((task) => task.id === id) ?? updatedTask;

  publish({
    type: eventType,
    task: canonicalTask,
    tasks: tasksSnapshot,
    actor,
    orderedTaskIds: payload.orderedTaskIds,
  });

  return canonicalTask;
};

export const deleteTask = async (id: number, actor: EventActor) => {
  const deletedCount = await deleteTaskRecord(id);
  if (deletedCount === 0) return 0;

  const tasksSnapshot = await fetchAllTasks();
  publish({
    type: "task-deleted",
    taskId: id,
    tasks: tasksSnapshot,
    actor,
  });

  return deletedCount;
};
