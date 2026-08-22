import Link from "next/link";
import { Flower2 } from "lucide-react";
import { HarvestTable } from "@/components/harvest-table";
import { ColumnSettings } from "@/components/column-settings";
import { Button } from "@/components/ui/button";

export default function HarvestsPage() {
    return (
        <div className="container mx-auto mb-6 max-w-6xl overflow-auto p-6 sm:p-3">
            <div className="garden-header rounded-lg p-6 sm:mx-6">
                <h1 className="text-primary relative z-10 text-3xl font-bold">
                    Harvest Log
                </h1>
                <p className="text-muted-foreground relative z-10">
                    Track all your garden harvests and see the fruits (and
                    vegetables) of your labor!
                </p>
            </div>
            <div className="my-6 flex flex-col justify-end gap-2 sm:flex-row">
                <Button asChild className="garden-button">
                    <Link href="/harvest/new">
                        <Flower2 className="mr-2 size-4" />
                        Log Harvest
                    </Link>
                </Button>
                <ColumnSettings type="harvests" />
            </div>
            <HarvestTable />
        </div>
    );
}
