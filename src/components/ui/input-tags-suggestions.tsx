"use client";

import * as React from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { XIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Input, type InputProps } from "./input";

type InputTagsSuggestionsProps = Omit<InputProps, "value" | "onChange"> & {
    value: string[];
    onChange: React.Dispatch<React.SetStateAction<string[]>>;
    suggestions?: string[];
};

const InputTagsSuggestions = React.forwardRef<
    HTMLInputElement,
    InputTagsSuggestionsProps
>(({ className, value, onChange, suggestions = [], ...props }, ref) => {
    const [pendingDataPoint, setPendingDataPoint] = React.useState("");
    const [filteredSuggestions, setFilteredSuggestions] = React.useState<
        string[]
    >([]);
    const [showSuggestions, setShowSuggestions] = React.useState(false);
    const [activeIndex, setActiveIndex] = React.useState(-1);

    React.useEffect(() => {
        const input = pendingDataPoint.trim().toLowerCase();
        if (!input.length) {
            setFilteredSuggestions([]);
            closeSuggestionsHandler();
            return;
        }

        const filtered = suggestions
            .filter(
                (s) => s.toLowerCase().includes(input) && !value.includes(s)
            )
            .slice(0, 10); // limit

        setFilteredSuggestions(filtered);
        setShowSuggestions(filtered.length > 0);
        setActiveIndex(-1);
    }, [pendingDataPoint, suggestions, value]);

    const addPendingDataPoint = (input = pendingDataPoint) => {
        const trimmed = input.trim();
        if (trimmed === "") return;

        const newDataPoints = new Set([...value, trimmed]);
        onChange(Array.from(newDataPoints));
        setPendingDataPoint("");
        closeSuggestionsHandler();
    };

    const closeSuggestionsHandler = () => {
        setShowSuggestions(false);
        setActiveIndex(-1);
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (showSuggestions && filteredSuggestions.length > 0) {
            if (e.key === "ArrowDown") {
                e.preventDefault();
                setActiveIndex((prev) =>
                    Math.min(prev + 1, filteredSuggestions.length - 1)
                );
                return;
            } else if (e.key === "ArrowUp") {
                e.preventDefault();
                setActiveIndex((prev) => Math.max(prev - 1, 0));
                return;
            } else if (e.key === "Enter") {
                e.preventDefault();
                if (activeIndex >= 0) {
                    addPendingDataPoint(filteredSuggestions[activeIndex]);
                } else {
                    addPendingDataPoint();
                }
                return;
            } else if (e.key === "Escape") {
                e.preventDefault();
                setShowSuggestions(false);
                return;
            }
        }

        if (e.key === "," && pendingDataPoint.length > 0) {
            e.preventDefault();
            addPendingDataPoint();
        } else if (
            e.key === "Backspace" &&
            pendingDataPoint.length === 0 &&
            value.length > 0
        ) {
            e.preventDefault();
            onChange(value.slice(0, -1));
        }
    };

    return (
        <div className="relative w-full">
            <div
                className={cn(
                    "flex w-full flex-wrap gap-2 rounded-md px-3 text-sm disabled:cursor-not-allowed disabled:opacity-50",
                    className
                )}
            >
                {value.map((item) => (
                    <Badge key={item} variant="secondary">
                        {item}
                        <Button
                            variant="ghost"
                            size="icon"
                            className="ml-2 h-3 w-3"
                            onClick={() => {
                                onChange(value.filter((i) => i !== item));
                            }}
                        >
                            <XIcon className="w-3" />
                        </Button>
                    </Badge>
                ))}
                <Input
                    value={pendingDataPoint}
                    onChange={(e) => setPendingDataPoint(e.target.value)}
                    onKeyDown={handleKeyDown}
                    onFocus={() =>
                        setShowSuggestions(filteredSuggestions.length > 0)
                    }
                    autoComplete="off"
                    aria-autocomplete="list"
                    aria-expanded={showSuggestions}
                    aria-activedescendant={
                        activeIndex >= 0
                            ? `suggestion-${activeIndex}`
                            : undefined
                    }
                    aria-controls="suggestion-list"
                    ref={ref}
                    onBlur={closeSuggestionsHandler}
                    {...props}
                />
            </div>

            {showSuggestions && filteredSuggestions.length > 0 && (
                <ul className="bg-background absolute z-10 mt-1 w-full rounded-md border shadow-md dark:border-neutral-800">
                    {filteredSuggestions.map((s, i) => (
                        <li
                            key={s}
                            className={cn(
                                "hover:bg-muted cursor-pointer px-3 py-2 text-sm",
                                activeIndex === i && "bg-muted"
                            )}
                            onMouseDown={(e) => {
                                e.preventDefault(); // prevent blur
                                addPendingDataPoint(s);
                            }}
                        >
                            {s}
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
});

InputTagsSuggestions.displayName = "InputTagsSuggestions";

export { InputTagsSuggestions };
