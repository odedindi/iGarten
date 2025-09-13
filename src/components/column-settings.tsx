"use client";

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

import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { type Column, useTaskStore } from "@/lib/task-store";
import { Settings } from "lucide-react";

import {
    defaultDropAnimationSideEffects,
    DragEndEvent,
    DragOverlay,
    DropAnimation,
    UniqueIdentifier,
} from "@dnd-kit/core";

import {
    SortableContext,
    rectSortingStrategy,
    arrayMove,
} from "@dnd-kit/sortable";

import { createPortal } from "react-dom";
import { cn } from "@/lib/utils";
import { ColumnSettingsDndContext } from "./column-settings-dnd-context";
import { ColumnSettingsDndItem } from "./column-settings-sortable-item";

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

    const [activeId, setActiveId] = useState<UniqueIdentifier | null>(null);

    const handleDragEnd = ({ active, over }: DragEndEvent) => {
        setActiveId(null);
        if (!over) {
            return;
        }

        if (active.id == over.id) {
            return;
        }

        setLocalColumns((items) =>
            arrayMove(
                items,
                items.findIndex((it) => it.id == active.id),
                items.findIndex((it) => it.id == over.id)
            ).map((item, index) => ({
                ...item,
                order: index,
            }))
        );
    };

    const getIndex = (id: UniqueIdentifier) =>
        localColumns.findIndex((c) => c.id === id);

    const activeIndex = activeId != null ? getIndex(activeId) : -1;
    const dropAnimationConfig: DropAnimation = {
        sideEffects: defaultDropAnimationSideEffects({
            styles: {
                active: {
                    opacity: "0.5",
                },
            },
        }),
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
                <DialogDescription>
                    Customize your table view by selecting which columns to
                    display and reordering them with drag-and-drop. You can also
                    enable or disable sorting and filtering features for your
                    data tables.
                </DialogDescription>
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

                    <div className="max-h-[30vh] space-y-2 overflow-auto">
                        <ColumnSettingsDndContext
                            onDragCancel={() => setActiveId(null)}
                            onDragEnd={handleDragEnd}
                            onDragStart={({ active }) => {
                                if (!active) return;
                                setActiveId(active.id);
                            }}
                        >
                            <SortableContext
                                items={localColumns}
                                strategy={rectSortingStrategy}
                            >
                                {localColumns.map((column) => (
                                    <ColumnSettingsDndItem
                                        key={column.id}
                                        column={column}
                                        className={cn(
                                            localColumns[activeIndex]?.id ===
                                                column.id && "opacity-25"
                                        )}
                                        handleVisibilityChange={
                                            handleVisibilityChange
                                        }
                                    />
                                ))}
                            </SortableContext>
                            {createPortal(
                                <DragOverlay
                                    adjustScale
                                    dropAnimation={dropAnimationConfig}
                                >
                                    {activeId !== null &&
                                    !!localColumns[activeIndex] ? (
                                        <ColumnSettingsDndItem
                                            column={localColumns[activeIndex]}
                                            handleVisibilityChange={
                                                handleVisibilityChange
                                            }
                                        />
                                    ) : null}
                                </DragOverlay>,
                                document.body
                            )}
                        </ColumnSettingsDndContext>
                    </div>
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
