"use client";

import { useEffect, useState } from "react";
import { Task, useTaskStore } from "@/lib/task-store";
import { TaskForm } from "@/components/task-form";
import { notFound, useParams } from "next/navigation";
import { SproutsLoader } from "@/components/sprout-loader";

export default function EditTaskPage() {
    const params = useParams<{ id: string }>();
    const { getTask } = useTaskStore();
    const [task, setTask] = useState<Task | undefined>();

    useEffect(() => {
        const fetchTask = async () => {
            const data = getTask(params.id);

            setTask(data);
            if (!data && params.id !== "new") notFound();
        };
        fetchTask();
    }, [params, getTask]);

    return (
        <div className="container mx-auto max-w-4xl overflow-auto p-6">
            <h1 className="mb-6 text-3xl font-bold">Edit Task</h1>
            {task ? <TaskForm initialData={task} /> : <SproutsLoader />}
        </div>
    );
}
