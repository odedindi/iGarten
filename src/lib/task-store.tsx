"use client";

import type React from "react";

import { createContext, useContext, useEffect, useState } from "react";
import type { TableSettings, DemoSettings } from "./types";
import { generateDemoTasks, generateDemoHarvests } from "./demo-data";

export type TaskStatus =
    | "completed"
    | "to-plant"
    | "growing"
    | "harvested"
    | "failed";
export type TaskPriority = "low" | "medium" | "high" | "urgent";

export interface Task {
    id: string;
    title: string;
    description: string;
    dateCreated: string;
    dueDate: string | null;
    status: TaskStatus;
    priority: TaskPriority;
    tags: string[];
    deleted?: boolean;
    deletedAt?: string;
}

export interface Harvest {
    id: string;
    cropName: string;
    quantity: number;
    unit: string;
    dateHarvested: string;
    notes: string;
    location: string;
    quality: "poor" | "average" | "good" | "excellent";
    weather: string;
    deleted?: boolean;
    deletedAt?: string;
}

export interface Column {
    id: string;
    label: string;
    visible: boolean;
    order: number;
}

interface TaskContextType {
    tasks: Task[];
    harvests: Harvest[];
    columns: Column[];
    harvestColumns: Column[];
    tableSettings: TableSettings;
    harvestTableSettings: TableSettings;
    demoSettings: DemoSettings;
    isDataLoaded: boolean;
    addTask: (task: Omit<Task, "id" | "dateCreated">) => void;
    updateTask: (id: string, task: Partial<Task>) => void;
    deleteTask: (id: string) => void;
    softDeleteTask: (id: string) => void;
    restoreTask: (id: string) => void;
    permanentDeleteTask: (id: string) => void;
    getTask: (id: string) => Task | undefined;
    getDeletedTasks: () => Task[];
    addHarvest: (harvest: Omit<Harvest, "id">) => void;
    updateHarvest: (id: string, harvest: Partial<Harvest>) => void;
    deleteHarvest: (id: string) => void;
    softDeleteHarvest: (id: string) => void;
    restoreHarvest: (id: string) => void;
    permanentDeleteHarvest: (id: string) => void;
    getHarvest: (id: string) => Harvest | undefined;
    getDeletedHarvests: () => Harvest[];
    updateColumns: (columns: Column[]) => void;
    updateHarvestColumns: (columns: Column[]) => void;
    updateTableSettings: (settings: Partial<TableSettings>) => void;
    updateHarvestTableSettings: (settings: Partial<TableSettings>) => void;
    updateDemoSettings: (settings: Partial<DemoSettings>) => void;
    generateDemoData: () => void;
    clearDemoData: () => void;
}

const defaultColumns: Column[] = [
    { id: "title", label: "Plant/Task", visible: true, order: 0 },
    { id: "description", label: "Details", visible: true, order: 1 },
    { id: "dateCreated", label: "Created", visible: true, order: 2 },
    { id: "dueDate", label: "Target Date", visible: true, order: 3 },
    { id: "status", label: "Status", visible: true, order: 4 },
    { id: "priority", label: "Priority", visible: true, order: 5 },
    { id: "tags", label: "Tags", visible: true, order: 6 },
];

const defaultHarvestColumns: Column[] = [
    { id: "cropName", label: "Crop", visible: true, order: 0 },
    { id: "quantity", label: "Quantity", visible: true, order: 1 },
    { id: "unit", label: "Unit", visible: true, order: 2 },
    { id: "dateHarvested", label: "Harvest Date", visible: true, order: 3 },
    { id: "location", label: "Garden Location", visible: true, order: 4 },
    { id: "quality", label: "Quality", visible: true, order: 5 },
    { id: "weather", label: "Weather", visible: true, order: 6 },
    { id: "notes", label: "Notes", visible: true, order: 7 },
];

const defaultTableSettings: TableSettings = {
    sortable: true,
    filterable: true,
};

const defaultDemoSettings: DemoSettings = {
    enabled: false,
};

const TaskContext = createContext<TaskContextType | undefined>(undefined);

