import { Box, Typography, Button, IconButton } from "@mui/material";
import BoardCard from "./BoardCard";
import AddTaskModal from "../modals/AddTaskModal";
import type { TodoStatus, Todo } from "../../types/todo";
import DeleteConfirmDialog from "../modals/DeleteConfirmDialog";
import EditIcon from "@mui/icons-material/Edit";
import RenameColumnModal from "../modals/RenameColumnModal";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import useBoardColumnUiState from "../../hooks/useBoardColumnUiState";
import {
  getBoardColumnContainerSx,
  boardColumnHeaderSx,
  boardColumnTitleSx,
  boardColumnRenameButtonSx,
  boardColumnTaskListSx,
  boardColumnAddButtonSx,
} from "../../styles/boardColumnStyles";

interface Props {
  title: string;
  status: TodoStatus;
  tasks: Todo[];
  presence: Record<number, { name: string; color: string }>;
  isDragHover?: boolean;
  onAddTask?: (
    status: TodoStatus,
    title: string,
    description?: string,
    dueDate?: string,
  ) => void;
  onEditTask?: (
    id: number,
    title: string,
    description?: string,
    dueDate?: string,
  ) => void;
  onDeleteTask: (id: number) => void;
  onRename: (id: TodoStatus, newLabel: string) => void;
}

const BoardColumn = ({
  title,
  status,
  tasks,
  presence,
  isDragHover,
  onAddTask,
  onEditTask,
  onDeleteTask,
  onRename,
}: Props) => {
  const {
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
  } = useBoardColumnUiState({ status, tasks });
  const sortableIds = filteredTasks.map((task) => task.id);
  const showHover = isOver || Boolean(isDragHover);
  return (
    <>
      <Box
        ref={setNodeRef}
        width={300}
        padding={2}
        bgcolor={showHover ? "#e2f0ff" : "#f8f9fa"}
        borderRadius={2}
        sx={getBoardColumnContainerSx(showHover)}
      >
        <Box sx={boardColumnHeaderSx}>
          <Typography
            variant="subtitle1"
            fontWeight="bold"
            sx={boardColumnTitleSx}
          >
            {title}
          </Typography>
          <IconButton
            size="small"
            onClick={openRenameModal}
            sx={boardColumnRenameButtonSx}
          >
            <EditIcon fontSize="small" />
          </IconButton>
        </Box>

        <SortableContext
          items={sortableIds}
          strategy={verticalListSortingStrategy}
        >
          <Box sx={boardColumnTaskListSx}>
            {filteredTasks.map((task) => (
              <BoardCard
                key={task.id}
                task={task}
                presence={presence[task.id]}
                onEdit={() => openEditModal(task)}
                onDelete={() => requestDelete(task)}
              />
            ))}
          </Box>
        </SortableContext>

        <Button
          variant="contained"
          fullWidth
          sx={boardColumnAddButtonSx}
          onClick={openAddModal}
        >
          + Add Task
        </Button>

        <DeleteConfirmDialog
          open={Boolean(deleteTarget)}
          title="Delete task?"
          description={
            deleteTarget?.title
              ? 'Are you sure you want to delete "' + deleteTarget.title + '"?'
              : ""
          }
          onCancel={cancelDelete}
          onConfirm={() => {
            const id = confirmDelete();
            if (id !== null) {
              onDeleteTask(id);
            }
          }}
        />
      </Box>

      <RenameColumnModal
        open={renameOpen}
        currentName={title}
        onClose={closeRenameModal}
        onSave={(newName) => {
          onRename(status, newName);
          closeRenameModal();
        }}
      />

      <AddTaskModal
        open={open}
        task={selectedTask ?? undefined}
        onClose={closeTaskModal}
        onSave={(newTitle, description, dueDate) => {
          onAddTask?.(status, newTitle, description, dueDate);
          closeTaskModal();
        }}
        onEdit={onEditTask}
      />
    </>
  );
};

export default BoardColumn;
