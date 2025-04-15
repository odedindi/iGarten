"use client";

import { useEffect, useState } from "react";
import { Task, useTaskStore } from "@/lib/task-store";
import { TaskForm } from "@/components/task-form";
import { notFound } from "next/navigation";

export default function EditTaskPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { getTask } = useTaskStore();
    const [state, setState] = useState<Task | undefined>();

    useEffect(() => {
        const fetchTask = async () => {
            const { id } = await params;
            const task = getTask(id);

            setState(task);
            if (!task && id !== "new") notFound();
        };
        fetchTask();
    }, [params, getTask]);

    return (
        <div className="mx-auto max-w-4xl">
            <h1 className="mb-6 text-3xl font-bold">Edit Task</h1>
            <TaskForm initialData={state} />
        </div>
    );
}
