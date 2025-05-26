"use client";

import { useState } from "react";
import { useTaskStore, type Task, type Harvest } from "@/lib/task-store";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { isAfter, isBefore, isToday, subDays } from "date-fns";
import { TaskStatusChart } from "@/components/charts/task-status-chart";
import { TaskPriorityChart } from "@/components/charts/task-priority-chart";
import { HarvestQuantityChart } from "@/components/charts/harvest-quantity-chart";
import { HarvestQualityChart } from "@/components/charts/harvest-quality-chart";
import { AlertCircle, Sprout } from "lucide-react";
import { CompletionChart } from "@/components/charts/completion-chart";

export default function DashboardPage() {
    const {
        tasks,
        harvests,
        demoSettings,
        updateDemoSettings,
        generateDemoData,
        clearDemoData,
    } = useTaskStore();
    const [timeRange, setTimeRange] = useState<string>("all");

    // Use real or demo data based on settings
    // const useRealData = !demoSettings.enabled

    const handleDemoToggle = (enabled: boolean) => {
        updateDemoSettings({ enabled });

        // If enabling demo mode and no demo data exists, generate it
        if (enabled && (tasks.length === 0 || harvests.length === 0)) {
            generateDemoData();
        }
        // If disabling demo mode, clear the demo data
        if (!enabled) {
            clearDemoData();
        }
    };

    const getFilteredTasks = (): Task[] => {
        if (timeRange === "all") return tasks;

        const today = new Date();
        const startDate = subDays(
            today,
            timeRange === "7days"
                ? 7
                : timeRange === "30days"
                  ? 30
                  : timeRange === "90days"
                    ? 90
                    : 0
        );

        return tasks.filter((task) => {
            const createdDate = new Date(task.dateCreated);
            return isAfter(createdDate, startDate) || isToday(createdDate);
        });
    };

    const getFilteredHarvests = (): Harvest[] => {
        if (timeRange === "all") return harvests;

        const today = new Date();
        const startDate = subDays(
            today,
            timeRange === "7days"
                ? 7
                : timeRange === "30days"
                  ? 30
                  : timeRange === "90days"
                    ? 90
                    : 0
        );

        return harvests.filter((harvest) => {
            const harvestDate = new Date(harvest.dateHarvested);
            return isAfter(harvestDate, startDate) || isToday(harvestDate);
        });
    };

    const filteredTasks = getFilteredTasks();
    const filteredHarvests = getFilteredHarvests();

    // Calculate KPIs
    const totalTasks = filteredTasks.length;
    const completedTasks = filteredTasks.filter(
        (task) => task.status === "harvested"
    ).length;
    const overdueTasks = filteredTasks.filter((task) => {
        if (
            !task.dueDate ||
            task.status === "harvested" ||
            task.status === "failed"
        )
            return false;
        return isBefore(new Date(task.dueDate), new Date());
    }).length;
    const totalHarvests = filteredHarvests.length;

    // Calculate total harvest weight in kg
    const totalHarvestWeight = filteredHarvests.reduce((total, harvest) => {
        let weight = harvest.quantity;
        // Convert to kg if needed
        if (harvest.unit === "g") weight = weight / 1000;
        if (harvest.unit === "lb") weight = weight * 0.453592;
        if (harvest.unit === "oz") weight = weight * 0.0283495;
        // Skip non-weight units
        if (harvest.unit === "count" || harvest.unit === "bunch") return total;
        return total + weight;
    }, 0);

    const completionRate =
        totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

    return (
        <div className="space-y-6">
            <div className="garden-header rounded-lg p-6">
                <h1 className="text-primary relative z-10 text-3xl font-bold">
                    Garden Dashboard
                </h1>
                <p className="text-muted-foreground relative z-10">
                    Track your garden&apos;s progress and harvest yields over
                    time.
                </p>
            </div>

            <div className="flex flex-col items-start justify-between gap-2 md:flex-row md:items-center">
                <div className="flex items-center gap-2">
                    <Label htmlFor="demo-mode" className="cursor-pointer">
                        Mock data
                    </Label>
                    <Switch
                        id="demo-mode"
                        checked={demoSettings.enabled}
                        onCheckedChange={handleDemoToggle}
                    />
                    {demoSettings.enabled && (
                        <Button
                            variant="outline"
                            size="sm"
                            className="garden-input ml-2 h-8 text-xs"
                            onClick={generateDemoData}
                        >
                            <Sprout className="mr-1 h-3 w-3" />
                            Generate Mock Data
                        </Button>
                    )}
                </div>

                <div className="flex items-center gap-2">
                    <span className="text-muted-foreground text-sm">
                        Time Range:
                    </span>
                    <Select value={timeRange} onValueChange={setTimeRange}>
                        <SelectTrigger className="garden-input w-[180px]">
                            <SelectValue placeholder="Select time range" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Time</SelectItem>
                            <SelectItem value="7days">Last 7 Days</SelectItem>
                            <SelectItem value="30days">Last 30 Days</SelectItem>
                            <SelectItem value="90days">Last 90 Days</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>

            {demoSettings.enabled && (
                <div className="bg-primary/10 border-primary/20 flex items-start gap-2 rounded-md border p-4">
                    <AlertCircle className="text-primary mt-0.5 h-5 w-5" />
                    <div>
                        <h3 className="text-primary font-medium">
                            Generating Mock Data
                        </h3>
                        <p className="text-muted-foreground text-sm">
                            You can generate mock data for your garden tasks and
                            harvests. This is useful for testing and exploring
                            the app without needing real data.
                        </p>
                        <p className="text-muted-secondary text-sm">
                            This data is saved and will not be lost when you
                            refresh the page. To reset the data, go to the table
                            view and delete the tasks and harvests.
                        </p>
                    </div>
                </div>
            )}

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card className="garden-card">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            Garden Tasks
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-primary text-2xl font-bold">
                            {totalTasks}
                        </div>
                    </CardContent>
                </Card>
                <Card className="garden-card">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            Harvest Success Rate
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-primary text-2xl font-bold">
                            {completionRate}%
                        </div>
                    </CardContent>
                </Card>
                <Card className="garden-card">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            Overdue Tasks
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-destructive text-2xl font-bold">
                            {overdueTasks}
                        </div>
                    </CardContent>
                </Card>
                <Card className="garden-card">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            Total Harvests
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-primary text-2xl font-bold">
                            {totalHarvests}
                        </div>
                        <div className="text-muted-foreground text-sm">
                            {totalHarvestWeight.toFixed(2)} kg total
                        </div>
                    </CardContent>
                </Card>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-1">
                <Card className="garden-card">
                    <CardHeader>
                        <CardTitle className="text-primary">
                            Completion / Harvest
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <CompletionChart tasks={filteredTasks} />
                    </CardContent>
                </Card>
            </div>
            <Tabs defaultValue="tasks" className="garden-tabs">
                <TabsList className="garden-tabs">
                    <TabsTrigger value="tasks" className="garden-tab">
                        Garden Tasks
                    </TabsTrigger>
                    <TabsTrigger value="harvests" className="garden-tab">
                        Harvests
                    </TabsTrigger>
                </TabsList>
                <TabsContent value="tasks" className="space-y-4">
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                        <Card className="garden-card">
                            <CardHeader>
                                <CardTitle className="text-primary">
                                    Task Status
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <TaskStatusChart tasks={filteredTasks} />
                            </CardContent>
                        </Card>
                        <Card className="garden-card">
                            <CardHeader>
                                <CardTitle className="text-primary">
                                    Task Priority
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <TaskPriorityChart tasks={filteredTasks} />
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>
                <TabsContent value="harvests" className="space-y-4">
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                        <Card className="garden-card">
                            <CardHeader>
                                <CardTitle className="text-primary">
                                    Harvest Quantity
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <HarvestQuantityChart
                                    harvests={filteredHarvests}
                                />
                            </CardContent>
                        </Card>
                        <Card className="garden-card">
                            <CardHeader>
                                <CardTitle className="text-primary">
                                    Harvest Quality
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <HarvestQualityChart
                                    harvests={filteredHarvests}
                                />
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    );
}
