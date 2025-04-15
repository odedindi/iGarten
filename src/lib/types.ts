export interface TableSettings {
    sortable: boolean;
    filterable: boolean;
}

export interface SortConfig {
    key: string;
    direction: "asc" | "desc";
}

export type FilterValueType = string | number | boolean | undefined;
export interface FilterConfig {
    [key: string]: FilterValueType;
}

export interface DemoSettings {
    enabled: boolean;
}
