import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import type { AiQuotaState } from "@/lib/ai/rate-limits";
import { Flower2, Sprout, Trees } from "lucide-react";

interface AiQuotaGardenProps {
    quota: AiQuotaState | null;
    className?: string;
}

function computeUsagePercent(remaining: number | null, limit: number | null) {
    if (remaining === null || limit === null || limit <= 0) {
        return null;
    }

    const used = limit - remaining;
    return Math.max(0, Math.min(100, Math.round((used / limit) * 100)));
}

function getGardenMood(quota: AiQuotaState) {
    if (quota.isRateLimited) {
        return {
            icon: Flower2,
            title: "The greenhouse is taking a rest",
            subtitle:
                "Rate limit hit — let the soil recover before the next request.",
        };
    }

    if (quota.rpmRemaining !== null && quota.rpmRemaining <= 3) {
        return {
            icon: Trees,
            title: "Nutrients are running low",
            subtitle: "Only a few minute-requests remain.",
        };
    }

    return {
        icon: Sprout,
        title: "Garden is thriving",
        subtitle: "You still have healthy AI quota available.",
    };
}

export function AiQuotaGarden({ quota, className }: AiQuotaGardenProps) {
    if (!quota) {
        return null;
    }

    const rpmUsage = computeUsagePercent(quota.rpmRemaining, quota.rpmLimit);
    const rpdUsage = computeUsagePercent(quota.rpdRemaining, quota.rpdLimit);
    const mood = getGardenMood(quota);
    const MoodIcon = mood.icon;

    return (
        <Card className={className ?? "bg-muted/40 border-primary/20 p-3"}>
            <div className="mb-2 flex items-start gap-2">
                <MoodIcon className="text-primary mt-0.5 h-4 w-4" />
                <div>
                    <p className="text-sm font-medium">{mood.title}</p>
                    <p className="text-muted-foreground text-xs">
                        {mood.subtitle}
                    </p>
                </div>
            </div>

            <div className="space-y-3">
                {(quota.rpmLimit !== null || quota.rpmRemaining !== null) && (
                    <div className="space-y-1">
                        <div className="flex items-center justify-between text-xs">
                            <span className="text-muted-foreground">
                                Requests per minute
                            </span>
                            <span>
                                {quota.rpmRemaining ?? "?"}/
                                {quota.rpmLimit ?? "?"}
                            </span>
                        </div>
                        {rpmUsage !== null && <Progress value={rpmUsage} />}
                    </div>
                )}

                {(quota.rpdLimit !== null || quota.rpdRemaining !== null) && (
                    <div className="space-y-1">
                        <div className="flex items-center justify-between text-xs">
                            <span className="text-muted-foreground">
                                Requests per day
                            </span>
                            <span>
                                {quota.rpdRemaining ?? "?"}/
                                {quota.rpdLimit ?? "?"}
                            </span>
                        </div>
                        {rpdUsage !== null && <Progress value={rpdUsage} />}
                    </div>
                )}

                {quota.resetSeconds !== null && (
                    <p className="text-muted-foreground text-xs">
                        Next minute reset in ~{quota.resetSeconds}s
                    </p>
                )}
            </div>
        </Card>
    );
}
