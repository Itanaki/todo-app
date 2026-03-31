import type { Todo, TodoStatus } from "../types/todo";
import { getTabIdentity } from "./collabIdentity";

const API_BASE_URL = "http://localhost:4000";

const getActorHeaders = () => {
  const identity = getTabIdentity();

  return {
    "x-actor-id": identity.id,
    "x-actor-name": identity.name,
    "x-actor-color": identity.color,
  };
};

export const tasksService = {
  async getTasks(): Promise<Todo[]> {
    const res = await fetch(`${API_BASE_URL}/tasks`);

    if (!res.ok) {
      throw new Error("Failed to fetch tasks");
    }

    return res.json();
  },

  async createTask(payload: {
    title: string;
    description?: string;
    dueDate?: string;
    status?: TodoStatus;
  }): Promise<Todo> {
    const res = await fetch(`${API_BASE_URL}/tasks`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
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
      orderedTaskIds?: number[];
      orderedByStatus?: Record<TodoStatus, number[]>;
    },
  ): Promise<Todo> {
    const res = await fetch(`${API_BASE_URL}/tasks/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        ...getActorHeaders(),
      },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      throw new Error("Failed to update task");
    }

    return res.json();
  },

  async deleteTask(id: number): Promise<void> {
    const res = await fetch(`${API_BASE_URL}/tasks/${id}`, {
      method: "DELETE",
      headers: {
        ...getActorHeaders(),
      },
    });

    if (!res.ok) {
      throw new Error("Failed to delete task");
    }
  },
};
