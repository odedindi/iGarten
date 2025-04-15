"use client";

import type React from "react";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTaskStore, type Task } from "@/lib/task-store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { TipTapEditor } from "@/components/tiptap-editor";
import { DatePicker } from "./ui/date-picker";

interface TaskFormProps {
    initialData?: Task;
}

export function TaskForm({ initialData }: TaskFormProps) {
    const router = useRouter();
    const { addTask, updateTask } = useTaskStore();
    const [title, setTitle] = useState(initialData?.title || "");
    const [description, setDescription] = useState(
        initialData?.description || ""
    );
    const [dueDate, setDueDate] = useState(
        initialData?.dueDate ? new Date(initialData.dueDate) : undefined
    );
    const [status, setStatus] = useState<Task["status"]>(
        initialData?.status || "to-plant"
    );
    const [priority, setPriority] = useState<Task["priority"]>(
        initialData?.priority || "medium"
    );
    const [tags, setTags] = useState(
        initialData?.tags ? initialData.tags.join(", ") : ""
    );

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        const formData = {
            title,
            description,
            dueDate: dueDate ? new Date(dueDate).toISOString() : null,
            status,
            priority,
            tags: tags
                .split(",")
                .map((tag) => tag.trim())
                .filter(Boolean),
        } as Omit<Task, "id" | "dateCreated">;

        if (initialData) {
            updateTask(initialData.id, formData);
        } else {
            addTask(formData);
        }

        router.push("/admin");
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
                <Label htmlFor="title">Plant/Task Name</Label>
                <Input
                    id="title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="E.g., Plant tomatoes, Prune apple tree"
                    required
                    maxLength={255}
                    className="garden-input"
                />
            </div>

            <div className="space-y-2">
                <Label htmlFor="description">Details</Label>
                <TipTapEditor content={description} onChange={setDescription} />
                <p className="text-muted-foreground text-xs italic">
                    Add details like soil type, sun exposure, watering needs,
                    etc.
                </p>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="space-y-2">
                    <Label htmlFor="dueDate">Target Date</Label>
                    <DatePicker
                        value={dueDate}
                        onChange={setDueDate}
                        presets="future"
                    />
                    <p className="text-muted-foreground text-xs italic">
                        When should this be done by?
                    </p>
                </div>

                <div className="space-y-2">
                    <Label htmlFor="status">Status</Label>
                    <Select
                        value={status}
                        onValueChange={(newStatus) =>
                            setStatus(newStatus as Task["status"])
                        }
                    >
                        <SelectTrigger id="status" className="garden-input">
                            <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                        <SelectContent className="bg-popover">
                            <SelectItem value="to-plant">To Plant</SelectItem>
                            <SelectItem value="growing">Growing</SelectItem>
                            <SelectItem value="harvested">Harvested</SelectItem>
                            <SelectItem value="failed">
                                Failed (RIP Plant)
                            </SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                <div className="space-y-2">
                    <Label htmlFor="priority">Priority</Label>
                    <Select
                        value={priority}
                        onValueChange={(newPriority) =>
                            setPriority(newPriority as Task["priority"])
                        }
                    >
                        <SelectTrigger id="priority" className="garden-input">
                            <SelectValue placeholder="Select priority" />
                        </SelectTrigger>
                        <SelectContent className="bg-popover">
                            <SelectItem value="low">
                                Low (Meh, whenever)
                            </SelectItem>
                            <SelectItem value="medium">
                                Medium (Soon-ish)
                            </SelectItem>
                            <SelectItem value="high">High (ASAP)</SelectItem>
                            <SelectItem value="urgent">
                                Urgent (Plants dying!)
                            </SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                <div className="space-y-2">
                    <Label htmlFor="tags">Tags</Label>
                    <Input
                        id="tags"
                        value={tags}
                        onChange={(e) => setTags(e.target.value)}
                        placeholder="E.g., vegetables, fruit, herbs"
                        className="garden-input"
                    />
                    <p className="text-muted-foreground text-xs italic">
                        Separate with commas
                    </p>
                </div>
            </div>

            <div className="flex justify-end space-x-2 pt-4">
                <Button
                    type="button"
                    variant="outline"
                    onClick={() => router.back()}
                >
                    Cancel
                </Button>
                <Button type="submit" className="garden-button">
                    {initialData ? "Update Garden Task" : "Add to Garden"}
                </Button>
            </div>
        </form>
    );
}
