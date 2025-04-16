"use client";

import type React from "react";

import { useState, useCallback, memo } from "react";

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Filter, ActiveFilters } from "@/components/ui/filter";
import {
    ArrowUpDown,
    ArrowDown,
    ArrowUp,
    FilterIcon,
    Trash2,
    ChevronLeft,
    ChevronRight,
    Download,
    RefreshCw,
} from "lucide-react";
import { useTableData, type TableData } from "@/hooks/use-table-data";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { convertToCSV, downloadFile } from "@/lib/utils";
import { format } from "date-fns";

export interface Column {
    id: string;
    label: string;
    visible: boolean;
    order: number;
}

interface DataTableProps<T extends TableData> {
    data: T[];
    columns: Column[];
    defaultSortKey: string;
    defaultSortDirection: "asc" | "desc";
    defaultPageSize?: number;
    tableSettings: {
        sortable: boolean;
        filterable: boolean;
    };
    renderCell: (item: T, columnId: string) => React.ReactNode;
    renderActions: (item: T) => React.ReactNode;
    onDelete: (ids: string[]) => void;
    emptyState: {
        message: string;
        buttonText: string;
        buttonAction: () => void;
    };
    getFilterOptions?: (
        columnId: string
    ) => { value: string; label: string }[] | undefined;
    getFilterType?: (
        columnId: string
    ) => "text" | "select" | "date" | "number" | "tags";
    tableName?: string;
}

