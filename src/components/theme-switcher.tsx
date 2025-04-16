"use client";

import { useState } from "react";
import { useTheme } from "@/lib/theme-store";
import { themeOptions } from "@/lib/themes";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
    DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Palette, Moon, Sun } from "lucide-react";
import { cn } from "@/lib/utils";

export function ThemeSwitcher() {
    const { theme, mode, setTheme, toggleMode } = useTheme();
    const [open, setOpen] = useState(false);

    return (
        <DropdownMenu open={open} onOpenChange={setOpen}>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="rounded-full">
                    <Palette className="h-5 w-5" />
                    <span className="sr-only">Toggle theme</span>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="bg-popover">
                <div className="flex items-center justify-between px-2 py-1.5">
                    <span className="text-xs font-medium">Theme</span>
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={(e) => {
                            e.preventDefault();
                            toggleMode();
                        }}
                        className="h-8 w-8 rounded-full"
                    >
                        {mode === "light" ? (
                            <Moon className="h-4 w-4" />
                        ) : (
                            <Sun className="h-4 w-4" />
                        )}
                        <span className="sr-only">Toggle mode</span>
                    </Button>
                </div>
                <DropdownMenuSeparator />
                {themeOptions.map((option) => (
                    <DropdownMenuItem
                        key={option.name}
                        className={cn(
                            "cursor-pointer",
                            theme.name === option.name &&
                                "bg-accent text-accent-foreground"
                        )}
                        onClick={() => {
                            setTheme(option.name);
                            setOpen(false);
                        }}
                    >
                        <div className="flex items-center gap-2">
                            <div
                                className="h-4 w-4 rounded-full"
                                style={{
                                    backgroundColor:
                                        option.colors[mode].primary,
                                }}
                            ></div>
                            <span>{option.label}</span>
                        </div>
                    </DropdownMenuItem>
                ))}
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
