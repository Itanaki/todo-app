import { useEffect } from "react";
import type { Dispatch, SetStateAction } from "react";
import type { Todo } from "../types/todo";
import type { PresenceMap, TaskRealtimeEvent } from "../types/realtime";

type UseTaskRealtimeSyncParams = {
  localActorId: string;
  setTasks: Dispatch<SetStateAction<Todo[]>>;
  setPresence: Dispatch<SetStateAction<PresenceMap>>;
};

export const useTaskRealtimeSync = ({
  localActorId,
  setTasks,
  setPresence,
}: UseTaskRealtimeSyncParams) => {
  useEffect(() => {
    const eventSource = new EventSource("http://localhost:4000/events");

    const applyOrderedIds = (currentTasks: Todo[], orderedIds: number[]) => {
      const orderMap = new Map<number, number>();
      orderedIds.forEach((id, index) => orderMap.set(id, index));

      return [...currentTasks].sort((a, b) => {
        const aIndex = orderMap.get(a.id);
        const bIndex = orderMap.get(b.id);

        if (aIndex === undefined && bIndex === undefined) return 0;
        if (aIndex === undefined) return 1;
        if (bIndex === undefined) return -1;

        return aIndex - bIndex;
      });
    };

    const markPresence = (
      taskId: number,
      actor: { id: string; name: string; color: string },
    ) => {
      if (actor.id === localActorId) return;

      setPresence((prev) => ({
        ...prev,
        [taskId]: {
          name: actor.name,
          color: actor.color,
        },
      }));

      setTimeout(() => {
        setPresence((prev) => {
          const next = { ...prev };
          delete next[taskId];
          return next;
        });
      }, 3000);
    };

    eventSource.onmessage = (event) => {
      const payload = JSON.parse(event.data) as TaskRealtimeEvent;

      switch (payload.type) {
        case "task-updated":
        case "task-moved": {
          const { task, actor, orderedTaskIds, tasks: snapshotTasks } = payload;

          if (Array.isArray(snapshotTasks)) {
            setTasks(snapshotTasks);
          } else {
            setTasks((prev) => {
              const merged = prev.map((currentTask) =>
                currentTask.id === task.id
                  ? { ...currentTask, ...task }
                  : currentTask,
              );

              if (
                payload.type === "task-moved" &&
                Array.isArray(orderedTaskIds) &&
                orderedTaskIds.length > 0
              ) {
                return applyOrderedIds(merged, orderedTaskIds);
              }

              return merged;
            });
          }

          if (actor) {
            markPresence(task.id, actor);
          }

          break;
        }

        case "task-created": {
          const { task, actor, tasks: snapshotTasks } = payload;

          if (Array.isArray(snapshotTasks)) {
            setTasks(snapshotTasks);
          } else {
            setTasks((prev) => {
              const exists = prev.some(
                (existingTask) => existingTask.id === task.id,
              );
              if (exists) {
                return prev.map((existingTask) =>
                  existingTask.id === task.id
                    ? { ...existingTask, ...task }
                    : existingTask,
                );
              }

              return [...prev, task];
            });
          }

          if (actor) {
            markPresence(task.id, actor);
          }

          break;
        }

        case "task-deleted": {
          const { taskId, tasks: snapshotTasks } = payload;

          if (Array.isArray(snapshotTasks)) {
            setTasks(snapshotTasks);
          } else {
            setTasks((prev) => prev.filter((task) => task.id !== taskId));
          }

          break;
        }
      }
    };

    return () => {
      eventSource.close();
    };
  }, [localActorId, setTasks, setPresence]);
};
