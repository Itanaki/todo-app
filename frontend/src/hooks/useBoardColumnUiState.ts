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
  showCompletedDeleteWarning: boolean;
  approveCompletedDelete: () => void;
  cancelCompletedDelete: () => void;
}

interface DeleteTarget {
  id: number;
  title: string;
}

const useBoardColumnUiState = ({
  status,
  tasks,
}: UseBoardColumnUiStateParams): UseBoardColumnUiStateResult => {
  const [deleteTarget, setDeleteTarget] = useState<DeleteTarget | null>(null);
  const [pendingDelete, setPendingDelete] = useState<DeleteTarget | null>(null);
  const [showCompletedDeleteWarning, setShowCompletedDeleteWarning] =
    useState(false);

  const [open, setOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Todo | null>(null);
  const [renameOpen, setRenameOpen] = useState(false);

  const { setNodeRef, isOver } = useDroppable({ id: status });

  const filteredTasks = useMemo(
    () => tasks.filter((task) => task.status === status),
    [tasks, status],
  );

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
    if (task.status === "complete") {
      setPendingDelete({ id: task.id, title: task.title });
      setShowCompletedDeleteWarning(true);
      return;
    }
    setDeleteTarget({ id: task.id, title: task.title });
  };

  const approveCompletedDelete = () => {
    if (pendingDelete) {
      setDeleteTarget(pendingDelete);
      setPendingDelete(null);
    }
    setShowCompletedDeleteWarning(false);
  };

  const cancelCompletedDelete = () => {
    setPendingDelete(null);
    setShowCompletedDeleteWarning(false);
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
    showCompletedDeleteWarning,
    approveCompletedDelete,
    cancelCompletedDelete,
  };
};

export default useBoardColumnUiState;
