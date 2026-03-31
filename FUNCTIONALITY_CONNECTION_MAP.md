# Functionality and Connection Map

This is a practical map of what each major file does and how files connect.

## 1) Directory Overview

## Root

- backend: API, DB integration, real-time events
- frontend: UI, board interactions, real-time listeners

## Backend Core

- backend/src/server.ts
- backend/src/db.ts
- backend/src/events/taskEvents.ts
- backend/src/modules/tasks/\*
- backend/src/routes/tasks.ts

## Frontend Core

- frontend/src/pages/BoardPage.tsx
- frontend/src/components/board/\*
- frontend/src/hooks/\*
- frontend/src/services/\*
- frontend/src/types/\*

## 2) Backend File-by-File

### backend/src/server.ts

- Creates Fastify app.
- Registers CORS and health route.
- Hosts SSE endpoint /events.
- Registers task routes.

Depends on:

- backend/src/events/taskEvents.ts
- backend/src/modules/tasks/tasks.route.ts

### backend/src/db.ts

- Creates Knex instance using knexfile.ts environment config.

Used by:

- backend/src/modules/tasks/tasks.repo.ts

### backend/src/events/taskEvents.ts

- In-memory pub/sub listener set.
- subscribe, unsubscribe, publish used by SSE flow.

Used by:

- backend/src/server.ts
- backend/src/modules/tasks/tasks.service.ts

### backend/src/modules/tasks/tasks.schema.ts

- Zod schemas for create/update and id params.
- Defines accepted payload shapes.

Used by:

- backend/src/modules/tasks/tasks.route.ts
- backend/src/modules/tasks/tasks.service.ts (types)

### backend/src/modules/tasks/tasks.mapper.ts

- Maps DB row fields to API DTO fields.
- Handles null/default normalization for status/sortIndex.

Used by:

- backend/src/modules/tasks/tasks.repo.ts

### backend/src/modules/tasks/tasks.repo.ts

- All SQL reads/writes for tasks.
- Handles ordered fetch and sort_index persistence.

Used by:

- backend/src/modules/tasks/tasks.service.ts

### backend/src/modules/tasks/tasks.service.ts

- Business orchestration:
  - create, update/move, delete, list
  - reorder persistence
  - event publish with task snapshots

Used by:

- backend/src/modules/tasks/tasks.route.ts

### backend/src/modules/tasks/tasks.route.ts

- HTTP handlers for:
  - GET /tasks
  - POST /tasks
  - PUT /tasks/:id
  - DELETE /tasks/:id
- Validates requests and maps status codes.

Used by:

- backend/src/server.ts

### backend/src/routes/tasks.ts

- Re-export shim for registerTaskRoutes.
- Keeps compatibility for older imports.

## 3) Frontend File-by-File

### frontend/src/pages/BoardPage.tsx

- Main board screen.
- Renders columns and drag overlay.
- Uses useBoardState and useBoardDragState.

Depends on:

- frontend/src/hooks/useBoardState.ts
- frontend/src/hooks/useBoardDragState.ts
- frontend/src/components/board/BoardColumn.tsx

### frontend/src/components/board/BoardColumn.tsx

- Renders one board column and its task cards.
- Hosts add/edit/delete modals.
- Handles rename actions.

Depends on:

- frontend/src/hooks/useBoardColumnUiState.ts
- frontend/src/components/board/BoardCard.tsx
- frontend/src/components/modals/\*

### frontend/src/components/board/BoardCard.tsx

- Renders individual task card.
- Sortable draggable item.
- Shows presence name/color highlight.

Depends on:

- frontend/src/types/todo.ts
- dnd-kit sortable hooks

### frontend/src/hooks/useBoardState.ts

- Composition hook for board-level state.
- Coordinates initial load, renameColumn, and combines task hooks.

Depends on:

- frontend/src/hooks/useTaskOperations.ts
- frontend/src/hooks/useTaskRealtimeSync.ts

### frontend/src/hooks/useTaskOperations.ts

- CRUD and move operation functions.
- Builds orderedByStatus payload on move.

Depends on:

- frontend/src/services/tasks.services.ts

### frontend/src/hooks/useTaskRealtimeSync.ts

- EventSource subscription to /events.
- Applies snapshot updates to tasks.
- Handles temporary presence highlights.

Depends on:

- frontend/src/types/realtime.ts

### frontend/src/hooks/useBoardDragState.ts

- dnd-kit drag state management.
- Calls moveTask on drag end.

Depends on:

- frontend/src/types/todo.ts

### frontend/src/hooks/useBoardColumnUiState.ts

- Per-column modal and delete confirmation state.
- Filters tasks by column status.

### frontend/src/services/tasks.services.ts

- HTTP API adapter for tasks.
- Adds actor headers for collaboration metadata.

Depends on:

- frontend/src/services/collabIdentity.ts

### frontend/src/services/collabIdentity.ts

- Per-tab identity (id, name, color) using sessionStorage.

### frontend/src/types/todo.ts

- Todo and TodoStatus types.

### frontend/src/types/realtime.ts

- Typed realtime event payload shapes and presence types.

## 4) Runtime Data Flow

## Create Task

1. UI triggers addTask in useTaskOperations.
2. tasks.services POST /tasks with actor headers.
3. backend route validates -> service -> repo insert.
4. service publishes task-created with tasks snapshot.
5. all tabs receive SSE and replace tasks state from snapshot.

## Move/Reorder Task

1. Drag end calls moveTask.
2. Frontend computes orderedByStatus and sends PUT /tasks/:id.
3. Backend updates status and sort_index values.
4. service publishes task-moved with full snapshot.
5. listening tabs replace tasks state with exact canonical snapshot.

## Delete Task

1. UI triggers deleteTask.
2. API DELETE /tasks/:id.
3. backend deletes and publishes task-deleted with snapshot.
4. tabs replace tasks from snapshot.

## 5) Scalability Notes

- Task module in backend is already layered (route/service/repo/schema/mapper).
- Frontend board logic is split by concern (drag, realtime, operations, ui state).
- Next recommended scaling step is test coverage around move/reorder and event ordering.
