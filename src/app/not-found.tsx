import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
    return (
        <div className="flex min-h-screen flex-col items-center justify-center p-4">
            <h1 className="mb-4 text-4xl font-bold">404 - Not Found</h1>
            <p className="text-muted-foreground mb-6">
                The page you are looking for doesn&apos;t exist or has been
                moved.
            </p>
            <Button asChild>
                <Link href="/">Return to Dashboard</Link>
            </Button>
        </div>
    );
}
