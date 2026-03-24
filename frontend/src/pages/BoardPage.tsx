import { Box, Typography } from "@mui/material";
import BoardColumn from "../components/board/BoardColumn";
import { useState } from "react";
import type { Todo, TodoStatus } from "../types/todo";
import { DndContext, type DragEndEvent } from "@dnd-kit/core";
import { DEFAULT_COLUMNS } from "../components/board/BoardColumns";

const BoardPage = () => {
  const [columns, setColumns] = useState(DEFAULT_COLUMNS);
  const [tasks, setTasks] = useState<Todo[]>([]);

  const renameColumn = (id: TodoStatus, newLabel: string) => {
    setColumns((cols) =>
      cols.map((col) => (col.id === id ? { ...col, label: newLabel } : col)),
    );
  };

  const addTask = (status: TodoStatus, title: string, description?: string) => {
    const newTask: Todo = {
      id: Date.now(),
      title,
      description,
      status,
    };
    setTasks((prev) => [...prev, newTask]);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over) return;
    const taskId = active.id as number;
    const newStatus = over.id as Todo["status"];
    moveTask(taskId, newStatus);
  };

  const deleteTask = (id: number) => {
    setTasks((prev) => prev.filter((task) => task.id !== id));
  };

  const moveTask = (id: number, newStatus: Todo["status"]) => {
    setTasks((prev) =>
      prev.map((task) =>
        task.id === id ? { ...task, status: newStatus } : task,
      ),
    );
  };

  const editTask = (id: number, title: string, description?: string) => {
    setTasks((prev) =>
      prev.map((task) =>
        task.id === id ? { ...task, title, description } : task,
      ),
    );
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        padding: { xs: 2, md: 3 },
        boxSizing: "border-box",
        overflowX: "auto",
      }}
    >
      <Box
        sx={{
          width: "min(1240px, 100%)",
          minHeight: "calc(100vh - 48px)",
          margin: "0 auto",
          padding: { xs: 2, md: 3 },
          borderRadius: 3,
          backgroundColor: "rgba(255, 255, 255, 0.14)",
          boxShadow: "0 12px 32px rgba(0, 0, 0, 0.2)",
          backdropFilter: "blur(6px)",
          WebkitBackdropFilter: "blur(6px)",
          boxSizing: "border-box",
        }}
      >
        <Typography
          variant="h4"
          gutterBottom
          sx={{ color: "white", mb: 4, fontWeight: "bold" }}
        >
          Todo Board
        </Typography>

        <Box
          display="flex"
          gap={3}
          justifyContent="center"
          sx={{
            overflowX: "auto",
            pb: 2,
          }}
          alignItems="flex-start"
        >
          <DndContext onDragEnd={handleDragEnd}>
            {columns.map((col) => (
              <BoardColumn
                key={col.id}
                status={col.id}
                title={col.label}
                tasks={tasks}
                onAddTask={addTask}
                onEditTask={editTask}
                onMoveTask={moveTask}
                onDeleteTask={deleteTask}
                onRename={renameColumn}
              />
            ))}
          </DndContext>
        </Box>
      </Box>
    </Box>
  );
};

export default BoardPage;
