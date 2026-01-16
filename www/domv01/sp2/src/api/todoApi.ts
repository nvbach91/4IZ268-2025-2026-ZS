export type Todo = {
  id: string;
  userId: string;
  createdAt: string;
  done: boolean;
  title: string;
  tag: Tags | null;
  description?: string;
  deadline: Date | string;
};

export type Tags = "All" | "Work" | "Personal" | "Urgent" | "Home" | "Shopping";

type TodoApiResponse = Omit<Todo, "deadline"> & { deadline: string | Date };

type PaginationOptions = {
  page?: number;
  limit?: number;
  completed?: boolean;
};

export type PaginatedTodos = {
  todos: Todo[];
  total: number | null;
  page: number;
  limit: number;
};

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

const normalizeTodo = (todo: TodoApiResponse): Todo => ({
  ...todo,
  deadline: todo.deadline && todo.deadline !== "" ? new Date(todo.deadline) : "",
});


export const todoApi = {

  getUserTodos: async (
    userId: string,
    options?: PaginationOptions
  ): Promise<PaginatedTodos> => {
    const page = options?.page ?? 1;
    const limit = options?.limit ?? 1;
    const endpoint = new URL(`${API_Base_URL}/todos`);
    endpoint.searchParams.append("userId", userId);
    endpoint.searchParams.append("page", String(page));
    endpoint.searchParams.append("limit", String(limit));

    if (typeof options?.completed === "boolean") {
      endpoint.searchParams.append("completed", String(options.completed));
    }

    const response = await fetch(endpoint.toString());
    if (!response.ok) throw new Error("Failed to fetch todo");

    const totalHeader = response.headers.get("x-total-count");
    const total = totalHeader ? Number(totalHeader) : null;

    const todos: Todo[] = (await response.json()).map(normalizeTodo);

    return {
      todos,
      total: Number.isFinite(total) ? Number(total) : null,
      page,
      limit,
    };
  },

  getUserTodosByTag: async (
    userId: string,
    tag: Tags,
    options?: PaginationOptions
  ): Promise<PaginatedTodos> => {
    const page = options?.page ?? 1;
    const limit = options?.limit ?? 10;
    const endpoint = new URL(`${API_Base_URL}/todos`);
    
    endpoint.searchParams.append("userId", userId);
    endpoint.searchParams.append("tag", tag);
    endpoint.searchParams.append("page", String(page));
    endpoint.searchParams.append("limit", String(limit));
    
    if (typeof options?.completed === "boolean") {
      endpoint.searchParams.append("completed", String(options.completed));
    }

    const response = await fetch(endpoint.toString());
    if (!response.ok) throw new Error("Failed to fetch todos by tag");

    const totalHeader = response.headers.get("x-total-count");
    const total = totalHeader ? Number(totalHeader) : null;

    const todos: Todo[] = (await response.json()).map(normalizeTodo);
    
    return {
      todos,
      total: Number.isFinite(total) ? Number(total) : null,
      page,
      limit,
    };
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
    const createdTodo: TodoApiResponse = await response.json();
    storageManager.addTodoId(todo.userId, createdTodo.id);
    return normalizeTodo(createdTodo);
  },

  update: async (id: string, updates: Partial<Todo>): Promise<Todo> => {
    const response = await fetch(`${API_Base_URL}/todos/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updates),
    });
    if (!response.ok) throw new Error("Failed to update todo");
    const updatedTodo: TodoApiResponse = await response.json();
    return normalizeTodo(updatedTodo);
  },

  delete: async (id: string, userId: string): Promise<void> => {
    const response = await fetch(`${API_Base_URL}/todos/${id}`, {
      method: "DELETE",
    });
    if (!response.ok) throw new Error("Failed to delete todo");
    storageManager.removeTodoId(userId, id);
  },
};
