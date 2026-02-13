import { generateText } from "ai";
import { visionModel } from "@/lib/ai/config";
import { IDENTIFY_SYSTEM_PROMPT } from "@/lib/ai/prompts";

export async function POST(req: Request) {
    const startTime = Date.now();
    console.log("[Identify API] POST request received");

    try {
        const { image } = await req.json();

        console.log("[Identify API] Image provided:", !!image);
        console.log("[Identify API] Image data length:", image?.length ?? 0);

        if (!image) {
            console.log("[Identify API] No image — returning 400");
            return new Response(
                JSON.stringify({ error: "No image provided" }),
                {
                    status: 400,
                    headers: { "Content-Type": "application/json" },
                }
            );
        }

        console.log(
            "[Identify API] Calling Gemini generateText with vision..."
        );
        const result = await generateText({
            model: visionModel,
            system: IDENTIFY_SYSTEM_PROMPT,
            messages: [
                {
                    role: "user",
                    content: [
                        { type: "text", text: "Identify this plant" },
                        { type: "image", image },
                    ],
                },
            ],
            maxRetries: 5,
        });

        const elapsed = Date.now() - startTime;
        console.log(
            `[Identify API] Success (${elapsed}ms), response length: ${result.text.length}`
        );

        return new Response(JSON.stringify({ text: result.text }), {
            status: 200,
            headers: { "Content-Type": "application/json" },
        });
    } catch (error) {
        const elapsed = Date.now() - startTime;
        console.error(`[Identify API] ERROR after ${elapsed}ms:`, error);

        if (error instanceof Error) {
            console.error("[Identify API] Error name:", error.name);
            console.error("[Identify API] Error message:", error.message);
            if ("cause" in error) {
                console.error("[Identify API] Error cause:", error.cause);
            }
        }

        const errorMessage =
            error instanceof Error ? error.message : String(error);
        const isRateLimited =
            errorMessage.includes("429") ||
            errorMessage.toLowerCase().includes("quota") ||
            errorMessage.toLowerCase().includes("resource_exhausted");

        if (isRateLimited) {
            console.error("[Identify API] Rate limited by Gemini");
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
            JSON.stringify({ error: "Failed to identify plant" }),
            {
                status: 500,
                headers: { "Content-Type": "application/json" },
            }
        );
    }
}
