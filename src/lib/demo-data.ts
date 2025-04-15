import type { Task, Harvest, TaskStatus, TaskPriority } from "./task-store";
import { addDays, subDays } from "date-fns";

// Garden plants and vegetables
const plants = [
    "Tomatoes",
    "Peppers",
    "Eggplant",
    "Zucchini",
    "Cucumbers",
    "Lettuce",
    "Spinach",
    "Kale",
    "Carrots",
    "Radishes",
    "Beets",
    "Onions",
    "Garlic",
    "Potatoes",
    "Sweet Potatoes",
    "Basil",
    "Thyme",
    "Rosemary",
    "Mint",
    "Cilantro",
    "Parsley",
    "Dill",
    "Chives",
    "Oregano",
    "Sage",
    "Strawberries",
    "Blueberries",
    "Raspberries",
    "Blackberries",
    "Grapes",
    "Apples",
    "Pears",
    "Peaches",
    "Plums",
    "Cherries",
    "Sunflowers",
    "Zinnias",
    "Marigolds",
    "Lavender",
    "Roses",
];

// Garden tasks
const taskTypes = [
    "Plant",
    "Water",
    "Fertilize",
    "Prune",
    "Weed",
    "Mulch",
    "Harvest",
    "Transplant",
    "Sow Seeds",
    "Thin Seedlings",
    "Stake",
    "Trellis",
    "Cover",
    "Uncover",
    "Inspect",
    "Treat for Pests",
    "Apply Compost",
    "Turn Soil",
    "Build Bed",
    "Install Irrigation",
];

// Garden locations
const locations = [
    "Front Yard",
    "Back Yard",
    "Raised Bed #1",
    "Raised Bed #2",
    "Raised Bed #3",
    "Porch",
    "Balcony",
    "Windowsill",
    "Greenhouse",
    "Container Garden",
    "Herb Garden",
    "Vegetable Garden",
    "Fruit Garden",
    "Flower Bed",
    "Community Garden",
];

// Weather conditions
const weatherConditions = [
    "Sunny",
    "Partly Cloudy",
    "Overcast",
    "Light Rain",
    "Heavy Rain",
    "Drizzle",
    "Foggy",
    "Windy",
    "Hot",
    "Cold",
    "Humid",
    "Dry",
    "Stormy",
    "Mild",
    "Perfect",
];

// Plant tags
const plantTags = [
    "Vegetables",
    "Herbs",
    "Fruits",
    "Flowers",
    "Annuals",
    "Perennials",
    "Edible",
    "Ornamental",
    "Native",
    "Exotic",
    "Drought-Tolerant",
    "Shade-Loving",
    "Full-Sun",
    "Container",
    "Ground Cover",
    "Climbing",
    "Pollinator-Friendly",
    "Deer-Resistant",
    "Heirloom",
    "Organic",
];

// Generate a random date within range
function randomDate(start: Date, end: Date): string {
    return new Date(
        start.getTime() + Math.random() * (end.getTime() - start.getTime())
    ).toISOString();
}

// Generate a random item from an array
function randomItem<T>(array: T[]): T {
    return array[Math.floor(Math.random() * array.length)];
}

// Generate a random number within range
function randomNumber(min: number, max: number): number {
    return Math.round((Math.random() * (max - min) + min) * 100) / 100;
}

// Generate a random boolean with weighted probability
function randomBoolean(trueWeight = 0.5): boolean {
    return Math.random() < trueWeight;
}

// Generate random description HTML
function generateDescription(plant: string, task: string): string {
    const tips = [
        `Make sure to water ${plant} regularly.`,
        `${plant} needs full sun exposure.`,
        `${plant} prefers well-draining soil.`,
        `Watch for pests on your ${plant}.`,
        `${plant} benefits from companion planting with herbs.`,
        `${plant} should be spaced 12-18 inches apart.`,
        `${plant} is frost-sensitive.`,
        `${plant} is drought-tolerant once established.`,
        `${plant} will need staking as it grows.`,
        `Harvest ${plant} when fully ripe for best flavor.`,
    ];

    const randomTip = randomItem(tips);
    const infoSections = [
        `<p><strong>${task} ${plant}</strong> in the garden.</p>`,
        `<p>${randomTip}</p>`,
        `<ul><li>Soil pH: ${randomNumber(5.5, 7.5).toFixed(1)}</li><li>Growth rate: ${randomItem(["Slow", "Moderate", "Fast"])}</li></ul>`,
    ];

    return infoSections.join("");
}

