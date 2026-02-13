import { generateObject } from "ai";
import { structuredModel } from "@/lib/ai/config";
import { SCHEDULE_SYSTEM_PROMPT } from "@/lib/ai/prompts";
import { z } from "zod";

const scheduleSchema = z.object({
    tasks: z.array(
        z.object({
            title: z.string(),
            description: z.string(),
            priority: z.enum(["low", "medium", "high", "urgent"]),
            dueDate: z.string(),
            tags: z.array(z.string()),
        })
    ),
});

export async function POST(req: Request) {
    const startTime = Date.now();
    console.log("[Schedule API] POST request received");

    try {
        const { gardenContext } = await req.json();

        console.log(
            "[Schedule API] Garden context length:",
            gardenContext?.length ?? 0
        );

        if (!gardenContext) {
            console.log("[Schedule API] No garden context — returning 400");
            return new Response(
                JSON.stringify({ error: "No garden context provided" }),
                {
                    status: 400,
                    headers: { "Content-Type": "application/json" },
                }
            );
        }

        console.log("[Schedule API] Calling Gemini generateObject...");
        const result = await generateObject({
            model: structuredModel,
            schema: scheduleSchema,
            system: SCHEDULE_SYSTEM_PROMPT,
            prompt: gardenContext,
            maxRetries: 5,
        });

        const elapsed = Date.now() - startTime;
        console.log(
            `[Schedule API] Success (${elapsed}ms), tasks generated: ${result.object.tasks.length}`
        );

        return new Response(JSON.stringify(result.object), {
            status: 200,
            headers: { "Content-Type": "application/json" },
        });
    } catch (error) {
        const elapsed = Date.now() - startTime;
        console.error(`[Schedule API] ERROR after ${elapsed}ms:`, error);

        if (error instanceof Error) {
            console.error("[Schedule API] Error name:", error.name);
            console.error("[Schedule API] Error message:", error.message);
            if ("cause" in error) {
                console.error("[Schedule API] Error cause:", error.cause);
            }
        }

        const errorMessage =
            error instanceof Error ? error.message : String(error);
        const isRateLimited =
            errorMessage.includes("429") ||
            errorMessage.toLowerCase().includes("quota") ||
            errorMessage.toLowerCase().includes("resource_exhausted");

        if (isRateLimited) {
            console.error("[Schedule API] Rate limited by Gemini");
            return new Response(
                JSON.stringify({
                    error: "Rate limited. The free AI tier has limited requests per minute. Please wait a moment and try again.",
                }),
                {
                    status: 429,
                    headers: { "Content-Type": "application/json" },
                }
            );
        }

        return new Response(
            JSON.stringify({ error: "Failed to generate schedule" }),
            {
                status: 500,
                headers: { "Content-Type": "application/json" },
            }
        );
    }
}
