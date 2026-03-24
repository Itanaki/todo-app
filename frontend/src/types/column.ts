import type { TodoStatus } from "./todo";

export interface BoardColumnConfig {
  id: TodoStatus; // internal, stable
  label: string; // user-facing, renameable
}
