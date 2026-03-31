# Bug Triage and Navigation Guide

This guide helps you quickly find where to debug issues in the Todo app.

## 1) Quick System Mental Model

- Frontend state and collaboration are managed in hooks under frontend/src/hooks.
- API calls are centralized in frontend/src/services/tasks.services.ts.
- Backend HTTP entry is backend/src/server.ts.
- Backend task domain is split into route/schema/service/repo/mapper under backend/src/modules/tasks.
- Real-time sync is Server-Sent Events via backend/src/server.ts (/events) and frontend/src/hooks/useTaskRealtimeSync.ts.

## 2) First Checks Before Debugging

- Confirm backend is running on port 4000.
- Confirm frontend is running on Vite port (usually 5173 or 5174).
- Confirm browser console has no CORS/SSE errors.
- Confirm DB migrations are up to date.

Useful commands:

- Backend: npm run migrate:latest
- Backend: npm run dev
- Frontend: npm run dev

## 3) Symptom -> Where to Debug

### A) Task creates/updates/deletes fail

Frontend side:

- frontend/src/services/tasks.services.ts
- frontend/src/hooks/useTaskOperations.ts

Backend side:

- backend/src/modules/tasks/tasks.route.ts
- backend/src/modules/tasks/tasks.service.ts
- backend/src/modules/tasks/tasks.repo.ts

### B) Task status does not update after drag/drop

Frontend side:

- frontend/src/hooks/useBoardDragState.ts
- frontend/src/hooks/useTaskOperations.ts (moveTask)

Backend side:

- backend/src/modules/tasks/tasks.schema.ts (status validation)
- backend/src/modules/tasks/tasks.service.ts (updateTask)
- backend/src/modules/tasks/tasks.repo.ts (status/sort persistence)

### C) Order mismatch between tabs

Frontend side:

- frontend/src/hooks/useTaskRealtimeSync.ts (snapshot application)
- frontend/src/hooks/useTaskOperations.ts (orderedByStatus payload)

Backend side:

- backend/src/modules/tasks/tasks.service.ts (event publishing)
- backend/src/modules/tasks/tasks.repo.ts (sort_index writes and ordered fetch)

DB side:

- tasks table columns status and sort_index

### D) Real-time updates not appearing

Frontend side:

- frontend/src/hooks/useTaskRealtimeSync.ts (EventSource setup)

Backend side:

- backend/src/server.ts (/events endpoint, SSE headers)
- backend/src/events/taskEvents.ts (subscribe/publish bus)

### E) Duplicate card in UI but single DB row

Frontend side:

- frontend/src/hooks/useTaskOperations.ts (addTask upsert behavior)
- frontend/src/hooks/useTaskRealtimeSync.ts (task-created handling)

## 4) Backend File Responsibilities (Debug Order)

For any task-related backend bug, inspect in this order:

1. backend/src/modules/tasks/tasks.route.ts
2. backend/src/modules/tasks/tasks.schema.ts
3. backend/src/modules/tasks/tasks.service.ts
4. backend/src/modules/tasks/tasks.repo.ts
5. backend/src/modules/tasks/tasks.mapper.ts

Reason:

- route: request/response wiring
- schema: payload constraints
- service: business logic and event orchestration
- repo: actual SQL writes/reads
- mapper: DTO shape returned to frontend

## 5) Frontend File Responsibilities (Debug Order)

For board behavior bugs, inspect in this order:

1. frontend/src/hooks/useBoardDragState.ts
2. frontend/src/hooks/useTaskOperations.ts
3. frontend/src/hooks/useTaskRealtimeSync.ts
4. frontend/src/hooks/useBoardState.ts
5. frontend/src/components/board/BoardColumn.tsx
6. frontend/src/components/board/BoardCard.tsx

## 6) Fast SQL Checks

Use this to inspect canonical order by column:

SELECT id, title, status, sort_index
FROM tasks
ORDER BY
CASE status
WHEN 'todo' THEN 0
WHEN 'in-progress' THEN 1
WHEN 'complete' THEN 2
ELSE 3
END,
sort_index ASC,
id DESC;

## 7) If You Need to Scale Next

Recommended next steps:

- Add board_version to event payloads to ignore stale events.
- Add API integration tests for move/reorder flows.
- Add logger context (actor id, task id, event type) to backend task service.
- Add an in-UI connection status indicator for EventSource health.
