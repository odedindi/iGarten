import { streamText } from "ai";
import { CHAT_MODEL, getChatModel } from "@/lib/ai/config";
import { CHAT_SYSTEM_PROMPT } from "@/lib/ai/prompts";
import { extractQuotaHeaders } from "@/lib/ai/rate-limits";

function extractRetrySeconds(errorMessage: string) {
    const retryMatch = errorMessage.match(/retry in\s+([\d.]+)s/i);
    if (!retryMatch) {
        return null;
    }

    const seconds = Number(retryMatch[1]);
    return Number.isFinite(seconds) ? Math.ceil(seconds) : null;
}

function buildQuotaExceededMessage(retrySeconds: number | null) {
    if (retrySeconds !== null) {
        return `Quota exhausted for the selected model. Please retry in about ${retrySeconds}s or switch to another model.`;
    }

    return "Quota exhausted for the selected model. Please wait and try again or switch to another model.";
}

export async function POST(req: Request) {
    const startTime = Date.now();
    let selectedModel = CHAT_MODEL;

    try {
        const body = await req.json();
        const { messages, gardenContext } = body;
        selectedModel = CHAT_MODEL;

        const systemPrompt = `${CHAT_SYSTEM_PROMPT}\n\n${gardenContext}`;
        const result = streamText({
            model: getChatModel(selectedModel),
            system: systemPrompt,
            messages,
            maxRetries: 1,
            onError: ({ error }) => {
                const message =
                    error instanceof Error ? error.message : String(error);
                if (
                    message.includes("429") ||
                    message.toLowerCase().includes("quota") ||
                    message.toLowerCase().includes("resource_exhausted")
                ) {
                    console.warn(
                        `[Chat API] Stream quota/rate-limit issue on model ${selectedModel}`
                    );
                    return;
                }

                console.error("[Chat API] Stream error:", message);
            },
        });

        const providerResponse = await Promise.resolve(result.response).catch(
            () => null
        );
        const quotaHeaders = extractQuotaHeaders(providerResponse?.headers);

        console.log(
            `[Chat API] Stream started model=${selectedModel} in ${Date.now() - startTime}ms`
        );
        return result.toTextStreamResponse({
            headers: {
                "x-ig-model": selectedModel,
                ...quotaHeaders,
            },
        });
    } catch (error) {
        const elapsed = Date.now() - startTime;

        const errorMessage =
            error instanceof Error ? error.message : String(error);
        console.error(
            `[Chat API] ERROR model=${selectedModel} after ${elapsed}ms: ${errorMessage}`
        );

        const isRateLimited =
            errorMessage.includes("429") ||
            errorMessage.toLowerCase().includes("quota") ||
            errorMessage.toLowerCase().includes("resource_exhausted");

        if (isRateLimited) {
            const errorCause = error instanceof Error ? error.cause : null;
            const responseHeaders =
                typeof errorCause === "object" &&
                errorCause &&
                "responseHeaders" in errorCause
                    ? ((errorCause as { responseHeaders?: Headers })
                          .responseHeaders ?? null)
                    : null;
            const rateLimitHeaders = extractQuotaHeaders(responseHeaders);
            const retrySeconds = extractRetrySeconds(errorMessage);

            return new Response(
                JSON.stringify({
                    error: buildQuotaExceededMessage(retrySeconds),
                }),
                {
                    status: 429,
                    headers: {
                        "Content-Type": "application/json",
                        ...(retrySeconds !== null
                            ? { "Retry-After": String(retrySeconds) }
                            : {}),
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
