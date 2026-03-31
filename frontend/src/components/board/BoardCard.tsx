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
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import dayjs from "dayjs";
import { getDueStyle } from "../../utils/dueDate";
import {
  getBoardCardBottomSx,
  getBoardCardContainerSx,
  getBoardCardDescSx,
  getBoardCardDueDateSx,
  getBoardCardSx,
  getBoardCardTitleSx,
} from "../../styles/boardCardStyles";

interface BoardCardProps {
  task: Todo;

  presence?: {
    name: string;
    color: string;
  };

  onEdit?: () => void;
  onDelete: () => void;
}

const BoardCard = ({ task, presence, onEdit, onDelete }: BoardCardProps) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: task.id,
  });

  const style = {
    transform: CSS.Translate.toString(transform),
    transition,
  };

  return (
    <Card
      ref={setNodeRef}
      style={{
        ...style,
        opacity: isDragging ? 0 : 1,
        border: presence ? `2px solid ${presence.color}` : "1px solid #e0e0e0",
      }}
      sx={getBoardCardContainerSx}
    >
      <CardContent sx={getBoardCardSx} {...listeners} {...attributes}>
        {presence && (
          <Typography
            variant="caption"
            sx={{
              display: "inline-block",
              mb: 1,
              px: 1,
              py: 0.25,
              borderRadius: 1,
              color: "white",
              backgroundColor: presence.color,
              fontWeight: 600,
            }}
          >
            {presence.name}
          </Typography>
        )}

        <Typography variant="body1" fontWeight={500} sx={getBoardCardTitleSx}>
          {task.title}
        </Typography>

        {task.description && (
          <Typography
            variant="body2"
            color="text.secondary"
            mt={1}
            sx={getBoardCardDescSx}
          >
            {task.description}
          </Typography>
        )}

        {task.dueDate &&
          (() => {
            return (
              <Box sx={getBoardCardDueDateSx(getDueStyle(task.dueDate))}>
                Due {dayjs(task.dueDate).format("MMM D")}
              </Box>
            );
          })()}
      </CardContent>

      <CardContent sx={getBoardCardBottomSx}>
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
