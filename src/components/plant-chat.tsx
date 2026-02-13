"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import { useTaskStore } from "@/lib/task-store";
import { buildGardenContext } from "@/lib/ai/garden-context";
import {
    loadChatConversations,
    saveChatConversations,
    type ChatConversationRecord,
    type ChatMessageRecord,
} from "../lib/ai/history";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Bot,
    User,
    Loader2,
    Send,
    AlertCircle,
    MessageSquarePlus,
    Trash2,
} from "lucide-react";
import ReactMarkdown from "react-markdown";

const MAX_MODEL_MESSAGES = 24;
const MAX_MODEL_CHARS = 12000;
const MIN_MESSAGES_TO_KEEP = 6;

function createConversation(): ChatConversationRecord {
    const now = new Date().toISOString();
    return {
        id: crypto.randomUUID(),
        title: "New chat",
        createdAt: now,
        updatedAt: now,
        messages: [],
    };
}

function sortConversations(conversations: ChatConversationRecord[]) {
    return [...conversations].sort((a, b) =>
        b.updatedAt.localeCompare(a.updatedAt)
    );
}

function buildConversationTitle(message: string) {
    const cleanMessage = message.trim().replace(/\s+/g, " ");
    if (!cleanMessage) {
        return "New chat";
    }
    return cleanMessage.slice(0, 40);
}

function buildModelMessageWindow(messages: ChatMessageRecord[]) {
    const selected: { role: "user" | "assistant"; content: string }[] = [];
    let totalChars = 0;

    for (let i = messages.length - 1; i >= 0; i -= 1) {
        const current = messages[i];
        const nextTotal = totalChars + current.content.length;

        if (selected.length >= MAX_MODEL_MESSAGES) {
            break;
        }

        if (
            selected.length >= MIN_MESSAGES_TO_KEEP &&
            nextTotal > MAX_MODEL_CHARS
        ) {
            break;
        }

        selected.unshift({ role: current.role, content: current.content });
        totalChars = nextTotal;
    }

    return selected;
}

