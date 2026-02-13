import type { Task, Harvest } from "@/lib/task-store";

export function buildGardenContext(tasks: Task[], harvests: Harvest[]): string {
    const activeTasks = tasks.filter((task) => !task.deleted);
    const activeHarvests = harvests.filter((harvest) => !harvest.deleted);

    if (activeTasks.length === 0 && activeHarvests.length === 0) {
        return "Your garden is empty. Start by adding some plants and tasks!";
    }

    let context = "Your Garden Overview:\n\n";

    if (activeTasks.length > 0) {
        context += `Active Tasks (${activeTasks.length}):\n`;
        activeTasks.forEach((task) => {
            context += `- ${task.title} — Status: ${task.status}, Priority: ${task.priority}`;
            if (task.dueDate) {
                context += `, Due: ${new Date(task.dueDate).toLocaleDateString()}`;
            }
            context += "\n";
        });
        context += "\n";
    }

    if (activeHarvests.length > 0) {
        context += `Recent Harvests (${activeHarvests.length}):\n`;
        activeHarvests.forEach((harvest) => {
            context += `- ${harvest.cropName} — ${harvest.quantity}${harvest.unit}, Quality: ${harvest.quality}, Date: ${new Date(harvest.dateHarvested).toLocaleDateString()}\n`;
        });
    }

    return context.trim();
}
