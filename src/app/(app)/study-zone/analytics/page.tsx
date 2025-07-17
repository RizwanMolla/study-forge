import { AnalyticsTab } from "@/components/study-zone/analytics-tab";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function AnalyticsPage() {
    return (
        <div className="space-y-4">
            <div className="flex items-center gap-4">
                <Button variant="outline" size="icon" asChild>
                    <Link href="/study-zone">
                        <ArrowLeft className="h-4 w-4" />
                    </Link>
                </Button>
                <h1 className="text-2xl font-bold tracking-tight">My Analytics</h1>
            </div>
            <AnalyticsTab />
        </div>
    );
}
