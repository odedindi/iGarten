"use client";

import { useState, useCallback, memo, useMemo } from "react";
import { Checkbox } from "@/components/ui/checkbox";

import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { type Task, type Harvest, useTaskStore } from "@/lib/task-store";
import {
    MoreHorizontal,
    Trash2,
    RotateCcw,
    Trash,
    Sprout,
    Flower2,
} from "lucide-react";
import { formatDateSafe } from "@/lib/utils";
import { isValid } from "date-fns";

const toTime = (d: Date | string | number | null | undefined): number => {
    if (!d) return 0;
    const parsed = d instanceof Date ? d : new Date(d);
    return isValid(parsed) ? parsed.getTime() : 0;
};

const DeletedTaskItem = memo(function DeletedTaskItem({
    task,
    onRestore,
    onPermanentDelete,
}: {
    task: Task;
    onRestore: (id: string) => void;
    onPermanentDelete: (id: string) => void;
}) {
    return (
        <Card className="group-hover:border-primary/50 mb-4 w-full gap-0">
            <CardHeader className="pb-1">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Sprout className="text-muted-foreground h-4 w-4" />
                        <CardTitle className="text-lg">{task.title}</CardTitle>
                    </div>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                                <span className="sr-only">Open menu</span>
                                <MoreHorizontal className="h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuItem
                                onClick={() => onRestore(task.id)}
                                className="text-green-600"
                            >
                                <RotateCcw className="mr-2 h-4 w-4" />
                                Restore
                            </DropdownMenuItem>
                            <DropdownMenuItem
                                onClick={() => onPermanentDelete(task.id)}
                                className="text-destructive"
                            >
                                <Trash className="mr-2 h-4 w-4" />
                                Delete Forever
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </CardHeader>
            <CardContent>
                <div className="space-y-2">
                    <div
                        className="text-muted-foreground line-clamp-3 text-sm"
                        dangerouslySetInnerHTML={{ __html: task.description }}
                    />
                    <div className="flex flex-wrap gap-2">
                        <Badge variant="outline">{task.status}</Badge>
                        <Badge variant="outline">{task.priority}</Badge>
                        {task.tags.map((tag, i) => (
                            <Badge
                                key={i}
                                variant="secondary"
                                className="text-xs"
                            >
                                {tag}
                            </Badge>
                        ))}
                    </div>
                    <div className="text-muted-foreground text-xs">
                        Created: {formatDateSafe(task.dateCreated, "PPP")}
                    </div>
                    <div className="text-muted-foreground text-xs">
                        Deleted: {formatDateSafe(task.deletedAt)}
                    </div>
                </div>
            </CardContent>
        </Card>
    );
});

const DeletedHarvestItem = memo(function DeletedHarvestItem({
    harvest,
    onRestore,
    onPermanentDelete,
}: {
    harvest: Harvest;
    onRestore: (id: string) => void;
    onPermanentDelete: (id: string) => void;
}) {
    return (
        <Card className="group-hover:border-primary/50 mb-4 w-full gap-0">
            <CardHeader className="pb-1">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Flower2 className="text-muted-foreground h-4 w-4" />
                        <CardTitle className="text-lg">
                            {harvest.cropName}
                        </CardTitle>
                    </div>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                                <span className="sr-only">Open menu</span>
                                <MoreHorizontal className="h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuItem
                                onClick={() => onRestore(harvest.id)}
                                className="text-green-600"
                            >
                                <RotateCcw className="mr-2 h-4 w-4" />
                                Restore
                            </DropdownMenuItem>
                            <DropdownMenuItem
                                onClick={() => onPermanentDelete(harvest.id)}
                                className="text-destructive"
                            >
                                <Trash className="mr-2 h-4 w-4" />
                                Delete Forever
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </CardHeader>
            <CardContent>
                <div className="space-y-2">
                    <div className="text-muted-foreground text-sm">
                        {harvest.quantity} {harvest.unit} • {harvest.location}
                    </div>
                    <div
                        className="text-muted-foreground line-clamp-3 text-sm"
                        dangerouslySetInnerHTML={{
                            __html: harvest.notes,
                        }}
                    />
                    <div className="flex flex-wrap gap-2">
                        <Badge variant="outline">{harvest.quality}</Badge>
                        {harvest.weather && (
                            <Badge variant="outline">{harvest.weather}</Badge>
                        )}
                    </div>
                    <div className="text-muted-foreground text-xs">
                        Harvested:{" "}
                        {formatDateSafe(harvest.dateHarvested, "PPP")}
                    </div>
                    <div className="text-muted-foreground text-xs">
                        Deleted: {formatDateSafe(harvest.deletedAt)}
                    </div>
                </div>
            </CardContent>
        </Card>
    );
});

