import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { CreateTodoForm } from "@/components/CreateTodoForm";
import { Plus } from "lucide-react";

interface CreateTodoDialogProps {
  onSubmit: (
    title: string,
    tag: string,
    description?: string,
    deadline?: Date
  ) => Promise<void>;
}

export function CreateTodoDialog({ onSubmit }: CreateTodoDialogProps) {
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (
    title: string,
    tag: string,
    description?: string,
    deadline?: Date
  ) => {
    setIsLoading(true);
    try {
      await onSubmit(title, tag, description, deadline);
      setOpen(false);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" /> Add Todo
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add New Todo</DialogTitle>
          <DialogDescription>
            Create a new task for your list.
          </DialogDescription>
        </DialogHeader>
        <CreateTodoForm onSubmit={handleSubmit} isLoading={isLoading} />
      </DialogContent>
    </Dialog>
  );
}
