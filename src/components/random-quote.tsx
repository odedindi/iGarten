"use client";

import { useMemo } from "react";

const gardenQuotes = [
    "Gardening: The art of killing plants with love.",
    "My garden is my most beautiful masterpiece. — Claude Monet",
    "To plant a garden is to believe in tomorrow. — Audrey Hepburn",
    "The glory of gardening: hands in the dirt, head in the sun, heart with nature.",
    "A garden is a grand teacher. — Gertrude Jekyll",
    "Weeds are flowers too, once you get to know them. — A.A. Milne",
    "Garden as though you will live forever. — William Kent",
];

export default function RandomQuote() {
    // Get a random quote
    const randomQuote = useMemo(
        () => gardenQuotes[Math.floor(Math.random() * gardenQuotes.length)],
        []
    );

    return <div className="garden-quote mb-4">{randomQuote}</div>;
}
