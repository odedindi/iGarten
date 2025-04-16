"use client";

import { useCallback } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TaskForm } from "@/components/task-form";
import { HarvestForm } from "@/components/harvest-form";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Flower2, Sprout } from "lucide-react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";

export default function GardenEntryPage() {
    const router = useRouter();

    const searchParams = useSearchParams();
    const pathname = usePathname();

    const tab = searchParams.get("tab") ?? "harvest";
    const setTab = useCallback(
        (value: string) => {
            const params = new URLSearchParams(searchParams.toString());
            params.set("tab", value);
            router.replace(`${pathname}?${params.toString()}`);
        },
        [searchParams, router, pathname]
    );

    return (
        <div className="mx-auto max-w-4xl">
            <div className="garden-header mb-6 rounded-lg p-6">
                <h1 className="text-primary relative z-10 text-3xl font-bold">
                    Garden Journal Entry
                </h1>
                <p className="text-muted-foreground relative z-10 mb-6">
                    Record your garden activities and harvests. Keep your garden
                    organized and track your progress!
                </p>
            </div>

            <Tabs
                defaultValue="task"
                value={tab}
                onValueChange={setTab}
                className="garden-tabs"
            >
                <TabsList className="mb-6 grid w-full grid-cols-2">
                    <TabsTrigger
                        value="harvest"
                        className="garden-tab flex items-center gap-2"
                    >
                        <Flower2 className="h-4 w-4" />
                        <span>Log Harvest</span>
                    </TabsTrigger>
                    <TabsTrigger
                        value="task"
                        className="garden-tab flex items-center gap-2"
                    >
                        <Sprout className="h-4 w-4" />
                        <span>New Garden Task</span>
                    </TabsTrigger>
                </TabsList>
                <TabsContent value="harvest">
                    <Card className="garden-card">
                        <CardHeader>
                            <CardTitle className="text-primary">
                                Log Harvest
                            </CardTitle>
                            <CardDescription>
                                {
                                    "Record what you've harvested from your garden. Keep track of quantities, quality, and more!"
                                }
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <HarvestForm />
                        </CardContent>
                    </Card>
                </TabsContent>
                <TabsContent value="task">
                    <Card className="garden-card">
                        <CardHeader>
                            <CardTitle className="text-primary">
                                New Garden Task
                            </CardTitle>
                            <CardDescription>
                                Add a new task for your garden, like planting
                                seeds, watering, or pruning.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <TaskForm />
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}
