
import { zodResolver } from "@hookform/resolvers/zod";
import { Check, ChevronsUpDown, Calendar as CalendarIcon, Trash2 } from "lucide-react";
import { useForm } from "react-hook-form";
import * as z from "zod";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { Calendar } from "@/components/ui/calendar";
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "@/components/ui/command";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { useState } from "react";
import type { Tags } from "@/api/todoApi";

const tag = [
    { label: "Work", value: "work" },
    { label: "Personal", value: "personal" },
    { label: "Urgent", value: "urgent" },
    { label: "Home", value: "home" },
    { label: "Shopping", value: "shopping" },
] as const;

const formSchema = z.object({
    title: z.string().min(1, {
        message: "Title is required.",
    }),
    tag: z.string().min(1, {
        message: "Tag is required.",
    }),
    description: z.string().optional(),
    deadline: z.date().optional(),
});

interface CreateTodoFormProps {
    onSubmit: (title: string,  tag: Tags, description?: string, deadline?: Date | string) => void;
    isLoading?: boolean;
    defaultValues?: {
        title: string;
        tag: Tags;
        description?: string;
        deadline?: Date;
    };
}

export function CreateTodoForm({ onSubmit, isLoading, defaultValues }: CreateTodoFormProps) {
    const [open, setOpen] = useState(false)
    const [calendarOpen, setCalendarOpen] = useState(false)
    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            title: defaultValues?.title || "",
            description: defaultValues?.description || "",
            tag: defaultValues?.tag || "",
            deadline: defaultValues?.deadline instanceof Date ? defaultValues.deadline : (defaultValues?.deadline ? new Date(defaultValues.deadline) : undefined),
        },
    });

    function handleSubmit(values: z.infer<typeof formSchema>) {
        const deadlineValue = values.deadline || "";
        onSubmit(values.title, values.tag as Tags, values.description, deadlineValue);
        form.reset();
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
                <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Title</FormLabel>
                            <FormControl>
                                <Input placeholder="Buy groceries" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Description (optional)</FormLabel>
                            <FormControl>
                                <Textarea rows={3} placeholder="Milk, eggs, bread..." {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="tag"
                    render={({ field }) => (
                        <FormItem className="flex flex-col">
                            <FormLabel>Tag</FormLabel>
                            <Popover open={open} onOpenChange={setOpen}>
                                <PopoverTrigger asChild>
                                    <FormControl>
                                        <Button
                                            variant="outline"
                                            role="combobox"
                                            className={cn(
                                                "w-[200px] justify-between",
                                                !field.value && "text-muted-foreground"
                                            )}
                                        >
                                            {field.value
                                                ? tag.find(
                                                    (tag) => tag.value === field.value
                                                )?.label
                                                : "Select tag"}
                                            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                        </Button>
                                    </FormControl>
                                </PopoverTrigger>
                                <PopoverContent className="w-[200px] p-0">
                                    <Command>
                                        <CommandInput placeholder="Search tag..." />
                                        <CommandList>
                                            <CommandEmpty>No tag found.</CommandEmpty>
                                            <CommandGroup>
                                                {tag.map((tag) => (
                                                    <CommandItem
                                                        value={tag.label}
                                                        key={tag.value}
                                                        onSelect={() => {
                                                            form.setValue("tag", tag.value)
                                                            setOpen(false)
                                                        }}
                                                    >
                                                        <Check
                                                            className={cn(
                                                                "mr-2 h-4 w-4",
                                                                tag.value === field.value
                                                                    ? "opacity-100"
                                                                    : "opacity-0"
                                                            )}
                                                        />
                                                        {tag.label}
                                                    </CommandItem>
                                                ))}
                                            </CommandGroup>
                                        </CommandList>
                                    </Command>
                                </PopoverContent>
                            </Popover>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="deadline"
                    render={({ field }) => (
                        <FormItem className="flex flex-col">
                            <FormLabel>Deadline (optional)</FormLabel>
                            <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
                                <PopoverTrigger asChild>
                                    <FormControl>
                                        <Button
                                            variant="outline"
                                            className={cn(
                                                "w-[200px] justify-start text-left font-normal",
                                                !field.value && "text-muted-foreground"
                                            )}
                                        >
                                            <CalendarIcon className="mr-2 h-4 w-4" />
                                            {field.value
                                                ? field.value.toLocaleDateString()
                                                : "Pick a date"}
                                        </Button>
                                    </FormControl>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0">
                                    <Calendar
                                        mode="single"
                                        selected={field.value}
                                        onSelect={(date) => {
                                            field.onChange(date)
                                            setCalendarOpen(false)
                                        }}
                                        disabled={(date) =>
                                            date < new Date(new Date().setHours(0, 0, 0, 0))
                                        }
                                    />
                                </PopoverContent>
                            </Popover>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <div className="flex gap-2">
                    <Button type="submit" disabled={isLoading} className="flex-1">
                        {isLoading ? <><Spinner className="mr-2" /> {defaultValues ? "Updating..." : "Adding..."}</> : defaultValues ? "Update Todo" : "Add Todo"}
                    </Button>
                    {defaultValues && (
                        <Button type="button" variant="destructive" disabled={isLoading} onClick={() => {
                            const event = new CustomEvent('deleteTodo');
                            window.dispatchEvent(event);
                        }}>
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete
                        </Button>
                    )}
                </div>
            </form>
        </Form>
    );
}