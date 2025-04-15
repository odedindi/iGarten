"use client";

import type { Task } from "@/lib/task-store";
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
} from "@/components/ui/chart";

interface TaskPriorityChartProps {
    tasks: Task[];
}

export function TaskPriorityChart({ tasks }: TaskPriorityChartProps) {
    // Count tasks by priority
    const priorityCounts = tasks.reduce(
        (acc, task) => {
            acc[task.priority] = (acc[task.priority] || 0) + 1;
            return acc;
        },
        {} as Record<string, number>
    );

    // Prepare data for chart
    const data = [
        { name: "Low", value: priorityCounts.low || 0 },
        { name: "Medium", value: priorityCounts.medium || 0 },
        { name: "High", value: priorityCounts.high || 0 },
        { name: "Urgent", value: priorityCounts.urgent || 0 },
    ];

    if (tasks.length === 0) {
        return (
            <div className="flex h-80 items-center justify-center">
                <p className="text-muted-foreground">No task data to display</p>
            </div>
        );
    }

    return (
        <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip
                        contentStyle={{
                            background: "rgba(0, 0, 0, 0.5)",
                            backdropFilter: "blur(16px)",
                        }}
                    />
                    <Bar dataKey="value" name="Tasks" fill="#adcbef" />
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
}