export function TaskProvider({ children }: { children: React.ReactNode }) {
    const [tasks, setTasks] = useState<Task[]>([]);
    const [harvests, setHarvests] = useState<Harvest[]>([]);
    const [columns, setColumns] = useState<Column[]>(defaultColumns);
    const [harvestColumns, setHarvestColumns] = useState<Column[]>(
        defaultHarvestColumns
    );
    const [tableSettings, setTableSettings] =
        useState<TableSettings>(defaultTableSettings);
    const [harvestTableSettings, setHarvestTableSettings] =
        useState<TableSettings>(defaultTableSettings);
    const [demoSettings, setDemoSettings] =
        useState<DemoSettings>(defaultDemoSettings);
    const [loaded, setLoaded] = useState(false);
    const [isDataLoaded, setIsDataLoaded] = useState(false);

    useEffect(() => {
        // Load tasks from localStorage
        const storedTasks = localStorage.getItem("garden_tasks");
        if (storedTasks) {
            setTasks(JSON.parse(storedTasks));
        }

        // Load harvests from localStorage
        const storedHarvests = localStorage.getItem("garden_harvests");
        if (storedHarvests) {
            setHarvests(JSON.parse(storedHarvests));
        }

        // Load columns from localStorage
        const storedColumns = localStorage.getItem("garden_columns");
        if (storedColumns) {
            setColumns(JSON.parse(storedColumns));
        }

        // Load harvest columns from localStorage
        const storedHarvestColumns = localStorage.getItem(
            "garden_harvest_columns"
        );
        if (storedHarvestColumns) {
            setHarvestColumns(JSON.parse(storedHarvestColumns));
        }

        // Load table settings from localStorage
        const storedTableSettings = localStorage.getItem(
            "garden_table_settings"
        );
        if (storedTableSettings) {
            setTableSettings(JSON.parse(storedTableSettings));
        }

        // Load harvest table settings from localStorage
        const storedHarvestTableSettings = localStorage.getItem(
            "garden_harvest_table_settings"
        );
        if (storedHarvestTableSettings) {
            setHarvestTableSettings(JSON.parse(storedHarvestTableSettings));
        }

        // Load demo settings from localStorage
        const storedDemoSettings = localStorage.getItem("garden_demo_settings");
        if (storedDemoSettings) {
            setDemoSettings(JSON.parse(storedDemoSettings));
        }

        setLoaded(true);

        // Mark data as loaded after a short delay
        setTimeout(() => {
            setIsDataLoaded(true);
        }, 300);
    }, []);

    useEffect(() => {
        // Save tasks to localStorage when they change
        if (loaded) {
            localStorage.setItem("garden_tasks", JSON.stringify(tasks));
        }
    }, [tasks, loaded]);

    useEffect(() => {
        // Save harvests to localStorage when they change
        if (loaded) {
            localStorage.setItem("garden_harvests", JSON.stringify(harvests));
        }
    }, [harvests, loaded]);

    useEffect(() => {
        // Save columns to localStorage when they change
        if (loaded) {
            localStorage.setItem("garden_columns", JSON.stringify(columns));
        }
    }, [columns, loaded]);

    useEffect(() => {
        // Save harvest columns to localStorage when they change
        if (loaded) {
            localStorage.setItem(
                "garden_harvest_columns",
                JSON.stringify(harvestColumns)
            );
        }
    }, [harvestColumns, loaded]);

    useEffect(() => {
        // Save table settings to localStorage when they change
        if (loaded) {
            localStorage.setItem(
                "garden_table_settings",
                JSON.stringify(tableSettings)
            );
        }
    }, [tableSettings, loaded]);

    useEffect(() => {
        // Save harvest table settings to localStorage when they change
        if (loaded) {
            localStorage.setItem(
                "garden_harvest_table_settings",
                JSON.stringify(harvestTableSettings)
            );
        }
    }, [harvestTableSettings, loaded]);

    useEffect(() => {
        // Save demo settings to localStorage when they change
        if (loaded) {
            localStorage.setItem(
                "garden_demo_settings",
                JSON.stringify(demoSettings)
            );
        }
    }, [demoSettings, loaded]);

    const addTask = (task: Omit<Task, "id" | "dateCreated">) => {
        const newTask: Task = {
            ...task,
            id: crypto.randomUUID(),
            dateCreated: new Date().toISOString(),
        };
        setTasks((prev) => [...prev, newTask]);
    };

    const updateTask = (id: string, updatedFields: Partial<Task>) => {
        setTasks((prev) =>
            prev.map((task) =>
                task.id === id ? { ...task, ...updatedFields } : task
            )
        );
    };

    const deleteTask = (id: string) => {
        // Use soft delete by default
        softDeleteTask(id);
    };

    const softDeleteTask = (id: string) => {
        setTasks((prev) =>
            prev.map((task) =>
                task.id === id
                    ? {
                          ...task,
                          deleted: true,
                          deletedAt: new Date().toISOString(),
                      }
                    : task
            )
        );
    };

    const restoreTask = (id: string) => {
        setTasks((prev) =>
            prev.map((task) =>
                task.id === id
                    ? { ...task, deleted: false, deletedAt: undefined }
                    : task
            )
        );
    };

    const permanentDeleteTask = (id: string) => {
        setTasks((prev) => prev.filter((task) => task.id !== id));
    };

    const getTask = (id: string) => {
        return tasks.find((task) => task.id === id);
    };

    const getDeletedTasks = () => {
        return tasks.filter((task) => task.deleted === true);
    };

    const addHarvest = (harvest: Omit<Harvest, "id">) => {
        const newHarvest: Harvest = {
            ...harvest,
            id: crypto.randomUUID(),
        };
        setHarvests((prev) => [...prev, newHarvest]);
    };

    const updateHarvest = (id: string, updatedFields: Partial<Harvest>) => {
        setHarvests((prev) =>
            prev.map((harvest) =>
                harvest.id === id ? { ...harvest, ...updatedFields } : harvest
            )
        );
    };

    const deleteHarvest = (id: string) => {
        // Use soft delete by default
        softDeleteHarvest(id);
    };

    const softDeleteHarvest = (id: string) => {
        setHarvests((prev) =>
            prev.map((harvest) =>
                harvest.id === id
                    ? {
                          ...harvest,
                          deleted: true,
                          deletedAt: new Date().toISOString(),
                      }
                    : harvest
            )
        );
    };

    const restoreHarvest = (id: string) => {
        setHarvests((prev) =>
            prev.map((harvest) =>
                harvest.id === id
                    ? { ...harvest, deleted: false, deletedAt: undefined }
                    : harvest
            )
        );
    };

    const permanentDeleteHarvest = (id: string) => {
        setHarvests((prev) => prev.filter((harvest) => harvest.id !== id));
    };

    const getHarvest = (id: string) => {
        return harvests.find((harvest) => harvest.id === id);
    };

    const getDeletedHarvests = () => {
        return harvests.filter((harvest) => harvest.deleted === true);
    };

    const updateColumns = (newColumns: Column[]) => {
        setColumns(newColumns);
    };

    const updateHarvestColumns = (newColumns: Column[]) => {
        setHarvestColumns(newColumns);
    };

    const updateTableSettings = (settings: Partial<TableSettings>) => {
        setTableSettings((prev) => ({ ...prev, ...settings }));
    };

    const updateHarvestTableSettings = (settings: Partial<TableSettings>) => {
        setHarvestTableSettings((prev) => ({ ...prev, ...settings }));
    };

    const updateDemoSettings = (settings: Partial<DemoSettings>) => {
        setDemoSettings((prev) => ({ ...prev, ...settings }));
    };

    const generateDemoData = () => {
        const demoTasks = generateDemoTasks(50);
        const demoHarvests = generateDemoHarvests(40);

        setTasks((prev) => [...demoTasks, ...prev]);
        setHarvests((prev) => [...demoHarvests, ...prev]);
    };
    const clearDemoData = () => {
        setTasks((prev) => prev.filter((t) => !t.id.endsWith("mock-data")));
        setHarvests((prev) => prev.filter((h) => !h.id.endsWith("mock-data")));
    };
    return (
        <TaskContext.Provider
            value={{
                tasks,
                harvests,
                columns,
                harvestColumns,
                tableSettings,
                harvestTableSettings,
                demoSettings,
                isDataLoaded,
                addTask,
                updateTask,
                deleteTask,
                softDeleteTask,
                restoreTask,
                permanentDeleteTask,
                getTask,
                getDeletedTasks,
                addHarvest,
                updateHarvest,
                deleteHarvest,
                softDeleteHarvest,
                restoreHarvest,
                permanentDeleteHarvest,
                getHarvest,
                getDeletedHarvests,
                updateColumns,
                updateHarvestColumns,
                updateTableSettings,
                updateHarvestTableSettings,
                updateDemoSettings,
                generateDemoData,
                clearDemoData,
            }}
        >
            {children}
        </TaskContext.Provider>
    );
}

export function useTaskStore() {
    const context = useContext(TaskContext);
    if (context === undefined) {
        throw new Error("useTaskStore must be used within a TaskProvider");
    }
    return context;
}
