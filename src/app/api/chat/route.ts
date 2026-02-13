import { streamText } from "ai";
import { chatModel } from "@/lib/ai/config";
import { CHAT_SYSTEM_PROMPT } from "@/lib/ai/prompts";

export async function POST(req: Request) {
    const startTime = Date.now();
    console.log("[Chat API] POST request received");

    try {
        const body = await req.json();
        const { messages, gardenContext } = body;

        console.log("[Chat API] Messages count:", messages?.length ?? 0);
        console.log(
            "[Chat API] Garden context length:",
            gardenContext?.length ?? 0
        );
        console.log(
            "[Chat API] Last user message:",
            messages?.[messages.length - 1]?.content?.slice(0, 100)
        );

        const systemPrompt = `${CHAT_SYSTEM_PROMPT}\n\n${gardenContext}`;

        console.log("[Chat API] Calling Gemini streamText...");
        const result = streamText({
            model: chatModel,
            system: systemPrompt,
            messages,
            maxRetries: 5,
        });

        console.log(`[Chat API] Stream started (${Date.now() - startTime}ms)`);
        return result.toTextStreamResponse();
    } catch (error) {
        const elapsed = Date.now() - startTime;
        console.error(`[Chat API] ERROR after ${elapsed}ms:`, error);

        if (error instanceof Error) {
            console.error("[Chat API] Error name:", error.name);
            console.error("[Chat API] Error message:", error.message);
            console.error("[Chat API] Error stack:", error.stack);
            if ("cause" in error) {
                console.error("[Chat API] Error cause:", error.cause);
            }
        }

        const errorMessage =
            error instanceof Error ? error.message : String(error);
        const isRateLimited =
            errorMessage.includes("429") ||
            errorMessage.toLowerCase().includes("quota") ||
            errorMessage.toLowerCase().includes("resource_exhausted");

        if (isRateLimited) {
            console.error("[Chat API] Rate limited by Gemini");
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
            JSON.stringify({ error: "Failed to process chat request" }),
            {
                status: 500,
                headers: { "Content-Type": "application/json" },
            }
        );
    }
}
