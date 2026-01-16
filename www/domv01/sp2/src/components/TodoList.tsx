import type { Tags, Todo } from "@/api/todoApi";
import { TodoItem } from "@/components/TodoItem";
import { type useUser } from "@clerk/clerk-react";
import type { Filter } from "./CategoryFilter";

interface TodoListProps {
  user: ReturnType<typeof useUser>;
  todos: Todo[];
  activeTag: Tags;
  completionFilter: Filter;
  onToggle: (id: string, done: boolean) => void;
  onDelete: (id: string) => void;
  onEdit?: (
    id: string,
    title: string,
    tag: Tags,
    description?: string,
    deadline?: Date | string
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

  const filteredByCompletion =
    completionFilter === "all"
      ? todos
      : completionFilter === "completed"
      ? todos.filter((todo) => todo.done)
      : todos.filter((todo) => !todo.done);

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

  const totalCompleted = todos.filter((todo) => todo.done).length;
  const totalTodos = todos.length;

  let sortedEntries = Object.entries(groupedTodos);
  if (activeTag === "All") {
    sortedEntries.sort(([, todosA], [, todosB]) => {
      const earliestA = todosA.find(() => true)?.deadline;
      const earliestB = todosB.find(() => true)?.deadline;

      if (!earliestA && !earliestB) return 0;
      if (!earliestA) return 1;
      if (!earliestB) return -1;

      return new Date(earliestA).getTime() - new Date(earliestB).getTime();
    });
  }

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-muted-foreground">
          {totalCompleted}/{totalTodos}
        </h2>
        <p className="text-sm text-muted-foreground">Total completed</p>
      </div>
      {sortedEntries.map(([tag, sectionTodos]) => {
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
