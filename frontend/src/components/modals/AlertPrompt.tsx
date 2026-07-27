import { Snackbar, IconButton, Box, Alert } from "@mui/material";
import type { AlertColor } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";

interface WarningAlertProps {
  open: boolean;
  message: string;
  severity?: AlertColor;
  autoHideDuration?: number;
  onClose: () => void;
  action?: React.ReactNode;
}

const WarningAlert = ({
  open,
  message,
  severity = "warning",
  onClose,
  action,
}: WarningAlertProps) => {
  return (
    <Snackbar
      open={open}
      onClose={onClose}
      anchorOrigin={{ vertical: "top", horizontal: "center" }}
    >
      <Alert
        severity={severity}
        variant="filled"
        sx={{ width: "100%" }}
        action={
          <Box display="flex" alignItems="center" gap={1}>
            {action}
            <IconButton size="small" color="inherit" onClick={onClose}>
              <CloseIcon fontSize="small" />
            </IconButton>
          </Box>
        }
      >
        {message}
      </Alert>
    </Snackbar>
  );
};

export default WarningAlert;
