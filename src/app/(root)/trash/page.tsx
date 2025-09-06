"use client";

import { useState, useCallback, memo } from "react";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { type Task, type Harvest, useTaskStore } from "@/lib/task-store";
import {
    MoreHorizontal,
    Trash2,
    RotateCcw,
    Trash,
    Sprout,
    Flower2,
} from "lucide-react";
import { format } from "date-fns";

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
        <Card className="mb-4 w-full gap-0">
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
                        Deleted:{" "}
                        {task.deletedAt
                            ? format(new Date(task.deletedAt), "PPP 'at' p")
                            : "Unknown"}
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
        <Card className="mb-4 w-full gap-0">
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
                        <Badge variant="outline">{harvest.weather}</Badge>
                    </div>
                    <div className="text-muted-foreground text-xs">
                        Harvested:{" "}
                        {format(new Date(harvest.dateHarvested), "PPP")}
                    </div>
                    <div className="text-muted-foreground text-xs">
                        Deleted:{" "}
                        {harvest.deletedAt
                            ? format(new Date(harvest.deletedAt), "PPP 'at' p")
                            : "Unknown"}
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

    return (
        <div className="container mx-auto space-y-6 overflow-auto p-6">
            <div className="garden-header rounded-lg p-6">
                <h1 className="text-primary relative z-10 flex items-center gap-2 text-3xl font-bold">
                    <Trash2 className="h-8 w-8" />
                    Garbage Bin
                </h1>
                <p className="text-muted-foreground relative z-10">
                    Manage your deleted garden entries. You can restore them or
                    delete them permanently.
                </p>
            </div>

            <Tabs defaultValue="tasks" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger
                        value="tasks"
                        className="flex items-center gap-2"
                    >
                        <Sprout className="h-4 w-4" />
                        Tasks ({deletedTasks.length})
                    </TabsTrigger>
                    <TabsTrigger
                        value="harvests"
                        className="flex items-center gap-2"
                    >
                        <Flower2 className="h-4 w-4" />
                        Harvests ({deletedHarvests.length})
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="tasks" className="mt-6">
                    {deletedTasks.length > 0 && (
                        <div className="mb-4 flex items-center gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() =>
                                    handleSelectAllTasks(
                                        selectedTasks.length !==
                                            deletedTasks.length
                                    )
                                }
                            >
                                {selectedTasks.length === deletedTasks.length
                                    ? "Deselect All"
                                    : "Select All"}
                            </Button>
                            {selectedTasks.length > 0 && (
                                <>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={handleBulkRestoreTasks}
                                        className="text-green-600"
                                    >
                                        <RotateCcw className="mr-2 h-4 w-4" />
                                        Restore Selected ({selectedTasks.length}
                                        )
                                    </Button>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={handleBulkPermanentDeleteTasks}
                                        className="text-destructive"
                                    >
                                        <Trash className="mr-2 h-4 w-4" />
                                        Delete Forever ({selectedTasks.length})
                                    </Button>
                                </>
                            )}
                        </div>
                    )}

                    {deletedTasks.length === 0 ? (
                        <div className="py-12 text-center">
                            <Sprout className="text-muted-foreground mx-auto mb-4 h-12 w-12" />
                            <h3 className="mb-2 text-lg font-semibold">
                                No deleted tasks
                            </h3>
                            <p className="text-muted-foreground">
                                All your garden tasks are safe and sound!
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {deletedTasks.map((task) => (
                                <div
                                    key={task.id}
                                    className="flex items-start gap-3"
                                >
                                    <Checkbox
                                        checked={selectedTasks.includes(
                                            task.id
                                        )}
                                        onCheckedChange={(checked) =>
                                            handleSelectTask(task.id, !!checked)
                                        }
                                        aria-label="Select item"
                                        className="mt-2"
                                    />

                                    <DeletedTaskItem
                                        task={task}
                                        onRestore={handleRestoreTask}
                                        onPermanentDelete={
                                            handlePermanentDeleteTask
                                        }
                                    />
                                </div>
                            ))}
                        </div>
                    )}
                </TabsContent>

                <TabsContent value="harvests" className="mt-6">
                    {deletedHarvests.length > 0 && (
                        <div className="mb-4 flex items-center gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() =>
                                    handleSelectAllHarvests(
                                        selectedHarvests.length !==
                                            deletedHarvests.length
                                    )
                                }
                            >
                                {selectedHarvests.length ===
                                deletedHarvests.length
                                    ? "Deselect All"
                                    : "Select All"}
                            </Button>
                            {selectedHarvests.length > 0 && (
                                <>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={handleBulkRestoreHarvests}
                                        className="text-green-600"
                                    >
                                        <RotateCcw className="mr-2 h-4 w-4" />
                                        Restore Selected (
                                        {selectedHarvests.length})
                                    </Button>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={
                                            handleBulkPermanentDeleteHarvests
                                        }
                                        className="text-destructive"
                                    >
                                        <Trash className="mr-2 h-4 w-4" />
                                        Delete Forever (
                                        {selectedHarvests.length})
                                    </Button>
                                </>
                            )}
                        </div>
                    )}

                    {deletedHarvests.length === 0 ? (
                        <div className="py-12 text-center">
                            <Flower2 className="text-muted-foreground mx-auto mb-4 h-12 w-12" />
                            <h3 className="mb-2 text-lg font-semibold">
                                No deleted harvests
                            </h3>
                            <p className="text-muted-foreground">
                                All your harvest records are safe and sound!
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {deletedHarvests.map((harvest) => (
                                <div
                                    key={harvest.id}
                                    className="flex items-start gap-3"
                                >
                                    <Checkbox
                                        checked={selectedHarvests.includes(
                                            harvest.id
                                        )}
                                        onCheckedChange={(checked) =>
                                            handleSelectHarvest(
                                                harvest.id,
                                                !!checked
                                            )
                                        }
                                        aria-label="Select item"
                                        className="mt-2"
                                    />
                                    <DeletedHarvestItem
                                        harvest={harvest}
                                        onRestore={handleRestoreHarvest}
                                        onPermanentDelete={
                                            handlePermanentDeleteHarvest
                                        }
                                    />
                                </div>
                            ))}
                        </div>
                    )}
                </TabsContent>
            </Tabs>
        </div>
    );
}
