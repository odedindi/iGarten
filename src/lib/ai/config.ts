import { google } from "@ai-sdk/google";

const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;
console.log(
    `[AI Config] API key status: ${apiKey ? `set (${apiKey.slice(0, 8)}...${apiKey.slice(-4)})` : "MISSING"}`
);

type GoogleGenerativeAIModelId = Parameters<typeof google>[0];

export const DEFAULT_CHAT_MODEL = "gemini-2.5-flash";

export const FALLBACK_CHAT_MODELS = [
    "gemini-2.5-flash",
    "gemini-2.5-flash-lite",
    "gemini-3.0-flash",
    "gemini-3.0-flash-lite",
] satisfies GoogleGenerativeAIModelId[];

export function getChatModel(modelId: string = DEFAULT_CHAT_MODEL) {
    return google(modelId);
}

export const chatModel = getChatModel(DEFAULT_CHAT_MODEL);
export const visionModel = google(DEFAULT_CHAT_MODEL);
export const structuredModel = google(DEFAULT_CHAT_MODEL);
