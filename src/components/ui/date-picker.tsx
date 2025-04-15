"use client";

import * as React from "react";
import { addDays, format } from "date-fns";
import { CalendarIcon } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

const defaultPresets: {
    past: DatePickerProps["presets"];
    future: DatePickerProps["presets"];
} = {
    past: [
        { label: "last week", value: -7 },
        { label: "Before 3 days", value: -3 },
        { label: "Yesterday", value: -1 },
        { label: "Today", value: 0 },
    ],
    future: [
        { label: "Today", value: 0 },
        { label: "Tomorrow", value: 1 },
        { label: "In 3 days", value: 3 },
        { label: "In a week", value: 7 },
    ],
};

interface DatePickerProps {
    date: Date | undefined;
    onChange: (date: Date | undefined) => void;
    presets?: {
        label: string;
        value: number;
    }[];
}

export function DatePicker({
    value,
    onChange,
    presets,
}: {
    value: Date | undefined;
    onChange: (value: Date | undefined) => void;
    presets?: "past" | "future";
}) {
    const presetOptions = !presets
        ? []
        : presets === "past"
          ? defaultPresets.past
          : defaultPresets.future;

    return (
        <Popover>
            <PopoverTrigger asChild>
                <Button
                    variant={"outline"}
                    className={cn(
                        "w-full justify-start text-left font-normal",
                        !value && "text-muted-foreground"
                    )}
                >
                    <CalendarIcon />
                    {value ? format(value, "PPP") : <span>Pick a date</span>}
                </Button>
            </PopoverTrigger>
            <PopoverContent
                align="start"
                className="flex w-auto flex-col space-y-2 p-2"
            >
                {presetOptions?.length ? (
                    <Select
                        onValueChange={(value) =>
                            onChange(addDays(new Date(), parseInt(value)))
                        }
                    >
                        <SelectTrigger className="w-full">
                            <SelectValue placeholder="Select" />
                        </SelectTrigger>
                        <SelectContent position="popper">
                            {presetOptions.map((preset) => (
                                <SelectItem
                                    key={preset.label}
                                    value={preset.value.toString()}
                                >
                                    {preset.label}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                ) : null}
                <div className="rounded-md border">
                    <Calendar
                        mode="single"
                        selected={value}
                        onSelect={onChange}
                    />
                </div>
            </PopoverContent>
        </Popover>
    );
}
