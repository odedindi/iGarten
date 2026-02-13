"use client";

import { useState, useEffect, useRef } from "react";
import { useTaskStore } from "@/lib/task-store";
import { buildGardenContext } from "@/lib/ai/garden-context";
import {
    loadLocalStorage,
    saveLocalStorage,
} from "@/lib/ai/history";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Bot, User, Loader2, Send, AlertCircle } from "lucide-react";
import ReactMarkdown from "react-markdown";

const CHAT_HISTORY_KEY = "garden_ai_chat_history_v1";

interface Message {
    id: string;
    role: "user" | "assistant";
    content: string;
}

export function PlantChat() {
    const { tasks, harvests } = useTaskStore();
    const gardenContext = buildGardenContext(tasks, harvests);
    const scrollRef = useRef<HTMLDivElement>(null);
    const [messages, setMessages] = useState<Message[]>([]);
    const [inputValue, setInputValue] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [historyLoaded, setHistoryLoaded] = useState(false);

    useEffect(() => {
        setMessages(loadLocalStorage<Message[]>(CHAT_HISTORY_KEY, []));
        setHistoryLoaded(true);
    }, []);

    useEffect(() => {
        if (!historyLoaded) {
            return;
        }

        saveLocalStorage(CHAT_HISTORY_KEY, messages);
    }, [messages, historyLoaded]);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages]);

    const clearHistory = () => {
        setMessages([]);
        setErrorMessage(null);
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!inputValue.trim() || isLoading) return;

        const userMessage: Message = {
            id: crypto.randomUUID(),
            role: "user",
            content: inputValue,
        };

        setMessages((prev) => [...prev, userMessage]);
        setInputValue("");
        setIsLoading(true);
        setErrorMessage(null);

        try {
            const response = await fetch("/api/chat", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    messages: [
                        ...messages.map((m) => ({
                            role: m.role,
                            content: m.content,
                        })),
                        { role: "user", content: inputValue },
                    ],
                    gardenContext,
                }),
            });

            if (response.status === 429) {
                const data = await response.json();
                setErrorMessage(
                    data.error ||
                        "Rate limited — please wait a moment and try again."
                );
                return;
            }

            if (!response.ok) {
                throw new Error("Failed to get response");
            }

            const reader = response.body?.getReader();
            const decoder = new TextDecoder();
            let assistantContent = "";

            const assistantMessage: Message = {
                id: crypto.randomUUID(),
                role: "assistant",
                content: "",
            };

            setMessages((prev) => [...prev, assistantMessage]);

            if (reader) {
                while (true) {
                    const { done, value } = await reader.read();
                    if (done) break;

                    const chunk = decoder.decode(value);
                    assistantContent += chunk;

                    setMessages((prev) =>
                        prev.map((m) =>
                            m.id === assistantMessage.id
                                ? { ...m, content: assistantContent }
                                : m
                        )
                    );
                }
            }
        } catch (error) {
            console.error("Chat error:", error);
            setErrorMessage(
                "Sorry, I encountered an error. Please try again later."
            );
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Card className="garden-card flex min-h-[600px] flex-col">
            <CardHeader>
                <div className="flex items-center justify-between gap-4">
                    <CardTitle className="text-primary flex items-center gap-2">
                        <Bot className="h-5 w-5" />
                        Chat with Verdia
                    </CardTitle>
                    {messages.length > 0 && (
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={clearHistory}
                            disabled={isLoading}
                        >
                            Clear history
                        </Button>
                    )}
                </div>
            </CardHeader>
            <CardContent className="flex flex-1 flex-col gap-4">
                <ScrollArea className="flex-1 pr-4" ref={scrollRef}>
                    {messages.length === 0 && !errorMessage ? (
                        <div className="text-muted-foreground flex h-full items-center justify-center text-center">
                            <div>
                                <Bot className="text-primary mx-auto mb-4 h-12 w-12 opacity-50" />
                                <p className="text-sm">
                                    Ask me anything about your plants! I can see
                                    your garden data and give personalized
                                    advice.
                                </p>
                            </div>
                        </div>
                    ) : (
                        <div className="flex flex-col gap-4">
                            {messages.map((message) => (
                                <div
                                    key={message.id}
                                    className={`flex items-start gap-3 ${
                                        message.role === "user"
                                            ? "flex-row-reverse"
                                            : ""
                                    }`}
                                >
                                    <div
                                        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${
                                            message.role === "user"
                                                ? "bg-primary text-primary-foreground"
                                                : "bg-muted"
                                        }`}
                                    >
                                        {message.role === "user" ? (
                                            <User className="h-4 w-4" />
                                        ) : (
                                            <Bot className="h-4 w-4" />
                                        )}
                                    </div>
                                    <div
                                        className={`flex-1 rounded-lg p-3 ${
                                            message.role === "user"
                                                ? "bg-primary text-primary-foreground"
                                                : "bg-muted"
                                        }`}
                                    >
                                        {message.role === "user" ? (
                                            <p className="text-sm whitespace-pre-wrap">
                                                {message.content}
                                            </p>
                                        ) : (
                                            <div className="prose prose-sm dark:prose-invert prose-p:my-1 prose-headings:my-2 prose-ul:my-1 prose-ol:my-1 prose-li:my-0.5 prose-hr:my-3 prose-strong:text-inherit max-w-none">
                                                <ReactMarkdown>
                                                    {message.content}
                                                </ReactMarkdown>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                            {errorMessage && (
                                <div className="flex items-start gap-3">
                                    <div className="bg-destructive/10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full">
                                        <AlertCircle className="text-destructive h-4 w-4" />
                                    </div>
                                    <div className="bg-destructive/10 flex-1 rounded-lg p-3">
                                        <p className="text-destructive text-sm">
                                            {errorMessage}
                                        </p>
                                    </div>
                                </div>
                            )}
                            {isLoading && !errorMessage && (
                                <div className="flex items-start gap-3">
                                    <div className="bg-muted flex h-8 w-8 shrink-0 items-center justify-center rounded-full">
                                        <Bot className="h-4 w-4" />
                                    </div>
                                    <div className="bg-muted flex-1 rounded-lg p-3">
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </ScrollArea>
                <form
                    onSubmit={handleSubmit}
                    className="flex items-center gap-2"
                >
                    <Input
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        placeholder="Ask about plant care, pests, diseases..."
                        className="garden-input flex-1"
                        disabled={isLoading}
                    />
                    <Button
                        type="submit"
                        size="icon"
                        disabled={isLoading || !inputValue.trim()}
                        className="garden-button shrink-0"
                    >
                        <Send className="h-4 w-4" />
                    </Button>
                </form>
            </CardContent>
        </Card>
    );
}