export function PlantChat() {
    const { tasks, harvests } = useTaskStore();
    const gardenContext = buildGardenContext(tasks, harvests);
    const scrollRef = useRef<HTMLDivElement>(null);
    const [conversations, setConversations] = useState<
        ChatConversationRecord[]
    >([]);
    const [activeConversationId, setActiveConversationId] = useState<
        string | null
    >(null);
    const [inputValue, setInputValue] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [historyLoaded, setHistoryLoaded] = useState(false);

    const activeConversation = conversations.find(
        (conversation) => conversation.id === activeConversationId
    );
    const messages = useMemo(
        () => activeConversation?.messages ?? [],
        [activeConversation?.messages]
    );

    useEffect(() => {
        let cancelled = false;

        const loadHistory = async () => {
            const loadedConversations = await loadChatConversations();
            if (cancelled) {
                return;
            }

            if (loadedConversations.length === 0) {
                const initialConversation = createConversation();
                setConversations([initialConversation]);
                setActiveConversationId(initialConversation.id);
            } else {
                const sortedConversations =
                    sortConversations(loadedConversations);
                setConversations(sortedConversations);
                setActiveConversationId(sortedConversations[0].id);
            }

            setHistoryLoaded(true);
        };

        void loadHistory();

        return () => {
            cancelled = true;
        };
    }, []);

    useEffect(() => {
        if (!historyLoaded) {
            return;
        }

        void saveChatConversations(conversations);
    }, [conversations, historyLoaded]);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages]);

    const upsertConversation = (
        id: string,
        updater: (
            conversation: ChatConversationRecord
        ) => ChatConversationRecord
    ) => {
        setConversations((prev) =>
            sortConversations(
                prev.map((conversation) =>
                    conversation.id === id
                        ? updater(conversation)
                        : conversation
                )
            )
        );
    };

    const createNewConversation = () => {
        const newConversation = createConversation();
        setConversations((prev) => [newConversation, ...prev]);
        setActiveConversationId(newConversation.id);
        setErrorMessage(null);
    };

    const clearHistory = () => {
        if (!activeConversationId) {
            return;
        }

        upsertConversation(activeConversationId, (conversation) => ({
            ...conversation,
            updatedAt: new Date().toISOString(),
            messages: [],
        }));
        setErrorMessage(null);
    };

    const deleteConversation = () => {
        if (!activeConversationId || conversations.length === 0) {
            return;
        }

        let nextActiveId: string | null = null;

        setConversations((prev) => {
            const remaining = prev.filter(
                (conversation) => conversation.id !== activeConversationId
            );

            if (remaining.length === 0) {
                const initialConversation = createConversation();
                nextActiveId = initialConversation.id;
                return [initialConversation];
            }

            nextActiveId = remaining[0].id;
            return remaining;
        });

        setActiveConversationId(nextActiveId);
        setErrorMessage(null);
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!inputValue.trim() || isLoading) return;

        let conversationId = activeConversationId;

        if (!conversationId) {
            const initialConversation = createConversation();
            conversationId = initialConversation.id;
            setConversations((prev) => [initialConversation, ...prev]);
            setActiveConversationId(initialConversation.id);
        }

        if (!conversationId) {
            return;
        }

        const currentConversation = conversations.find(
            (conversation) => conversation.id === conversationId
        );
        const currentMessages = currentConversation?.messages ?? [];

        const userMessage: ChatMessageRecord = {
            id: crypto.randomUUID(),
            role: "user",
            content: inputValue,
        };

        const nextMessages = [...currentMessages, userMessage];
        const nextTitle =
            (currentConversation?.title ?? "New chat") === "New chat" &&
            currentMessages.length === 0
                ? buildConversationTitle(userMessage.content)
                : (currentConversation?.title ?? "New chat");

        upsertConversation(conversationId, (conversation) => ({
            ...conversation,
            title: nextTitle,
            updatedAt: new Date().toISOString(),
            messages: nextMessages,
        }));

        setInputValue("");
        setIsLoading(true);
        setErrorMessage(null);

        try {
            const messagesForModel = buildModelMessageWindow(nextMessages);
            const response = await fetch("/api/chat", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    messages: messagesForModel,
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

            const assistantMessage: ChatMessageRecord = {
                id: crypto.randomUUID(),
                role: "assistant",
                content: "",
            };

            upsertConversation(conversationId, (conversation) => ({
                ...conversation,
                updatedAt: new Date().toISOString(),
                messages: [...conversation.messages, assistantMessage],
            }));

            if (reader) {
                while (true) {
                    const { done, value } = await reader.read();
                    if (done) break;

                    const chunk = decoder.decode(value);
                    assistantContent += chunk;

                    upsertConversation(conversationId, (conversation) => ({
                        ...conversation,
                        updatedAt: new Date().toISOString(),
                        messages: conversation.messages.map(
                            (message: ChatMessageRecord) =>
                                message.id === assistantMessage.id
                                    ? { ...message, content: assistantContent }
                                    : message
                        ),
                    }));
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
                        Chat with Gruno
                    </CardTitle>
                    <div className="flex items-center gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={createNewConversation}
                            disabled={isLoading}
                        >
                            <MessageSquarePlus className="mr-2 h-4 w-4" />
                            New
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={deleteConversation}
                            disabled={isLoading || conversations.length <= 1}
                        >
                            <Trash2 className="h-4 w-4" />
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={clearHistory}
                            disabled={isLoading || messages.length === 0}
                        >
                            Clear
                        </Button>
                    </div>
                </div>
                <Select
                    value={activeConversationId ?? undefined}
                    onValueChange={setActiveConversationId}
                >
                    <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select conversation" />
                    </SelectTrigger>
                    <SelectContent>
                        {conversations.map((conversation) => (
                            <SelectItem
                                key={conversation.id}
                                value={conversation.id}
                            >
                                {conversation.title}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
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
                            {messages.map((message: ChatMessageRecord) => (
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
