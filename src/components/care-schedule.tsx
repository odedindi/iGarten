"use client";

import { useEffect, useState } from "react";
import { useTaskStore } from "@/lib/task-store";
import { buildGardenContext } from "@/lib/ai/garden-context";
import {
    loadLocalStorage,
    prependWithLimit,
    saveLocalStorage,
} from "@/lib/ai/history";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion";
import {
    Sparkles,
    CalendarPlus,
    Check,
    Loader2,
    AlertCircle,
} from "lucide-react";
import type { TaskPriority } from "@/lib/task-store";

const SCHEDULE_HISTORY_KEY = "garden_ai_schedule_history_v1";
const MAX_SCHEDULE_HISTORY = 10;

interface GeneratedTask {
    title: string;
    description: string;
    priority: TaskPriority;
    dueDate: string;
    tags: string[];
}

interface ScheduleHistoryEntry {
    id: string;
    createdAt: string;
    tasks: GeneratedTask[];
}

export function CareSchedule() {
    const { tasks, harvests, addTask } = useTaskStore();
    const [schedule, setSchedule] = useState<GeneratedTask[] | null>(null);
    const [loading, setLoading] = useState(false);
    const [addedTasks, setAddedTasks] = useState<Set<number>>(new Set());
    const [error, setError] = useState<string | null>(null);
    const [history, setHistory] = useState<ScheduleHistoryEntry[]>([]);
    const [historyLoaded, setHistoryLoaded] = useState(false);

    useEffect(() => {
        setHistory(
            loadLocalStorage<ScheduleHistoryEntry[]>(SCHEDULE_HISTORY_KEY, [])
        );
        setHistoryLoaded(true);
    }, []);

    useEffect(() => {
        if (!historyLoaded) {
            return;
        }

        saveLocalStorage(SCHEDULE_HISTORY_KEY, history);
    }, [history, historyLoaded]);

    const handleGenerate = async () => {
        setLoading(true);
        setError(null);
        try {
            const gardenContext = buildGardenContext(tasks, harvests);
            const response = await fetch("/api/schedule", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ gardenContext }),
            });

            if (response.status === 429) {
                const data = await response.json();
                setError(
                    data.error ||
                        "Rate limited — the free AI tier has limited requests per minute. Please wait a moment and try again."
                );
                return;
            }

            if (!response.ok) {
                throw new Error("Failed to generate schedule");
            }

            const data = await response.json();
            setSchedule(data.tasks);
            setAddedTasks(new Set());
            setHistory((prev) =>
                prependWithLimit(
                    prev,
                    {
                        id: crypto.randomUUID(),
                        createdAt: new Date().toISOString(),
                        tasks: data.tasks,
                    },
                    MAX_SCHEDULE_HISTORY
                )
            );
        } catch (err) {
            console.error("Error generating schedule:", err);
            setError("Failed to generate schedule. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const handleAddTask = (task: GeneratedTask, index: number) => {
        addTask({
            title: task.title,
            description: task.description,
            priority: task.priority,
            dueDate: task.dueDate,
            status: "to-plant",
            tags: task.tags,
        });
        setAddedTasks((prev) => new Set(prev).add(index));
    };

    const clearHistory = () => {
        setHistory([]);
    };

    const restoreSuggestion = (entry: ScheduleHistoryEntry) => {
        setSchedule(entry.tasks);
        setAddedTasks(new Set());
    };

    const getPriorityColor = (priority: TaskPriority) => {
        switch (priority) {
            case "urgent":
                return "destructive";
            case "high":
                return "default";
            case "medium":
                return "secondary";
            case "low":
                return "outline";
            default:
                return "secondary";
        }
    };

    return (
        <Card className="garden-card">
            <CardHeader>
                <div className="flex items-center justify-between">
                    <CardTitle className="text-primary flex items-center gap-2">
                        <Sparkles className="h-5 w-5" />
                        AI Care Schedule
                    </CardTitle>
                    <Button
                        onClick={handleGenerate}
                        disabled={loading}
                        className="garden-button"
                    >
                        {loading ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Generating...
                            </>
                        ) : (
                            <>
                                <Sparkles className="mr-2 h-4 w-4" />
                                Generate Schedule
                            </>
                        )}
                    </Button>
                </div>
            </CardHeader>
            <CardContent>
                {error && (
                    <div className="bg-destructive/10 border-destructive/20 mb-4 flex items-start gap-3 rounded-lg border p-4">
                        <AlertCircle className="text-destructive mt-0.5 h-5 w-5 shrink-0" />
                        <div className="flex-1">
                            <p className="text-destructive text-sm font-medium">
                                {error}
                            </p>
                        </div>
                    </div>
                )}
                {!schedule ? (
                    <div className="text-muted-foreground flex min-h-[300px] items-center justify-center text-center">
                        <div>
                            <Sparkles className="text-primary mx-auto mb-4 h-12 w-12 opacity-50" />
                            <p className="text-sm">
                                Generate an AI-powered care schedule based on
                                your current garden. The AI will analyze your
                                plants and suggest tasks.
                            </p>
                        </div>
                    </div>
                ) : (
                    <div className="space-y-4">
                        <p className="text-sm">
                            Generated {schedule.length} tasks based on your
                            garden data. Click &quot;Add to Garden&quot; to add
                            them to your task list.
                        </p>
                        <div className="space-y-3">
                            {schedule.map((task, index) => (
                                <Card
                                    key={index}
                                    className="bg-muted border-primary/20"
                                >
                                    <CardContent className="p-4">
                                        <div className="flex items-start justify-between gap-4">
                                            <div className="flex-1 space-y-2">
                                                <div className="flex items-center gap-2">
                                                    <h4 className="font-semibold">
                                                        {task.title}
                                                    </h4>
                                                    <Badge
                                                        variant={getPriorityColor(
                                                            task.priority
                                                        )}
                                                    >
                                                        {task.priority}
                                                    </Badge>
                                                </div>
                                                <p className="text-muted-foreground text-sm">
                                                    {task.description}
                                                </p>
                                                <div className="flex items-center gap-2 text-xs">
                                                    <span className="text-muted-foreground">
                                                        Due:{" "}
                                                        {new Date(
                                                            task.dueDate
                                                        ).toLocaleDateString()}
                                                    </span>
                                                    {task.tags.length > 0 && (
                                                        <div className="flex gap-1">
                                                            {task.tags.map(
                                                                (tag) => (
                                                                    <Badge
                                                                        key={
                                                                            tag
                                                                        }
                                                                        variant="outline"
                                                                        className="text-xs"
                                                                    >
                                                                        {tag}
                                                                    </Badge>
                                                                )
                                                            )}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                            <Button
                                                size="sm"
                                                onClick={() =>
                                                    handleAddTask(task, index)
                                                }
                                                disabled={addedTasks.has(index)}
                                                className={
                                                    addedTasks.has(index)
                                                        ? ""
                                                        : "garden-button"
                                                }
                                            >
                                                {addedTasks.has(index) ? (
                                                    <>
                                                        <Check className="mr-2 h-4 w-4" />
                                                        Added
                                                    </>
                                                ) : (
                                                    <>
                                                        <CalendarPlus className="mr-2 h-4 w-4" />
                                                        Add to Garden
                                                    </>
                                                )}
                                            </Button>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    </div>
                )}

                {history.length > 0 && (
                    <div className="mt-6">
                        <Accordion type="single" collapsible>
                            <AccordionItem value="schedule-history">
                                <AccordionTrigger>
                                    Suggestions history ({history.length})
                                </AccordionTrigger>
                                <AccordionContent>
                                    <div className="space-y-2">
                                        <div className="mb-2 flex justify-end">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={clearHistory}
                                            >
                                                Clear history
                                            </Button>
                                        </div>
                                        {history.map((entry) => (
                                            <Card
                                                key={entry.id}
                                                className="bg-muted"
                                            >
                                                <CardContent className="flex items-center justify-between gap-4 p-3">
                                                    <div>
                                                        <p className="text-sm font-medium">
                                                            {`${entry.tasks.length} suggested tasks`}
                                                        </p>
                                                        <p className="text-muted-foreground text-xs">
                                                            {new Date(
                                                                entry.createdAt
                                                            ).toLocaleString()}
                                                        </p>
                                                    </div>
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() =>
                                                            restoreSuggestion(
                                                                entry
                                                            )
                                                        }
                                                    >
                                                        Restore
                                                    </Button>
                                                </CardContent>
                                            </Card>
                                        ))}
                                    </div>
                                </AccordionContent>
                            </AccordionItem>
                        </Accordion>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
