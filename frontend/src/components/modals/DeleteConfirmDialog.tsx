import {
  Dialog,
  DialogTitle,
  DialogActions,
  Button,
  Typography,
  DialogContent,
} from "@mui/material";

interface DeleteConfirmDialogProps {
  open: boolean;
  title?: string;
  description?: string;
  onConfirm: () => void;
  onCancel: () => void;
}

const DeleteConfirmDialog = ({
  open,
  title = "Delete Task?",
  description,
  onConfirm,
  onCancel,
}: DeleteConfirmDialogProps) => {
  return (
    <Dialog open={open} onClose={onCancel}>
      <DialogTitle sx={{ color: "black", fontWeight: "bold" }}>
        {title}
      </DialogTitle>

      <DialogContent>
        <Typography variant="body2" color="text.secondary">
          {description}
        </Typography>
      </DialogContent>

      <DialogActions>
        <Button onClick={onCancel}>Cancel</Button>
        <Button color="error" variant="contained" onClick={onConfirm}>
          Delete
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default DeleteConfirmDialog;
