"use client";

import type React from "react";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useTaskStore, type Harvest } from "@/lib/task-store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { TipTapEditor } from "@/components/tiptap-editor";
import { DatePicker } from "./ui/date-picker";
import { InputSuggestions } from "./ui/input-suggestions";
import { sortStrings } from "@/lib/utils";

interface HarvestFormProps {
    initialData?: Harvest;
}

export function HarvestForm({ initialData }: HarvestFormProps) {
    const router = useRouter();
    const { addHarvest, updateHarvest, harvests } = useTaskStore();
    const [cropName, setCropName] = useState(initialData?.cropName || "");
    const [quantity, setQuantity] = useState(
        initialData?.quantity?.toString() || ""
    );
    const [unit, setUnit] = useState(initialData?.unit || "kg");
    const [dateHarvested, setDateHarvested] = useState<Date | undefined>(
        initialData?.dateHarvested
            ? new Date(initialData.dateHarvested)
            : undefined
    );
    const [notes, setNotes] = useState(initialData?.notes || "");
    const [location, setLocation] = useState(initialData?.location || "");
    const [quality, setQuality] = useState(initialData?.quality || "good");
    const [weather, setWeather] = useState(initialData?.weather || "");
    const { locationOptions, weatherOptions, cropOptions } = useMemo(() => {
        const locationOptions = new Set<string>();
        const weatherOptions = new Set<string>();
        const cropOptions = new Set<string>();
        for (const harvest of harvests) {
            if (harvest.location) {
                locationOptions.add(harvest.location);
            }
            if (harvest.weather) {
                weatherOptions.add(harvest.weather);
            }
            if (harvest.cropName) {
                cropOptions.add(harvest.cropName);
            }
        }
        return {
            locationOptions: [...locationOptions].sort(sortStrings),
            weatherOptions: [...weatherOptions].sort(sortStrings),
            cropOptions: [...cropOptions].sort(sortStrings),
        };
    }, [harvests]);
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        const formData = {
            cropName,
            quantity: Number.parseFloat(quantity),
            unit,
            dateHarvested: dateHarvested?.toISOString() || "",
            notes,
            location,
            quality,
            weather,
        } satisfies Omit<Harvest, "id">;

        if (initialData) {
            updateHarvest(initialData.id, formData);
        } else {
            addHarvest(formData);
        }

        router.push("/harvests");
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
                <Label htmlFor="cropName">Crop Name</Label>
                <InputSuggestions
                    id="cropName"
                    suggestions={cropOptions}
                    value={cropName}
                    onChange={setCropName}
                    placeholder="E.g., Tomatoes, Carrots, Basil"
                    required
                    className="garden-input"
                />
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="space-y-2">
                    <Label htmlFor="quantity">Quantity</Label>
                    <Input
                        id="quantity"
                        type="number"
                        step="0.01"
                        value={quantity}
                        onChange={(e) => setQuantity(e.target.value)}
                        placeholder="How much did you harvest?"
                        required
                        className="garden-input"
                    />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="unit">Unit</Label>
                    <Select value={unit} onValueChange={setUnit}>
                        <SelectTrigger id="unit" className="garden-input">
                            <SelectValue placeholder="Select unit" />
                        </SelectTrigger>
                        <SelectContent className="bg-popover">
                            <SelectItem value="kg">Kilograms (kg)</SelectItem>
                            <SelectItem value="g">Grams (g)</SelectItem>
                            <SelectItem value="lb">Pounds (lb)</SelectItem>
                            <SelectItem value="oz">Ounces (oz)</SelectItem>
                            <SelectItem value="count">
                                Count (individual items)
                            </SelectItem>
                            <SelectItem value="bunch">Bunches</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                <div className="space-y-2">
                    <Label htmlFor="dateHarvested">Harvest Date</Label>
                    <DatePicker
                        value={dateHarvested}
                        onChange={setDateHarvested}
                        presets="past"
                    />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="location">Garden Location</Label>
                    <InputSuggestions
                        id="location"
                        suggestions={locationOptions}
                        value={location}
                        onChange={setLocation}
                        placeholder="E.g., North bed, Greenhouse, Pot #3"
                        className="garden-input"
                    />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="quality">Quality</Label>
                    <Select
                        value={quality}
                        onValueChange={(value) =>
                            setQuality(value as typeof quality)
                        }
                    >
                        <SelectTrigger id="quality" className="garden-input">
                            <SelectValue placeholder="Select quality" />
                        </SelectTrigger>
                        <SelectContent className="bg-popover">
                            <SelectItem value="poor">
                                Poor (Barely edible)
                            </SelectItem>
                            <SelectItem value="average">
                                Average {"(It'll do)"}
                            </SelectItem>
                            <SelectItem value="good">Good (Tasty!)</SelectItem>
                            <SelectItem value="excellent">
                                Excellent (Blue ribbon worthy!)
                            </SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                <div className="space-y-2">
                    <Label htmlFor="weather">Weather</Label>
                    <InputSuggestions
                        id="weather"
                        suggestions={weatherOptions}
                        value={weather}
                        onChange={setWeather}
                        placeholder="E.g., Sunny, Rainy, Hot"
                        className="garden-input"
                    />
                </div>
            </div>

            <div className="space-y-2">
                <Label htmlFor="notes">Notes</Label>
                <TipTapEditor content={notes} onChange={setNotes} />
                <p className="text-muted-foreground text-xs italic">
                    Add any additional notes about this harvest, such as flavor,
                    issues, or plans for next season.
                </p>
            </div>

            <div className="flex justify-end space-x-2 pt-4">
                <Button
                    type="button"
                    variant="outline"
                    onClick={() => router.back()}
                >
                    Cancel
                </Button>
                <Button type="submit" className="garden-button">
                    {initialData ? "Update Harvest" : "Log Harvest"}
                </Button>
            </div>
        </form>
    );
}
