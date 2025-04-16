"use client";

import { useEffect, useState } from "react";
import { Harvest, useTaskStore } from "@/lib/task-store";
import { HarvestForm } from "@/components/harvest-form";
import { notFound, useParams } from "next/navigation";
import { SproutsLoader } from "@/components/sprout-loader";

export default function EditHarvestPage() {
    const params = useParams<{ id: string }>();
    const { getHarvest } = useTaskStore();
    const [harvest, setTask] = useState<Harvest | undefined>(undefined);

    useEffect(() => {
        const fetchTask = async () => {
            const data = getHarvest(params.id);

            setTask(data);
            if (!data && params.id !== "new") notFound();
        };
        fetchTask();
    }, [params, getHarvest]);

    return (
        <div className="mx-auto max-w-4xl">
            <h1 className="mb-6 text-3xl font-bold text-green-700">
                Edit Harvest Entry
            </h1>

            {harvest ? (
                <HarvestForm initialData={harvest} />
            ) : (
                <SproutsLoader />
            )}
        </div>
    );
}
