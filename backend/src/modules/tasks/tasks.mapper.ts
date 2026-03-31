export type TaskRow = {
  id: number;
  title: string;
  description: string | null;
  due_date: string | null;
  created_at: string;
  status: string | null;
  sort_index: number | null;
};

export const mapTaskRow = (row: TaskRow) => ({
  id: row.id,
  title: row.title,
  description: row.description,
  dueDate: row.due_date,
  createdAt: row.created_at,
  status: row.status ?? "todo",
  sortIndex: row.sort_index ?? 0,
});

export type TaskDto = ReturnType<typeof mapTaskRow>;