// Generate realistic demo tasks
export function generateDemoTasks(count = 50): Task[] {
    const today = new Date();
    const oneYearAgo = subDays(today, 365);
    const tasks: Task[] = [];

    // Ensure we have tasks in all statuses and priorities for good chart data
    const statuses: TaskStatus[] = [
        "to-plant",
        "growing",
        "harvested",
        "failed",
    ];
    const priorities: TaskPriority[] = ["low", "medium", "high", "urgent"];

    // First, ensure we have at least a few tasks in each status and priority
    for (const status of statuses) {
        for (const priority of priorities) {
            const plant = randomItem(plants);
            const action = randomItem(taskTypes);

            tasks.push({
                id: crypto.randomUUID(),
                title: `${action} ${plant}`,
                description: generateDescription(plant, action),
                dateCreated: randomDate(oneYearAgo, today),
                dueDate: randomBoolean(0.8)
                    ? randomDate(oneYearAgo, addDays(today, 30))
                    : null,
                status,
                priority,
                tags: Array.from({ length: randomNumber(1, 4) }, () =>
                    randomItem(plantTags)
                ),
            });
        }
    }

    // Fill the rest with random tasks
    while (tasks.length < count) {
        const plant = randomItem(plants);
        const action = randomItem(taskTypes);

        tasks.push({
            id: crypto.randomUUID(),
            title: `${action} ${plant}`,
            description: generateDescription(plant, action),
            dateCreated: randomDate(oneYearAgo, today),
            dueDate: randomBoolean(0.8)
                ? randomDate(oneYearAgo, addDays(today, 30))
                : null,
            status: randomItem(statuses),
            priority: randomItem(priorities),
            tags: Array.from({ length: randomNumber(1, 4) }, () =>
                randomItem(plantTags)
            ),
        });
    }

    return tasks;
}

// Generate realistic demo harvests
export function generateDemoHarvests(count = 40): Harvest[] {
    const today = new Date();
    // const oneYearAgo = subDays(today, 365)
    const harvests: Harvest[] = [];

    // Quality options
    const qualities = ["poor", "average", "good", "excellent"] as const;

    // Units with appropriate quantity ranges
    const unitRanges = {
        kg: [0.5, 5],
        g: [100, 1000],
        lb: [0.5, 10],
        oz: [4, 32],
        count: [1, 20],
        bunch: [1, 5],
    };

    const units = Object.keys(unitRanges);

    // Distribute harvests more heavily in summer months
    for (let i = 0; i < count; i++) {
        // Create a seasonal bias - more harvests in summer
        let harvestDate: Date;
        const season = Math.random();

        if (season < 0.5) {
            // Summer
            const summerStart = new Date(today.getFullYear(), 5, 1); // June 1
            const summerEnd = new Date(today.getFullYear(), 8, 30); // September 30
            harvestDate = new Date(randomDate(summerStart, summerEnd));
        } else if (season < 0.8) {
            // Spring/Fall
            const springStart = new Date(today.getFullYear(), 2, 1); // March 1
            const springEnd = new Date(today.getFullYear(), 4, 30); // May 31
            const fallStart = new Date(today.getFullYear(), 9, 1); // October 1
            const fallEnd = new Date(today.getFullYear(), 10, 30); // November 30

            harvestDate =
                Math.random() < 0.5
                    ? new Date(randomDate(springStart, springEnd))
                    : new Date(randomDate(fallStart, fallEnd));
        } else {
            // Winter (fewer harvests)
            const winterStart = new Date(today.getFullYear() - 1, 11, 1); // December 1
            const winterEnd = new Date(today.getFullYear(), 1, 28); // February 28
            harvestDate = new Date(randomDate(winterStart, winterEnd));
        }

        // Only harvest vegetables, herbs, and fruits
        const harvestables = plants.filter(
            (p) =>
                ![
                    "Sunflowers",
                    "Zinnias",
                    "Marigolds",
                    "Lavender",
                    "Roses",
                ].includes(p)
        );

        const crop = randomItem(harvestables);
        const unit = randomItem(units);
        const range = unitRanges[unit as keyof typeof unitRanges];

        // Quality tends to be better in summer
        let qualityWeights;
        if (harvestDate.getMonth() >= 5 && harvestDate.getMonth() <= 8) {
            // June-September
            qualityWeights = [0.1, 0.2, 0.4, 0.3]; // Higher chance of good/excellent in summer
        } else if (harvestDate.getMonth() >= 2 && harvestDate.getMonth() <= 4) {
            // March-May
            qualityWeights = [0.2, 0.3, 0.3, 0.2]; // Balanced in spring
        } else if (
            harvestDate.getMonth() >= 9 &&
            harvestDate.getMonth() <= 10
        ) {
            // October-November
            qualityWeights = [0.2, 0.3, 0.3, 0.2]; // Balanced in fall
        } else {
            // Winter
            qualityWeights = [0.3, 0.4, 0.2, 0.1]; // Lower quality in winter
        }

        // Select quality based on weights
        let quality: (typeof qualities)[number] = qualities[0];
        const qualityRoll = Math.random();
        let cumulative = 0;
        for (let j = 0; j < qualities.length; j++) {
            cumulative += qualityWeights[j];
            if (qualityRoll <= cumulative) {
                quality = qualities[j];
                break;
            }
        }

        harvests.push({
            id: crypto.randomUUID(),
            cropName: crop,
            quantity: randomNumber(range[0], range[1]),
            unit: unit,
            dateHarvested: harvestDate.toISOString(),
            notes: `Harvested ${crop} from the ${randomItem(locations)}. ${randomItem(
                [
                    "Tasted great!",
                    "Not as sweet as expected.",
                    "Perfect ripeness!",
                    "Could have waited another day.",
                    "Amazing flavor this year!",
                    "Will plant more next season.",
                    "Need to adjust watering schedule.",
                    "Best harvest yet!",
                    "Using in tonight's dinner.",
                ]
            )}`,
            location: randomItem(locations),
            quality: quality as "poor" | "average" | "good" | "excellent",
            weather: randomItem(weatherConditions),
        });
    }

    // Sort by date
    return harvests.sort(
        (a, b) =>
            new Date(a.dateHarvested).getTime() -
            new Date(b.dateHarvested).getTime()
    );
}
