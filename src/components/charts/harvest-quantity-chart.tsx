"use client";

import type { Harvest } from "@/lib/task-store";
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
} from "@/components/ui/chart";

interface HarvestQuantityChartProps {
    harvests: Harvest[];
}

export function HarvestQuantityChart({ harvests }: HarvestQuantityChartProps) {
    // Group harvests by crop name and sum quantities
    const harvestsByType = harvests.reduce(
        (acc, harvest) => {
            // Skip non-weight units for simplicity
            if (harvest.unit === "count" || harvest.unit === "bunch")
                return acc;

            // Convert all to kg for consistency
            let quantity = harvest.quantity;
            if (harvest.unit === "g") quantity = quantity / 1000;
            if (harvest.unit === "lb") quantity = quantity * 0.453592;
            if (harvest.unit === "oz") quantity = quantity * 0.0283495;

            if (!acc[harvest.cropName]) {
                acc[harvest.cropName] = 0;
            }
            acc[harvest.cropName] += quantity;
            return acc;
        },
        {} as Record<string, number>
    );

    // Convert to array and sort by quantity
    const data = Object.entries(harvestsByType)
        .map(([name, value]) => ({ name, value }))
        .sort((a, b) => b.value - a.value)
        .slice(0, 10); // Top 10 for readability

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
                <BarChart data={data}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis
                        label={{
                            value: "kg",
                            angle: -90,
                            position: "insideLeft",
                        }}
                    />
                    <Tooltip
                        contentStyle={{
                            background: "rgba(0, 0, 0, 0.5)",
                            backdropFilter: "blur(16px)",
                        }}
                        formatter={(value) => [
                            `${typeof value === "number" ? value.toFixed(2) : value} kg`,
                            "Quantity",
                        ]}
                    />
                    <Bar dataKey="value" name="Quantity (kg)" fill="#60a5fa" />
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
}
