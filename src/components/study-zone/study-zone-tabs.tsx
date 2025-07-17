'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Notebook, CheckSquare, BarChart, Timer, BrainCircuit } from 'lucide-react';

const tabs = [
    { href: '/study-zone/notes', label: 'Notes', icon: Notebook },
    { href: '/study-zone/todo', label: 'To-Do', icon: CheckSquare },
    { href: '/study-zone/pomodoro', label: 'Pomodoro', icon: Timer },
    { href: '/study-zone/summarizer', label: 'AI Summarizer', icon: BrainCircuit },
    { href: '/study-zone/analytics', label: 'Analytics', icon: BarChart },
];

export function StudyZoneTabs() {
  const pathname = usePathname();

  return (
    <div className="border-b">
        <div className="flex items-center space-x-2 overflow-x-auto pb-2">
        {tabs.map((tab) => {
            const isActive = pathname.startsWith(tab.href);
            return (
            <Link
                key={tab.href}
                href={tab.href}
                className={cn(
                'flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors',
                isActive
                    ? 'bg-primary text-primary-foreground shadow-sm'
                    : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground'
                )}
            >
                <tab.icon className="h-4 w-4" />
                {tab.label}
            </Link>
            );
        })}
        </div>
    </div>
  );
}
