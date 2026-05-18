import { NextResponse } from "next/server";
import { CHAT_MODEL, IDENTIFY_MODEL, SCHEDULE_MODEL } from "@/lib/ai/config";

type GoogleModel = {
    name: string;
    displayName?: string;
    description?: string;
    supportedGenerationMethods?: string[];
    supportedInputModalities?: string[];
    inputTokenLimit?: number;
    outputTokenLimit?: number;
};

type GoogleModelsResponse = {
    models?: GoogleModel[];
};

function normalizeModelId(name: string) {
    return name.replace(/^models\//, "");
}

function supportsChat(model: GoogleModel) {
    return (
        model.supportedGenerationMethods?.includes("generateContent") ||
        model.supportedGenerationMethods?.includes("streamGenerateContent")
    );
}

function isGenerallyRelevant(modelId: string) {
    const id = modelId.toLowerCase();

    const isGeminiOrGemma = id.includes("gemini") || id.includes("gemma");
    if (!isGeminiOrGemma) {
        return false;
    }

    const irrelevantTokens = ["embedding", "imagen", "veo", "aqa"];

    return !irrelevantTokens.some((token) => id.includes(token));
}

function isFreeTierFriendly(modelId: string) {
    const id = modelId.toLowerCase();

    const likelyPaidOnlyTokens = ["ultra"];
    return !likelyPaidOnlyTokens.some((token) => id.includes(token));
}

function supportsFeature(
    model: GoogleModel,
    feature: "chat" | "schedule" | "identify"
) {
    const modalities = model.supportedInputModalities?.map((m) =>
        m.toUpperCase()
    );

    if (!modalities || modalities.length === 0) {
        return true;
    }

    if (feature === "identify") {
        return modalities.includes("TEXT") && modalities.includes("IMAGE");
    }

    return modalities.includes("TEXT");
}

function fallbackModels(feature: "chat" | "schedule" | "identify") {
    const modelId =
        feature === "identify"
            ? IDENTIFY_MODEL
            : feature === "schedule"
              ? SCHEDULE_MODEL
              : CHAT_MODEL;
    return [
        {
            id: modelId,
            displayName: modelId,
            inputTokenLimit: null,
            outputTokenLimit: null,
        },
    ];
}

function getDefaultModelForFeature(feature: "chat" | "schedule" | "identify") {
    if (feature === "identify") return IDENTIFY_MODEL;
    if (feature === "schedule") return SCHEDULE_MODEL;
    return CHAT_MODEL;
}

export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);
    const featureParam = searchParams.get("feature");
    const tierParam = searchParams.get("tier");
    const viewParam = searchParams.get("view");
    const feature: "chat" | "schedule" | "identify" =
        featureParam === "schedule" || featureParam === "identify"
            ? featureParam
            : "chat";
    const tier = tierParam === "all" ? "all" : "free";
    const view = viewParam === "raw" ? "raw" : "filtered";

    const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;

    if (!apiKey) {
        return NextResponse.json(
            {
                models: fallbackModels(feature),
                defaultModel: getDefaultModelForFeature(feature),
                source: "fallback",
                warning: "Missing GOOGLE_GENERATIVE_AI_API_KEY.",
                filters: { feature, tier, view },
            },
            { status: 200 }
        );
    }

    try {
        const response = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`,
            {
                method: "GET",
                headers: { "Content-Type": "application/json" },
                cache: "no-store",
            }
        );

        if (!response.ok) {
            throw new Error(`Google models request failed: ${response.status}`);
        }

        const data = (await response.json()) as GoogleModelsResponse;
        const rawModels = (data.models ?? []).map((model) => ({
            id: normalizeModelId(model.name),
            displayName: model.displayName ?? normalizeModelId(model.name),
            inputTokenLimit: model.inputTokenLimit ?? null,
            outputTokenLimit: model.outputTokenLimit ?? null,
        }));

        const chatCapableModels = (data.models ?? []).filter((model) =>
            supportsChat(model)
        );
        const generallyRelevantModels = chatCapableModels.filter((model) =>
            isGenerallyRelevant(normalizeModelId(model.name))
        );
        const featureRelevantModels = generallyRelevantModels.filter((model) =>
            supportsFeature(model, feature)
        );
        const tierRelevantModels = featureRelevantModels.filter((model) =>
            tier === "all"
                ? true
                : isFreeTierFriendly(normalizeModelId(model.name))
        );

        const filteredModels = tierRelevantModels
            .map((model) => ({
                id: normalizeModelId(model.name),
                displayName: model.displayName ?? normalizeModelId(model.name),
                inputTokenLimit: model.inputTokenLimit ?? null,
                outputTokenLimit: model.outputTokenLimit ?? null,
            }))
            .sort((a, b) => a.id.localeCompare(b.id));

        const models =
            view === "raw"
                ? [...rawModels].sort((a, b) => a.id.localeCompare(b.id))
                : filteredModels;

        if (models.length === 0) {
            return NextResponse.json({
                models: fallbackModels(feature),
                defaultModel: getDefaultModelForFeature(feature),
                source: "fallback",
                warning: "No chat-capable models returned by Google API.",
                filters: { feature, tier, view },
                stats: {
                    raw: rawModels.length,
                    chatCapable: chatCapableModels.length,
                    relevant: generallyRelevantModels.length,
                    feature: featureRelevantModels.length,
                    tier: tierRelevantModels.length,
                    returned: 0,
                },
            });
        }

        const defaultModel =
            models.find(
                (model) => model.id === getDefaultModelForFeature(feature)
            )?.id ?? models[0].id;

        return NextResponse.json({
            models,
            defaultModel,
            source: "google",
            filters: { feature, tier, view },
            stats: {
                raw: rawModels.length,
                chatCapable: chatCapableModels.length,
                relevant: generallyRelevantModels.length,
                feature: featureRelevantModels.length,
                tier: tierRelevantModels.length,
                returned: models.length,
            },
        });
    } catch (error) {
        console.error("[Chat Models API] Failed to load model list", error);

        return NextResponse.json(
            {
                models: fallbackModels(feature),
                defaultModel: getDefaultModelForFeature(feature),
                source: "fallback",
                warning: "Failed to query Google models API.",
                filters: { feature, tier, view },
            },
            { status: 200 }
        );
    }
}
