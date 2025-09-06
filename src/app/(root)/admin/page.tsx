import { TaskTable } from "@/components/task-table";
import { ColumnSettings } from "@/components/column-settings";

export default function AdminPage() {
    return (
        <div className="container mx-auto space-y-6 overflow-auto p-6">
            <div className="garden-header rounded-lg p-6">
                <h1 className="text-primary relative z-10 text-3xl font-bold">
                    Garden Tasks
                </h1>
                <p className="text-muted-foreground relative z-10">
                    Manage your garden tasks and keep track of what needs
                    planting, what&apos;s growing, and what&apos;s ready to
                    harvest.
                </p>
            </div>
            <div className="flex justify-end">
                <ColumnSettings type="tasks" />
            </div>
            <TaskTable />
        </div>
    );
}
