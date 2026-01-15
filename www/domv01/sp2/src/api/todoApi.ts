export type Todo = {
  id: string;
  userId: string;
  createdAt: string;
  done: boolean;
  title: string;
  tag: Tags | null;
  description?: string;
  deadline: Date;
};

export type Tags = "All" | "Work" | "Personal" | "Urgent" | "Home" | "Shopping";

const API_Base_URL = import.meta.env.VITE_API_BASE_URL;

if (!API_Base_URL) {
  throw new Error('Missing API Url')
}

const STORAGE_KEY_PREFIX = "todos_";

const storageManager = {
  getTodoIdsKey: (userId: string) => `${STORAGE_KEY_PREFIX}${userId}`,
  
  getTodoIds: (userId: string): string[] => {
    const key = storageManager.getTodoIdsKey(userId);
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) : [];
  },

  addTodoId: (userId: string, todoId: string) => {
    const ids = storageManager.getTodoIds(userId);
    if (!ids.includes(todoId)) {
      ids.push(todoId);
      localStorage.setItem(storageManager.getTodoIdsKey(userId), JSON.stringify(ids));
    }
  },

  removeTodoId: (userId: string, todoId: string) => {
    const ids = storageManager.getTodoIds(userId);
    const filtered = ids.filter((id) => id !== todoId);
    localStorage.setItem(storageManager.getTodoIdsKey(userId), JSON.stringify(filtered));
  },
};

export const todoApi = {
  getById: async (id: string): Promise<Todo> => {
    const response = await fetch(`${API_Base_URL}/todos/${id}`);
    if (!response.ok) throw new Error("Failed to fetch todo");
    return response.json();
  },

  getUserTodos: async (userId: string): Promise<Todo[]> => {
    const todoIds = storageManager.getTodoIds(userId);
    const todos = await Promise.all(
      todoIds.map((id) => todoApi.getById(id).catch(() => null))
    );
    return todos.filter((todo): todo is Todo => todo !== null);
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
    const createdTodo = await response.json();
    storageManager.addTodoId(todo.userId, createdTodo.id);
    return createdTodo;
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

  delete: async (id: string, userId: string): Promise<void> => {
    const response = await fetch(`${API_Base_URL}/todos/${id}`, {
      method: "DELETE",
    });
    if (!response.ok) throw new Error("Failed to delete todo");
    storageManager.removeTodoId(userId, id);
  },
};
