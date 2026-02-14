import { streamText } from "ai";
import { DEFAULT_CHAT_MODEL, getChatModel } from "@/lib/ai/config";
import { CHAT_SYSTEM_PROMPT } from "@/lib/ai/prompts";
import { extractQuotaHeaders } from "@/lib/ai/rate-limits";

export async function POST(req: Request) {
    const startTime = Date.now();
    console.log("[Chat API] POST request received");

    try {
        const body = await req.json();
        const { messages, gardenContext, model } = body;
        const selectedModel =
            typeof model === "string" && model.length > 0
                ? model
                : DEFAULT_CHAT_MODEL;

        console.log("[Chat API] Messages count:", messages?.length ?? 0);
        console.log(
            "[Chat API] Garden context length:",
            gardenContext?.length ?? 0
        );
        console.log(
            "[Chat API] Last user message:",
            messages?.[messages.length - 1]?.content?.slice(0, 100)
        );
        console.log("[Chat API] Selected model:", selectedModel);

        const systemPrompt = `${CHAT_SYSTEM_PROMPT}\n\n${gardenContext}`;

        console.log("[Chat API] Calling Gemini streamText...");
        const result = streamText({
            model: getChatModel(selectedModel),
            system: systemPrompt,
            messages,
            maxRetries: 5,
        });

        const providerResponse = await Promise.resolve(result.response).catch(
            () => null
        );
        const quotaHeaders = extractQuotaHeaders(providerResponse?.headers);

        if (Object.keys(quotaHeaders).length > 0) {
            console.log("[Chat API] Quota headers (success):", quotaHeaders);
        } else {
            console.log(
                "[Chat API] No quota headers returned on success response (provider omitted telemetry)"
            );
        }

        console.log(`[Chat API] Stream started (${Date.now() - startTime}ms)`);
        return result.toTextStreamResponse({
            headers: {
                "x-ig-model": selectedModel,
                ...quotaHeaders,
            },
        });
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
            const errorCause = error instanceof Error ? error.cause : null;
            const responseHeaders =
                typeof errorCause === "object" &&
                errorCause &&
                "responseHeaders" in errorCause
                    ? ((errorCause as { responseHeaders?: Headers })
                          .responseHeaders ?? null)
                    : null;
            const rateLimitHeaders = extractQuotaHeaders(responseHeaders);

            if (Object.keys(rateLimitHeaders).length > 0) {
                console.error(
                    "[Chat API] Quota headers (429 response):",
                    rateLimitHeaders
                );
            } else {
                console.error(
                    "[Chat API] No quota headers available on 429 response"
                );
            }

            return new Response(
                JSON.stringify({
                    error: "Rate limited. The free AI tier has limited requests per minute. Please wait a moment and try again.",
                }),
                {
                    status: 429,
                    headers: {
                        "Content-Type": "application/json",
                        ...rateLimitHeaders,
                    },
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
