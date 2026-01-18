import type { Tags } from "@/api/todoApi";
import { Button } from "@/components/ui/button";
import { ButtonGroup } from "@/components/ui/button-group";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { FolderOpen, MoreHorizontalIcon } from "lucide-react";

const tags: Tags[] = ["All", "Work", "Personal", "Urgent", "Home", "Shopping"];
export type Filter = "all" | "completed" | "active";

export function CategoryFilter({
  activeTag,
  onTagChange,
  completionFilter,
  onCompletionFilterChange,
}: {
  activeTag: Tags;
  onTagChange: (tag: Tags) => void;
  completionFilter: Filter;
  onCompletionFilterChange: (filter: Filter) => void;
}) {
  return (
    <ButtonGroup className="flex-wrap items-center">
      {tags.map((tag) => (
        <Button
          key={tag}
          variant={activeTag === tag ? "default" : "outline"}
          size="sm"
          onClick={() => onTagChange(tag)}
          className="gap-2"
        >
          <FolderOpen className="size-4" />
          {tag}
        </Button>
      ))}

      <DropdownMenu>
        <Button variant="outline" size="sm" asChild>
          <DropdownMenuTrigger>
            {completionFilter || "Active"}<MoreHorizontalIcon className="size-4" />
          </DropdownMenuTrigger>
        </Button>
        <DropdownMenuContent align="end">
          <DropdownMenuRadioGroup
            value={completionFilter}
            onValueChange={(value) => onCompletionFilterChange(value as Filter)}
          >
            <DropdownMenuRadioItem value="all">All</DropdownMenuRadioItem>
            <DropdownMenuRadioItem value="active">Active</DropdownMenuRadioItem>
            <DropdownMenuRadioItem value="completed">
              Completed
            </DropdownMenuRadioItem>
          </DropdownMenuRadioGroup>
        </DropdownMenuContent>
      </DropdownMenu>
    </ButtonGroup>
  );
}
