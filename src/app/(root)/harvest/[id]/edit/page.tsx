"use client";

import { useEffect } from "react";
import { useTaskStore } from "@/lib/task-store";
import { HarvestForm } from "@/components/harvest-form";
import { notFound } from "next/navigation";

export default function EditHarvestPage({
    params,
}: {
    params: { id: string };
}) {
    const { getHarvest } = useTaskStore();
    const harvest = getHarvest(params.id);

    useEffect(() => {
        if (!harvest) notFound();
    }, [harvest]);

    return (
        <div className="mx-auto max-w-4xl">
            <h1 className="mb-6 text-3xl font-bold text-green-700">
                Edit Harvest Entry
            </h1>
            <HarvestForm initialData={harvest} />
        </div>
    );
}
