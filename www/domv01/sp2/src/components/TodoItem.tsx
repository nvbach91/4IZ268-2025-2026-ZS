import { useState, useEffect } from "react";
import type { Tags, Todo } from "@/api/todoApi";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Calendar } from "lucide-react";
import { cn } from "@/lib/utils";
import { CreateTodoForm } from "@/components/CreateTodoForm";

interface TodoItemProps {
  todo: Todo;
  onToggle: (id: string, done: boolean) => void;
  onDelete: (id: string) => void;
  onEdit?: (
    id: string,
    title: string,
    tag: Tags,
    description?: string,
    deadline?: Date | string,
  ) => Promise<void>;
}

const textStyles = {
  title:
    "text-base font-medium leading-none cursor-pointer peer-disabled:cursor-not-allowed peer-disabled:opacity-70",
  completed: "line-through text-muted-foreground",
};

export function TodoItem({ todo, onToggle, onDelete, onEdit }: TodoItemProps) {
  const [editOpen, setEditOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);

  useEffect(() => {
    const handleDeleteEvent = () => {
      setEditOpen(false);
      setDeleteConfirmOpen(true);
    };
    window.addEventListener("deleteTodo", handleDeleteEvent);
    return () => window.removeEventListener("deleteTodo", handleDeleteEvent);
  }, []);

  const getDaysUntilDeadline = () => {
    return Math.ceil(
      (new Date(todo.deadline).getTime() - new Date().getTime()) /
        (1000 * 60 * 60 * 24)
    );
  };

  const formatDeadline = () => {
    return new Date(todo.deadline).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const daysUntilDeadline =
    todo.deadline !== ""
      ? getDaysUntilDeadline()
      : null;

  const handleDelete = () => {
    onDelete(todo.id);
    setDeleteConfirmOpen(false);
  };
  const handleToggle = (checked: boolean) => onToggle(todo.id, checked);

  const handleEditSubmit = async (
    title: string,
    tag: Tags,
    description?: string,
    deadline?: Date | string,
  ) => {
    if (onEdit) {
      setIsEditing(true);
      try {
        await onEdit(todo.id, title, tag, description, deadline);
        setEditOpen(false);
      } catch (error) {
        console.error(error);
      } finally {
        setIsEditing(false);
      }
    }
  };

  return (
    <>
      <Card
        className="group flex flex-row justify-between border-l-4 border-l-primary/0 animate-in fade-in zoom-in-95 transition-all duration-300 hover:border-l-primary hover:shadow-lg hover:-translate-y-1 cursor-pointer"
        onClick={() => setEditOpen(true)}
      >
        <div className="flex justify-center gap-2 flex-col">
          <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
            <div className="flex items-center gap-2 flex-1">
              <Checkbox
                id={`todo-${todo.id}`}
                checked={todo.done}
                onCheckedChange={handleToggle}
                onClick={(e) => e.stopPropagation()}
              />
              <label
                htmlFor={`todo-${todo.id}`}
                className="flex-1"
                onClick={(e) => e.stopPropagation()}
              >
                <CardTitle
                  className={cn(
                    textStyles.title,
                    todo.done && textStyles.completed
                  )}
                >
                  {todo.title}
                </CardTitle>
              </label>
            </div>
          </CardHeader>
          {todo.description && (
            <CardContent className="pt-0">
              <p
                className={cn(
                  "text-sm text-muted-foreground",
                  todo.done && textStyles.completed
                )}
              >
                {todo.description}
              </p>
            </CardContent>
          )}
          {daysUntilDeadline !== null && (
            <CardContent className="pt-0">
              <div className="flex items-center gap-2">
                <Calendar
                  className={cn(
                    "h-3.5 w-3.5",
                    daysUntilDeadline < 0
                      ? "text-destructive"
                      : daysUntilDeadline === 0
                      ? "text-orange-500"
                      : daysUntilDeadline <= 3
                      ? "text-yellow-600"
                      : "text-muted-foreground"
                  )}
                />
                <div className="flex flex-col">
                  <p className="text-xs text-muted-foreground">
                    {formatDeadline()}
                  </p>
                  <p
                    className={cn(
                      "text-xs font-medium",
                      daysUntilDeadline < 0
                        ? "text-destructive"
                        : daysUntilDeadline === 0
                        ? "text-orange-500"
                        : daysUntilDeadline <= 3
                        ? "text-yellow-600"
                        : "text-muted-foreground"
                    )}
                  >
                    {daysUntilDeadline < 0
                      ? `${Math.abs(daysUntilDeadline)} days overdue`
                      : daysUntilDeadline === 0
                      ? "Due today"
                      : daysUntilDeadline === 1
                      ? "Due tomorrow"
                      : `${daysUntilDeadline} days left`}
                  </p>
                </div>
              </div>
            </CardContent>
          )}
        </div>
      </Card>

      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit Todo</DialogTitle>
            <DialogDescription>Update your task details.</DialogDescription>
          </DialogHeader>
          <CreateTodoForm
            onSubmit={handleEditSubmit}
            isLoading={isEditing}
            defaultValues={{
              title: todo.title,
              tag: todo.tag || "All",
              description: todo.description || "",
              deadline: todo.deadline
                ? (() => {
                    return todo.deadline !== ""
                      ? new Date(todo.deadline)
                      : undefined;
                  })()
                : undefined,
            }}
          />
        </DialogContent>
      </Dialog>

      <AlertDialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Todo</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "<strong>{todo.title}</strong>"?
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="flex justify-end gap-2">
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-white cursor-pointer hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
