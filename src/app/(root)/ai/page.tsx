"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PlantChat } from "@/components/plant-chat";
import { PlantIdentifier } from "@/components/plant-identifier";
import { CareSchedule } from "@/components/care-schedule";
import { Bot, Camera, Sparkles } from "lucide-react";

export default function AIPage() {
    return (
        <div className="container mx-auto mb-6 max-w-6xl overflow-auto p-3 sm:p-6">
            <div className="garden-header mb-4 rounded-lg p-4 sm:mb-6 sm:p-6">
                <h1 className="text-primary relative z-10 text-2xl font-bold sm:text-3xl">
                    AI Garden Assistant
                </h1>
                <p className="text-muted-foreground relative z-10">
                    Your intelligent plant care companion powered by Google
                    Gemini
                </p>
            </div>

            <Tabs defaultValue="chat" className="garden-tabs">
                <div className="overflow-x-auto">
                    <TabsList className="mb-6 w-full">
                        <TabsTrigger
                            value="chat"
                            className="garden-tab flex items-center gap-2"
                        >
                            <Bot className="h-4 w-4" />
                            <span className="hidden sm:inline">Plant </span>Chat
                        </TabsTrigger>
                        <TabsTrigger
                            value="identify"
                            className="garden-tab flex items-center gap-2"
                        >
                            <Camera className="h-4 w-4" />
                            <span className="hidden sm:inline">Identify </span>
                            Plant
                        </TabsTrigger>
                        <TabsTrigger
                            value="schedule"
                            className="garden-tab flex items-center gap-2"
                        >
                            <Sparkles className="h-4 w-4" />
                            <span className="hidden sm:inline">Generate </span>
                            Schedule
                        </TabsTrigger>
                    </TabsList>
                </div>

                <TabsContent value="chat">
                    <PlantChat />
                </TabsContent>

                <TabsContent value="identify">
                    <PlantIdentifier />
                </TabsContent>

                <TabsContent value="schedule">
                    <CareSchedule />
                </TabsContent>
            </Tabs>
        </div>
    );
}
