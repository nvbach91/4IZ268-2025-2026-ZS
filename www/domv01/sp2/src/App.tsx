import { useEffect, useState } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { todoApi, type Tags as Tag, type Todo } from "@/api/todoApi";
import { CategoryFilter, type Filter } from "@/components/CategoryFilter";
import { CreateTodoDialog } from "@/components/CreateTodoDialog";
import { TodoList } from "@/components/TodoList";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import {
  RedirectToSignIn,
  SignedIn,
  SignedOut,
  UserButton,
  useUser,
} from "@clerk/clerk-react";

function App() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTag, setActiveTag] = useState<Tag>("All");
  const [completionFilter, setCompletionFilter] = useState<Filter>("active");
  const [page, setPage] = useState(1);
  const [totalCount, setTotalCount] = useState<number | null>(null);
  const user = useUser();

  const handleTagChange = (tag: Tag) => {
    setActiveTag(tag);
    setCompletionFilter("active");
    setPage(1);
  };

  const handleTodosChange = (updatedTodo: Todo[]) => {
    updatedTodo = updatedTodo.sort((a, b) => {
      if (a.deadline === "") return 1;
      if (b.deadline === "") return -1;
      const timeA = new Date(a.deadline).getDate();
      const timeB = new Date(b.deadline).getDate();
      return timeA - timeB;
    });
    setTodos(updatedTodo);
  };

  const fetchTodos = async (pageToLoad = 1) => {
    setLoading(true);
    try {
      if (!user.isSignedIn || !user.user?.id) return;

      let result;
      if (activeTag !== "All") {
        result = await todoApi.getUserTodosByTag(user.user.id, activeTag, {
          page: pageToLoad,
          limit: 10,
        });
      } else {
        result = await todoApi.getUserTodos(user.user.id, {
          page: pageToLoad,
          limit: 10,
        });
      }

      handleTodosChange(result.todos);
      setTotalCount(result.total);
    } catch (error) {
      console.error(error);
      setTodos([]);
      setTotalCount(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!user.isSignedIn) {
      setTodos([]);
      setTotalCount(null);
      setLoading(false);
      return;
    }

    setPage(1);
  }, [user.isSignedIn]);

  useEffect(() => {
    if (!user.isSignedIn) return;
    fetchTodos(page);
  }, [page, user.isSignedIn, activeTag]);

  const totalPages =
    totalCount !== null ? Math.max(1, Math.ceil(totalCount / 10)) : null;
  const hasNextPage =
    totalPages !== null ? page < totalPages : todos.length >= 10;
  const hasPreviousPage = page > 1;

  const handleCreateTodo = async (
    title: string,
    tag: Tag,
    description?: string,
    deadline?: Date | string
  ) => {
    try {
      if (!user.user?.id) {
        toast.error("User not authenticated");
        return;
      }
      const newTodo: Todo = await todoApi.create({
        title,
        description,
        tag,
        userId: user.user.id,
        deadline: deadline || "",
      });
      handleTodosChange([newTodo, ...todos]);
      setTotalCount((prev) => (prev !== null ? prev + 1 : prev));

      if (page === 1) {
        fetchTodos(1);
      } else {
        setPage(1);
      }
      toast.success("Todo created!");
    } catch (error) {
      console.error(error);
      toast.error("Failed to create todo");
      throw error;
    }
  };

  const handleToggleTodo = async (id: string, done: boolean) => {
    const previousTodos = [...todos];
    handleTodosChange(todos.map((t) => (t.id === id ? { ...t, done } : t)));
    try {
      await todoApi.update(id, { done });
    } catch (error) {
      console.error(error);
      toast.error("Failed to update todo");
      handleTodosChange(previousTodos);
    }
  };

  const handleDeleteTodo = async (id: string) => {
    const previousTodos = [...todos];
    setTodos(todos.filter((t) => t.id !== id));

    try {
      if (!user.user?.id) {
        toast.error("User not authenticated");
        return;
      }
      await todoApi.delete(id, user.user.id);
      setTotalCount((prev) => (prev !== null ? Math.max(0, prev - 1) : prev));
      toast.success("Todo deleted");

      if (page > 1 && todos.length === 1) {
        setPage((prev) => Math.max(1, prev - 1));
        return;
      }

      fetchTodos(page);
    } catch (error) {
      console.error(error);
      toast.error("Failed to delete todo");
      setTodos(previousTodos);
    }
  };

  const handleEditTodo = async (
    id: string,
    title: string,
    tag: Tag,
    description?: string,
    deadline?: Date | string
  ) => {
    const previousTodos = [...todos];
    try {
      if (!user.user?.id) {
        toast.error("User not authenticated");
        return;
      }
      await todoApi.update(id, {
        title,
        description,
        tag,
        userId: user.user.id,
        deadline: deadline || "",
      });
      toast.success("Todo updated!");

      handleTodosChange(
        todos.map((t) =>
          t.id === id
            ? {
                ...t,
                title,
                description,
                tag,
                deadline: deadline || "",
              }
            : t
        )
      );
    } catch (error) {
      console.error(error);
      toast.error("Failed to update todo");
      setTodos(previousTodos);
      throw error;
    }
  };

  const handleNextPage = () => {
    if (!hasNextPage || loading) return;
    setPage((prev) => prev + 1);
  };

  const handlePreviousPage = () => {
    if (!hasPreviousPage || loading) return;
    setPage((prev) => Math.max(1, prev - 1));
  };

  return (
    <>
      <header className="right-8 top-8 absolute">
        <SignedOut>
          <RedirectToSignIn />
        </SignedOut>
        <SignedIn>
          <UserButton />
        </SignedIn>
      </header>
      <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8 font-sans selection:bg-primary selection:text-primary-foreground">
        <ToastContainer position="bottom-right" theme="dark" />
        <div className="mx-auto max-w-4xl space-y-8">
          <div className="space-y-2 text-center">
            <h1 className="text-5xl font-extrabold tracking-tight text-black drop-shadow-sm pb-1">
              Tasks
            </h1>
          </div>
          {user.isSignedIn && (
            <div className="flex justify-center">
              <CreateTodoDialog onSubmit={handleCreateTodo} />
            </div>
          )}

          {loading ? (
            <div className="flex justify-center py-10">
              <Spinner className="size-10 text-primary animate-spin" />
            </div>
          ) : (
            <>
              <div className="space-y-4">
                <div className="flex justify-center">
                  <CategoryFilter
                    activeTag={activeTag}
                    onTagChange={handleTagChange}
                    completionFilter={completionFilter}
                    onCompletionFilterChange={setCompletionFilter}
                  />
                </div>

                {user.isSignedIn && (
                  <div className="flex items-center justify-end gap-4 text-sm text-muted-foreground">
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handlePreviousPage}
                        disabled={!hasPreviousPage || loading}
                      >
                        Previous
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleNextPage}
                        disabled={!hasNextPage || loading}
                      >
                        Next
                      </Button>
                    </div>
                  </div>
                )}
              </div>
              <TodoList
                user={user}
                todos={todos}
                activeTag={activeTag}
                completionFilter={completionFilter}
                onToggle={handleToggleTodo}
                onDelete={handleDeleteTodo}
                onEdit={handleEditTodo}
              />
              <div className="flex items-center justify-center gap-4 text-sm text-muted-foreground">
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handlePreviousPage}
                    disabled={!hasPreviousPage || loading}
                  >
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleNextPage}
                    disabled={!hasNextPage || loading}
                  >
                    Next
                  </Button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
}

export default App;
