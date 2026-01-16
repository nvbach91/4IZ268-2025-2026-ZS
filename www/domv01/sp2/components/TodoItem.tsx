import { useState } from "react";
import type { Todo } from "@/api/todoApi";
import {
    Card,
    CardContent,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
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
import { Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { CreateTodoForm } from "@/components/CreateTodoForm";

interface TodoItemProps {
    todo: Todo;
    onToggle: (id: string, done: boolean) => void;
    onDelete: (id: string) => void;
    onEdit?: (
        id: string,
        title: string,
        description: string,
        tags: string[]
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

    const handleDelete = () => {
        onDelete(todo.id);
        setDeleteConfirmOpen(false);
    };
    const handleToggle = (checked: boolean) => onToggle(todo.id, checked);

    const handleEditSubmit = async (
        title: string,
        description: string,
        tags: string[]
    ) => {
        if (onEdit) {
            setIsEditing(true);
            try {
                await onEdit(todo.id, title, description, tags);
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
                </div>
                <CardFooter>
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={(e) => {
                            e.stopPropagation();
                            setDeleteConfirmOpen(true);
                        }}
                        className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                        aria-label="Delete todo"
                    >
                        <Trash2 className="h-4 w-4" />
                    </Button>
                </CardFooter>
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
                            description: todo.description || "",
                            tag: todo.tags?.[0] || "",
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
