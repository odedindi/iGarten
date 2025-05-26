import {
    type ChangeEvent,
    forwardRef,
    type KeyboardEvent,
    useRef,
    useState,
} from "react";
import { Input, type InputProps } from "./input";

interface InputSuggestionsProps extends Omit<InputProps, "onChange"> {
    suggestions?: string[];
    onChange: (value: string) => void;
}

const InputSuggestions = forwardRef<HTMLInputElement, InputSuggestionsProps>(
    ({ suggestions = [], onChange, value, ...props }, ref) => {
        const [filtered, setFiltered] = useState<string[]>([]);
        const [showSuggestions, setShowSuggestions] = useState(false);
        const [activeIndex, setActiveIndex] = useState<number>(-1);
        const listRef = useRef<HTMLUListElement>(null);

        const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
            const inputValue = e.target.value;
            onChange(inputValue);
            if (inputValue) {
                const filteredSuggestions = suggestions.filter((s) =>
                    s.toLowerCase().includes(inputValue.toLowerCase())
                );
                setFiltered(filteredSuggestions);
                setShowSuggestions(filteredSuggestions.length > 0);
                setActiveIndex(-1);
            } else {
                setFiltered([]);
                closeSuggestionsHandler();
            }
        };

        const closeSuggestionsHandler = () => {
            setShowSuggestions(false);
            setActiveIndex(-1);
        };

        const handleSelect = (selected: string) => {
            onChange(selected);

            closeSuggestionsHandler();
        };

        const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
            if (!showSuggestions || !filtered.length) return;
            if (e.key === "ArrowDown") {
                e.preventDefault();

                setActiveIndex((prev) =>
                    Math.min(prev + 1, filtered.length - 1)
                );
            } else if (e.key === "ArrowUp") {
                e.preventDefault();

                setActiveIndex((prev) => Math.max(prev - 1, 0));
            } else if (e.key === "Enter") {
                e.preventDefault();
                if (activeIndex >= 0 && activeIndex < filtered.length) {
                    handleSelect(filtered[activeIndex]);
                }
            } else if (e.key === "Escape") {
                closeSuggestionsHandler();
            }
        };

        return (
            <div className="relative w-full">
                <Input
                    value={value}
                    onChange={handleChange}
                    onKeyDown={handleKeyDown}
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
                {showSuggestions && filtered.length && (
                    <ul
                        id="suggestion-list"
                        ref={listRef}
                        className="bg-background absolute z-10 mt-1 w-full rounded-md border shadow-md"
                    >
                        {filtered.map((s, index) => (
                            <li
                                key={index}
                                id={`suggestion-${index}`}
                                role="option"
                                aria-selected={activeIndex === index}
                                className={`hover:bg-muted cursor-pointer px-3 py-2 text-sm ${
                                    activeIndex === index ? "bg-muted" : ""
                                }`}
                                onMouseDown={() => handleSelect(s)} // prevent blur before click
                            >
                                {s}
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        );
    }
);

InputSuggestions.displayName = "InputSuggestions";

export { InputSuggestions };
