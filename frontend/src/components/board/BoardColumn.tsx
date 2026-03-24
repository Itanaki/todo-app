import { Box, Typography, Button, IconButton } from "@mui/material";
import BoardCard from "./BoardCard";
import AddTaskModal from "../modals/AddTaskModal";
import { useState } from "react";
import type { TodoStatus, Todo } from "../../types/todo";
import { useDroppable } from "@dnd-kit/core";
import DeleteConfirmDialog from "../modals/DeleteConfirmDialog";
import EditIcon from "@mui/icons-material/Edit";
import RenameColumnModal from "../modals/RenameColumnModal";

interface Props {
  title: string;
  status: TodoStatus;
  tasks: Todo[];
  onAddTask?: (status: TodoStatus, title: string, description?: string) => void;
  onEditTask?: (id: number, title: string, description?: string) => void;
  onMoveTask: (id: number, status: TodoStatus) => void;
  onDeleteTask: (id: number) => void;
  onRename: (id: TodoStatus, newLabel: string) => void;
}

const BoardColumn = ({
  title,
  status,
  tasks,
  onAddTask,
  onEditTask,
  onDeleteTask,
  onRename,
}: Props) => {
  const [deleteTarget, setDeleteTarget] = useState<{
    id: number;
    title: string;
  } | null>(null);
  const [open, setOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Todo | null>(null);
  const [renameOpen, setRenameOpen] = useState(false);
  const filteredTasks = tasks.filter((task) => task.status === status);

  const { setNodeRef, isOver } = useDroppable({
    id: status,
  });

  return (
    <>
      <Box
        ref={setNodeRef}
        width={300}
        padding={2}
        bgcolor={isOver ? "#e2f0ff" : "#f8f9fa"}
        borderRadius={2}
        sx={{
          boxShadow: isOver
            ? "0 4px 12px rgba(0, 121, 191, 0.3)"
            : "0 2px 8px rgba(0, 0, 0, 0.1)",
          transition: "all 0.2s ease",
          flexShrink: 0,
          minHeight: 30, // starting height
          maxHeight: "75vh", // maximum growth
          display: "flex",
          flexDirection: "column",
        }}
      >
        <Box display="flex" alignItems="center" gap={1} mb={2}>
          <Typography
            variant="subtitle1"
            fontWeight="bold"
            sx={{ color: "#172b4d" }}
          >
            {title}
          </Typography>
          <IconButton
            size="small"
            onClick={() => setRenameOpen(true)}
            sx={{ opacity: 0.7 }}
          >
            <EditIcon fontSize="small" />
          </IconButton>
        </Box>

        <Box
          sx={{
            flex: 1,
            overflowY: "auto",
            mb: 1,
            scrollbarGutter: "stable overlay",
          }}
        >
          {filteredTasks.map((task) => (
            <BoardCard
              key={task.id}
              task={task}
              onEdit={() => {
                setSelectedTask(task);
                setOpen(true);
              }}
              onDelete={() =>
                setDeleteTarget({ id: task.id, title: task.title })
              }
            />
          ))}
        </Box>

        <Button
          variant="contained"
          fullWidth
          sx={{
            justifyContent: "flex-start",
            mt: "auto",
            backgroundColor: "rgba(9, 30, 66, 0.04)",
            color: "#172b4d",
            textTransform: "none",
            fontWeight: 500,
            "&:hover": {
              backgroundColor: "rgba(9, 30, 66, 0.08)",
            },
          }}
          onClick={() => {
            setSelectedTask(null);
            setOpen(true);
          }}
        >
          + Add Task
        </Button>

        <DeleteConfirmDialog
          open={Boolean(deleteTarget)}
          title="Delete task?"
          description={
            deleteTarget?.title
              ? `Are you sure you want to delete "${deleteTarget.title}"?`
              : ""
          }
          onCancel={() => setDeleteTarget(null)}
          onConfirm={() => {
            if (deleteTarget) {
              onDeleteTask(deleteTarget.id);
            }
            setDeleteTarget(null);
          }}
        />
      </Box>

      <RenameColumnModal
        open={renameOpen}
        currentName={title}
        onClose={() => setRenameOpen(false)}
        onSave={(newName) => {
          onRename(status, newName);
          setRenameOpen(false);
        }}
      />

      <AddTaskModal
        open={open}
        task={selectedTask ?? undefined}
        onClose={() => setOpen(false)}
        onSave={(title, description) => {
          onAddTask?.(status, title, description); // ✅ pass column status
          setOpen(false);
        }}
        onEdit={onEditTask}
      />
    </>
  );
};

export default BoardColumn;
