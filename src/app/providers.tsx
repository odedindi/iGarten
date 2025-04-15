"use client";

import type React from "react";

import { TaskProvider } from "@/lib/task-store";
import { ThemeProvider } from "@/lib/theme-store";

export function Providers({ children }: { children: React.ReactNode }) {
    return (
        <ThemeProvider>
            <TaskProvider>{children}</TaskProvider>
        </ThemeProvider>
    );
}
