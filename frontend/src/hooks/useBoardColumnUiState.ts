import { useMemo, useState } from "react";
import { useDroppable } from "@dnd-kit/core";
import type { Todo, TodoStatus } from "../types/todo";

interface UseBoardColumnUiStateParams {
  status: TodoStatus;
  tasks: Todo[];
}

interface UseBoardColumnUiStateResult {
  deleteTarget: { id: number; title: string } | null;
  open: boolean;
  selectedTask: Todo | null;
  renameOpen: boolean;
  filteredTasks: Todo[];
  setNodeRef: ReturnType<typeof useDroppable>["setNodeRef"];
  isOver: boolean;
  openRenameModal: () => void;
  closeRenameModal: () => void;
  openAddModal: () => void;
  openEditModal: (task: Todo) => void;
  closeTaskModal: () => void;
  requestDelete: (task: Todo) => void;
  cancelDelete: () => void;
  confirmDelete: () => number | null;
}

const useBoardColumnUiState = ({
  status,
  tasks,
}: UseBoardColumnUiStateParams): UseBoardColumnUiStateResult => {
  const [deleteTarget, setDeleteTarget] = useState<{
    id: number;
    title: string;
  } | null>(null);
  const [open, setOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Todo | null>(null);
  const [renameOpen, setRenameOpen] = useState(false);

  const filteredTasks = useMemo(
    () => tasks.filter((task) => task.status === status),
    [tasks, status],
  );

  const { setNodeRef, isOver } = useDroppable({ id: status });

  const openRenameModal = () => setRenameOpen(true);
  const closeRenameModal = () => setRenameOpen(false);

  const openAddModal = () => {
    setSelectedTask(null);
    setOpen(true);
  };

  const openEditModal = (task: Todo) => {
    setSelectedTask(task);
    setOpen(true);
  };

  const closeTaskModal = () => setOpen(false);

  const requestDelete = (task: Todo) => {
    setDeleteTarget({ id: task.id, title: task.title });
  };

  const cancelDelete = () => setDeleteTarget(null);

  const confirmDelete = () => {
    const id = deleteTarget?.id ?? null;
    setDeleteTarget(null);
    return id;
  };

  return {
    deleteTarget,
    open,
    selectedTask,
    renameOpen,
    filteredTasks,
    setNodeRef,
    isOver,
    openRenameModal,
    closeRenameModal,
    openAddModal,
    openEditModal,
    closeTaskModal,
    requestDelete,
    cancelDelete,
    confirmDelete,
  };
};

export default useBoardColumnUiState;
