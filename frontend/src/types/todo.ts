export type TodoStatus = "todo" | "in-progress" | "complete";

export interface Todo {
  id: number;
  title: string;
  description?: string;
  status: TodoStatus;
  dueDate?: string;
  columnId?: number;
  columnCode?: string;
  columnLabel?: string;
}
