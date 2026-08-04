import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  IconButton,
  Avatar,
  Stack,
  Divider,
} from "@mui/material";
import HelpOutlineIcon from "@mui/icons-material/HelpOutline";
import AddTaskIcon from "@mui/icons-material/Add";
import DragIcon from "@mui/icons-material/OpenWith";
import EditIcon from "@mui/icons-material/Edit";
import SearchIcon from "@mui/icons-material/Search";
import CloseIcon from "@mui/icons-material/Close";
import {
  dialogTitleSx,
  avatarSx,
  dialogContentSx,
  listItemSx,
  dialogActionsSx,
  captionSx,
} from "../../styles/helpModalStyles";
import React, { useState } from "react";
import columnDescriptions from "../../config/columnDescriptions";
import { Tabs, Tab } from "@mui/material";
import { DueDateColorsContent } from "./DueDateColorsModal";

type HelpModalProps = {
  open: boolean;
  onClose: () => void;
  columns?: { id: string; label: string }[];
};

export default function HelpModal({ open, onClose, columns }: HelpModalProps) {
  const [tab, setTab] = useState(0);

  const handleTabChange = (ev: React.SyntheticEvent, value: number) => {
    void ev;
    setTab(value);
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      aria-labelledby="help-dialog-title"
    >
      <DialogTitle sx={dialogTitleSx} id="help-dialog-title">
        <Stack direction="row" alignItems="center" spacing={2}>
          <Avatar sx={avatarSx}>
            <HelpOutlineIcon />
          </Avatar>
          <div>
            <Typography variant="h6" color="text.primary">Help & Quick Start</Typography>
            <Typography variant="caption" sx={captionSx}>
              A few tips to get you started (30s)
            </Typography>
          </div>
        </Stack>

        <IconButton
          aria-label="close help"
          onClick={onClose}
          size="small"
          sx={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)" }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <Divider />
      <Tabs value={tab} onChange={handleTabChange} variant="fullWidth" sx={{ px: 2 }}>
        <Tab label="Quick Start" />
        <Tab label="Due Date Colors" />
        <Tab label="Columns" />
      </Tabs>

      <DialogContent dividers sx={dialogContentSx}>
        {tab === 0 && (
          <>
            <List disablePadding>
              <ListItem sx={listItemSx}>
                <ListItemIcon>
                  <AddTaskIcon color="primary" />
                </ListItemIcon>
                <ListItemText
                  primary={<Typography fontWeight={600}>Add a task</Typography>}
                  secondary={<Typography color="text.secondary">Use the + Add Task button in a column to create a task quickly.</Typography>}
                />
              </ListItem>

              <ListItem sx={listItemSx}>
                <ListItemIcon>
                  <DragIcon color="primary" />
                </ListItemIcon>
                <ListItemText
                  primary={<Typography fontWeight={600}>Move tasks</Typography>}
                  secondary={<Typography color="text.secondary">Drag and drop cards between columns to update their status.</Typography>}
                />
              </ListItem>

              <ListItem sx={listItemSx}>
                <ListItemIcon>
                  <EditIcon color="primary" />
                </ListItemIcon>
                <ListItemText
                  primary={<Typography fontWeight={600}>Edit / Delete</Typography>}
                  secondary={<Typography color="text.secondary">Open a task to edit details or delete it. Changes sync in real time.</Typography>}
                />
              </ListItem>

              <ListItem sx={listItemSx}>
                <ListItemIcon>
                  <SearchIcon color="primary" />
                </ListItemIcon>
                <ListItemText
                  primary={<Typography fontWeight={600}>Search</Typography>}
                  secondary={<Typography color="text.secondary">Use the search bar to quickly locate tasks by title or description.</Typography>}
                />
              </ListItem>
            </List>

            <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
              For more detailed guides and keyboard shortcuts, visit the Docs page or reach out to the project owner.
            </Typography>
          </>
        )}

        {tab === 1 && <DueDateColorsContent />}

        {tab === 2 && (
          <>
            <Typography variant="body1" fontWeight={600} sx={{ mb: 1 }}>
              How columns work
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
              Columns represent task status. You can rename columns to fit your workflow. Describe each column below:
            </Typography>
            <List disablePadding>
              {(columns && columns.length > 0 ? columns : [
                { id: "todo", label: "Todo" },
                { id: "in-progress", label: "In-Progress" },
                { id: "complete", label: "Completed" },
              ]).map((c) => (
                <ListItem key={c.id} sx={listItemSx}>
                  <ListItemText
                    primary={<Typography fontWeight={600}>{c.label}</Typography>}
                    secondary={<Typography color="text.secondary">{columnDescriptions[c.id] ?? "(No description provided)"}</Typography>}
                  />
                </ListItem>
              ))}
            </List>
          </>
        )}
      </DialogContent>

      <DialogActions sx={dialogActionsSx}>
        <Button disabled={tab === 0} onClick={() => setTab((t) => Math.max(0, t - 1))}>
          Back
        </Button>

        <Button disabled={tab === 2} onClick={() => setTab((t) => Math.min(2, t + 1))}>
          Next
        </Button>

        <Button onClick={onClose} variant="outlined" color="primary">
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
}
