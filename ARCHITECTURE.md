# Todo App Architecture and Functional Connections

## Overview

This application is currently frontend-first, with a Kanban-style board UI for todos.
The backend folder exists but is not implemented yet.

Core flow:

- App bootstraps in frontend/src/main.tsx
- Global providers and theme are set in frontend/src/app/App.tsx
- Board screen is rendered by frontend/src/pages/BoardPage.tsx
- Board state logic is handled in frontend/src/hooks/useBoardState.ts
- Column-level UI state logic is handled in frontend/src/hooks/useBoardColumnUiState.ts
- Visual components live in frontend/src/components

## Directory Responsibilities

### backend

- Current status: empty
- Intended role: API and data persistence layer in the future

### frontend/src/app

- frontend/src/app/App.tsx: App shell and global providers
- frontend/src/app/theme.ts: MUI theme and CssBaseline/global style setup

### frontend/src/pages

- frontend/src/pages/BoardPage.tsx: page-level composition and drag-end orchestration

### frontend/src/components/board

- frontend/src/components/board/BoardColumn.tsx: one board column, integrates cards and modals
- frontend/src/components/board/BoardCard.tsx: task card display and actions
- frontend/src/components/board/BoardColumns.ts: default board column definitions

### frontend/src/components/modals

- frontend/src/components/modals/AddTaskModal.tsx: add/edit task form modal
- frontend/src/components/modals/DeleteConfirmDialog.tsx: delete confirmation
- frontend/src/components/modals/RenameColumnModal.tsx: column rename modal

### frontend/src/hooks

- frontend/src/hooks/useBoardState.ts: board domain state and actions
- frontend/src/hooks/useBoardColumnUiState.ts: per-column UI interactions and droppable behavior

### frontend/src/styles

- frontend/src/styles/boardPageStyles.ts: page-level style objects
- frontend/src/styles/boardColumnStyles.ts: column-level style objects
- frontend/src/styles/boardCardStyles.ts: card-level style objects

### frontend/src/types

- frontend/src/types/todo.ts: todo model and status types
- frontend/src/types/column.ts: board column model types

### frontend/src/utils

- frontend/src/utils/dueDate.ts: due-date status style helper

### frontend/src/services

- Current status: empty
- Intended role: API clients, persistence adapters, and side-effect-based data access

## Functional Connection Map

### Startup and Providers

1. frontend/src/main.tsx mounts React root
2. frontend/src/app/App.tsx wraps app with:

- MUI ThemeProvider and CssBaseline
- Date localization provider for date picker usage

### Board Data and Rendering

1. frontend/src/pages/BoardPage.tsx calls frontend/src/hooks/useBoardState.ts
2. useBoardState provides:

- columns and tasks
- actions: add, edit, move, delete, rename

3. BoardPage renders one frontend/src/components/board/BoardColumn.tsx per column

### Column UI Behavior

1. frontend/src/components/board/BoardColumn.tsx uses frontend/src/hooks/useBoardColumnUiState.ts
2. useBoardColumnUiState handles:

- modal open/close state
- selected task for edit
- delete target and confirmation lifecycle
- filtered tasks per status
- droppable state for drag-and-drop hover feedback

### Task Card and Due Date

1. frontend/src/components/board/BoardCard.tsx renders each todo
2. Due-date visual tone is derived from frontend/src/utils/dueDate.ts
3. Card visual styles come from frontend/src/styles/boardCardStyles.ts

## Current Architectural Pattern

- Page component orchestrates board-level state and DnD events
- Hooks encapsulate reusable behavior:
- domain state hook for board logic
- UI state hook for column interactions
- Components focus on rendering and callbacks
- Styles are centralized in style modules
- Utilities hold pure helper logic
- Services are reserved for external data concerns (planned)

## Future Growth Path

1. Add persistence/API in frontend services
2. Keep hooks as orchestration points that call services
3. Keep components presentational and event-driven
4. Add backend endpoints when backend implementation starts
