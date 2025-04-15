"use client";

import type React from "react";

import { createContext, useContext, useEffect, useState } from "react";
import { themeOptions, getThemeByName, type ThemeOption } from "@/lib/themes";

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

export function ThemeProvider({ children }: { children: React.ReactNode }) {
    const [theme, setThemeState] = useState<ThemeOption>(themeOptions[0]);
    const [mode, setModeState] = useState<ThemeMode>("light");
    const [loaded, setLoaded] = useState(false);
    const [isThemeLoaded, setIsThemeLoaded] = useState(false);

    useEffect(() => {
        // Load theme from localStorage
        const storedTheme = localStorage.getItem("garden_theme");
        if (storedTheme) {
            setThemeState(getThemeByName(storedTheme));
        }

        // Load mode from localStorage
        const storedMode = localStorage.getItem("garden_theme_mode");
        if (storedMode === "dark" || storedMode === "light") {
            setModeState(storedMode);
        }

        setLoaded(true);
    }, []);

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
        setThemeState(getThemeByName(themeName));
    };

    const setMode = (newMode: ThemeMode) => {
        setIsThemeLoaded(false);
        setModeState(newMode);
    };

    const toggleMode = () => {
        setIsThemeLoaded(false);
        setModeState((prev) => (prev === "light" ? "dark" : "light"));
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
