"use client";

import { useEffect, useState, useRef } from "react";
import {
    loadLocalStorage,
    prependWithLimit,
    saveLocalStorage,
} from "@/lib/ai/history";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Camera, Upload, Loader2, Leaf } from "lucide-react";
import ReactMarkdown from "react-markdown";

const IDENTIFY_HISTORY_KEY = "garden_ai_identify_history_v1";
const MAX_IDENTIFY_HISTORY = 10;

interface IdentifyHistoryEntry {
    id: string;
    createdAt: string;
    sourceLabel: string;
    result: string;
}

export function PlantIdentifier() {
    const [image, setImage] = useState<string | null>(null);
    const [result, setResult] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [dragActive, setDragActive] = useState(false);
    const [sourceLabel, setSourceLabel] = useState<string>("Uploaded image");
    const [history, setHistory] = useState<IdentifyHistoryEntry[]>([]);
    const [historyLoaded, setHistoryLoaded] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        setHistory(
            loadLocalStorage<IdentifyHistoryEntry[]>(IDENTIFY_HISTORY_KEY, [])
        );
        setHistoryLoaded(true);
    }, []);

    useEffect(() => {
        if (!historyLoaded) {
            return;
        }

        saveLocalStorage(IDENTIFY_HISTORY_KEY, history);
    }, [history, historyLoaded]);

    const handleFile = (file: File) => {
        if (!file.type.startsWith("image/")) {
            alert("Please upload an image file");
            return;
        }

        const reader = new FileReader();
        reader.onload = (e) => {
            const base64 = e.target?.result as string;
            setImage(base64);
            setResult(null);
            setSourceLabel(file.name || "Uploaded image");
        };
        reader.readAsDataURL(file);
    };

    const handleDrag = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === "dragenter" || e.type === "dragover") {
            setDragActive(true);
        } else if (e.type === "dragleave") {
            setDragActive(false);
        }
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);

        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            handleFile(e.dataTransfer.files[0]);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        e.preventDefault();
        if (e.target.files && e.target.files[0]) {
            handleFile(e.target.files[0]);
        }
    };

    const handleIdentify = async () => {
        if (!image) return;

        setLoading(true);
        try {
            const response = await fetch("/api/identify", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ image }),
            });

            if (response.status === 429) {
                const data = await response.json();
                setResult(
                    data.error ||
                        "Rate limited — the free AI tier has limited requests per minute. Please wait a moment and try again."
                );
                return;
            }

            if (!response.ok) {
                throw new Error("Failed to identify plant");
            }

            const data = await response.json();
            setResult(data.text);
            setHistory((prev) =>
                prependWithLimit(
                    prev,
                    {
                        id: crypto.randomUUID(),
                        createdAt: new Date().toISOString(),
                        sourceLabel,
                        result: data.text,
                    },
                    MAX_IDENTIFY_HISTORY
                )
            );
        } catch (error) {
            console.error("Error identifying plant:", error);
            setResult(
                "Sorry, I couldn't identify this plant. Please try again with a clearer image."
            );
        } finally {
            setLoading(false);
        }
    };

    const clearHistory = () => {
        setHistory([]);
    };

    return (
        <Card className="garden-card">
            <CardHeader>
                <CardTitle className="text-primary flex items-center gap-2">
                    <Camera className="h-5 w-5" />
                    Identify Plant
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                {!image ? (
                    <div
                        onDragEnter={handleDrag}
                        onDragLeave={handleDrag}
                        onDragOver={handleDrag}
                        onDrop={handleDrop}
                        onClick={() => fileInputRef.current?.click()}
                        className={`border-primary/30 hover:border-primary/50 flex min-h-[300px] cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed p-8 transition-colors ${
                            dragActive ? "border-primary bg-primary/5" : ""
                        }`}
                    >
                        <Upload className="text-primary/50 mb-4 h-16 w-16" />
                        <p className="text-muted-foreground mb-2 text-center">
                            Drop a photo of your plant here, or click to browse
                        </p>
                        <p className="text-muted-foreground text-center text-sm">
                            Supports JPG, PNG, and WEBP
                        </p>
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*"
                            onChange={handleChange}
                            className="hidden"
                        />
                    </div>
                ) : (
                    <div className="space-y-4">
                        <div className="relative aspect-video overflow-hidden rounded-lg">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                                src={image}
                                alt="Plant to identify"
                                className="h-full w-full object-contain"
                            />
                        </div>
                        <div className="flex gap-2">
                            <Button
                                onClick={handleIdentify}
                                disabled={loading}
                                className="garden-button flex-1"
                            >
                                {loading ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Identifying...
                                    </>
                                ) : (
                                    <>
                                        <Leaf className="mr-2 h-4 w-4" />
                                        Identify Plant
                                    </>
                                )}
                            </Button>
                            <Button
                                variant="outline"
                                onClick={() => {
                                    setImage(null);
                                    setResult(null);
                                }}
                            >
                                Clear
                            </Button>
                        </div>
                    </div>
                )}

                {result && (
                    <Card
                        className="bg-muted"
                        ref={(node) => {
                            if (node) {
                                // scroll to bottom of the node
                                node.scrollIntoView({
                                    behavior: "smooth",
                                    block: "end",
                                });
                            }
                        }}
                    >
                        <CardHeader>
                            <CardTitle className="text-primary flex items-center gap-2 text-lg">
                                <Leaf className="h-5 w-5" />
                                Identification Result
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <ReactMarkdown>{result}</ReactMarkdown>
                        </CardContent>
                    </Card>
                )}

                {history.length > 0 && (
                    <Card className="bg-muted">
                        <CardHeader className="pb-2">
                            <div className="flex items-center justify-between gap-4">
                                <CardTitle className="text-primary text-lg">
                                    Scan history ({history.length})
                                </CardTitle>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={clearHistory}
                                >
                                    Clear history
                                </Button>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-2">
                            {history.map((entry) => (
                                <div
                                    key={entry.id}
                                    className="bg-background rounded-md border p-3"
                                >
                                    <div className="mb-2 flex items-center justify-between gap-4">
                                        <div>
                                            <p className="text-sm font-medium">
                                                {entry.sourceLabel}
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
                                                setResult(entry.result)
                                            }
                                        >
                                            View
                                        </Button>
                                    </div>
                                    <p className="text-muted-foreground line-clamp-2 text-xs">
                                        {entry.result}
                                    </p>
                                </div>
                            ))}
                        </CardContent>
                    </Card>
                )}
            </CardContent>
        </Card>
    );
}
