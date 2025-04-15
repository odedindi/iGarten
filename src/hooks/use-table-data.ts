"use client";

import { useState, useMemo, useEffect } from "react";
import { format, parseISO } from "date-fns";
import type { SortConfig, FilterConfig, FilterValueType } from "@/lib/types";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type TODO = any;

// Generic type for table data
export type TableData = Record<string, TODO> & { id: string };

interface UseTableDataProps<T extends TableData> {
    data: T[];
    defaultSortKey: string;
    defaultSortDirection: "asc" | "desc";
    defaultPageSize?: number;
}

export function useTableData<T extends TableData>({
    data,
    defaultSortKey,
    defaultSortDirection,
    defaultPageSize = 10,
}: UseTableDataProps<T>) {
    // Sorting state
    const [sortConfig, setSortConfig] = useState<SortConfig>({
        key: defaultSortKey,
        direction: defaultSortDirection,
    });

    // Filtering state
    const [filters, setFilters] = useState<FilterConfig>({});
    const [showFilters, setShowFilters] = useState(false);

    // Selection state
    const [selectedRows, setSelectedRows] = useState<Set<string>>(new Set());

    // Pagination state
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(defaultPageSize);

    // Sorting function
    const handleSort = (key: string) => {
        setSortConfig((prevConfig) => ({
            key,
            direction:
                prevConfig.key === key
                    ? prevConfig.direction === "asc"
                        ? "desc"
                        : "asc"
                    : "asc",
        }));
    };

    // Filtering functions
    const handleFilterChange = (key: string, value: FilterValueType) => {
        setFilters((prev) => ({ ...prev, [key]: value }));
        setCurrentPage(1);
    };

    const clearFilter = (key: string) => {
        setFilters((prev) => {
            const updated = { ...prev };
            delete updated[key];
            return updated;
        });
        setCurrentPage(1);
    };

    const clearAllFilters = () => {
        setFilters({});
        setCurrentPage(1);
    };

    // Selection functions
    const toggleRowSelection = (id: string) => {
        const newSelected = new Set(selectedRows);
        if (newSelected.has(id)) {
            newSelected.delete(id);
        } else {
            newSelected.add(id);
        }
        setSelectedRows(newSelected);
    };

    const toggleAllRows = (filteredData: T[]) => {
        if (selectedRows.size === filteredData.length) {
            // Deselect all
            setSelectedRows(new Set());
        } else {
            // Select all
            setSelectedRows(new Set(filteredData.map((item) => item.id)));
        }
    };

    const clearSelection = () => {
        setSelectedRows(new Set());
    };

    // Pagination functions
    const goToPage = (page: number) => {
        setCurrentPage(page);
    };

    const nextPage = () => {
        setCurrentPage((prev) => Math.min(prev + 1, totalPages));
    };

    const prevPage = () => {
        setCurrentPage((prev) => Math.max(prev - 1, 1));
    };

    const changePageSize = (size: number) => {
        setPageSize(size);
        setCurrentPage(1); // Reset to first page when changing page size
    };

    // Filter and sort the data
    const filteredData = useMemo(() => {
        // Apply filters
        let result = [...data];

        Object.entries(filters).forEach(([key, value]) => {
            if (value !== undefined && value !== "") {
                result = result.filter((item) => {
                    const itemValue = item[key];

                    // Handle array values (like tags)
                    if (Array.isArray(itemValue)) {
                        return itemValue.some((val) =>
                            String(val)
                                .toLowerCase()
                                .includes(String(value).toLowerCase())
                        );
                    }

                    // Handle date values
                    if (key.includes("date") && itemValue) {
                        try {
                            return (
                                format(parseISO(itemValue), "yyyy-MM-dd") ===
                                value
                            );
                        } catch (e) {
                            console.warn(
                                `Failed to parse date for filtering: ${e}`
                            );
                            return false;
                        }
                    }

                    // Handle string values
                    if (typeof itemValue === "string") {
                        return itemValue
                            .toLowerCase()
                            .includes(String(value).toLowerCase());
                    }

                    // Handle number values
                    if (
                        typeof itemValue === "number" &&
                        typeof value === "string"
                    ) {
                        return itemValue.toString().includes(value);
                    }

                    // Default comparison
                    return itemValue === value;
                });
            }
        });

        return result;
    }, [data, filters]);

    // Sort the filtered data
    const sortedData = useMemo(() => {
        return [...filteredData].sort((a, b) => {
            const aValue = a[sortConfig.key];
            const bValue = b[sortConfig.key];

            // Handle null values
            if (aValue === null && bValue === null) return 0;
            if (aValue === null) return 1;
            if (bValue === null) return -1;

            // Handle date sorting
            if (
                typeof aValue === "string" &&
                typeof bValue === "string" &&
                (sortConfig.key.includes("date") ||
                    sortConfig.key.includes("Date"))
            ) {
                try {
                    const aDate = new Date(aValue).getTime();
                    const bDate = new Date(bValue).getTime();
                    return sortConfig.direction === "asc"
                        ? aDate - bDate
                        : bDate - aDate;
                } catch (e) {
                    // Fall back to string comparison if date parsing fails
                    console.warn(
                        `Failed to parse date for sorting: ${e}. Falling back to string comparison.`
                    );
                }
            }

            // Handle number sorting
            if (typeof aValue === "number" && typeof bValue === "number") {
                return sortConfig.direction === "asc"
                    ? aValue - bValue
                    : bValue - aValue;
            }

            // Handle array sorting (like tags)
            if (Array.isArray(aValue) && Array.isArray(bValue)) {
                const aString = aValue.length > 0 ? String(aValue[0]) : "";
                const bString = bValue.length > 0 ? String(bValue[0]) : "";
                return sortConfig.direction === "asc"
                    ? aString.localeCompare(bString)
                    : bString.localeCompare(aString);
            }

            // Default string sorting
            if (typeof aValue === "string" && typeof bValue === "string") {
                return sortConfig.direction === "asc"
                    ? aValue.localeCompare(bValue)
                    : bValue.localeCompare(aValue);
            }

            // Default comparison
            return sortConfig.direction === "asc"
                ? aValue > bValue
                    ? 1
                    : -1
                : bValue > aValue
                  ? 1
                  : -1;
        });
    }, [filteredData, sortConfig]);

    // Calculate pagination values
    const totalItems = sortedData.length;
    const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));

    // Adjust current page if it's out of bounds
    useEffect(() => {
        if (currentPage > totalPages) setCurrentPage(totalPages);
    }, [currentPage, totalPages]);

    // Get the current page of data
    const paginatedData = useMemo(() => {
        const startIndex = (currentPage - 1) * pageSize;
        return sortedData.slice(startIndex, startIndex + pageSize);
    }, [sortedData, currentPage, pageSize]);

    return {
        processedData: paginatedData,
        allFilteredData: sortedData,
        sortConfig,
        filters,
        showFilters,
        selectedRows,
        pagination: {
            currentPage,
            pageSize,
            totalPages,
            totalItems,
            goToPage,
            nextPage,
            prevPage,
            changePageSize,
        },
        handleSort,
        handleFilterChange,
        clearFilter,
        clearAllFilters,
        setShowFilters,
        toggleRowSelection,
        toggleAllRows,
        clearSelection,
    };
}
