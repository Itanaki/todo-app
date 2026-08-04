import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Box, Typography, Stack } from "@mui/material";
import { getDueStyle } from "../../utils/dueDate";

type Props = {
  open: boolean;
  onClose: () => void;
};

export function DueDateColorsContent() {
  const examples = [
    { label: "Overdue", date: "2020-01-01" },
    { label: "Due soon", date: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() },
    { label: "Upcoming", date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() },
  ];

  return (
    <>
      <Typography variant="body2" color="text.secondary" gutterBottom>
        The board highlights task due dates to show urgency. Below are the colors used:
      </Typography>

      <Stack spacing={2} sx={{ mt: 1 }}>
        {examples.map((ex) => {
          const style = getDueStyle(ex.date);
          return (
            <Box key={ex.label} display="flex" alignItems="center" gap={2}>
              <Box sx={{ width: 56, height: 32, borderRadius: 1, backgroundColor: style.bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Typography variant="caption" sx={{ color: style.text, fontWeight: 700 }}>
                  {style.label}
                </Typography>
              </Box>

              <Box>
                <Typography fontWeight={600}>{ex.label}</Typography>
                <Typography variant="body2" color="text.secondary">bg: {style.bg} • text: {style.text}</Typography>
              </Box>
            </Box>
          );
        })}
      </Stack>
    </>
  );
}

export default function DueDateColorsModal({ open, onClose }: Props) {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle>Due Date Colors</DialogTitle>

      <DialogContent dividers>
        <DueDateColorsContent />
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose} variant="outlined">Close</Button>
      </DialogActions>
    </Dialog>
  );
}
