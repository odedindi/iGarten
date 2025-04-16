import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Inter } from "next/font/google";
import { Sidebar } from "@/components/sidebar";
import { LoadingScreen } from "@/components/loading-screen";
import { Providers } from "./providers";

const inter = Inter({ subsets: ["latin"] });

const geistSans = Geist({
    variable: "--font-geist-sans",
    subsets: ["latin"],
});

const geistMono = Geist_Mono({
    variable: "--font-geist-mono",
    subsets: ["latin"],
});

export const viewport: Viewport = {
    width: "device-width",
    initialScale: 1,
    viewportFit: "auto",
    colorScheme: "dark",
    themeColor: [
        { media: "(prefers-color-scheme: dark)", color: "#1F1F1F" },
        { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    ],
};
export const metadata: Metadata = {
    title: "iGarten - Digital Garden Management",
    description:
        "The opposite of NIMBY, more like OIMBY - Only In My Back Yard! The digital place to aggregate stuff about your garden.",
    keywords: [
        "digital garden",
        "garden management",
        "plant care",
        "garden journal",
        "garden planner",
        "garden design",
        "garden community",
        "gardening tips",
        "sustainable gardening",
    ],
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en" suppressHydrationWarning>
            <head>
                <meta
                    name="viewport"
                    content="width=device-width, initial-scale=1"
                />
            </head>
            <body
                className={`${geistSans.variable} ${geistMono.variable} ${inter.className} antialiased`}
            >
                <Providers>
                    <LoadingScreen>
                        <div className="flex h-screen">
                            <Sidebar />
                            <main className="flex-1 overflow-auto px-4 pt-16 md:px-6">
                                {children}
                            </main>
                        </div>
                    </LoadingScreen>
                </Providers>
            </body>
        </html>
    );
}
