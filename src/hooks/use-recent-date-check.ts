import { useState, useEffect, useCallback } from "react";
import { isAfter, subMinutes } from "date-fns";

const STORAGE_KEY = "sprout-timestamp";

export function useRecentDateCheck() {
    const [isRecent, setIsRecent] = useState(false);

    useEffect(() => {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
            const storedTime = parseInt(stored, 10);
            const fiveMinutesAgo = subMinutes(new Date(), 5);

            setIsRecent(isAfter(storedTime, fiveMinutesAgo));
        }
    }, []);

    const setTimestamp = useCallback(() => {
        localStorage.setItem(STORAGE_KEY, Date.now().toString());
        setIsRecent(true);
    }, []);

    return [isRecent, setTimestamp] as const;
}
