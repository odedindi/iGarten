import { google } from "@ai-sdk/google";

const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;
console.log(
    `[AI Config] API key status: ${apiKey ? `set (${apiKey.slice(0, 8)}...${apiKey.slice(-4)})` : "MISSING"}`
);

// Best model per feature — hardcoded for safety and cost-efficiency.
// gemini-2.5-flash: fast, cheap, supports vision, structured output, and chat.
export const CHAT_MODEL = "gemini-2.5-flash";
export const IDENTIFY_MODEL = "gemini-2.5-flash";
export const SCHEDULE_MODEL = "gemini-2.5-flash";

/** @deprecated Use per-feature constants (CHAT_MODEL, IDENTIFY_MODEL, SCHEDULE_MODEL) */
export const DEFAULT_CHAT_MODEL = CHAT_MODEL;

export function getChatModel(modelId: string = CHAT_MODEL) {
    return google(modelId);
}

export const chatModel = getChatModel(CHAT_MODEL);
export const visionModel = google(IDENTIFY_MODEL);
export const structuredModel = google(SCHEDULE_MODEL);
