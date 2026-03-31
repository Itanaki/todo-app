import type { Todo } from "./todo";

export interface PresenceActor {
  id: string;
  name: string;
  color: string;
}

export type PresenceMap = Record<number, { name: string; color: string }>;

export type TaskRealtimeEvent =
  | {
      type: "task-created";
      task: Todo;
      tasks?: Todo[];
      actor?: PresenceActor;
    }
  | {
      type: "task-updated" | "task-moved";
      task: Todo;
      tasks?: Todo[];
      actor?: PresenceActor;
      orderedTaskIds?: number[];
    }
  | {
      type: "task-deleted";
      taskId: number;
      tasks?: Todo[];
      actor?: PresenceActor;
    };
