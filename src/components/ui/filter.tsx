"use client";
import { XCircle } from "lucide-react";
import { Input } from "./input";
import { Button } from "./button";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "./select";
import { Badge } from "./badge";
import { cn } from "@/lib/utils";
import { DatePicker } from "./date-picker";
import { format, isValid } from "date-fns";
import { FilterValueType } from "@/lib/types";

const isValidDate = (value: unknown): value is Date => isValid(value);
const DATE_FORMAT = "yyyy-MM-dd";

interface FilterProps {
    column: string;
    columnLabel: string;
    type: "text" | "select" | "date" | "number" | "boolean" | "tags";
    value: FilterValueType;
    onChange: (value: FilterValueType) => void;
    onClear: () => void;
    options?: { value: string; label: string }[];
    className?: string;
}

export function Filter({
    // column,
    columnLabel,
    type,
    value,
    onChange,
    onClear,
    options = [],
    className,
}: FilterProps) {
    const renderFilterInput = () => {
        switch (type) {
            case "text":
                return (
                    <Input
                        placeholder={`Filter by ${columnLabel}`}
                        value={value?.toString() ?? ""}
                        onChange={(e) => onChange(e.target.value)}
                        className="garden-input h-8"
                    />
                );
            case "number":
                return (
                    <Input
                        type="number"
                        placeholder={`Filter by ${columnLabel}`}
                        value={value?.toString() ?? ""}
                        onChange={(e) =>
                            onChange(
                                e.target.value ? Number(e.target.value) : ""
                            )
                        }
                        className="garden-input h-8"
                    />
                );
            case "date":
                return (
                    <DatePicker
                        value={isValidDate(value) ? new Date(value) : undefined}
                        onChange={(date) => {
                            const nextDate = date
                                ? format(date, DATE_FORMAT)
                                : undefined;
                            const shouldClear =
                                typeof value === "string" && nextDate === value;

                            onChange(shouldClear ? undefined : nextDate);
                        }}
                    />
                );
            case "select":
                return (
                    <Select
                        value={value?.toString() ?? ""}
                        onValueChange={onChange}
                    >
                        <SelectTrigger className="garden-input h-8">
                            <SelectValue
                                placeholder={`Filter by ${columnLabel}`}
                            />
                        </SelectTrigger>
                        <SelectContent>
                            {options.map((option) => (
                                <SelectItem
                                    key={option.value}
                                    value={option.value}
                                >
                                    {option.label}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                );
            case "tags":
                return (
                    <Input
                        placeholder={`Filter by ${columnLabel}`}
                        value={value?.toString() ?? ""}
                        onChange={(e) => onChange(e.target.value)}
                        className="garden-input h-8"
                    />
                );
            case "boolean":
                return (
                    <Select
                        value={value?.toString() ?? ""}
                        onValueChange={(val) => onChange(val === "true")}
                    >
                        <SelectTrigger className="garden-input h-8">
                            <SelectValue
                                placeholder={`Filter by ${columnLabel}`}
                            />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="true">Yes</SelectItem>
                            <SelectItem value="false">No</SelectItem>
                        </SelectContent>
                    </Select>
                );
            default:
                return null;
        }
    };

    return (
        <div className={cn("flex items-center gap-1", className)}>
            {renderFilterInput()}
            {value && (
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={onClear}
                    className="text-muted-foreground h-8 w-8 p-0"
                >
                    <XCircle className="h-4 w-4" />
                    <span className="sr-only">Clear filter</span>
                </Button>
            )}
        </div>
    );
}

export function ActiveFilters<T extends Record<string, unknown>>({
    filters,
    columns,
    onClearFilter,
    onClearAll,
}: {
    filters: T;
    columns: { id: string; label: string }[];
    onClearFilter: (key: string) => void;
    onClearAll: () => void;
}) {
    const activeFilters = Object.entries(filters).filter(
        ([_, value]) => value !== undefined && value !== ""
    );

    if (activeFilters.length === 0) return null;

    return (
        <div className="mb-2 flex flex-wrap items-center gap-2">
            <span className="text-muted-foreground text-sm">
                Active filters:
            </span>
            {activeFilters.map(([key, value]) => {
                const column = columns.find((col) => col.id === key);
                return (
                    <Badge
                        key={key}
                        variant="outline"
                        className="garden-badge flex items-center gap-1"
                    >
                        <span>
                            {column?.label || key}:{" "}
                            {Array.isArray(value)
                                ? value.join(", ")
                                : value?.toString()}
                        </span>
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => onClearFilter(key)}
                            className="text-muted-foreground hover:text-foreground h-4 w-4 rounded-full p-0"
                        >
                            <XCircle className="h-3 w-3" />
                            <span className="sr-only">Remove</span>
                        </Button>
                    </Badge>
                );
            })}
            <Button
                variant="ghost"
                size="sm"
                onClick={onClearAll}
                className="text-muted-foreground hover:text-foreground h-6 text-xs"
            >
                Clear all
            </Button>
        </div>
    );
}
