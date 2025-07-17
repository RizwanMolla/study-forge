'use client';

import { useState, useEffect } from 'react';
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip, Legend } from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { getAnalytics } from '@/lib/actions/analytics.actions';
import { useToast } from '@/hooks/use-toast';
import { Notebook, Timer, CheckCircle } from 'lucide-react';
import { Skeleton } from '../ui/skeleton';

interface AnalyticsData {
  pomodoroSessions: number;
  notesCreated: number;
  todosCompleted: number;
}

export function AnalyticsTab() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    async function fetchData() {
      try {
        const analyticsData = await getAnalytics();
        setData(analyticsData);
      } catch (error) {
        toast({ title: 'Error', description: 'Could not fetch analytics data.', variant: 'destructive' });
      } finally {
        setIsLoading(false);
      }
    }
    fetchData();
  }, [toast]);

  const chartData = [
    { name: 'Pomodoros', total: data?.pomodoroSessions || 0 },
    { name: 'Notes', total: data?.notesCreated || 0 },
    { name: 'To-Dos', total: data?.todosCompleted || 0 },
  ];

  return (
    <div className="space-y-4 pt-4">
        <Card>
        <CardHeader>
            <CardTitle>Overview</CardTitle>
            <CardDescription>Track your study habits and progress.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-8">
            <div className="grid gap-4 md:grid-cols-3">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Pomodoro Sessions</CardTitle>
                        <Timer className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        {isLoading ? <Skeleton className="h-8 w-16" /> : <div className="text-2xl font-bold">{data?.pomodoroSessions}</div>}
                        <p className="text-xs text-muted-foreground">Total focus sessions completed.</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Notes Created</CardTitle>
                        <Notebook className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        {isLoading ? <Skeleton className="h-8 w-16" /> : <div className="text-2xl font-bold">{data?.notesCreated}</div>}
                        <p className="text-xs text-muted-foreground">Total notes in your collection.</p>
                    </CardContent>
                </Card>
                 <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">To-Dos Completed</CardTitle>
                        <CheckCircle className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        {isLoading ? <Skeleton className="h-8 w-16" /> : <div className="text-2xl font-bold">{data?.todosCompleted}</div>}
                        <p className="text-xs text-muted-foreground">Total tasks completed.</p>
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Activity Overview</CardTitle>
                </CardHeader>
                <CardContent>
                    {isLoading ? (
                        <Skeleton className="h-[350px] w-full" />
                    ) : (
                        <ResponsiveContainer width="100%" height={350}>
                            <BarChart data={chartData}>
                                <XAxis dataKey="name" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                                <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} allowDecimals={false} />
                                <Tooltip
                                    contentStyle={{
                                        background: "hsl(var(--background))",
                                        border: "1px solid hsl(var(--border))",
                                        borderRadius: "var(--radius)",
                                    }}
                                />
                                <Bar dataKey="total" name="Total" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    )}
                </CardContent>
            </Card>
        </CardContent>
        </Card>
    </div>
  );
}
