# Backend Explanation for Mentor

## 1) High-level architecture

The backend is a layered Fastify + Knex service for a collaborative task board.

Main layers:

- Transport layer: Fastify routes and HTTP/SSE handling
- Validation layer: Zod schemas for request safety and type inference
- Service layer: Business orchestration and event publishing
- Data access layer: Knex SQL operations and persistence rules
- Realtime layer: In-memory pub/sub used by Server-Sent Events (SSE)

The design separates concerns so each file has one primary responsibility:

- routes: parse + validate + map status codes
- services: enforce workflow/business rules
- repo: all SQL and persistence details
- mapper: DB row shape to API DTO shape
- events: fan-out of realtime messages to connected clients

---

## 2) Entry point and app bootstrap

File: backend/src/server.ts

Responsibilities:

- Creates Fastify app instance (logger enabled)
- Registers CORS support
- Exposes health endpoint: GET /health
- Exposes SSE stream endpoint: GET /events
- Registers task CRUD routes
- Starts server on PORT env or 4000

Startup sequence:

1. Register CORS with GET/POST/PUT/DELETE/OPTIONS
2. Register GET /health for liveness checks
3. Register GET /events for realtime updates
4. Register task routes from tasks.route.ts
5. Listen on 0.0.0.0

Failure handling:

- If startup fails, error is logged and process exits with code 1.

---

## 3) Realtime mechanism (SSE + pub/sub)

Files:

- backend/src/server.ts
- backend/src/events/taskEvents.ts

How SSE works here:

- Client connects to GET /events.
- Response headers are set for text/event-stream and no buffering.
- A small initial comment line is written (: connected).
- A keepalive comment is written every 20 seconds to prevent idle disconnects.
- The connection subscribes to an in-memory listener set.
- On socket close, keepalive timer is cleared and listener is unsubscribed.

Pub/sub implementation details:

- taskEvents.ts keeps a Set of listener functions in memory.
- subscribe(listener): adds listener
- unsubscribe(listener): removes listener
- publish(event): loops listeners and sends event to each

Important architecture note:

- This pub/sub is process-local. It works for one backend process.
- In horizontal scaling (multiple instances), events will not automatically sync across instances unless you replace this with shared messaging (Redis pub/sub, Kafka, etc.).

---

## 4) Database setup and configuration

Files:

- backend/knexfile.ts
- backend/src/db.ts

Configuration:

- DB client: pg
- Connection values from environment variables:
  - DB_HOST, DB_PORT, DB_USER, DB_PASSWORD, DB_NAME
  - DATABASE_URL as an alternative connection string
- Same config object is currently used for development and production keys.

Runtime DB instance:

- db.ts chooses environment key using NODE_ENV:
  - production -> production
  - everything else -> development
- Exports a singleton Knex instance used across repositories/services.

Used by:

- backend/src/modules/tasks/tasks.repo.ts
- backend/src/events/taskEvents.ts (indirectly part of persistence-to-event flow via service)

---

## 5) Schema evolution via migrations

Key migrations:

- create_tasks_table:
  - id (auto increment primary key)
  - title (required)
  - description (nullable)
  - due_date (nullable date)
  - created_at (default now)
- add_status_to_tasks_table:
  - adds status column (default todo)
  - backfills null statuses to todo
- add_sort_index_to_tasks:
  - adds sort_index (default 0)
  - backfills existing rows with deterministic ordering

Why status + sort_index matter:

- status supports board columns (todo / in-progress / complete)
- sort_index preserves user-defined ordering within board views and drag-drop operations

---

## 6) Validation and API contracts

File: backend/src/modules/tasks/tasks.schema.ts

Zod schemas define acceptable request shapes:

1. createTaskSchema

- title: required non-empty string (trimmed)
- description: optional string
- dueDate: optional date string in YYYY-MM-DD format
- status: optional enum (todo, in-progress, complete)

2. taskIdParamsSchema

- id: coerced to positive integer

3. updateTaskSchema

- title, description, dueDate, status are optional
- description and dueDate can explicitly be null
- supports ordering payload in two forms:
  - orderedTaskIds: global order list
  - orderedByStatus: separate id arrays per status column

Type safety benefit:

- TypeScript types are inferred from schemas, reducing mismatch between runtime validation and compile-time typing.

---

## 7) Mapping layer

File: backend/src/modules/tasks/tasks.mapper.ts

Purpose:

- Convert DB-style fields to API-style DTO fields.

Examples:

- due_date -> dueDate
- created_at -> createdAt
- status null fallback -> todo
- sort_index null fallback -> 0

Why this matters:

- Decouples API contract from physical table naming.
- Centralizes normalization logic in one place.

---

