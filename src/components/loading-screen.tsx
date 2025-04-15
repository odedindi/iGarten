"use client";

import type React from "react";

import { useEffect, useState, memo } from "react";
import { Sprout } from "lucide-react";
import { TextAnimate } from "@/components/ui/text-animate";
import { motion } from "motion/react";
import { cn } from "@/lib/utils";

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

    const duration =
        minDuration ?? generateRandom(MIN_RANDOM, MAX_RANDOM, RANDOM_STEP);
    useEffect(() => {
        // This ensures we show the loader for at least duration milliseconds
        // even if the content loads faster, to prevent flickering
        const timer = setTimeout(() => {
            setIsLoading(false);
        }, duration);

        return () => {
            clearTimeout(timer);
        };
    }, [duration]);

    if (isLoading) {
        return (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#f8f9fa] dark:bg-[#121212]">
                <div className="flex flex-col items-center">
                    {/* Plant growing animation */}
                    <div className="relative flex h-24 w-24 items-end justify-center">
                        {Array.from({ length: 3 }, (_, i) => (
                            <motion.div
                                initial={{
                                    opacity: 0,
                                    scale: 0,
                                }}
                                animate={{
                                    opacity: 0.9,
                                    scale: 1,
                                    transition: {
                                        delay: i * 0.2, // Stagger the animation by 0.5s for each sprout
                                        duration: i * 0.1 + 0.1, // Adjust the duration of the animation
                                        ease: "easeInOut", // Add easing for smoother animation
                                    },
                                }}
                                viewport={{ once: true }}
                                className={cn(
                                    `transition-color absolute animate-pulse duration-50 ease-linear`,
                                    i === 0 && "bottom-0",
                                    i === 1 && "bottom-10",
                                    i === 2 && "bottom-24"
                                )}
                                key={`sprout-${i}`}
                            >
                                <Sprout
                                    className={cn(
                                        "text-emerald-600 dark:text-emerald-400",
                                        i === 0 && "size-8",
                                        i === 1 && "size-12",
                                        i === 2 && "size-18"
                                    )}
                                />
                            </motion.div>
                        ))}
                    </div>

                    <TextAnimate
                        className="text-emerald-700 dark:text-emerald-300"
                        text="iGarden 3000..."
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
                </div>
            </div>
        );
    }

    return <>{children}</>;
});
