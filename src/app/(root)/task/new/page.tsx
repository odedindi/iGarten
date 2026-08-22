import { TaskForm } from "@/components/task-form";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";

export default function NewTaskPage() {
    return (
        <Card className="garden-card sm:mt-12 md:mt-4">
            <CardHeader>
                <CardTitle className="text-primary text-3xl font-bold">
                    New Garden Task
                </CardTitle>
                <CardDescription>
                    Add a new task for your garden, like planting seeds,
                    watering, or pruning.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <TaskForm />
            </CardContent>
        </Card>
    );
}
