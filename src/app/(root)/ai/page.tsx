"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PlantChat } from "@/components/plant-chat";
import { PlantIdentifier } from "@/components/plant-identifier";
import { CareSchedule } from "@/components/care-schedule";
import { Bot, Camera, Sparkles } from "lucide-react";

export default function AIPage() {
    return (
        <div className="container mx-auto max-w-6xl overflow-auto p-6">
            <div className="garden-header mb-6 rounded-lg p-6">
                <h1 className="text-primary relative z-10 text-3xl font-bold">
                    AI Garden Assistant
                </h1>
                <p className="text-muted-foreground relative z-10">
                    Your intelligent plant care companion powered by Google
                    Gemini
                </p>
            </div>

            <Tabs defaultValue="chat" className="garden-tabs">
                <TabsList className="mb-6 grid w-full grid-cols-3">
                    <TabsTrigger
                        value="chat"
                        className="garden-tab flex items-center gap-2"
                    >
                        <Bot className="h-4 w-4" />
                        <span>Plant Chat</span>
                    </TabsTrigger>
                    <TabsTrigger
                        value="identify"
                        className="garden-tab flex items-center gap-2"
                    >
                        <Camera className="h-4 w-4" />
                        <span>Identify Plant</span>
                    </TabsTrigger>
                    <TabsTrigger
                        value="schedule"
                        className="garden-tab flex items-center gap-2"
                    >
                        <Sparkles className="h-4 w-4" />
                        <span>Generate Schedule</span>
                    </TabsTrigger>
                </TabsList>

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
