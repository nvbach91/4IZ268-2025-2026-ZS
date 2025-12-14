
import { zodResolver } from "@hookform/resolvers/zod";
import { Check, ChevronsUpDown } from "lucide-react";
import { useForm } from "react-hook-form";
import * as z from "zod";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
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
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { useState } from "react";

const tags = [
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
    description: z.string().optional(),
    tag: z.string().optional(),
});

interface CreateTodoFormProps {
    onSubmit: (title: string, description: string, tags: string[]) => void;
    isLoading?: boolean;
    defaultValues?: {
        title?: string;
        description?: string;
        tag?: string;
    };
}

export function CreateTodoForm({ onSubmit, isLoading, defaultValues }: CreateTodoFormProps) {
    const [open, setOpen] = useState(false)
    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            title: defaultValues?.title || "",
            description: defaultValues?.description || "",
            tag: defaultValues?.tag || "",
        },
    });

    function handleSubmit(values: z.infer<typeof formSchema>) {
        const submittedTags = values.tag ? [values.tag] : [];
        onSubmit(values.title, values.description || "", submittedTags);
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
                                <Input placeholder="Milk, eggs, bread..." {...field} />
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
                                                ? tags.find(
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
                                                {tags.map((tag) => (
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
                <Button type="submit" disabled={isLoading} className="w-full">
                    {isLoading ? <><Spinner className="mr-2" /> {defaultValues ? "Updating..." : "Adding..."}</> : defaultValues ? "Update Todo" : "Add Todo"}
                </Button>
            </form>
        </Form>
    );
}