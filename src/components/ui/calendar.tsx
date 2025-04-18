"use client";

import * as React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { DayPicker } from "react-day-picker";
import "react-day-picker/style.css";

import { cn } from "@/lib/utils";

function Calendar({
    className,
    classNames,
    showOutsideDays = true,
    ...props
}: React.ComponentProps<typeof DayPicker>) {
    return (
        <DayPicker
            animate
            showOutsideDays={showOutsideDays}
            className={cn("p-3", className)}
            classNames={{
                button_next: "cursor-pointer p-1",
                button_previous: "cursor-pointer p-1",
                months: "flex flex-col sm:flex-row gap-2",
                month: "flex flex-col gap-4",
                month_caption: "flex justify-center pt-1",
                caption_label: "text-sm font-medium",
                month_grid: "w-full border-collapse space-x-1",
                weekdays: "flex",
                weekday:
                    "text-muted-foreground rounded-md w-8 font-normal text-[0.8rem]",
                week: "flex w-full mt-2",
                day: cn(
                    "relative p-0 text-center text-sm focus-within:relative focus-within:z-20 [&:has([aria-selected])]:bg-accent [&:has([aria-selected].day-range-end)]:rounded-r-md",
                    props.mode === "range"
                        ? "[&:has(>.day-range-end)]:rounded-r-md [&:has(>.day-range-start)]:rounded-l-md first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md"
                        : "[&:has([aria-selected])]:rounded-md"
                ),
                day_button: cn(
                    "size-8 p-0 font-normal aria-selected:opacity-100"
                ),
                range_start:
                    "day-range-start aria-selected:bg-primary aria-selected:text-primary-foreground",
                range_end:
                    "day-range-end aria-selected:bg-primary aria-selected:text-primary-foreground",
                selected:
                    "bg-primary !text-primary-foreground hover:bg-primary !hover:text-primary-foreground focus:bg-primary !focus:text-primary-foreground",
                today: "bg-accent text-accent-foreground",
                outside:
                    "day-outside text-muted-foreground aria-selected:text-muted-foreground",
                disabled: "text-muted-foreground opacity-50",
                range_middle:
                    "aria-selected:bg-accent aria-selected:text-accent-foreground",
                hidden: "invisible",
                ...classNames,
            }}
            components={{
                Chevron: ({ className, ...props }) =>
                    props.orientation === "left" ? (
                        <ChevronLeft
                            className={cn("size-4", className)}
                            {...props}
                        />
                    ) : (
                        <ChevronRight
                            className={cn("size-4", className)}
                            {...props}
                        />
                    ),
            }}
            {...props}
        />
    );
}

export { Calendar };
