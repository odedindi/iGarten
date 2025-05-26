import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

/**
 * Converts an array of objects to a CSV string
 * @param data Array of objects to convert
 * @param columns Array of column definitions with id and label
 * @returns CSV string
 */
export function convertToCSV<T extends Record<string, unknown>>(
    data: T[],
    columns: { id: string; label: string; visible: boolean; order?: number }[]
): string {
    // Filter to only visible columns and sort by order if available
    const visibleColumns = columns
        .filter((col) => col.visible)
        .sort((a, b) => {
            // If order is not defined on either column, maintain original order
            if (a.order === undefined && b.order === undefined) return 0;
            // If order is only defined on one column, prioritize the one with order
            if (a.order === undefined) return 1;
            if (b.order === undefined) return -1;
            // Otherwise sort by order
            return a.order - b.order;
        });

    // Create header row
    const header = visibleColumns.map((col) => `"${col.label}"`).join(",");

    // Create data rows
    const rows = data
        .map((item) => {
            return visibleColumns
                .map((column) => {
                    const value = item[column.id];

                    // Handle different data types
                    if (value === null || value === undefined) {
                        return '""';
                    }

                    // Handle arrays (like tags)
                    if (Array.isArray(value)) {
                        return `"${value.join(", ")}"`;
                    }

                    // Handle dates
                    if (
                        value instanceof Date ||
                        (typeof value === "string" &&
                            column.id.includes("date"))
                    ) {
                        try {
                            const date =
                                value instanceof Date ? value : new Date(value);
                            return `"${date.toLocaleDateString()}"`;
                        } catch (e) {
                            console.warn("Invalid date format:", value, e);
                            return `"${value}"`;
                        }
                    }

                    // Handle HTML content by stripping tags
                    if (typeof value === "string" && value.includes("<")) {
                        const strippedValue = value.replace(/<[^>]*>?/gm, "");
                        return `"${strippedValue.replace(/"/g, '""')}"`;
                    }

                    // Handle strings with quotes
                    if (typeof value === "string") {
                        return `"${value.replace(/"/g, '""')}"`;
                    }

                    return `"${value}"`;
                })
                .join(",");
        })
        .join("\n");

    return `${header}\n${rows}`;
}

/**
 * Downloads a string as a file
 * @param content Content to download
 * @param fileName Name of the file
 * @param mimeType MIME type of the file
 */
export function downloadFile(
    content: string,
    fileName: string,
    mimeType: string
): void {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
}

export const sortStrings = (a: string, b: string) => a.localeCompare(b);
