export type TaskRow = {
  id: number;
  title: string;
  description: string | null;
  due_date: string | null;
  created_at: string;
  sort_index: number | null;
  column_id: number | null;
  column_code: string | null;
  column_label: string | null;
};

export const mapTaskRow = (row: TaskRow) => ({
  id: row.id,
  title: row.title,
  description: row.description,
  dueDate: row.due_date,
  createdAt: row.created_at,
  status: row.column_code ?? "todo",
  sortIndex: row.sort_index ?? 0,
  columnId: row.column_id,
  columnCode: row.column_code,
  columnLabel: row.column_label,
});

export type TaskDto = ReturnType<typeof mapTaskRow>;
