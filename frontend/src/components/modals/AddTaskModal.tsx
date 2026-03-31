import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  IconButton,
  Box,
} from "@mui/material";

import CloseIcon from "@mui/icons-material/Close";
import { useState, useEffect } from "react";
import { DatePicker } from "@mui/x-date-pickers";
import dayjs, { Dayjs } from "dayjs";
import { normalizeText } from "../../utils/normalizeSpacing";

interface AddTaskModalProps {
  open: boolean;
  onClose: () => void;
  onSave?: (title: string, description?: string, dueDate?: string) => void;
  onEdit?: (
    id: number,
    title: string,
    description?: string,
    dueDate?: string,
  ) => void;
  task?: {
    id: number;
    title: string;
    description?: string;
    dueDate?: string;
  };
}

const isInvalidDueDate = (date: Dayjs | null): boolean => {
  if (!date) return false;

  const today = dayjs().startOf("day");
  const maxAllowedDate = today.add(2, "year").endOf("day");

  const isInPast = date.isBefore(today);
  const isMoreThanTwoYearsAhead = date.isAfter(maxAllowedDate);

  return isInPast || isMoreThanTwoYearsAhead;
};

const AddTaskModal = ({
  open,
  onClose,
  onSave,
  onEdit,
  task,
}: AddTaskModalProps) => {
  const [dueDate, setDueDate] = useState<Dayjs | null>(null);

  const [form, setForm] = useState({ title: "", description: "" });

  // Initialize form when task changes (for editing)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (open && task) {
      setForm({
        title: task.title,
        description: task.description ?? "",
      });
      setDueDate(task.dueDate ? dayjs(task.dueDate) : null);
    }

    if (open && !task) {
      setForm({
        title: "",
        description: "",
      });
      setDueDate(null);
    }
  }, [task, open]);

  const handleClose = () => {
    setForm({ title: "", description: "" });
    setDueDate(null);
    onClose();
  };
  // Check if form has changes compared to original task
  const hasChanges = task
    ? form.title !== task.title ||
      form.description !== (task.description ?? "") ||
      (task.dueDate ?? "") !== (dueDate?.format("YYYY-MM-DD") ?? "")
    : form.title.trim() !== "";

  const handleSave = () => {
    const title = normalizeText(form.title);
    const description = normalizeText(form.description);

    const formattedDueDate = dueDate ? dueDate.format("YYYY-MM-DD") : undefined;

    if (!title) return;

    if (task && onEdit) {
      // Edit mode
      onEdit(task.id, title, description, formattedDueDate);
    } else if (onSave) {
      // Add mode
      onSave(title, description, formattedDueDate);
      setForm({ title: "", description: "" });
    }
    onClose();
  };

  return (
    <Dialog
      key={`${open}-${task?.id}`}
      open={open}
      onClose={handleClose}
      fullWidth
      maxWidth="sm"
    >
      <DialogTitle sx={{ color: "black" }}>
        {task ? "Edit Task" : "Add Task"}
        <IconButton
          onClick={handleClose}
          sx={{ position: "absolute", right: 8, top: 8 }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent dividers>
        <Box display="flex" flexDirection="column" gap={2}>
          <TextField
            label="Title"
            placeholder="Enter Task Title"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            fullWidth
            autoFocus
          />

          <TextField
            label="Description"
            placeholder="Add a more detailed description"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            fullWidth
            multiline
            minRows={4}
          />

          <DatePicker
            label="Deadline"
            value={dueDate}
            onChange={(newValue) => setDueDate(newValue)}
            disablePast
            slotProps={{
              textField: {
                fullWidth: true,
                error: isInvalidDueDate(dueDate),
                helperText: isInvalidDueDate(dueDate)
                  ? "Deadline cannot be more than 2 years, a past month, and a past year"
                  : "",
              },
            }}
          />
        </Box>
      </DialogContent>

      <DialogActions>
        <Button onClick={handleClose}>Cancel</Button>
        <Button
          variant="contained"
          onClick={handleSave}
          disabled={!hasChanges || isInvalidDueDate(dueDate)}
        >
          {task ? "Update" : "Add"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AddTaskModal;