## 8) Repository layer (SQL only)

File: backend/src/modules/tasks/tasks.repo.ts

Responsibilities:

- fetchAllTasks:
  - SELECT known task columns
  - Order by status bucket (todo -> in-progress -> complete)
  - Then order by sort_index asc
  - Then id desc for tie-break
- getNextSortIndexForStatus:
  - Finds max sort_index for a status and returns next index
- createTaskRecord:
  - INSERT and return mapped row
- updateTaskRecord:
  - Partial UPDATE by id with only provided fields
- reorderByStatus:
  - Transactionally updates status + sort_index for each status column order
- reorderByGlobalIds:
  - Transactionally updates sort_index for a global id list
- deleteTaskRecord:
  - DELETE by id

Design principle:

- No HTTP concerns, no event publishing, no response code logic.
- Pure persistence operations.

---

## 9) Service layer (business orchestration)

File: backend/src/modules/tasks/tasks.service.ts

Responsibilities by method:

1. listTasks

- Returns repository fetch result.

2. createTask

- Resolves default status to todo if omitted
- Computes next sort_index in target status
- Creates row
- Fetches full tasks snapshot
- Publishes realtime event: task-created
- Returns created task

3. updateTask

- Applies partial update
- If task not found -> returns null
- Applies reordering logic if ordering payload is present
- Fetches canonical snapshot after mutations
- Publishes event:
  - task-moved when status included
  - task-updated otherwise
- Returns canonical task state

4. deleteTask

- Deletes by id
- If not found -> returns 0
- Fetches updated snapshot
- Publishes task-deleted event
- Returns deleted count

Event payload strategy:

- Events include actor metadata and often include full tasks snapshot.
- This helps clients converge quickly to consistent UI state after each mutation.

---

## 10) Route layer (HTTP adaptation)

File: backend/src/modules/tasks/tasks.route.ts

Endpoints:

- GET /tasks
- POST /tasks
- PUT /tasks/:id
- DELETE /tasks/:id

Per-route behavior:

- Validates params/body with Zod safeParse.
- On invalid input: returns 400 with issue details.
- Calls service methods when valid.
- Maps service outcomes to status codes:
  - POST success -> 201
  - PUT missing task -> 404
  - DELETE missing task -> 404
  - DELETE success -> 204

Actor extraction:

- Reads x-actor-id, x-actor-name, x-actor-color headers.
- Falls back to default values when absent.
- Passes actor into service for event metadata.

---

## 11) Compatibility shim

File: backend/src/routes/tasks.ts

Role:

- Re-exports registerTaskRoutes from modules/tasks/tasks.route.ts.
- Preserves compatibility for older import paths while code is modularized.

---

## 12) End-to-end request flow examples

Example A: Create task

1. Client sends POST /tasks payload.
2. Route validates payload with createTaskSchema.
3. Service computes sort index + creates task via repo.
4. Service loads fresh task snapshot.
5. Service publishes task-created event.
6. SSE subscribers receive event on /events.
7. HTTP response returns 201 + created task.

Example B: Move task between columns

1. Client sends PUT /tasks/:id with status and ordering payload.
2. Route validates id + body.
3. Service updates base fields.
4. Service persists new ordering transactionally.
5. Service fetches canonical snapshot.
6. Service publishes task-moved event.
7. HTTP response returns updated canonical task.

Example C: Delete task

1. Client sends DELETE /tasks/:id.
2. Route validates id.
3. Service deletes row.
4. If deleted, service fetches snapshot and publishes task-deleted.
5. HTTP response is 204 (or 404 if not found).

---

## 13) Why this backend structure is solid for mentoring discussion

Strengths:

- Clear separation of concerns across route/service/repo/mapper.
- Runtime validation and compile-time types stay aligned via Zod inference.
- Realtime collaboration integrated with low complexity (SSE + in-memory pub/sub).
- Ordering logic is explicit and persisted (status + sort_index).
- Transaction usage for reorder operations protects consistency.

Current limitations / future improvements:

- In-memory pub/sub is single-instance only.
- Reordering loops issue many updates; could be optimized with bulk update patterns for larger boards.
- Could enforce stronger DB constraints/indexes for status + sort_index query patterns.
- Could introduce structured error classes for cleaner error mapping.

---

## 14) Short verbal summary you can present

This backend uses Fastify for transport, Zod for validation, Knex for SQL, and SSE for realtime updates. Routes only validate and map HTTP concerns, services orchestrate business actions and publish events, repositories perform all persistence, and a mapper keeps API DTOs independent from raw DB fields. Task movement and ordering are persisted using status and sort_index, and clients receive snapshot-based realtime updates after create, update/move, and delete operations.
