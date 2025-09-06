import { HarvestForm } from "@/components/harvest-form";

export default function NewHarvestPage() {
    return (
        <div className="container mx-auto max-w-4xl overflow-auto p-6">
            <h1 className="mb-6 text-3xl font-bold text-green-700">
                Log New Harvest
            </h1>
            <p className="text-muted-foreground mb-6">
                {
                    "Record what you've harvested from your garden. Keep track of quantities, quality, and more!"
                }
            </p>
            <HarvestForm />
        </div>
    );
}
