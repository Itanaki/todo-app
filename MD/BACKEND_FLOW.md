# Backend Quick Walkthrough

## Startup (server.ts)

Create Fastify app, register CORS, add `/health` endpoint, set up `/events` for SSE, register task routes, listen on port.

## Real-Time (taskEvents.ts)

In-memory pub/sub using a Set of listeners. `subscribe()`, `unsubscribe()`, `publish()` — that's it. SSE clients connect to `/events` and receive events in real-time.

## Database (knexfile.ts, db.ts)

Postgres connection config from env vars or DATABASE_URL. Knex query builder creates a singleton db instance.

## Modules Structure (backend/src/modules/tasks/)

The `modules` folder organizes features by domain. Each module is self-contained with all layers in one place:

- **tasks.schema.ts** — Zod validation schemas (createTaskSchema, updateTaskSchema, taskIdParamsSchema) + type inference
- **tasks.mapper.ts** — Convert DB rows to API Data Transfer Objects (due_date → dueDate, null status → 'todo', null sort_index → 0)
- **tasks.repo.ts** — Pure SQL operations (fetchAllTasks, createTaskRecord, updateTaskRecord, deleteTaskRecord, reorderByStatus, reorderByGlobalIds)
- **tasks.service.ts** — Business logic (createTask, updateTask, deleteTask, listTasks) + event publishing
- **tasks.route.ts** — HTTP handlers (GET/POST/PUT/DELETE) + param validation + status code mapping

Shim: `backend/src/routes/tasks.ts` re-exports registerTaskRoutes for backwards compatibility.

## Migrations

1. Create tasks table (id, title, description, due_date, created_at)
2. Add status column (defaults to 'todo')
3. Add sort_index column (for ordering)

## Request Flow

**POST /tasks** → Validate with Zod → Extract actor from headers → Call service

**Service:**

- Compute next sort_index for status
- Create task in repo
- Fetch all tasks snapshot
- Publish `task-created` event
- Return task

**Repo:** Pure SQL INSERT, RETURNING the row

**Mapper:** Convert DB fields to API DTOs (due_date → dueDate, null status → 'todo', etc.)

**Route Response:** Return 201 with task

**Real-Time:** All `/events` clients receive the event instantly with the full snapshot

## Other endpoints

- **GET /tasks** → Fetch all (ordered by status, sort_index, id)
- **PUT /tasks/:id** → Update + optional reorder (transactional)
- **DELETE /tasks/:id** → Delete + publish event

## Why it works

- Routes validate + extract context
- Services handle logic + events
- Repos are pure SQL
- Mappers decouple API from DB schema
- Every mutation → realtime event + snapshot to all clients
