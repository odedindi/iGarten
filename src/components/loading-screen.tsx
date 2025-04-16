"use client";

import type React from "react";

import { useEffect, useState, memo, useRef } from "react";
import { TextAnimate } from "@/components/ui/text-animate";
import { SproutsLoader } from "./sprout-loader";

const MIN_RANDOM = 1250;
const MAX_RANDOM = 2500;
const RANDOM_STEP = 50;

function generateRandom(min: number, max: number, step: number) {
    const randomNum = min + Math.random() * (max - min);
    return Math.round(randomNum / step) * step;
}

interface LoadingScreenProps {
    children: React.ReactNode;
    minDuration?: number;
}

export const LoadingScreen = memo(function LoadingScreen({
    children,
    minDuration,
}: LoadingScreenProps) {
    const [isLoading, setIsLoading] = useState(true);
    const didShowOnce = useRef(false);
    const duration =
        minDuration ?? generateRandom(MIN_RANDOM, MAX_RANDOM, RANDOM_STEP);
    useEffect(() => {
        // This ensures we show the loader for at least duration milliseconds
        // even if the content loads faster, to prevent flickering
        const timer = setTimeout(() => {
            setIsLoading(false);
            didShowOnce.current = true;
        }, duration);

        return () => {
            clearTimeout(timer);
        };
    }, [duration]);

    if (isLoading && !didShowOnce.current) {
        return (
            <SproutsLoader>
                <TextAnimate
                    className="text-emerald-700 dark:text-emerald-300"
                    text="iGarten..."
                    type="fadeInUp"
                    role="heading"
                />

                <TextAnimate
                    className="text-sm text-gray-500 dark:text-gray-400"
                    text="Planting seeds of productivity"
                    type="popIn"
                    role="heading"
                    delay={0.5}
                />
            </SproutsLoader>
        );
    }

    return <>{children}</>;
});
