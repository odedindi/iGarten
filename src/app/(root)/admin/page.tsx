import Link from "next/link";
import { Sprout } from "lucide-react";
import { TaskTable } from "@/components/task-table";
import { ColumnSettings } from "@/components/column-settings";
import { Button } from "@/components/ui/button";

export default function AdminPage() {
    return (
        <div className="container mx-auto mb-6 max-w-6xl overflow-auto p-6 sm:p-3">
            <div className="garden-header rounded-lg p-6 sm:mx-6">
                <h1 className="text-primary relative z-10 text-3xl font-bold">
                    Garden Tasks
                </h1>
                <p className="text-muted-foreground relative z-10">
                    Manage your garden tasks and keep track of what needs
                    planting, what&apos;s growing, and what&apos;s ready to
                    harvest.
                </p>
            </div>
            <div className="my-6 flex flex-col justify-end gap-2 sm:flex-row">
                <Button asChild className="garden-button">
                    <Link href="/task/new">
                        <Sprout className="mr-2 size-4" />
                        Plant New Task
                    </Link>
                </Button>
                <ColumnSettings type="tasks" />
            </div>
            <TaskTable />
        </div>
    );
}
