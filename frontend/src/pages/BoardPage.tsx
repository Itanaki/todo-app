import { Box, Button, Card, CardContent, Typography } from "@mui/material";
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
  boardPageTitleSx,
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
  } = useBoardState(accessToken);

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
            <Typography variant="h4" gutterBottom sx={boardPageTitleSx}>
              Todo Board
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Signed in as {userLabel}
            </Typography>
          </Box>

          <Button variant="outlined" onClick={onSignOut}>
            Sign out
          </Button>
        </Box>

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
      </Box>
    </Box>
  );
};

export default BoardPage;
