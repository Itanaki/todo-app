import {
  Card,
  CardContent,
  Typography,
  Box,
  IconButton,
  Button,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import CloseIcon from "@mui/icons-material/Close";
import type { Todo } from "../../types/todo";
import { useDraggable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";

interface BoardCardProps {
  task: Todo;
  onEdit?: () => void;
  onDelete: () => void;
}

const BoardCard = ({ task, onEdit, onDelete }: BoardCardProps) => {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id: task.id,
  });

  const style = {
    transform: CSS.Translate.toString(transform),
  };

  return (
    <Card
      ref={setNodeRef}
      style={{
        ...style,
        position: transform ? "fixed" : "relative",
        zIndex: transform ? 9999 : 1,
        width: transform ? "268px" : "auto",
      }}
      sx={{
        mb: 1.5,
        boxShadow: "0 1px 4px rgba(0, 0, 0, 0.12)",
        backgroundColor: "white",
        cursor: "grab",
        transition: "all 0.2s ease",
        "&:hover": {
          boxShadow: "0 2px 8px rgba(0, 0, 0, 0.15)",
        },
        borderRadius: "6px",
        border: "none",
      }}
    >
      <CardContent
        sx={{
          padding: 2,
          "&:last-child": { paddingBottom: 2 },
          backgroundColor: "white",
        }}
        {...listeners}
        {...attributes}
      >
        <Typography variant="body1" fontWeight={500} sx={{ color: "#172b4d" }}>
          {task.title}
        </Typography>

        {task.description && (
          <Typography
            variant="body2"
            color="text.secondary"
            mt={1}
            sx={{ color: "#626f86" }}
          >
            {task.description}
          </Typography>
        )}
      </CardContent>

      <CardContent
        sx={{ padding: "8px 16px", "&:last-child": { paddingBottom: "8px" } }}
      >
        <Box display="flex" justifyContent="space-between" alignItems="center">
          {(task.status === "todo" || task.status === "in-progress") &&
            onEdit && (
              <Button
                size="small"
                startIcon={<EditIcon />}
                onClick={onEdit}
                sx={{ textTransform: "none", fontSize: "0.875rem" }}
              >
                Edit
              </Button>
            )}

          <IconButton
            size="small"
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
            sx={{ ml: "auto" }}
          >
            <CloseIcon fontSize="small" />
          </IconButton>
        </Box>
      </CardContent>
    </Card>
  );
};

export default BoardCard;
