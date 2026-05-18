import { useCallback } from "react";
import { isAfter, subMinutes } from "date-fns";
import useSWR from "swr";

const STORAGE_KEY = "sprout-timestamp";
const timestampFetcher = () => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
        const storedTime = parseInt(stored, 10);
        const fiveMinutesAgo = subMinutes(new Date(), 5);

        return isAfter(storedTime, fiveMinutesAgo);
    }
    return false;
};
export function useRecentDateCheck() {
    const { data: isRecent = false, mutate: setIsRecent } = useSWR(
        "recent-date-check",
        timestampFetcher
    );
    const setTimestamp = useCallback(() => {
        localStorage.setItem(STORAGE_KEY, Date.now().toString());
        setIsRecent(true);
    }, [setIsRecent]);

    return [isRecent, setTimestamp] as const;
}
