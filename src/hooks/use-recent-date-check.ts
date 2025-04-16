import { useState, useEffect } from "react";

const FIVE_MINUTES = 5 * 60 * 1000; // in milliseconds
const STORAGE_KEY = "sprout-timestamp";

export function useRecentDateCheck(setNew = false) {
    const [isRecent, setIsRecent] = useState(false);

    useEffect(() => {
        const now = Date.now();

        if (setNew) {
            localStorage.setItem(STORAGE_KEY, now.toString());
            setIsRecent(true);
        } else {
            const stored = localStorage.getItem(STORAGE_KEY);
            if (stored) {
                const storedTime = parseInt(stored, 10);
                if (now - storedTime < FIVE_MINUTES) {
                    setIsRecent(true);
                }
            }
        }
    }, [setNew]);

    return [isRecent, setIsRecent] as const;
}
