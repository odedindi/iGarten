"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { type Column, useTaskStore } from "@/lib/task-store";
import { Grip, Settings } from "lucide-react";
import {
    DragDropContext,
    Droppable,
    Draggable,
    OnDragEndResponder,
} from "@hello-pangea/dnd";

export function ColumnSettings({
    type = "tasks",
}: {
    type?: "tasks" | "harvests";
}) {
    const {
        columns,
        harvestColumns,
        updateColumns,
        updateHarvestColumns,
        tableSettings,
        harvestTableSettings,
        updateTableSettings,
        updateHarvestTableSettings,
    } = useTaskStore();

    const [localColumns, setLocalColumns] = useState<Column[]>(
        type === "tasks" ? [...columns] : [...harvestColumns]
    );
    const [localSettings, setLocalSettings] = useState(
        type === "tasks" ? { ...tableSettings } : { ...harvestTableSettings }
    );
    const [open, setOpen] = useState(false);

    const handleVisibilityChange = (id: string, checked: boolean) => {
        setLocalColumns((prev) =>
            prev.map((col) =>
                col.id === id ? { ...col, visible: checked } : col
            )
        );
    };

    const handleSettingChange = (
        setting: keyof typeof localSettings,
        value: boolean
    ) => {
        setLocalSettings((prev) => ({ ...prev, [setting]: value }));
    };

    const handleSave = () => {
        if (type === "tasks") {
            updateColumns(localColumns);
            updateTableSettings(localSettings);
        } else {
            updateHarvestColumns(localColumns);
            updateHarvestTableSettings(localSettings);
        }
        setOpen(false);
    };

    const onDragEnd: OnDragEndResponder = (result) => {
        if (!result.destination) return;

        const items = Array.from(localColumns);
        const [reorderedItem] = items.splice(result.source.index, 1);
        items.splice(result.destination.index, 0, reorderedItem);

        // Update order property
        const updatedItems = items.map((item, index) => ({
            ...item,
            order: index,
        }));

        setLocalColumns(updatedItems);
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button
                    variant="outline"
                    className="garden-input flex items-center gap-2"
                >
                    <Settings className="garden-icon h-4 w-4" />
                    {type === "tasks"
                        ? "Garden Task Columns"
                        : "Harvest Log Columns"}
                </Button>
            </DialogTrigger>
            <DialogContent className="dialog-content sm:max-w-md">
                <DialogHeader>
                    <DialogTitle className="text-primary">
                        {type === "tasks"
                            ? "Manage Garden Task Columns"
                            : "Manage Harvest Log Columns"}
                    </DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                    <div className="space-y-2 border-b pb-3">
                        <h4 className="text-sm font-medium">Table Features</h4>
                        <div className="flex items-center justify-between">
                            <Label htmlFor="sortable">Enable Sorting</Label>
                            <Switch
                                id="sortable"
                                checked={localSettings.sortable}
                                onCheckedChange={(checked) =>
                                    handleSettingChange("sortable", checked)
                                }
                            />
                        </div>
                        <div className="flex items-center justify-between">
                            <Label htmlFor="filterable">Enable Filtering</Label>
                            <Switch
                                id="filterable"
                                checked={localSettings.filterable}
                                onCheckedChange={(checked) =>
                                    handleSettingChange("filterable", checked)
                                }
                            />
                        </div>
                    </div>

                    <p className="text-muted-foreground text-sm">
                        Select which columns to display and drag to reorder
                        them.
                    </p>
                    <DragDropContext onDragEnd={onDragEnd}>
                        <Droppable droppableId="columns">
                            {(provided) => (
                                <div
                                    {...provided.droppableProps}
                                    ref={provided.innerRef}
                                    className="space-y-2"
                                >
                                    {localColumns
                                        .sort((a, b) => a.order - b.order)
                                        .map((column, index) => (
                                            <Draggable
                                                key={column.id}
                                                draggableId={column.id}
                                                index={index}
                                            >
                                                {(provided) => (
                                                    <div
                                                        ref={provided.innerRef}
                                                        {...provided.draggableProps}
                                                        {...provided.dragHandleProps}
                                                        className="garden-input flex items-center space-x-2 rounded-md border p-3"
                                                    >
                                                        <Checkbox
                                                            id={`column-${column.id}`}
                                                            checked={
                                                                column.visible
                                                            }
                                                            onCheckedChange={(
                                                                checked
                                                            ) =>
                                                                handleVisibilityChange(
                                                                    column.id,
                                                                    checked as boolean
                                                                )
                                                            }
                                                        />
                                                        <Label
                                                            htmlFor={`column-${column.id}`}
                                                            className="flex-1 cursor-pointer"
                                                        >
                                                            {column.label}
                                                        </Label>

                                                        <Grip className="h-4 w-4 cursor-grab" />
                                                    </div>
                                                )}
                                            </Draggable>
                                        ))}
                                    {provided.placeholder}
                                </div>
                            )}
                        </Droppable>
                    </DragDropContext>
                </div>
                <div className="flex justify-end">
                    <Button onClick={handleSave} className="garden-button">
                        Save Changes
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
