import { useState, useEffect } from "react";
import type { BoardColumnConfig } from "../types/column";
import type { Todo, TodoStatus } from "../types/todo";
import { DEFAULT_COLUMNS } from "../components/board/BoardColumns";
import { tasksService } from "../services/tasks.services";
import { getTabIdentity } from "../services/collabIdentity";
import { useTaskRealtimeSync } from "./useTaskRealtimeSync";
import { useTaskOperations } from "./useTaskOperations";

const DEFAULT_LABEL_BY_STATUS: Record<TodoStatus, string> = {
  todo: "Todo",
  "in-progress": "In-Progress",
  complete: "Completed",
};

interface UseBoardStateResult {
  columns: BoardColumnConfig[];
  tasks: Todo[];
  loading: boolean;

  presence: Record<number, { name: string; color: string }>;
  renameColumn: (id: TodoStatus, newLabel: string) => void;
  addTask: (
    status: TodoStatus,
    title: string,
    description?: string,
    dueDate?: string,
  ) => void;
  moveTask: (
    id: number,
    overId: number | TodoStatus,
    dropPosition?: "top" | "bottom",
  ) => void;
  deleteTask: (id: number) => void;
  editTask: (
    id: number,
    title: string,
    description?: string,
    dueDate?: string,
  ) => void;
}

const useBoardState = (accessToken?: string | null): UseBoardStateResult => {
  const [columns, setColumns] = useState<BoardColumnConfig[]>(DEFAULT_COLUMNS);
  const [tasks, setTasks] = useState<Todo[]>([]);
  const [loading, setLoading] = useState(true);

  const [presence, setPresence] = useState<
    Record<number, { name: string; color: string }>
  >({});

  const localActorId = getTabIdentity().id;

  useTaskRealtimeSync({
    localActorId,
    setTasks,
    setPresence,
    accessToken,
  });

  useEffect(() => {
    // Fetch tasks and try to fetch server-provided column definitions.
    // If the backend doesn't expose /task-columns (404), fall back to
    // deriving labels from the tasks payload (legacy behavior).
    tasksService
      .getTasks(accessToken)
      .then(async (tasksData) => {
        setTasks(
          tasksData.map((task) => ({
            ...task,
            status: task.status ?? "todo",
          })),
        );

        try {
          const columnsData = await tasksService.getColumns(accessToken);
          setColumns(
            columnsData.map((c) => ({ id: c.code as any, label: c.label, sortIndex: c.sort_index })),
          );
        } catch (err) {
          // fallback: build columns from tasks (legacy behavior)
          setColumns((cols) =>
            cols.map((col) => {
              const found = tasksData.find((t) => t.columnCode === col.id && t.columnLabel);
              return found ? { ...col, label: found.columnLabel ?? col.label } : col;
            }),
          );
        }
      })
      .finally(() => setLoading(false));
  }, [accessToken]);

  const { addTask, moveTask, deleteTask, editTask } = useTaskOperations({
    tasks,
    setTasks,
    accessToken,
  });

  const renameColumn = (id: TodoStatus, newLabel: string) => {
    const trimmedLabel = newLabel.trim();
    const resolvedLabel = trimmedLabel || DEFAULT_LABEL_BY_STATUS[id];

    tasksService
      .renameColumnLabel(id, resolvedLabel, accessToken)
      .then((updatedColumn) => {
        setColumns((cols) =>
          cols.map((col) =>
            col.id === updatedColumn.code
              ? { ...col, label: updatedColumn.label }
              : col,
          ),
        );
      })
      .catch((error) => {
        console.error(error);
      });
  };

  return {
    loading,
    columns,
    tasks,
    presence,
    renameColumn,
    addTask,
    moveTask,
    deleteTask,
    editTask,
  };
};

export default useBoardState;
