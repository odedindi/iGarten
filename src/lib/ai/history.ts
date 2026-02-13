export function loadLocalStorage<T>(key: string, fallback: T): T {
    if (typeof window === "undefined") {
        return fallback;
    }

    try {
        const rawValue = localStorage.getItem(key);
        if (!rawValue) {
            return fallback;
        }

        return JSON.parse(rawValue) as T;
    } catch {
        return fallback;
    }
}

export function saveLocalStorage<T>(key: string, value: T) {
    if (typeof window === "undefined") {
        return;
    }

    try {
        localStorage.setItem(key, JSON.stringify(value));
    } catch {
        // no-op
    }
}

export function prependWithLimit<T>(
    currentItems: T[],
    newItem: T,
    maxItems: number
) {
    return [newItem, ...currentItems].slice(0, maxItems);
}