export default function TrashPage() {
    const {
        getDeletedTasks,
        getDeletedHarvests,
        restoreTask,
        restoreHarvest,
        permanentDeleteTask,
        permanentDeleteHarvest,
    } = useTaskStore();

    const [selectedTasks, setSelectedTasks] = useState<string[]>([]);
    const [selectedHarvests, setSelectedHarvests] = useState<string[]>([]);

    const deletedTasks = getDeletedTasks();
    const deletedHarvests = getDeletedHarvests();

    const handleRestoreTask = useCallback(
        (id: string) => {
            restoreTask(id);
        },
        [restoreTask]
    );

    const handleRestoreHarvest = useCallback(
        (id: string) => {
            restoreHarvest(id);
        },
        [restoreHarvest]
    );

    const handlePermanentDeleteTask = useCallback(
        (id: string) => {
            permanentDeleteTask(id);
        },
        [permanentDeleteTask]
    );

    const handlePermanentDeleteHarvest = useCallback(
        (id: string) => {
            permanentDeleteHarvest(id);
        },
        [permanentDeleteHarvest]
    );

    const handleSelectTask = useCallback((id: string, selected: boolean) => {
        setSelectedTasks((prev) =>
            selected ? [...prev, id] : prev.filter((taskId) => taskId !== id)
        );
    }, []);

    const handleSelectHarvest = useCallback((id: string, selected: boolean) => {
        setSelectedHarvests((prev) =>
            selected
                ? [...prev, id]
                : prev.filter((harvestId) => harvestId !== id)
        );
    }, []);

    const handleSelectAllTasks = useCallback(
        (selected: boolean) => {
            setSelectedTasks(
                selected ? deletedTasks.map((task) => task.id) : []
            );
        },
        [deletedTasks]
    );

    const handleSelectAllHarvests = useCallback(
        (selected: boolean) => {
            setSelectedHarvests(
                selected ? deletedHarvests.map((harvest) => harvest.id) : []
            );
        },
        [deletedHarvests]
    );

    const handleBulkRestoreTasks = useCallback(() => {
        selectedTasks.forEach((id) => restoreTask(id));
        setSelectedTasks([]);
    }, [selectedTasks, restoreTask]);

    const handleBulkRestoreHarvests = useCallback(() => {
        selectedHarvests.forEach((id) => restoreHarvest(id));
        setSelectedHarvests([]);
    }, [selectedHarvests, restoreHarvest]);

    const handleBulkPermanentDeleteTasks = useCallback(() => {
        selectedTasks.forEach((id) => permanentDeleteTask(id));
        setSelectedTasks([]);
    }, [selectedTasks, permanentDeleteTask]);

    const handleBulkPermanentDeleteHarvests = useCallback(() => {
        selectedHarvests.forEach((id) => permanentDeleteHarvest(id));
        setSelectedHarvests([]);
    }, [selectedHarvests, permanentDeleteHarvest]);

    const allDeletedItems = useMemo(
        () =>
            [
                ...deletedTasks.map((t) => ({ ...t, type: "task" as const })),
                ...deletedHarvests.map((h) => ({
                    ...h,
                    type: "harvest" as const,
                })),
            ].sort((a, b) => toTime(b.deletedAt) - toTime(a.deletedAt)),
        [deletedTasks, deletedHarvests]
    );
    const allSelectedItems = selectedTasks.length + selectedHarvests.length;
    return (
        <div className="container mx-auto mb-6 max-w-6xl overflow-auto p-6 sm:p-3">
            <div className="garden-header rounded-lg p-6 sm:mx-6">
                <h1 className="text-primary relative z-10 flex items-center gap-2 text-3xl font-bold">
                    <Trash2 className="h-8 w-8" />
                    Garbage Bin
                </h1>
                <p className="text-muted-foreground relative z-10">
                    Manage your deleted garden entries. You can restore them or
                    delete them permanently.
                </p>
            </div>

            {!allDeletedItems.length ? (
                <div className="py-12 text-center">
                    <Sprout className="text-muted-foreground mx-auto mb-4 h-12 w-12" />
                    <h3 className="mb-2 text-lg font-semibold">
                        No deleted items
                    </h3>
                    <p className="text-muted-foreground">
                        Your garden is safe and sound!
                    </p>
                </div>
            ) : (
                <>
                    <div className="my-6 flex flex-col gap-2 sm:flex-row sm:flex-wrap md:items-center">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                                handleSelectAllTasks(
                                    selectedTasks.length !== deletedTasks.length
                                );
                                handleSelectAllHarvests(
                                    selectedHarvests.length !==
                                        deletedHarvests.length
                                );
                            }}
                            className="w-full flex-1 md:w-auto"
                        >
                            {allSelectedItems === allDeletedItems.length
                                ? "Deselect All"
                                : "Select All"}
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                                handleBulkRestoreTasks();
                                handleBulkRestoreHarvests();
                            }}
                            className="w-full flex-1 text-green-600 md:w-auto"
                            disabled={!selectedTasks.length}
                        >
                            <RotateCcw className="mr-2 h-4 w-4" />
                            Restore Selected{" "}
                            {allSelectedItems > 0 && `(${allSelectedItems})`}
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                                handleBulkPermanentDeleteTasks();
                                handleBulkPermanentDeleteHarvests();
                            }}
                            className="text-destructive w-full flex-1 md:w-auto"
                            disabled={!selectedTasks.length}
                        >
                            <Trash className="mr-2 h-4 w-4" />
                            Delete Forever{" "}
                            {allSelectedItems > 0 && `(${allSelectedItems})`}
                        </Button>
                    </div>
                    <div className="space-y-4">
                        {allDeletedItems.map((item) => {
                            const { type, ...rest } = item;
                            const isTask = type === "task";
                            const checked = isTask
                                ? selectedTasks.includes(item.id)
                                : selectedHarvests.includes(item.id);
                            const handleSelect = isTask
                                ? handleSelectTask
                                : handleSelectHarvest;
                            const handleRestore = isTask
                                ? handleRestoreTask
                                : handleRestoreHarvest;
                            const handlePermanentDelete = isTask
                                ? handlePermanentDeleteTask
                                : handlePermanentDeleteHarvest;
                            return (
                                <div
                                    key={item.id}
                                    className="group flex cursor-pointer items-start gap-3"
                                    onClick={() =>
                                        handleSelect(item.id, !checked)
                                    }
                                >
                                    <Checkbox
                                        checked={checked}
                                        onCheckedChange={(checked) =>
                                            handleSelect(item.id, !!checked)
                                        }
                                        aria-label="Select item"
                                        className="mt-2"
                                    />
                                    {isTask ? (
                                        <DeletedTaskItem
                                            task={rest as Task}
                                            onRestore={handleRestore}
                                            onPermanentDelete={
                                                handlePermanentDelete
                                            }
                                        />
                                    ) : (
                                        <DeletedHarvestItem
                                            harvest={item as Harvest}
                                            onRestore={handleRestore}
                                            onPermanentDelete={
                                                handlePermanentDelete
                                            }
                                        />
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </>
            )}
        </div>
    );
}
