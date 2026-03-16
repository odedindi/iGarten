export interface AiQuotaState {
    rpmLimit: number | null;
    rpmRemaining: number | null;
    rpdLimit: number | null;
    rpdRemaining: number | null;
    resetSeconds: number | null;
    isRateLimited: boolean;
}

const RPM_LIMIT_KEYS = [
    "x-ratelimit-limit-requests-minute",
    "x-ratelimit-limit-requests",
    "x-ratelimit-limit-rpm",
    "x-ratelimit-limit-minute",
    "x-ratelimit-limit",
];

const RPM_REMAINING_KEYS = [
    "x-ratelimit-remaining-requests-minute",
    "x-ratelimit-remaining-requests",
    "x-ratelimit-remaining-rpm",
    "x-ratelimit-remaining-minute",
    "x-ratelimit-remaining",
];

const RPD_LIMIT_KEYS = [
    "x-ratelimit-limit-requests-day",
    "x-ratelimit-limit-day",
    "x-ratelimit-limit-rpd",
];

const RPD_REMAINING_KEYS = [
    "x-ratelimit-remaining-requests-day",
    "x-ratelimit-remaining-day",
    "x-ratelimit-remaining-rpd",
];

const RESET_KEYS = [
    "x-ratelimit-reset-requests-minute",
    "x-ratelimit-reset-requests",
    "x-ratelimit-reset",
    "retry-after",
];

const FORWARDED_HEADER_KEYS = [
    ...RPM_LIMIT_KEYS,
    ...RPM_REMAINING_KEYS,
    ...RPD_LIMIT_KEYS,
    ...RPD_REMAINING_KEYS,
    ...RESET_KEYS,
];

function parseNumber(value: string | null): number | null {
    if (!value) {
        return null;
    }

    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
}

function getHeaderValue(headers: Headers, keys: string[]) {
    for (const key of keys) {
        const value = headers.get(key);
        if (value !== null) {
            return value;
        }
    }
    return null;
}

function getHeaderValueFromRecord(
    headers: Record<string, string>,
    keys: string[]
) {
    for (const key of keys) {
        const direct = headers[key];
        if (direct !== undefined) {
            return direct;
        }

        const lower = headers[key.toLowerCase()];
        if (lower !== undefined) {
            return lower;
        }
    }
    return null;
}

export function parseAiQuotaHeaders(
    headers: Headers,
    options?: { isRateLimited?: boolean }
): AiQuotaState | null {
    const rpmLimit = parseNumber(getHeaderValue(headers, RPM_LIMIT_KEYS));
    const rpmRemaining = parseNumber(
        getHeaderValue(headers, RPM_REMAINING_KEYS)
    );
    const rpdLimit = parseNumber(getHeaderValue(headers, RPD_LIMIT_KEYS));
    const rpdRemaining = parseNumber(
        getHeaderValue(headers, RPD_REMAINING_KEYS)
    );
    const resetSeconds = parseNumber(getHeaderValue(headers, RESET_KEYS));
    const isRateLimited =
        options?.isRateLimited === true ||
        (rpmRemaining !== null && rpmRemaining <= 0);

    if (
        rpmLimit === null &&
        rpmRemaining === null &&
        rpdLimit === null &&
        rpdRemaining === null &&
        resetSeconds === null &&
        !isRateLimited
    ) {
        return null;
    }

    return {
        rpmLimit,
        rpmRemaining,
        rpdLimit,
        rpdRemaining,
        resetSeconds,
        isRateLimited,
    };
}

export function extractQuotaHeaders(
    headers?: Headers | Record<string, string> | null
) {
    const forwarded: Record<string, string> = {};
    if (!headers) {
        return forwarded;
    }

    if (headers instanceof Headers) {
        for (const key of FORWARDED_HEADER_KEYS) {
            const value = headers.get(key);
            if (value !== null) {
                forwarded[key] = value;
            }
        }
        return forwarded;
    }

    for (const key of FORWARDED_HEADER_KEYS) {
        const value = getHeaderValueFromRecord(headers, [key]);
        if (value !== null) {
            forwarded[key] = value;
        }
    }

    return forwarded;
}
