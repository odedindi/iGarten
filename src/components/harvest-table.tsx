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
import { type Harvest, useTaskStore } from "@/lib/task-store";
import { Edit, MoreHorizontal, Trash } from "lucide-react";
import { format } from "date-fns";
import { DataTable } from "@/components/ui/data-table";

export const HarvestTable = memo(function HarvestTable() {
    const router = useRouter();
    const {
        harvests,
        harvestColumns,
        updateHarvest,
        deleteHarvest,
        harvestTableSettings,
    } = useTaskStore();
    const [editingCell, setEditingCell] = useState<{
        id: string;
        field: keyof Harvest;
    } | null>(null);
    const [editValue, setEditValue] = useState<string>("");

    const handleEdit = useCallback((harvest: Harvest, field: keyof Harvest) => {
        setEditingCell({ id: harvest.id, field });
        setEditValue(String(harvest[field]));
    }, []);

    const handleSave = useCallback(() => {
        if (!editingCell) return;

        const { id, field } = editingCell;
        let value: unknown = editValue;

        // Convert value based on field type
        if (field === "quantity" && typeof value === "string") {
            value = Number.parseFloat(value);
        }

        updateHarvest(id, { [field]: value });
        setEditingCell(null);
    }, [editingCell, editValue, updateHarvest]);

    const handleDeleteHarvests = useCallback(
        (ids: string[]) => {
            ids.forEach((id) => deleteHarvest(id));
        },
        [deleteHarvest]
    );

    const formatCellValue = useCallback(
        (harvest: Harvest, columnId: string) => {
            const value = harvest[columnId as keyof Harvest];

            if (columnId === "dateHarvested") {
                return value ? format(new Date(value as string), "PPP") : "-";
            }

            if (columnId === "quantity") {
                return `${value} ${harvest.unit}`;
            }

            if (columnId === "quality") {
                const qualityColors: Record<string, string> = {
                    poor: "bg-destructive/20 text-destructive",
                    average: "bg-secondary text-secondary-foreground",
                    good: "bg-primary/20 text-primary",
                    excellent: "bg-accent text-accent-foreground",
                };
                return (
                    <Badge
                        className={qualityColors[value as string]}
                        variant="outline"
                    >
                        {value}
                    </Badge>
                );
            }

            return value;
        },
        []
    );

    const renderCell = useCallback(
        (harvest: Harvest, columnId: string) => {
            const isEditing =
                editingCell?.id === harvest.id &&
                editingCell?.field === columnId;

            if (isEditing) {
                if (columnId === "quality") {
                    return (
                        <Select
                            value={editValue}
                            onValueChange={(value) => {
                                setEditValue(value);
                                updateHarvest(harvest.id, {
                                    quality: value as
                                        | "poor"
                                        | "average"
                                        | "good"
                                        | "excellent",
                                });
                                setEditingCell(null);
                            }}
                        >
                            <SelectTrigger className="garden-input w-full">
                                <SelectValue placeholder="Select quality" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="poor">Poor</SelectItem>
                                <SelectItem value="average">Average</SelectItem>
                                <SelectItem value="good">Good</SelectItem>
                                <SelectItem value="excellent">
                                    Excellent
                                </SelectItem>
                            </SelectContent>
                        </Select>
                    );
                }

                if (columnId === "unit") {
                    return (
                        <Select
                            value={editValue}
                            onValueChange={(value) => {
                                setEditValue(value);
                                updateHarvest(harvest.id, { unit: value });
                                setEditingCell(null);
                            }}
                        >
                            <SelectTrigger className="garden-input w-full">
                                <SelectValue placeholder="Select unit" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="kg">kg</SelectItem>
                                <SelectItem value="g">g</SelectItem>
                                <SelectItem value="lb">lb</SelectItem>
                                <SelectItem value="oz">oz</SelectItem>
                                <SelectItem value="count">count</SelectItem>
                                <SelectItem value="bunch">bunch</SelectItem>
                            </SelectContent>
                        </Select>
                    );
                }

                if (columnId === "dateHarvested") {
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

                if (columnId === "quantity") {
                    return (
                        <Input
                            type="number"
                            step="0.01"
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
                    role="button"
                    tabIndex={0}
                    onClick={() => {
                        handleEdit(harvest, columnId as keyof Harvest);
                    }}
                    onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                            handleEdit(harvest, columnId as keyof Harvest);
                        }
                    }}
                >
                    {formatCellValue(harvest, columnId)}
                </div>
            );
        },
        [
            editingCell,
            editValue,
            handleEdit,
            handleSave,
            formatCellValue,
            updateHarvest,
        ]
    );

    const renderActions = useCallback(
        (harvest: Harvest) => (
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="h-8 w-8 p-0">
                        <span className="sr-only">Open menu</span>
                        <MoreHorizontal className="h-4 w-4" />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                    <DropdownMenuItem
                        onClick={() =>
                            router.push(`/harvest/${harvest.id}/edit`)
                        }
                    >
                        <Edit className="mr-2 h-4 w-4" />
                        Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem
                        onClick={() => deleteHarvest(harvest.id)}
                        className="text-destructive"
                    >
                        <Trash className="mr-2 h-4 w-4" />
                        Delete
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        ),
        [router, deleteHarvest]
    );

    const getFilterType = useCallback(
        (columnId: string): "text" | "select" | "date" | "number" | "tags" => {
            if (columnId === "dateHarvested") {
                return "date";
            } else if (columnId === "quantity") {
                return "number";
            } else if (columnId === "quality") {
                return "select";
            } else if (columnId === "unit") {
                return "select";
            }
            return "text";
        },
        []
    );

    const getFilterOptions = useCallback((columnId: string) => {
        if (columnId === "quality") {
            return [
                { value: "poor", label: "Poor" },
                { value: "average", label: "Average" },
                { value: "good", label: "Good" },
                { value: "excellent", label: "Excellent" },
            ];
        } else if (columnId === "unit") {
            return [
                { value: "kg", label: "kg" },
                { value: "g", label: "g" },
                { value: "lb", label: "lb" },
                { value: "oz", label: "oz" },
                { value: "count", label: "count" },
                { value: "bunch", label: "bunch" },
            ];
        }
        return undefined;
    }, []);

    return (
        <DataTable
            data={harvests}
            columns={harvestColumns}
            defaultSortKey="dateHarvested"
            defaultSortDirection="desc"
            tableSettings={harvestTableSettings}
            renderCell={renderCell}
            renderActions={renderActions}
            onDelete={handleDeleteHarvests}
            emptyState={{
                message:
                    "No harvests logged yet. Time to reap what you've sown!",
                buttonText: "Log Your First Harvest",
                buttonAction: () => router.push("/?tab=harvest"),
            }}
            getFilterType={getFilterType}
            getFilterOptions={getFilterOptions}
            tableName="Harvest Log"
        />
    );
});
