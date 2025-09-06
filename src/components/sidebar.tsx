"use client";

import { useState, useEffect, useCallback, memo } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ThemeSwitcher } from "@/components/theme-switcher";
import {
    LayoutDashboard,
    Sprout,
    Flower2,
    PlusCircle,
    Menu,
    Trash2,
} from "lucide-react";
import { Sheet, SheetContent } from "@/components/ui/sheet";

// Garden quotes
const gardenQuotes = [
    "Gardening: The art of killing plants with love.",
    "My garden is my most beautiful masterpiece. — Claude Monet",
    "To plant a garden is to believe in tomorrow. — Audrey Hepburn",
    "The glory of gardening: hands in the dirt, head in the sun, heart with nature.",
    "A garden is a grand teacher. — Gertrude Jekyll",
    "Weeds are flowers too, once you get to know them. — A.A. Milne",
    "Garden as though you will live forever. — William Kent",
];

const routes = [
    {
        href: "/",
        label: "Add Garden Entry",
        icon: <PlusCircle className="mr-2 size-5" />,
    },
    {
        href: "/admin",
        label: "Garden Tasks",
        icon: <Sprout className="mr-2 size-5" />,
    },
    {
        href: "/harvests",
        label: "Harvest Log",
        icon: <Flower2 className="mr-2 size-5" />,
    },
    {
        href: "/dashboard",
        label: "Garden Stats",
        icon: <LayoutDashboard className="mr-2 size-5" />,
    },
    {
        href: "/trash",
        label: "Garbage Bin",
        icon: <Trash2 className="mr-2 size-5" />,
    },
];

// Memoize the sidebar content to prevent unnecessary re-renders
const SidebarContent = memo(function SidebarContent({
    pathname,
    isMobile,
    onMobileItemClick,
}: {
    pathname: string;
    isMobile: boolean;
    onMobileItemClick?: () => void;
}) {
    // Get a random quote - memoize to prevent changing on re-renders
    const [randomQuote] = useState(
        () => gardenQuotes[Math.floor(Math.random() * gardenQuotes.length)]
    );
    const isActive = (route: string) => pathname === route;
    return (
        <>
            <div className="garden-header p-6">
                <h1 className="text-primary text-2xl font-bold">iGarten</h1>
                <p className="text-muted-foreground text-sm">
                    OIMBY: Only In My Back Yard!
                </p>
            </div>
            <div className="flex flex-col gap-2 p-4">
                {routes.map((route) => (
                    <Button
                        key={route.href}
                        variant={isActive(route.href) ? "default" : "ghost"}
                        className={cn(
                            "ease justify-start transition-all duration-200",
                            isActive(route.href)
                                ? "garden-button"
                                : "hover:bg-primary/10 hover:text-primary"
                        )}
                        asChild
                        onClick={isMobile ? onMobileItemClick : undefined}
                    >
                        <Link href={route.href}>
                            {route.icon}
                            {route.label}
                        </Link>
                    </Button>
                ))}
            </div>
            <div className="mt-auto p-4">
                <div className="garden-quote mb-4 text-sm">{randomQuote}</div>
                <div className="flex items-center justify-between">
                    <span className="text-muted-foreground text-xs">Theme</span>
                    <ThemeSwitcher />
                </div>
            </div>
        </>
    );
});

export const Sidebar = memo(function Sidebar() {
    const pathname = usePathname();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isMobile, setIsMobile] = useState(false);

    // Check if we're on mobile
    useEffect(() => {
        const checkIfMobile = () => {
            setIsMobile(window.innerWidth < 768);
        };

        // Initial check
        checkIfMobile();

        // Add event listener
        window.addEventListener("resize", checkIfMobile);

        // Cleanup
        return () => window.removeEventListener("resize", checkIfMobile);
    }, []);

    const closeMobileMenu = useCallback(() => {
        setIsMobileMenuOpen(false);
    }, []);

    // Mobile sidebar
    if (isMobile) {
        return (
            <>
                <Button
                    variant="ghost"
                    size="icon"
                    className="fixed top-4 left-4 z-40 md:hidden"
                    onClick={() => setIsMobileMenuOpen(true)}
                >
                    <Menu className="h-6 w-6" />
                </Button>

                <Sheet
                    open={isMobileMenuOpen}
                    onOpenChange={setIsMobileMenuOpen}
                >
                    <SheetContent side="left" className="w-64 border-r p-0">
                        <SidebarContent
                            pathname={pathname}
                            isMobile={true}
                            onMobileItemClick={closeMobileMenu}
                        />
                    </SheetContent>
                </Sheet>
            </>
        );
    }

    // Desktop sidebar
    return (
        <div className="bg-background hidden h-full w-64 flex-col border-r md:flex">
            <SidebarContent pathname={pathname} isMobile={false} />
        </div>
    );
});
