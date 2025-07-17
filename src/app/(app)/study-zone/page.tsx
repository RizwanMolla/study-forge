import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { ArrowRight, BarChart, BrainCircuit, CheckSquare, Notebook, Timer } from "lucide-react";
import Link from "next/link";

const features = [
    { 
        href: '/study-zone/notes', 
        label: 'My Notes', 
        description: 'Create, edit, and organize your study notes.', 
        icon: Notebook,
        color: 'text-blue-500',
        bgColor: 'bg-blue-500/10'
    },
    { 
        href: '/study-zone/todo', 
        label: 'To-Do Lists', 
        description: 'Manage daily tasks and weekly routines.', 
        icon: CheckSquare,
        color: 'text-green-500',
        bgColor: 'bg-green-500/10'
    },
    { 
        href: '/study-zone/pomodoro', 
        label: 'Pomodoro Timer', 
        description: 'Boost focus with timed study sessions.', 
        icon: Timer,
        color: 'text-red-500',
        bgColor: 'bg-red-500/10'
    },
    { 
        href: '/study-zone/summarizer', 
        label: 'AI Summarizer', 
        description: 'Get key insights from documents and text.', 
        icon: BrainCircuit,
        color: 'text-purple-500',
        bgColor: 'bg-purple-500/10'
    },
    { 
        href: '/study-zone/analytics', 
        label: 'My Analytics', 
        description: 'Visualize your progress and stay motivated.', 
        icon: BarChart,
        color: 'text-yellow-500',
        bgColor: 'bg-yellow-500/10'
    },
];


export default function StudyZonePage() {
    return (
       <div className="space-y-6">
            <div>
                <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Welcome to your Study Zone</h1>
                <p className="text-muted-foreground mt-1">Select a tool to get started with your study session.</p>
            </div>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {features.map((feature) => (
                    <Link href={feature.href} key={feature.href}>
                        <Card className="group flex flex-col h-full hover:border-primary transition-all hover:scale-[1.02] hover:shadow-lg">
                             <CardHeader className="flex-row items-center gap-4">
                                <div className={cn("p-3 rounded-lg", feature.bgColor)}>
                                    <feature.icon className={cn("h-6 w-6", feature.color)} />
                                </div>
                                <div>
                                    <CardTitle>{feature.label}</CardTitle>
                                    <CardDescription className="mt-1">{feature.description}</CardDescription>
                                </div>
                            </CardHeader>
                            <CardContent className="flex-grow flex items-end justify-end">
                                <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
                            </CardContent>
                        </Card>
                    </Link>
                ))}
            </div>
       </div>
    );
}
