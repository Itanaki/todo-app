import { Box, Button, Card, CardContent, Typography, CircularProgress, TextField, Paper, List, ListItem, ListItemText, ListItemButton, Fab, IconButton, Dialog, DialogContent } from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import { useTheme } from "@mui/material/styles";
import useMediaQuery from "@mui/material/useMediaQuery";
import { useState, useRef, useMemo, useEffect } from "react";
import HelpModal from "../components/common/HelpModal";
import BoardColumn from "../components/board/BoardColumn";
import dayjs from "dayjs";
import { DndContext, DragOverlay, closestCorners } from "@dnd-kit/core";
import useBoardState from "../hooks/useBoardState";
import useBoardDragState from "../hooks/useBoardDragState";
import { getDueStyle } from "../utils/dueDate";
import {
  boardColumnsRowSx,
  boardPageContainerSx,
  boardPageOuterSx,
  loadingOverlaySx,
  loadingOverlayContentSx,
  boardPageSearchContainerSx,
  boardPageTextFieldSearchSx
} from "../styles/boardPageStyles";
import {
  getBoardCardContainerSx,
  getBoardCardDescSx,
  getBoardCardDueDateSx,
  getBoardCardSx,
  getBoardCardTitleSx,
} from "../styles/boardCardStyles";
import { createPortal } from "react-dom";

type BoardPageProps = {
  accessToken?: string | null;
  userLabel: string;
  onSignOut: () => void;
};

