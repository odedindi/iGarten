import { HarvestTable } from "@/components/harvest-table";
import { ColumnSettings } from "@/components/column-settings";

export default function HarvestsPage() {
    return (
        <div className="space-y-6">
            <div className="garden-header rounded-lg p-6">
                <h1 className="text-primary relative z-10 text-3xl font-bold">
                    Harvest Log
                </h1>
                <p className="text-muted-foreground relative z-10">
                    Track all your garden harvests and see the fruits (and
                    vegetables) of your labor!
                </p>
            </div>
            <div className="flex justify-end">
                <ColumnSettings type="harvests" />
            </div>
            <HarvestTable />
        </div>
    );
}
