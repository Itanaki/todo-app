import type { BoardColumnConfig } from "../../types/column";

export const DEFAULT_COLUMNS: BoardColumnConfig[] = [
  { id: "todo", label: "Todo" },
  { id: "in-progress", label: "In-Progress" },
  { id: "complete", label: "Completed" },
];