function DataTableComponent<T extends TableData>({
    data,
    columns,
    defaultSortKey,
    defaultSortDirection,
    defaultPageSize = 10,
    tableSettings,
    renderCell,
    renderActions,
    onDelete,
    emptyState,
    getFilterOptions = () => undefined,
    getFilterType = () => "text",
    tableName = "data",
}: DataTableProps<T>) {
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [isExporting, setIsExporting] = useState(false);

    const {
        processedData,
        allFilteredData,
        sortConfig,
        filters,
        showFilters,
        selectedRows,
        pagination,
        handleSort,
        handleFilterChange,
        clearFilter,
        clearAllFilters,
        setShowFilters,
        toggleRowSelection,
        toggleAllRows,
        clearSelection,
    } = useTableData<T>({
        data,
        defaultSortKey,
        defaultSortDirection,
        defaultPageSize,
    });

    const visibleColumns = columns
        .filter((col) => col.visible)
        .sort((a, b) => a.order - b.order);

    const handleDeleteSelected = useCallback(() => {
        onDelete(Array.from(selectedRows));
        clearSelection();
        setIsDeleteDialogOpen(false);
    }, [selectedRows, onDelete, clearSelection]);

    const handleExportCSV = useCallback(() => {
        try {
            setIsExporting(true);

            // Generate CSV from all filtered data
            const csv = convertToCSV(allFilteredData, columns);

            // Create filename with date
            const date = format(new Date(), "yyyy-MM-dd");
            const filename = `${tableName.toLowerCase().replace(/\s+/g, "-")}-${date}.csv`;

            // Download the file
            downloadFile(csv, filename, "text/csv;charset=utf-8;");

            setIsExporting(false);
        } catch (error) {
            console.error("Error exporting CSV:", error);
            setIsExporting(false);
        }
    }, [allFilteredData, columns, tableName]);

    const renderTableHeader = useCallback(
        (columnId: string, columnLabel: string) => {
            if (!tableSettings.sortable) {
                return <div>{columnLabel}</div>;
            }

            return (
                <Button
                    variant="ghost"
                    onClick={() => handleSort(columnId)}
                    className="text-foreground flex h-auto items-center gap-1 p-0 font-medium"
                >
                    {columnLabel}
                    {sortConfig.key === columnId ? (
                        sortConfig.direction === "asc" ? (
                            <ArrowUp className="h-3 w-3" />
                        ) : (
                            <ArrowDown className="h-3 w-3" />
                        )
                    ) : (
                        <ArrowUpDown className="h-3 w-3 opacity-50" />
                    )}
                </Button>
            );
        },
        [tableSettings.sortable, sortConfig, handleSort]
    );

    const renderFilterInputs = useCallback(() => {
        if (!showFilters || !tableSettings.filterable) return null;

        return (
            <div className="bg-primary/5 mb-2 rounded-md border p-2">
                <div className="mb-2 grid grid-cols-1 gap-2 md:grid-cols-2 lg:grid-cols-3">
                    {visibleColumns.map((column) => {
                        const filterType = getFilterType(column.id);
                        const options = getFilterOptions(column.id);

                        return (
                            <div key={column.id}>
                                <Filter
                                    column={column.id}
                                    columnLabel={column.label}
                                    type={filterType}
                                    value={filters[column.id]}
                                    onChange={(value) =>
                                        handleFilterChange(column.id, value)
                                    }
                                    onClear={() => clearFilter(column.id)}
                                    options={options}
                                />
                            </div>
                        );
                    })}
                </div>

                <ActiveFilters
                    filters={filters}
                    columns={columns}
                    onClearFilter={clearFilter}
                    onClearAll={clearAllFilters}
                />
            </div>
        );
    }, [
        showFilters,
        tableSettings.filterable,
        visibleColumns,
        filters,
        columns,
        getFilterType,
        getFilterOptions,
        handleFilterChange,
        clearFilter,
        clearAllFilters,
    ]);

    // Pagination UI component
    const renderPagination = useCallback(() => {
        const {
            currentPage,
            totalPages,
            // goToPage,
            nextPage,
            prevPage,
            pageSize,
            changePageSize,
            totalItems,
        } = pagination;

        if (totalItems === 0) return null;

        return (
            <div className="mt-4 mb-6 flex flex-col items-center justify-between gap-4 text-sm sm:flex-row">
                <div className="flex items-center gap-2">
                    <span className="text-muted-foreground">
                        Rows per page:
                    </span>
                    <Select
                        value={pageSize.toString()}
                        onValueChange={(value) => changePageSize(Number(value))}
                    >
                        <SelectTrigger className="garden-input h-8 w-20">
                            <SelectValue placeholder={pageSize.toString()} />
                        </SelectTrigger>
                        <SelectContent>
                            {[5, 10, 20, 50].map((size) => (
                                <SelectItem key={size} value={size.toString()}>
                                    {size}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                <div className="flex items-center gap-1">
                    <span className="text-muted-foreground">
                        {totalItems === 0
                            ? "No items"
                            : `${(currentPage - 1) * pageSize + 1}-${Math.min(currentPage * pageSize, totalItems)} of ${totalItems}`}
                    </span>
                    <div className="flex items-center">
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={prevPage}
                            disabled={currentPage === 1}
                            className="h-8 w-8"
                            aria-label="Previous page"
                        >
                            <ChevronLeft className="h-4 w-4" />
                        </Button>
                        <span className="mx-2">
                            Page {currentPage} of {totalPages}
                        </span>
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={nextPage}
                            disabled={currentPage === totalPages}
                            className="h-8 w-8"
                            aria-label="Next page"
                        >
                            <ChevronRight className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
            </div>
        );
    }, [pagination]);

    return (
        <div>
            <div className="mb-2 flex flex-col justify-between gap-2 sm:flex-row">
                <div className="flex flex-wrap gap-2">
                    {tableSettings.filterable && (
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setShowFilters(!showFilters)}
                            className="garden-input flex items-center gap-1"
                        >
                            <FilterIcon className="h-4 w-4" />
                            {showFilters ? "Hide Filters" : "Show Filters"}
                        </Button>
                    )}

                    <Button
                        variant="outline"
                        size="sm"
                        onClick={handleExportCSV}
                        disabled={isExporting || allFilteredData.length === 0}
                        className="garden-input flex items-center gap-1"
                    >
                        {isExporting ? (
                            <RefreshCw className="h-4 w-4 animate-spin" />
                        ) : (
                            <Download className="h-4 w-4" />
                        )}
                        Export CSV
                    </Button>
                </div>

                {selectedRows.size > 0 && (
                    <div className="flex items-center gap-2">
                        <span className="text-muted-foreground text-sm">
                            {selectedRows.size}{" "}
                            {selectedRows.size === 1 ? "item" : "items"}{" "}
                            selected
                        </span>
                        <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => setIsDeleteDialogOpen(true)}
                            className="flex items-center gap-1"
                        >
                            <Trash2 className="h-4 w-4" />
                            Delete Selected
                        </Button>
                    </div>
                )}
            </div>

            {renderFilterInputs()}

            <div className="garden-card overflow-hidden rounded-md border">
                <div className="overflow-x-auto">
                    <Table>
                        <TableHeader className="bg-primary/10">
                            <TableRow>
                                <TableHead className="text-primary-foreground/80 w-[40px] font-medium">
                                    <Checkbox
                                        checked={
                                            allFilteredData.length > 0 &&
                                            selectedRows.size ===
                                                allFilteredData.length
                                        }
                                        onCheckedChange={() =>
                                            toggleAllRows(allFilteredData)
                                        }
                                        aria-label="Select all"
                                    />
                                </TableHead>
                                {visibleColumns.map((column) => (
                                    <TableHead
                                        key={column.id}
                                        className="text-primary-foreground/80 font-medium"
                                    >
                                        {renderTableHeader(
                                            column.id,
                                            column.label
                                        )}
                                    </TableHead>
                                ))}
                                <TableHead className="text-primary-foreground/80 w-[80px] font-medium">
                                    Actions
                                </TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {allFilteredData.length === 0 ? (
                                <TableRow>
                                    <TableCell
                                        colSpan={visibleColumns.length + 2}
                                        className="h-24 text-center"
                                    >
                                        <div className="flex flex-col items-center justify-center gap-2">
                                            <p className="text-muted-foreground">
                                                {emptyState.message}
                                            </p>
                                            <Button
                                                onClick={
                                                    emptyState.buttonAction
                                                }
                                                className="garden-button"
                                            >
                                                {emptyState.buttonText}
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ) : (
                                processedData.map((item) => (
                                    <TableRow
                                        key={item.id}
                                        className={`hover:bg-primary/5 ${selectedRows.has(item.id) ? "bg-primary/10" : ""}`}
                                    >
                                        <TableCell>
                                            <Checkbox
                                                checked={selectedRows.has(
                                                    item.id
                                                )}
                                                onCheckedChange={() =>
                                                    toggleRowSelection(item.id)
                                                }
                                                aria-label={`Select item`}
                                            />
                                        </TableCell>
                                        {visibleColumns.map((column) => (
                                            <TableCell
                                                key={`${item.id}-${column.id}`}
                                            >
                                                {renderCell(item, column.id)}
                                            </TableCell>
                                        ))}
                                        <TableCell>
                                            {renderActions(item)}
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </div>
            </div>

            {renderPagination()}

            <AlertDialog
                open={isDeleteDialogOpen}
                onOpenChange={setIsDeleteDialogOpen}
            >
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This will permanently delete {selectedRows.size}{" "}
                            selected{" "}
                            {selectedRows.size === 1 ? "item" : "items"}. This
                            action cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleDeleteSelected}
                            className="bg-destructive text-destructive-foreground"
                        >
                            Delete
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}

// Memoize the component to prevent unnecessary re-renders
export const DataTable = memo(DataTableComponent) as typeof DataTableComponent;
