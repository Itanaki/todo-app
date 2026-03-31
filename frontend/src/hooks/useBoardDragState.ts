import { useMemo, useState } from "react";
import {
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragOverEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import type { Todo, TodoStatus } from "../types/todo";

interface UseBoardDragStateParams {
  tasks: Todo[];
  moveTask: (
    id: number,
    overId: number | TodoStatus,
    dropPosition?: "top" | "bottom",
  ) => void;
}

interface UseBoardDragStateResult {
  sensors: ReturnType<typeof useSensors>;
  activeTask: Todo | null;
  overColumnStatus: TodoStatus | null;
  handleDragStart: (event: DragStartEvent) => void;
  handleDragOver: (event: DragOverEvent) => void;
  handleDragEnd: (event: DragEndEvent) => void;
  handleDragCancel: () => void;
}

const isTodoStatus = (value: unknown): value is TodoStatus =>
  value === "todo" || value === "in-progress" || value === "complete";

const resolveOverColumnStatus = (
  overId: number | string,
  tasks: Todo[],
): TodoStatus | null => {
  if (isTodoStatus(overId)) return overId;
  if (typeof overId === "number") {
    return tasks.find((task) => task.id === overId)?.status ?? null;
  }
  return null;
};

const getDropPosition = (
  event: Pick<DragOverEvent | DragEndEvent, "active" | "over">,
): "top" | "bottom" | undefined => {
  const over = event.over;
  if (!over) return undefined;

  const activeRect = event.active.rect.current.translated;
  if (!activeRect) return undefined;

  const activeMiddleY = activeRect.top + activeRect.height / 2;
  const overMiddleY = over.rect.top + over.rect.height / 2;

  return activeMiddleY < overMiddleY ? "top" : "bottom";
};

const useBoardDragState = ({
  tasks,
  moveTask,
}: UseBoardDragStateParams): UseBoardDragStateResult => {
  const [activeTaskId, setActiveTaskId] = useState<number | null>(null);
  const [overColumnStatus, setOverColumnStatus] = useState<TodoStatus | null>(
    null,
  );
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 4,
      },
    }),
  );

  const activeTask = useMemo(
    () => tasks.find((task) => task.id === activeTaskId) ?? null,
    [tasks, activeTaskId],
  );

  const handleDragStart = (event: DragStartEvent) => {
    setActiveTaskId(event.active.id as number);
    setOverColumnStatus(null);
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { over } = event;
    if (!over) {
      setOverColumnStatus(null);
      return;
    }

    setOverColumnStatus(
      resolveOverColumnStatus(over.id as number | string, tasks),
    );
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveTaskId(null);
    setOverColumnStatus(null);

    if (!over) return;
    const taskId = active.id as number;
    const overId = over.id as number | TodoStatus;
    const dropPosition = getDropPosition(event);

    moveTask(taskId, overId, dropPosition);
  };

  const handleDragCancel = () => {
    setActiveTaskId(null);
    setOverColumnStatus(null);
  };

  return {
    sensors,
    activeTask,
    overColumnStatus,
    handleDragStart,
    handleDragOver,
    handleDragEnd,
    handleDragCancel,
  };
};

export default useBoardDragState;
