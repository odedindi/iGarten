"use client";

import { memo, type PropsWithChildren } from "react";
import { Sprout } from "lucide-react";

import { motion } from "motion/react";
import { cn } from "@/lib/utils";

export const SproutsLoader = memo(function SproutsLoader({
    children,
}: PropsWithChildren) {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#f8f9fa/2] backdrop-blur-sm dark:bg-[#121212/2]">
            <div className="flex flex-col items-center">
                {/* Sprouts growing animation */}
                <div className="relative flex h-24 w-24 items-end justify-center">
                    {Array.from({ length: 3 }, (_, i) => (
                        <motion.div
                            initial={{
                                opacity: 0,
                                scale: 0,
                            }}
                            animate={{
                                opacity: 1,
                                scale: 1,
                                transition: {
                                    delay: i * 0.75, // Stagger the animation by 0.5s for each sprout
                                    duration: 1.25, // Adjust the duration of the animation
                                    repeat: Infinity,
                                    repeatType: "mirror",
                                },
                            }}
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

                {children}
            </div>
        </div>
    );
});
