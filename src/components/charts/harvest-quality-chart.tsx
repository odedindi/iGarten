"use client";

import type { Harvest } from "@/lib/task-store";
import {
    PieChart,
    Pie,
    Cell,
    ResponsiveContainer,
    Legend,
    Tooltip,
} from "@/components/ui/chart";

interface HarvestQualityChartProps {
    harvests: Harvest[];
}

export function HarvestQualityChart({ harvests }: HarvestQualityChartProps) {
    // Count harvests by quality
    const qualityCounts = harvests.reduce(
        (acc, harvest) => {
            acc[harvest.quality] = (acc[harvest.quality] || 0) + 1;
            return acc;
        },
        {} as Record<string, number>
    );

    // Prepare data for chart
    const data = Object.entries(qualityCounts).map(([name, value]) => ({
        name,
        value,
    }));

    // Colors for different qualities
    const COLORS = {
        poor: "#f87171", // red-400
        average: "#facc15", // yellow-400
        good: "#4ade80", // green-400
        excellent: "#60a5fa", // blue-400
    };

    if (data.length === 0) {
        return (
            <div className="flex h-80 items-center justify-center">
                <p className="text-muted-foreground">
                    No harvest data to display
                </p>
            </div>
        );
    }

    return (
        <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                    <Pie
                        data={data}
                        cx="50%"
                        cy="50%"
                        labelLine={true}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                        label={({ name, percent }) =>
                            `${name}: ${(percent * 100).toFixed(0)}%`
                        }
                    >
                        {data.map((entry, index) => (
                            <Cell
                                key={`cell-${index}`}
                                fill={
                                    COLORS[entry.name as keyof typeof COLORS] ||
                                    "#9ca3af"
                                }
                            />
                        ))}
                    </Pie>
                    <Tooltip
                        contentStyle={{
                            background: "rgba(0, 0, 0, 0.5)",
                            backdropFilter: "blur(16px)",
                        }}
                    />
                    <Legend />
                </PieChart>
            </ResponsiveContainer>
        </div>
    );
}
