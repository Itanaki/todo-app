import { useCallback } from "react";
import { arrayMove } from "@dnd-kit/sortable";
import type { Dispatch, SetStateAction } from "react";
import { tasksService } from "../services/tasks.services";
import type { Todo, TodoStatus } from "../types/todo";

type UseTaskOperationsParams = {
  tasks: Todo[];
  setTasks: Dispatch<SetStateAction<Todo[]>>;
};

export const useTaskOperations = ({
  tasks,
  setTasks,
}: UseTaskOperationsParams) => {
  const addTask = useCallback(
    async (
      status: TodoStatus,
      title: string,
      description?: string,
      dueDate?: string,
    ) => {
      const created = await tasksService.createTask({
        title,
        description,
        dueDate,
        status,
      });

      setTasks((prev) => {
        const exists = prev.some((task) => task.id === created.id);
        if (exists) {
          return prev.map((task) =>
            task.id === created.id ? { ...task, ...created } : task,
          );
        }

        return [...prev, created];
      });
    },
    [setTasks],
  );

  const moveTask = useCallback(
    async (
      id: number,
      overId: number | TodoStatus,
      dropPosition: "top" | "bottom" = "bottom",
    ) => {
      if (id === overId) return;

      const nextStatus: TodoStatus | null =
        typeof overId === "number"
          ? (tasks.find((t) => t.id === overId)?.status ?? null)
          : overId;

      if (!nextStatus) return;

      const previousTasks = tasks;

      const getNextTasks = (prev: Todo[]) => {
        const activeIndex = prev.findIndex((task) => task.id === id);
        if (activeIndex === -1) return prev;

        const activeTask = prev[activeIndex];

        if (typeof overId === "number") {
          const overIndex = prev.findIndex((task) => task.id === overId);
          if (overIndex === -1) return prev;

          const next = prev.map((task) =>
            task.id === id ? { ...task, status: nextStatus } : task,
          );

          const updatedActiveIndex = next.findIndex((task) => task.id === id);
          return arrayMove(next, updatedActiveIndex, overIndex);
        }

        const movedTask = { ...activeTask, status: nextStatus };
        const withoutActive = prev.filter((task) => task.id !== id);

        let insertAt = withoutActive.length;

        if (dropPosition === "top") {
          const firstTargetIndex = withoutActive.findIndex(
            (task) => task.status === nextStatus,
          );
          insertAt =
            firstTargetIndex === -1 ? withoutActive.length : firstTargetIndex;
        } else {
          for (let i = 0; i < withoutActive.length; i += 1) {
            if (withoutActive[i].status === nextStatus) {
              insertAt = i + 1;
            }
          }
        }

        const reordered = [...withoutActive];
        reordered.splice(insertAt, 0, movedTask);
        return reordered;
      };

      const nextTasks = getNextTasks(previousTasks);
      setTasks(nextTasks);

      if (nextTasks === previousTasks) return;

      try {
        const orderedByStatus: Record<TodoStatus, number[]> = {
          todo: [],
          "in-progress": [],
          complete: [],
        };

        for (const task of nextTasks) {
          orderedByStatus[task.status].push(task.id);
        }

        await tasksService.updateTask(id, {
          status: nextStatus,
          orderedTaskIds: nextTasks.map((task) => task.id),
          orderedByStatus,
        });
      } catch {
        setTasks(previousTasks);
      }
    },
    [tasks, setTasks],
  );

  const deleteTask = useCallback(
    async (id: number) => {
      await tasksService.deleteTask(id);
      setTasks((prev) => prev.filter((task) => task.id !== id));
    },
    [setTasks],
  );

  const editTask = useCallback(
    async (
      id: number,
      title: string,
      description?: string,
      dueDate?: string,
    ) => {
      const updated = await tasksService.updateTask(id, {
        title,
        description,
        dueDate,
      });

      setTasks((prev) =>
        prev.map((task) => (task.id === id ? { ...task, ...updated } : task)),
      );
    },
    [setTasks],
  );

  return {
    addTask,
    moveTask,
    deleteTask,
    editTask,
  };
};
