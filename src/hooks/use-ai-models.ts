"use client";

import useSWR from "swr";

export interface AiModelOption {
    id: string;
    displayName: string;
    inputTokenLimit?: number | null;
    outputTokenLimit?: number | null;
}

interface AiModelsResponse {
    models?: AiModelOption[];
    defaultModel?: string;
}

const fetcher = async (url: string) => {
    const response = await fetch(url, { cache: "no-store" });
    if (!response.ok) {
        throw new Error("Failed to fetch AI models");
    }

    return (await response.json()) as AiModelsResponse;
};

export function useAiModels(feature: "chat" | "schedule" | "identify") {
    const { data, error, isLoading } = useSWR(
        `/api/chat/models?feature=${feature}&tier=free`,
        fetcher,
        {
            revalidateOnFocus: false,
            dedupingInterval: 60_000,
        }
    );

    return {
        models: data?.models ?? [],
        defaultModel: data?.defaultModel ?? "",
        isLoading,
        error,
    };
}
