import { HarvestForm } from "@/components/harvest-form";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";

export default function NewHarvestPage() {
    return (
        <Card className="garden-card sm:mt-12 md:mt-4">
            <CardHeader>
                <CardTitle className="text-primary text-3xl font-bold">
                    Log New Harvest
                </CardTitle>
                <CardDescription>
                    Record what you&apos;ve harvested from your garden. Keep
                    track of quantities, quality, and more!
                </CardDescription>
            </CardHeader>
            <CardContent>
                <HarvestForm />
            </CardContent>
        </Card>
    );
}
