import type { Todo } from "@/api/todoApi";
import { TodoItem } from "@/components/TodoItem";
import { type useUser } from "@clerk/clerk-react";

interface TodoListProps {
    user: ReturnType<typeof useUser>;
    todos: Todo[];
    onToggle: (id: string, done: boolean) => void;
    onDelete: (id: string) => void;
    onEdit?: (id: string, title: string, description: string, tags: string[]) => Promise<void>;
}

export function TodoList({ user, todos, onToggle, onDelete, onEdit }: TodoListProps) {
    if (!user.isSignedIn) {
        return (
            <div className="text-center text-muted-foreground p-8">
                Please sign in to view your todos.
            </div>
        );
    }
    if (todos.length === 0) {
        return (
            <div className="text-center text-muted-foreground p-8">
                No todos yet. Add one above!
            </div>
        );
    }

    const groupedTodos = todos.reduce((acc, todo) => {
        const tag = todo.tags && todo.tags.length > 0 ? todo.tags[0] : "Uncategorized";
        if (!acc[tag]) {
            acc[tag] = [];
        }
        acc[tag].push(todo);
        return acc;
    }, {} as Record<string, Todo[]>);

    return (
        <div className="space-y-8">
            {Object.entries(groupedTodos).map(([tag, sectionTodos]) => (
                <div key={tag} className="space-y-4">
                    <h2 className="text-2xl font-semibold tracking-tight text-foreground border-b pb-2 uppercase text-sm text-muted-foreground">{tag}</h2>
                    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
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
            ))}
        </div>
    );
}
