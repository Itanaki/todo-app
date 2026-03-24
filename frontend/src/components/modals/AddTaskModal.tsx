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

interface AddTaskModalProps {
  open: boolean;
  onClose: () => void;
  onSave?: (title: string, description?: string) => void;
  onEdit?: (id: number, title: string, description?: string) => void;
  task?: {
    id: number;
    title: string;
    description?: string;
  };
}

const AddTaskModal = ({
  open,
  onClose,
  onSave,
  onEdit,
  task,
}: AddTaskModalProps) => {
  const [form, setForm] = useState({ title: "", description: "" });

  // Initialize form when task changes (for editing)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (open && task) {
      setForm({ title: task.title, description: task.description ?? "" });
    }
  }, [task, open]);

  const handleClose = () => {
    setForm({ title: "", description: "" });
    onClose();
  };
  // Check if form has changes compared to original task
  const hasChanges = task
    ? form.title !== task.title || form.description !== (task.description ?? "")
    : form.title.trim() !== "";

  const handleSave = () => {
    if (!form.title.trim()) return;

    if (task && onEdit) {
      // Edit mode
      onEdit(task.id, form.title, form.description);
    } else if (onSave) {
      // Add mode
      onSave(form.title, form.description);
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
      <DialogTitle>
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
        </Box>
      </DialogContent>

      <DialogActions>
        <Button onClick={handleClose}>Cancel</Button>
        <Button variant="contained" onClick={handleSave} disabled={!hasChanges}>
          {task ? "Update" : "Add"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AddTaskModal;
