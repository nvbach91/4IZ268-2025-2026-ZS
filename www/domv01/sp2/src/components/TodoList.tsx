import type { Tags, Todo } from "@/api/todoApi";
import { TodoItem } from "@/components/TodoItem";
import { type useUser } from "@clerk/clerk-react";

interface TodoListProps {
  user: ReturnType<typeof useUser>;
  todos: Todo[];
  activeTag: Tags;
  completionFilter: "all" | "completed" | "active";
  onToggle: (id: string, done: boolean) => void;
  onDelete: (id: string) => void;
  onEdit?: (
    id: string,
    title: string,
    tag: Tags,
    description?: string,
    deadline?: Date
  ) => Promise<void>;
}

export function TodoList({
  user,
  todos,
  activeTag,
  completionFilter,
  onToggle,
  onDelete,
  onEdit,
}: TodoListProps) {
  if (!user.isSignedIn) {
    return (
      <div className="text-center text-muted-foreground p-8">
        Please sign in to view your todos.
      </div>
    );
  }

  const filteredTodos =
    activeTag !== "All"
      ? todos.filter(
          (todo) => todo.tag?.toLowerCase() === activeTag.toLowerCase()
        )
      : todos;

  const filteredByCompletion = 
    completionFilter === "all"
      ? filteredTodos
      : completionFilter === "completed"
      ? filteredTodos.filter((todo) => todo.done)
      : filteredTodos.filter((todo) => !todo.done);

  if (filteredByCompletion.length === 0) {
    return (
      <div className="text-center text-muted-foreground p-8">
        {activeTag
          ? `No todos in ${activeTag}. Add one above!`
          : "No todos yet. Add one above!"}
      </div>
    );
  }

  const groupedTodos = filteredByCompletion.reduce((acc, todo) => {
    const tag = todo.tag || "Uncategorized";
    if (!acc[tag]) {
      acc[tag] = [];
    }
    acc[tag].push(todo);
    return acc;
  }, {} as Record<string, Todo[]>);

  Object.keys(groupedTodos).forEach((key) => {
    groupedTodos[key].sort((a, b) => {
      if (!a.deadline && !b.deadline) return 0;
      if (!a.deadline) return 1;
      if (!b.deadline) return -1;
      return new Date(a.deadline).getTime() - new Date(b.deadline).getTime();
    });
  });

  const totalCompleted = filteredTodos.filter((todo) => todo.done).length;
  const totalTodos = filteredTodos.length;

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-muted-foreground">
          {totalCompleted}/{totalTodos}
        </h2>
        <p className="text-sm text-muted-foreground">Total completed</p>
      </div>
      {Object.entries(groupedTodos).map(([tag, sectionTodos]) => {
        const completedCount = sectionTodos.filter((todo) => todo.done).length;
        const totalCount = sectionTodos.length;

        return (
          <div key={tag} className="space-y-4">
            <h2 className="text-2xl font-semibold tracking-tight font-foreground border-b pb-2 uppercase text-muted-foreground flex items-center justify-between">
              <span>{tag}</span>
              {activeTag === "All" && (
                <span className="text-sm font-normal">
                  {completedCount}/{totalCount}
                </span>
              )}
            </h2>
            <div className="grid gap-6 lg:grid-cols-2">
              {sectionTodos.map((todo) => (
                <TodoItem
                  key={todo.id}
                  todo={todo}
                  onToggle={onToggle}
                  onDelete={onDelete}
                  onEdit={onEdit}
                />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
