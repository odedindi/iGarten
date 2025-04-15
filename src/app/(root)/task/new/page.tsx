import { TaskForm } from "@/components/task-form";

export default function NewTaskPage() {
    return (
        <div className="mx-auto max-w-4xl">
            <h1 className="mb-6 text-3xl font-bold">Create New Task</h1>
            <TaskForm />
        </div>
    );
}