const BoardPage = ({ accessToken, userLabel, onSignOut }: BoardPageProps) => {
  const {
    columns,
    tasks,
    presence,
    renameColumn,
    addTask,
    moveTask,
    deleteTask,
    editTask,
    loading,
  } = useBoardState(accessToken);

  const [helpOpen, setHelpOpen] = useState(false);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);

  const [searchQuery, setSearchQuery] = useState("");
  const columnOpeners = useRef<Record<string, (task: any) => void>>({});
  const searchContainerRef = useRef<HTMLDivElement | null>(null);
  // Holds a task to open after the mobile search Dialog has fully exited
  const pendingMobileTask = useRef<Parameters<typeof columnOpeners.current[string]>[0] | null>(null);
  // Mirrors mobileSearchOpen for use in native event handlers without stale closure
  const mobileSearchOpenRef = useRef(false);
  useEffect(() => { mobileSearchOpenRef.current = mobileSearchOpen; }, [mobileSearchOpen]);

  const handleMobileSearchExited = () => {
    const task = pendingMobileTask.current;
    if (!task) return;
    pendingMobileTask.current = null;
    const opener = columnOpeners.current[task.status];
    if (opener) opener(task);
  };

  const searchResults = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return [];
    return tasks
      .filter((t) => {
        const title = (t.title ?? "").toLowerCase();
        const desc = (t.description ?? "").toLowerCase();
        return title.includes(q) || desc.includes(q);
      })
      .slice(0, 10);
  }, [tasks, searchQuery]);

  useEffect(() => {
    const onDocMouseDown = (ev: MouseEvent) => {
      // Skip when mobile dialog is open — the dialog Portal is outside searchContainerRef
      // and would incorrectly clear the query before the ListItemButton click fires
      if (mobileSearchOpenRef.current) return;
      const node = searchContainerRef.current;
      if (!node) return;
      const target = ev.target as Node | null;
      if (target && !node.contains(target)) {
        setSearchQuery("");
      }
    };

    const onDocKeyDown = (ev: KeyboardEvent) => {
      if (ev.key === "Escape") {
        setSearchQuery("");
        const input = searchContainerRef.current?.querySelector("input") as HTMLInputElement | null;
        input?.blur();
      }
    };

    document.addEventListener("mousedown", onDocMouseDown);
    document.addEventListener("keydown", onDocKeyDown);
    return () => {
      document.removeEventListener("mousedown", onDocMouseDown);
      document.removeEventListener("keydown", onDocKeyDown);
    };
  }, []);

  const theme = useTheme();
  const isSmall = useMediaQuery(theme.breakpoints.down("sm"));
  const isLarge = useMediaQuery(theme.breakpoints.up("lg"));

  const {
    sensors,
    activeTask,
    overColumnStatus,
    handleDragStart,
    handleDragOver,
    handleDragEnd,
    handleDragCancel,
  } = useBoardDragState({ tasks, moveTask });

  return (
    <Box sx={boardPageOuterSx}>
      <Box sx={boardPageContainerSx}>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 2,
            mb: 3,
          }}
        >
          <Box>
            <Typography variant="body2" color="text.secondary">
              Signed in as <strong>{userLabel}</strong>
            </Typography>
          </Box>

          <Box sx={boardPageSearchContainerSx} ref={searchContainerRef}>
            {!isSmall ? (
              <>
                <TextField
                  fullWidth
                  size="small"
                  sx={boardPageTextFieldSearchSx}
                  placeholder="Search tasks, descriptions..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />

                {searchResults.length > 0 && (
                  <Paper sx={{ position: "absolute", left: 0, right: 0, mt: 1, zIndex: 1300 }}>
                    <List dense disablePadding>
                      {searchResults.map((res) => (
                        <ListItem key={res.id} disablePadding>
                          <ListItemButton
                            disabled={res.status === "complete"}
                            onClick={() => {
                              if (res.status === "complete") return;
                              const opener = columnOpeners.current[res.status];
                              if (opener) opener(res);
                              setSearchQuery("");
                            }}
                          >
                            <ListItemText
                              primary={res.title}
                              secondary={
                                <>
                                  <div>{res.description}</div>
                                  <div style={{ fontSize: 12, color: "rgba(0,0,0,0.6)" }}>
                                    {columns.find((c) => c.id === res.status)?.label ?? res.status}
                                  </div>
                                </>
                              }
                            />
                          </ListItemButton>
                        </ListItem>
                      ))}
                    </List>
                  </Paper>
                )}
              </>
              ) : (
              <IconButton
                aria-label="open search"
                onClick={(e) => {
                  e.currentTarget.blur();
                  setMobileSearchOpen(true);
                }}
              >
                <SearchIcon />
              </IconButton>
            )}
          </Box>

          <Button variant="contained" color="primary" 
          onClick={onSignOut}>
            Sign out
          </Button>
        </Box>

        {/* Mobile search dialog */}
        <Dialog open={mobileSearchOpen} onClose={() => setMobileSearchOpen(false)} fullWidth TransitionProps={{ onExited: handleMobileSearchExited }}>
          <DialogContent>
            <TextField
              autoFocus
              fullWidth
              size="small"
              placeholder="Search tasks, descriptions..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />

            {searchResults.length > 0 && (
              <Paper sx={{ mt: 1 }}>
                <List dense disablePadding>
                  {searchResults.map((res) => (
                    <ListItem key={res.id} disablePadding>
                      <ListItemButton
                        disabled={res.status === "complete"}
                        onClick={() => {
                          if (res.status === "complete") return;
                          pendingMobileTask.current = res;
                          setSearchQuery("");
                          setMobileSearchOpen(false);
                        }}
                      >
                        <ListItemText
                          primary={res.title}
                          secondary={
                            <>
                              <div>{res.description}</div>
                              <div style={{ fontSize: 12, color: "rgba(0,0,0,0.6)" }}>
                                {columns.find((c) => c.id === res.status)?.label ?? res.status}
                              </div>
                            </>
                          }
                        />
                      </ListItemButton>
                    </ListItem>
                  ))}
                </List>
              </Paper>
            )}
          </DialogContent>
        </Dialog>

        <Box sx={boardColumnsRowSx}>
          <DndContext
            sensors={sensors}
            collisionDetection={closestCorners}
            onDragStart={handleDragStart}
            onDragOver={handleDragOver}
            onDragEnd={handleDragEnd}
            onDragCancel={handleDragCancel}
          >
            {columns.map((col) => (
              <BoardColumn
                key={col.id}
                status={col.id}
                title={col.label}
                tasks={tasks}
                presence={presence}
                registerOpenEdit={(status, fn) => {
                  columnOpeners.current[status] = fn;
                }}
                onAddTask={addTask}
                onEditTask={editTask}
                onDeleteTask={deleteTask}
                onRename={renameColumn}
                isDragHover={overColumnStatus === col.id}
              />
            ))}

            {typeof document !== "undefined"
              ? createPortal(
                  <DragOverlay zIndex={2000}>
                    {activeTask ? (
                      <Card
                        sx={{
                          ...getBoardCardContainerSx,
                          width: 268,
                          mb: 0,
                          cursor: "grabbing",
                        }}
                      >
                        <CardContent sx={getBoardCardSx}>
                          <Typography
                            variant="body1"
                            fontWeight={500}
                            sx={getBoardCardTitleSx}
                          >
                            {activeTask.title}
                          </Typography>

                          {activeTask.description && (
                            <Typography
                              variant="body2"
                              color="text.secondary"
                              mt={1}
                              sx={getBoardCardDescSx}
                            >
                              {activeTask.description}
                            </Typography>
                          )}

                          {activeTask.dueDate && (
                            <Box
                              sx={getBoardCardDueDateSx(
                                getDueStyle(activeTask.dueDate),
                              )}
                            >
                              Due {dayjs(activeTask.dueDate).format("MMM D")}
                            </Box>
                          )}
                        </CardContent>
                      </Card>
                    ) : null}
                  </DragOverlay>,
                  document.body,
                )
              : null}
          </DndContext>
        </Box>
        {loading && typeof document !== "undefined"
          ? createPortal(
              <Box role="status" aria-busy={true} sx={loadingOverlaySx}>
                <Box sx={loadingOverlayContentSx}>
                  <CircularProgress color="inherit" />
                  <Typography variant="h6">Loading tasks…</Typography>
                </Box>
              </Box>,
              document.body,
            )
          : null}
        {/* Help FAB positioned inside the container (bottom-right) for small/medium screens */}
        {!isLarge && (
          <Fab
            color="primary"
            size="small"
            aria-label="help"
            onClick={(e) => {
              e.currentTarget.blur();
              setHelpOpen(true);
            }}
            sx={{
              position: "absolute",
              right: 16,
              bottom: 16,
              zIndex: 1500,
            }}
          >
            ?
          </Fab>
        )}
      </Box>
      {/* Help FAB fixed at top-right for large desktop screens */}
      {isLarge && (
        <Fab
          color="primary"
          size="small"
          aria-label="help"
          onClick={(e) => {
            e.currentTarget.blur();
            setHelpOpen(true);
          }}
          sx={{
            position: "fixed",
            right: 16,
            top: 16,
            zIndex: 1500,
          }}
        >
          ?
        </Fab>
      )}

      {/* Help modal */}
      <HelpModal open={helpOpen} onClose={() => setHelpOpen(false)} columns={columns} />
    </Box>
  );
};

export default BoardPage;
