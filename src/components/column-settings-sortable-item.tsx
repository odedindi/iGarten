"use client";

import type { FC } from "react";

import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

import type { Column } from "@/lib/task-store";
import { Grip } from "lucide-react";

import { useSortable } from "@dnd-kit/sortable";

import { CSS } from "@dnd-kit/utilities";

import { cn } from "@/lib/utils";

interface ColumnSettingsDndItemProps {
    className?: string;
    column: Column;
    handleVisibilityChange: (id: string, checked: boolean) => void;
}

export const ColumnSettingsDndItem: FC<ColumnSettingsDndItemProps> = ({
    className,
    column,
    handleVisibilityChange,
}) => {
    const { attributes, listeners, setNodeRef, transform, transition } =
        useSortable({ id: column.id });
    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
    };
    return (
        <div
            ref={setNodeRef}
            style={style}
            className={cn(
                "garden-input flex items-center space-x-2 rounded-md border p-3",
                className
            )}
        >
            <Checkbox
                id={`column-${column.id}`}
                checked={column.visible}
                onCheckedChange={(checked) =>
                    handleVisibilityChange(column.id, checked as boolean)
                }
            />
            <Label
                htmlFor={`column-${column.id}`}
                className="flex-1 cursor-pointer"
            >
                {column.label}
            </Label>
            <Grip
                className="h-4 w-4 cursor-grab"
                {...attributes}
                {...listeners}
            />
        </div>
    );
};
