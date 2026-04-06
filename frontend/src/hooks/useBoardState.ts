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

const useBoardState = (): UseBoardStateResult => {
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
  });

  useEffect(() => {
    tasksService
      .getTasks()
      .then((data) => {
        setTasks(
          data.map((task) => ({
            ...task,
            status: task.status ?? "todo",
          })),
        );
      })
      .finally(() => setLoading(false));
  }, []);

  const { addTask, moveTask, deleteTask, editTask } = useTaskOperations({
    tasks,
    setTasks,
  });

  const renameColumn = (id: TodoStatus, newLabel: string) => {
    const trimmedLabel = newLabel.trim();
    const resolvedLabel = trimmedLabel || DEFAULT_LABEL_BY_STATUS[id];

    tasksService
      .renameColumnLabel(id, resolvedLabel)
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
