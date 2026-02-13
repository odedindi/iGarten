import { google } from "@ai-sdk/google";

const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;
console.log(
    `[AI Config] API key status: ${apiKey ? `set (${apiKey.slice(0, 8)}...${apiKey.slice(-4)})` : "MISSING"}`
);

export const chatModel = google("gemini-2.5-flash");
export const visionModel = google("gemini-2.5-flash");
export const structuredModel = google("gemini-2.5-flash");
