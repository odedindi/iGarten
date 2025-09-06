"use client";

import { useState, useCallback, memo } from "react";
import { useRouter } from "next/navigation";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
    type Task,
    type TaskPriority,
    type TaskStatus,
    useTaskStore,
} from "@/lib/task-store";
import { Edit, MoreHorizontal, Trash } from "lucide-react";
import { format } from "date-fns";
import { DataTable } from "@/components/ui/data-table";
import { RichTextEditorModal } from "@/components/rich-text-editor-modal";

export const TaskTable = memo(function TaskTable() {
    const router = useRouter();
    const { tasks, columns, updateTask, deleteTask, tableSettings } =
        useTaskStore();

    // Filter out deleted tasks
    const activeTasks = tasks.filter((task) => !task.deleted);
    const [editingCell, setEditingCell] = useState<{
        id: string;
        field: keyof Task;
    } | null>(null);
    const [editValue, setEditValue] = useState<string>("");
    const [descriptionModal, setDescriptionModal] = useState<{
        isOpen: boolean;
        taskId: string;
        content: string;
    }>({
        isOpen: false,
        taskId: "",
        content: "",
    });

    const handleEdit = useCallback((task: Task, field: keyof Task) => {
        setEditingCell({ id: task.id, field });
        setEditValue(String(task[field]));
    }, []);

    const handleSave = useCallback(() => {
        if (!editingCell) return;

        const { id, field } = editingCell;
        let value: unknown = editValue;

        // Convert value based on field type
        if (field === "tags" && typeof value === "string") {
            value = value.split(",").map((tag) => tag.trim());
        }

        updateTask(id, { [field]: value });
        setEditingCell(null);
    }, [editingCell, editValue, updateTask]);

    const handleDeleteTasks = useCallback(
        (ids: string[]) => {
            ids.forEach((id) => deleteTask(id));
        },
        [deleteTask]
    );

    const handleOpenDescriptionModal = useCallback((task: Task) => {
        setDescriptionModal({
            isOpen: true,
            taskId: task.id,
            content: task.description,
        });
    }, []);

    const handleCloseDescriptionModal = useCallback(() => {
        setDescriptionModal({
            isOpen: false,
            taskId: "",
            content: "",
        });
    }, []);

    const handleSaveDescription = useCallback(
        (content: string) => {
            updateTask(descriptionModal.taskId, { description: content });
            handleCloseDescriptionModal();
        },
        [descriptionModal.taskId, updateTask, handleCloseDescriptionModal]
    );

    const formatCellValue = useCallback(
        (task: Task, columnId: string) => {
            const value = task[columnId as keyof Task];

            if (columnId === "dateCreated" || columnId === "dueDate") {
                return value ? format(new Date(value as string), "PPP") : "-";
            }

            if (columnId === "tags" && Array.isArray(value)) {
                return (
                    <div className="flex flex-wrap gap-1">
                        {(value as string[]).map((tag, i) => (
                            <Badge
                                key={i}
                                variant="outline"
                                className="garden-badge"
                            >
                                {tag}
                            </Badge>
                        ))}
                    </div>
                );
            }

            if (columnId === "status") {
                const statusColors: Record<TaskStatus, string> = {
                    completed: "bg-success/20 text-success",
                    "to-plant": "bg-secondary text-secondary-foreground",
                    growing: "bg-primary/20 text-primary",
                    harvested: "bg-accent text-accent-foreground",
                    failed: "bg-destructive/20 text-destructive",
                };
                return (
                    <Badge
                        className={statusColors[value as TaskStatus]}
                        variant="outline"
                    >
                        {value}
                    </Badge>
                );
            }

            if (columnId === "priority") {
                const priorityColors: Record<TaskPriority, string> = {
                    low: "bg-muted text-muted-foreground",
                    medium: "bg-secondary text-secondary-foreground",
                    high: "bg-accent text-accent-foreground",
                    urgent: "bg-destructive/20 text-destructive",
                };
                return (
                    <Badge
                        className={priorityColors[value as TaskPriority]}
                        variant="outline"
                    >
                        {value}
                    </Badge>
                );
            }

            if (columnId === "description") {
                return (
                    <div
                        className="hover:bg-primary/5 line-clamp-2 cursor-pointer rounded p-1"
                        onClick={() => handleOpenDescriptionModal(task)}
                        onKeyDown={(e) => {
                            if (e.key === "Enter" || e.key === " ") {
                                handleOpenDescriptionModal(task);
                            }
                        }}
                        role="button"
                        tabIndex={0}
                        dangerouslySetInnerHTML={{ __html: value as string }}
                    />
                );
            }

            return value;
        },
        [handleOpenDescriptionModal]
    );

    const renderCell = useCallback(
        (task: Task, columnId: string) => {
            const isEditing =
                editingCell?.id === task.id && editingCell?.field === columnId;

            if (isEditing) {
                if (columnId === "status") {
                    return (
                        <Select
                            value={editValue}
                            onValueChange={(value) => {
                                setEditValue(value);
                                updateTask(task.id, {
                                    status: value as TaskStatus,
                                });
                                setEditingCell(null);
                            }}
                        >
                            <SelectTrigger className="garden-input w-full">
                                <SelectValue placeholder="Select status" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="to-plant">
                                    To Plant
                                </SelectItem>
                                <SelectItem value="growing">Growing</SelectItem>
                                <SelectItem value="harvested">
                                    Harvested
                                </SelectItem>
                                <SelectItem value="failed">
                                    Failed (RIP Plant)
                                </SelectItem>
                            </SelectContent>
                        </Select>
                    );
                }

                if (columnId === "priority") {
                    return (
                        <Select
                            value={editValue}
                            onValueChange={(value) => {
                                setEditValue(value);
                                updateTask(task.id, {
                                    priority: value as TaskPriority,
                                });
                                setEditingCell(null);
                            }}
                        >
                            <SelectTrigger className="garden-input w-full">
                                <SelectValue placeholder="Select priority" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="low">Low</SelectItem>
                                <SelectItem value="medium">Medium</SelectItem>
                                <SelectItem value="high">High</SelectItem>
                                <SelectItem value="urgent">Urgent</SelectItem>
                            </SelectContent>
                        </Select>
                    );
                }

                if (columnId === "dueDate") {
                    return (
                        <Input
                            type="date"
                            value={
                                editValue
                                    ? new Date(editValue)
                                          .toISOString()
                                          .split("T")[0]
                                    : ""
                            }
                            onChange={(e) =>
                                setEditValue(
                                    e.target.value
                                        ? new Date(e.target.value).toISOString()
                                        : ""
                                )
                            }
                            onBlur={handleSave}
                            onKeyDown={(e) => e.key === "Enter" && handleSave()}
                            className="garden-input"
                            autoFocus
                        />
                    );
                }

                if (columnId === "tags") {
                    const tagsArray = Array.isArray(task.tags) ? task.tags : [];
                    return (
                        <Input
                            value={tagsArray.join(", ")}
                            onChange={(e) => setEditValue(e.target.value)}
                            onBlur={handleSave}
                            onKeyDown={(e) => e.key === "Enter" && handleSave()}
                            placeholder="Comma separated tags"
                            className="garden-input"
                            autoFocus
                        />
                    );
                }

                return (
                    <Input
                        value={editValue}
                        onChange={(e) => setEditValue(e.target.value)}
                        onBlur={handleSave}
                        onKeyDown={(e) => e.key === "Enter" && handleSave()}
                        className="garden-input"
                        autoFocus
                    />
                );
            }

            return (
                <div
                    className="hover:bg-primary/5 cursor-pointer rounded p-1"
                    onClick={() => {
                        if (
                            columnId !== "dateCreated" &&
                            columnId !== "description"
                        ) {
                            handleEdit(task, columnId as keyof Task);
                        }
                    }}
                >
                    {formatCellValue(task, columnId)}
                </div>
            );
        },
        [
            editingCell,
            editValue,
            handleEdit,
            handleSave,
            formatCellValue,
            updateTask,
        ]
    );

    const renderActions = useCallback(
        (task: Task) => (
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="h-8 w-8 p-0">
                        <span className="sr-only">Open menu</span>
                        <MoreHorizontal className="h-4 w-4" />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                    <DropdownMenuItem
                        onClick={() => router.push(`/task/${task.id}/edit`)}
                    >
                        <Edit className="mr-2 h-4 w-4" />
                        Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem
                        onClick={() => deleteTask(task.id)}
                        className="text-destructive"
                    >
                        <Trash className="mr-2 h-4 w-4" />
                        Delete
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        ),
        [router, deleteTask]
    );

    const getFilterType = useCallback(
        (columnId: string): "text" | "select" | "date" | "number" | "tags" => {
            if (columnId === "dateCreated" || columnId === "dueDate") {
                return "date";
            } else if (columnId === "status") {
                return "select";
            } else if (columnId === "priority") {
                return "select";
            } else if (columnId === "tags") {
                return "tags";
            }
            return "text";
        },
        []
    );

    const getFilterOptions = useCallback((columnId: string) => {
        if (columnId === "status") {
            return [
                { value: "to-plant", label: "To Plant" },
                { value: "growing", label: "Growing" },
                { value: "harvested", label: "Harvested" },
                { value: "failed", label: "Failed" },
            ];
        } else if (columnId === "priority") {
            return [
                { value: "low", label: "Low" },
                { value: "medium", label: "Medium" },
                { value: "high", label: "High" },
                { value: "urgent", label: "Urgent" },
            ];
        }
        return undefined;
    }, []);

    return (
        <>
            <DataTable
                data={activeTasks}
                columns={columns}
                defaultSortKey="dateCreated"
                defaultSortDirection="desc"
                defaultPageSize={10}
                tableSettings={tableSettings}
                renderCell={renderCell}
                renderActions={renderActions}
                onDelete={handleDeleteTasks}
                emptyState={{
                    message: "No garden tasks found. Time to start planting!",
                    buttonText: "Add Your First Garden Task",
                    buttonAction: () => router.push("/?tab=task"),
                }}
                getFilterType={getFilterType}
                getFilterOptions={getFilterOptions}
                tableName="Garden Tasks"
            />
            <RichTextEditorModal
                isOpen={descriptionModal.isOpen}
                onClose={handleCloseDescriptionModal}
                initialContent={descriptionModal.content}
                onSave={handleSaveDescription}
                title="Edit Task Description"
            />
        </>
    );
});
