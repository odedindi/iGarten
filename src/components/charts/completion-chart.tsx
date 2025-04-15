"use client";

import type { Task } from "@/lib/task-store";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
} from "@/components/ui/chart";
import {
    format,
    parseISO,
    startOfWeek,
    endOfWeek,
    eachDayOfInterval,
    isSameDay,
} from "date-fns";

const completedStatus: Task["status"][] = ["completed", "harvested"] as const;

interface CompletionChartProps {
    tasks: Task[];
}

export function CompletionChart({ tasks }: CompletionChartProps) {
    // Get completed tasks
    const completedTasks = tasks.filter((task) =>
        completedStatus.includes(task.status)
    );

    // If no tasks, show empty chart
    if (completedTasks.length === 0) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>Completion / Harvested Trend</CardTitle>
                    <CardDescription>
                        No completed tasks in the selected time range
                    </CardDescription>
                </CardHeader>
                <CardContent className="flex h-80 items-center justify-center">
                    <p className="text-muted-foreground">No data to display</p>
                </CardContent>
            </Card>
        );
    }

    // Sort tasks by completion date
    const sortedTasks = [...completedTasks].sort(
        (a, b) =>
            new Date(a.dateCreated).getTime() -
            new Date(b.dateCreated).getTime()
    );

    // Get date range
    const firstDate = parseISO(sortedTasks[0].dateCreated);
    const lastDate = parseISO(sortedTasks[sortedTasks.length - 1].dateCreated);

    // Create weekly data points
    const startDate = startOfWeek(firstDate);
    const endDate = endOfWeek(lastDate);

    const dateRange = eachDayOfInterval({ start: startDate, end: endDate });

    // Group completed tasks by day
    const completionsByDay = dateRange.map((date) => {
        const tasksCompletedOnDay = completedTasks.filter((task) =>
            isSameDay(parseISO(task.dateCreated), date)
        );

        return {
            date: format(date, "MMM dd"),
            count: tasksCompletedOnDay.length,
            // Cumulative count for trend line
            cumulative: completedTasks.filter(
                (task) => parseISO(task.dateCreated) <= date
            ).length,
        };
    });

    // Group by week for better visualization if range is large
    const useWeeklyData = dateRange.length > 14;

    let chartData;
    if (useWeeklyData) {
        // Group by week
        const weeklyData: {
            week: string;
            count: number;
            cumulative: number;
        }[] = [];
        for (let i = 0; i < completionsByDay.length; i += 7) {
            const weekData = completionsByDay.slice(i, i + 7);
            const weekStart = weekData[0].date;
            const weekEnd = weekData[weekData.length - 1].date;
            const weekLabel = `${weekStart} - ${weekEnd}`;

            weeklyData.push({
                week: weekLabel,
                count: weekData.reduce((sum, day) => sum + day.count, 0),
                cumulative: weekData[weekData.length - 1]?.cumulative || 0,
            });
        }
        chartData = weeklyData.map((week) => ({
            name: week.week,
            "Tasks Completed": week.count,
            Cumulative: week.cumulative,
        }));
    } else {
        // Use daily data
        chartData = completionsByDay.map((day) => ({
            name: day.date,
            "Tasks Completed": day.count,
            Cumulative: day.cumulative,
        }));
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Completion / Harvested Trend</CardTitle>
                <CardDescription>
                    {useWeeklyData ? "Weekly" : "Daily"} task completion over
                    time
                </CardDescription>
            </CardHeader>
            <CardContent>
                <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={chartData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis
                                dataKey="name"
                                tick={{ display: "none" }}
                                interval={
                                    useWeeklyData ? 0 : "preserveStartEnd"
                                }
                            />
                            <YAxis yAxisId="left" />
                            <YAxis yAxisId="right" orientation="right" />
                            <Tooltip
                                contentStyle={{
                                    background: "rgba(0, 0, 0, 0.5)",
                                    backdropFilter: "blur(16px)",
                                }}
                            />
                            <Line
                                yAxisId="left"
                                type="monotone"
                                dataKey="Tasks Completed"
                                stroke="#8884d8"
                                activeDot={{ r: 8 }}
                            />
                            <Line
                                yAxisId="right"
                                type="monotone"
                                dataKey="Cumulative"
                                stroke="#82ca9d"
                                dot={false}
                            />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            </CardContent>
        </Card>
    );
}
