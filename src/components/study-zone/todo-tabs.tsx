'use client';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DailyTodoList } from './daily-todo-list';
import { WeeklyTodoPlanner } from './weekly-todo-planner';
import type { ITodo } from '@/lib/models/todo.model';
import { Button } from '../ui/button';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

interface TodoTabsProps {
    initialTodos: ITodo[];
    initialWeeklyTodos: ITodo[];
}

export function TodoTabs({ initialTodos, initialWeeklyTodos }: TodoTabsProps) {

    return (
        <div className="space-y-4">
            <div className="flex items-center gap-4">
                <Button variant="outline" size="icon" asChild>
                    <Link href="/study-zone">
                        <ArrowLeft className="h-4 w-4" />
                    </Link>
                </Button>
                <h1 className="text-2xl font-bold tracking-tight">To-Do Lists</h1>
            </div>
            <Tabs defaultValue="daily">
                <TabsList className="grid w-full grid-cols-2 md:w-[400px]">
                    <TabsTrigger value="daily">Daily To-Do</TabsTrigger>
                    <TabsTrigger value="weekly">Weekly Planner</TabsTrigger>
                </TabsList>
                <TabsContent value="daily">
                   <DailyTodoList initialTodos={initialTodos} />
                </TabsContent>
                <TabsContent value="weekly">
                   <WeeklyTodoPlanner initialWeeklyTodos={initialWeeklyTodos} />
                </TabsContent>
            </Tabs>
        </div>
    );
}
