import { PomodoroTab } from "@/components/study-zone/pomodoro-tab";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function PomodoroPage() {
    return (
        <div className="space-y-4">
            <div className="flex items-center gap-4">
                <Button variant="outline" size="icon" asChild>
                    <Link href="/study-zone">
                        <ArrowLeft className="h-4 w-4" />
                    </Link>
                </Button>
                <h1 className="text-2xl font-bold tracking-tight">Pomodoro Timer</h1>
            </div>
            <PomodoroTab />
        </div>
    );
}
