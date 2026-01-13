export type Todo = {
  id: string;
  userId: string;
  createdAt: string;
  done: boolean;
  title: string;
  tag: string;
  description?: string;
  deadline: Date;
};

const API_Base_URL = import.meta.env.VITE_API_BASE_URL;

if (!API_Base_URL) {
  throw new Error('Missing API Url')
}

export const todoApi = {
  getAll: async (): Promise<Todo[]> => {
    const response = await fetch(`${API_Base_URL}/todos`);
    if (!response.ok) throw new Error("Failed to fetch todos");
    return response.json();
  },

  create: async (
    todo: Omit<Todo, "id" | "createdAt" | "done">
  ): Promise<Todo> => {
    const response = await fetch(`${API_Base_URL}/todos`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...todo,
        done: false,
        createdAt: new Date().toISOString(),
      }),
    });
    if (!response.ok) throw new Error("Failed to create todo");
    return response.json();
  },

  update: async (id: string, updates: Partial<Todo>): Promise<Todo> => {
    const response = await fetch(`${API_Base_URL}/todos/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updates),
    });
    if (!response.ok) throw new Error("Failed to update todo");
    return response.json();
  },

  delete: async (id: string): Promise<void> => {
    const response = await fetch(`${API_Base_URL}/todos/${id}`, {
      method: "DELETE",
    });
    if (!response.ok) throw new Error("Failed to delete todo");
  },
};
