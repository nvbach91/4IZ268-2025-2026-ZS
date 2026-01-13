import { useEffect, useState } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { todoApi, type Todo } from "@/api/todoApi";
import { CreateTodoDialog } from "@/components/CreateTodoDialog";
import { TodoList } from "@/components/TodoList";
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
  const user = useUser();

  const fetchTodos = async () => {
    setLoading(true);
    try {
      if (!user.isSignedIn || !user.user?.id) return;
      const data = await todoApi.getAll();
      const userTodos = data.filter((todo) => todo.userId === user.user?.id);
      setTodos(userTodos.sort((a, b) => Number(b.id) - Number(a.id)));
    } catch (error) {
      console.error(error);
      toast.error("Failed to fetch todos");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTodos();
  }, [user.isSignedIn]);

  const handleCreateTodo = async (
    title: string,
    tag: string,
    description?: string,
    deadline?: Date
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
        deadline: deadline || new Date("1970-01-01T00:00:00.000Z"),
      });
      setTodos([newTodo, ...todos]);
      toast.success("Todo created!");
    } catch (error) {
      console.error(error);
      toast.error("Failed to create todo");
      throw error;
    }
  };

  const handleToggleTodo = async (id: string, done: boolean) => {
    const previousTodos = [...todos];
    setTodos(todos.map((t) => (t.id === id ? { ...t, done } : t)));
    try {
      await todoApi.update(id, { done });
    } catch (error) {
      console.error(error);
      toast.error("Failed to update todo");
      setTodos(previousTodos);
    }
  };

  const handleDeleteTodo = async (id: string) => {
    const previousTodos = [...todos];
    setTodos(todos.filter((t) => t.id !== id));

    try {
      await todoApi.delete(id);
      toast.success("Todo deleted");
    } catch (error) {
      console.error(error);
      toast.error("Failed to delete todo");
      setTodos(previousTodos);
    }
  };

  const handleEditTodo = async (
    id: string,
    title: string,
    tag: string,
    description?: string,
    deadline?: Date
  ) => {
    const previousTodos = [...todos];
    setTodos(
      todos.map((t) => (t.id === id ? { ...t, title, description, tag } : t))
    );
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
        deadline: deadline || new Date("1970-01-01T00:00:00.000Z"),
      });
      toast.success("Todo updated!");
    } catch (error) {
      console.error(error);
      toast.error("Failed to update todo");
      setTodos(previousTodos);
      throw error;
    }
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
        <ToastContainer position="bottom-right" theme="colored" />
        <div className="mx-auto max-w-4xl space-y-8">
          <div className="space-y-2 text-center">
            <h1 className="text-5xl font-extrabold tracking-tight text-black drop-shadow-sm pb-1">
              Tasks
            </h1>
            <p className="text-muted-foreground text-lg">
              Manage your tasks efficiently and with style.
            </p>
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
            <TodoList
              user={user}
              todos={todos}
              onToggle={handleToggleTodo}
              onDelete={handleDeleteTodo}
              onEdit={handleEditTodo}
            />
          )}
        </div>
      </div>
    </>
  );
}

export default App;
