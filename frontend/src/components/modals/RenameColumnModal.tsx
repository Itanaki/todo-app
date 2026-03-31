import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
} from "@mui/material";
import { useEffect, useState } from "react";
import { normalizeText } from "../../utils/normalizeSpacing";
interface RenameColumnModalProps {
  open: boolean;
  currentName: string;
  onClose: () => void;
  onSave: (newName: string) => void;
}

const RenameColumnModal = ({
  open,
  currentName,
  onClose,
  onSave,
}: RenameColumnModalProps) => {
  const [name, setName] = useState(currentName);

  useEffect(() => {
    setName(currentName);
  }, [currentName]);

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="xs">
      <DialogTitle sx={{ color: "black" }}>Rename Column</DialogTitle>

      <DialogContent>
        <TextField
          autoFocus
          fullWidth
          label="Column Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          onBlur={() => setName((prev) => prev.trim())}
          margin="normal"
        />
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>

        <Button
          variant="contained"
          onClick={() => {
            const normalized = normalizeText(name);
            if (normalized) {
              onSave(normalized);
            }
          }}
        >
          Save
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default RenameColumnModal;
