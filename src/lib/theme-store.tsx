"use client";

import type React from "react";

import { createContext, useContext, useEffect, useState } from "react";
import { themeOptions, getThemeByName, type ThemeOption } from "@/lib/themes";
import useSWR from "swr";

type ThemeMode = "light" | "dark";

interface ThemeContextType {
    theme: ThemeOption;
    mode: ThemeMode;
    setTheme: (theme: string) => void;
    setMode: (mode: ThemeMode) => void;
    toggleMode: () => void;
    isThemeLoaded: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const storedThemeFetcher = () => {
    const storedTheme = localStorage.getItem("garden_theme");
    if (storedTheme) return getThemeByName(storedTheme);

    return themeOptions[0];
};

const storedModeFetcher = () => {
    const storedMode = localStorage.getItem("garden_theme_mode");
    if (storedMode === "dark" || storedMode === "light") return storedMode;

    return "light" satisfies ThemeMode;
};

export function ThemeProvider({ children }: { children: React.ReactNode }) {
    // const [theme, setThemeState] = useState<ThemeOption>(themeOptions[0]);
    // const [mode, setModeState] = useState<ThemeMode>("light");
    // const [loaded, setLoaded] = useState(false);
    const [isThemeLoaded, setIsThemeLoaded] = useState(false);

    const { data: theme = themeOptions[0], ...themeQuery } = useSWR(
        `garden_theme`,
        storedThemeFetcher
    );

    const { data: mode = "light", ...modeQuery } = useSWR(
        `garden_theme_mode`,
        storedModeFetcher
    );

    const loaded = !modeQuery.isLoading && !themeQuery.isLoading;

    useEffect(() => {
        if (!loaded) return;

        // Apply theme CSS variables
        const root = document.documentElement;
        const colors = theme.colors[mode];

        // Apply each color directly to CSS variables
        Object.entries(colors).forEach(([key, value]) => {
            // Convert camelCase to kebab-case for CSS variables
            const cssKey = key.replace(/([A-Z])/g, "-$1").toLowerCase();
            root.style.setProperty(`--${cssKey}`, value);
        });

        // Apply font
        root.style.setProperty("--font-family", theme.font);

        // Save theme to localStorage
        localStorage.setItem("garden_theme", theme.name);
        localStorage.setItem("garden_theme_mode", mode);

        // Set data-theme attribute for tailwind
        document.documentElement.setAttribute("data-theme", theme.name);
        document.documentElement.setAttribute("data-mode", mode);

        // Set class for dark mode
        if (mode === "dark") {
            document.documentElement.classList.add("dark");
        } else {
            document.documentElement.classList.remove("dark");
        }

        // Mark theme as loaded after a short delay to ensure CSS transitions complete
        setTimeout(() => {
            setIsThemeLoaded(true);
        }, 300);
    }, [theme, mode, loaded]);

    const setTheme = (themeName: string) => {
        setIsThemeLoaded(false);
        themeQuery.mutate(getThemeByName(themeName));
    };

    const setMode = (newMode: ThemeMode) => {
        setIsThemeLoaded(false);
        modeQuery.mutate(newMode);
    };

    const toggleMode = () => {
        setIsThemeLoaded(false);
        modeQuery.mutate((prev) => (prev === "light" ? "dark" : "light"));
    };

    return (
        <ThemeContext.Provider
            value={{
                theme,
                mode,
                setTheme,
                setMode,
                toggleMode,
                isThemeLoaded,
            }}
        >
            {children}
        </ThemeContext.Provider>
    );
}

export function useTheme() {
    const context = useContext(ThemeContext);
    if (context === undefined) {
        throw new Error("useTheme must be used within a ThemeProvider");
    }
    return context;
}
