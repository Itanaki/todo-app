import type { Todo, TodoStatus } from "../types/todo";
import { getTabIdentity } from "./collabIdentity";
import { API_BASE_URL } from "./apiBaseUrl";

const getActorHeaders = () => {
  const identity = getTabIdentity();

  return {
    "x-actor-id": identity.id,
    "x-actor-name": identity.name,
    "x-actor-color": identity.color,
  };
};

const getAuthHeaders = (accessToken?: string | null): Record<string, string> =>
  accessToken ? { Authorization: `Bearer ${accessToken}` } : {};

export const tasksService = {
  async getTasks(accessToken?: string | null): Promise<Todo[]> {
    const res = await fetch(`${API_BASE_URL}/tasks`, {
      headers: {
        ...getAuthHeaders(accessToken),
      },
    });

    if (!res.ok) {
      throw new Error("Failed to fetch tasks");
    }

    return res.json();
  },

  async getColumns(accessToken?: string | null): Promise<Array<{ id: number; code: TodoStatus; label: string; sort_index: number }>> {
    const res = await fetch(`${API_BASE_URL}/task-columns`, {
      headers: {
        ...getAuthHeaders(accessToken),
      },
    });

    if (!res.ok) {
      throw new Error("Failed to fetch task columns");
    }

    return res.json();
  },

  async createTask(payload: {
    title: string;
    description?: string;
    dueDate?: string;
    status?: TodoStatus;
    columnId?: number;
  }, accessToken?: string | null): Promise<Todo> {
    const res = await fetch(`${API_BASE_URL}/tasks`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...getAuthHeaders(accessToken),
        ...getActorHeaders(),
      },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      throw new Error("Failed to create task");
    }

    return res.json();
  },

  async updateTask(
    id: number,
    payload: {
      title?: string;
      description?: string | null;
      dueDate?: string | null;
      status?: TodoStatus;
      columnId?: number;
      orderedTaskIds?: number[];
      orderedByStatus?: Record<TodoStatus, number[]>;
    },
    accessToken?: string | null,
  ): Promise<Todo> {
    const res = await fetch(`${API_BASE_URL}/tasks/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        ...getAuthHeaders(accessToken),
        ...getActorHeaders(),
      },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      throw new Error("Failed to update task");
    }

    return res.json();
  },

  async renameColumnLabel(
    code: TodoStatus,
    label: string,
    accessToken?: string | null,
  ): Promise<{ code: TodoStatus; label: string }> {
    const res = await fetch(`${API_BASE_URL}/task-columns/${code}/label`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        ...getAuthHeaders(accessToken),
        ...getActorHeaders(),
      },
      body: JSON.stringify({ label }),
    });

    if (!res.ok) {
      throw new Error("Failed to rename column");
    }

    return res.json();
  },

  async deleteTask(id: number, accessToken?: string | null): Promise<void> {
    const res = await fetch(`${API_BASE_URL}/tasks/${id}`, {
      method: "DELETE",
      headers: {
        ...getAuthHeaders(accessToken),
        ...getActorHeaders(),
      },
    });

    if (!res.ok) {
      throw new Error("Failed to delete task");
    }
  },
};
