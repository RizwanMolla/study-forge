'use client';

import { useState, useEffect } from 'react';
import {
  Bar,
  BarChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip as RechartsTooltip,
} from 'recharts';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  getComprehensiveAnalytics,
  ComprehensiveAnalyticsData,
} from '@/lib/actions/analytics.actions';
import { StudyHeatmap } from './analytics/study-heatmap';
import { useToast } from '@/hooks/use-toast';
import {
  Notebook,
  Timer,
  CheckCircle,
  Brain,
  TrendingUp,
  Clock,
  Sparkles,
  BarChart3,
} from 'lucide-react';
import { Skeleton } from '../ui/skeleton';

export function AnalyticsTab() {
  const [data, setData] = useState<ComprehensiveAnalyticsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    async function fetchData() {
      try {
        const analyticsData = await getComprehensiveAnalytics();
        setData(analyticsData);
      } catch (error) {
        toast({
          title: 'Error',
          description: 'Could not fetch study analytics data.',
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    }
    fetchData();
  }, [toast]);

  if (isLoading || !data) {
    return (
      <div className="space-y-6 pt-2">
        <div className="grid gap-4 md:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i}>
              <CardHeader className="pb-2">
                <Skeleton className="h-4 w-24" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-16" />
                <Skeleton className="h-3 w-32 mt-2" />
              </CardContent>
            </Card>
          ))}
        </div>
        <Skeleton className="h-[220px] w-full rounded-2xl" />
        <Skeleton className="h-[320px] w-full rounded-2xl" />
      </div>
    );
  }

  const focusHours =
    Math.round((data.userTotals.totalFocusMinutes / 60) * 10) / 10;

  return (
    <div className="space-y-8 pt-2">
      {/* 4 Core Quantitative Metrics */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="border-primary/20 bg-card/60 backdrop-blur shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Total Focus Time
            </CardTitle>
            <div className="p-2 rounded-lg bg-primary/10 text-primary">
              <Clock className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-black text-foreground">
              {focusHours > 0
                ? `${focusHours} hrs`
                : `${data.userTotals.totalFocusMinutes} mins`}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {data.userTotals.pomodoroSessions} Pomodoro sessions logged
            </p>
          </CardContent>
        </Card>

        <Card className="border-indigo-500/20 bg-card/60 backdrop-blur shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Flashcards Reviewed
            </CardTitle>
            <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-500">
              <Brain className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-black text-foreground">
              {data.userTotals.totalCardsReviewed}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Active recall repetitions
            </p>
          </CardContent>
        </Card>

        <Card className="border-blue-500/20 bg-card/60 backdrop-blur shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Study Notes
            </CardTitle>
            <div className="p-2 rounded-lg bg-blue-500/10 text-blue-500">
              <Notebook className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-black text-foreground">
              {data.userTotals.notesCreated}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Knowledge base documents
            </p>
          </CardContent>
        </Card>

        <Card className="border-emerald-500/20 bg-card/60 backdrop-blur shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Tasks Finished
            </CardTitle>
            <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-500">
              <CheckCircle className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-black text-foreground">
              {data.userTotals.todosCompleted}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              To-do items completed
            </p>
          </CardContent>
        </Card>
      </div>

      {/* GitHub-Style 365-Day Study Activity Heatmap */}
      <StudyHeatmap
        heatmapDays={data.heatmapDays}
        currentStreak={data.streaks.currentStreak}
        longestStreak={data.streaks.longestStreak}
        totalActiveDays={data.streaks.totalActiveDays}
      />

      {/* Weekly Velocity Chart */}
      <div className="grid gap-6 md:grid-cols-3">
        <Card className="md:col-span-2 border-primary/20 bg-card/60 backdrop-blur shadow-sm">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base font-bold flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-primary" />
                  Past 7 Days Focus Velocity
                </CardTitle>
                <CardDescription className="text-xs mt-0.5">
                  Daily focus time in minutes.
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-[260px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={data.weeklyTrend}
                  margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                >
                  <XAxis
                    dataKey="day"
                    stroke="#888888"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    stroke="#888888"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                    allowDecimals={false}
                    unit="m"
                  />
                  <RechartsTooltip
                    cursor={{ fill: 'hsl(var(--muted)/0.3)' }}
                    contentStyle={{
                      background: 'hsl(var(--background))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: 'var(--radius)',
                      fontSize: '12px',
                    }}
                    formatter={(val: any) => [`${val} mins`, 'Focus Time']}
                  />
                  <Bar
                    dataKey="focusMinutes"
                    name="Focus (minutes)"
                    fill="hsl(var(--primary))"
                    radius={[6, 6, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Learning Distribution Summary */}
        <Card className="border-primary/20 bg-card/60 backdrop-blur shadow-sm flex flex-col justify-between">
          <CardHeader>
            <CardTitle className="text-base font-bold flex items-center gap-2">
              <BarChart3 className="h-4 w-4 text-primary" />
              Activity Mix
            </CardTitle>
            <CardDescription className="text-xs">
              Breakdown of learning actions.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3 text-xs">
              <div>
                <div className="flex justify-between mb-1 text-muted-foreground font-medium">
                  <span className="flex items-center gap-1.5">
                    <Timer className="h-3.5 w-3.5 text-primary" /> Focus Sessions
                  </span>
                  <span className="font-bold text-foreground">
                    {data.userTotals.pomodoroSessions}
                  </span>
                </div>
                <div className="h-2 rounded-full bg-muted overflow-hidden">
                  <div
                    className="h-full bg-primary rounded-full transition-all"
                    style={{
                      width: `${Math.min(
                        100,
                        (data.userTotals.pomodoroSessions /
                          Math.max(1, data.userTotals.pomodoroSessions + data.userTotals.totalCardsReviewed + data.userTotals.todosCompleted)) *
                          100
                      )}%`,
                    }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between mb-1 text-muted-foreground font-medium">
                  <span className="flex items-center gap-1.5">
                    <Brain className="h-3.5 w-3.5 text-indigo-500" /> Card Reviews
                  </span>
                  <span className="font-bold text-foreground">
                    {data.userTotals.totalCardsReviewed}
                  </span>
                </div>
                <div className="h-2 rounded-full bg-muted overflow-hidden">
                  <div
                    className="h-full bg-indigo-500 rounded-full transition-all"
                    style={{
                      width: `${Math.min(
                        100,
                        (data.userTotals.totalCardsReviewed /
                          Math.max(1, data.userTotals.pomodoroSessions + data.userTotals.totalCardsReviewed + data.userTotals.todosCompleted)) *
                          100
                      )}%`,
                    }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between mb-1 text-muted-foreground font-medium">
                  <span className="flex items-center gap-1.5">
                    <CheckCircle className="h-3.5 w-3.5 text-emerald-500" /> Tasks Finished
                  </span>
                  <span className="font-bold text-foreground">
                    {data.userTotals.todosCompleted}
                  </span>
                </div>
                <div className="h-2 rounded-full bg-muted overflow-hidden">
                  <div
                    className="h-full bg-emerald-500 rounded-full transition-all"
                    style={{
                      width: `${Math.min(
                        100,
                        (data.userTotals.todosCompleted /
                          Math.max(1, data.userTotals.pomodoroSessions + data.userTotals.totalCardsReviewed + data.userTotals.todosCompleted)) *
                          100
                      )}%`,
                    }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between mb-1 text-muted-foreground font-medium">
                  <span className="flex items-center gap-1.5">
                    <Notebook className="h-3.5 w-3.5 text-blue-500" /> Notes Written
                  </span>
                  <span className="font-bold text-foreground">
                    {data.userTotals.notesCreated}
                  </span>
                </div>
                <div className="h-2 rounded-full bg-muted overflow-hidden">
                  <div
                    className="h-full bg-blue-500 rounded-full transition-all"
                    style={{
                      width: `${Math.min(100, data.userTotals.notesCreated * 10)}%`,
                    }}
                  />
                </div>
              </div>
            </div>
          </CardContent>

          <div className="p-4 border-t bg-muted/20 rounded-b-xl text-[11px] text-muted-foreground flex items-center justify-between">
            <span className="flex items-center gap-1">
              <Sparkles className="h-3 w-3 text-primary" />
              Real-time synchronization
            </span>
            <span>StudyForge 2.0</span>
          </div>
        </Card>
      </div>
    </div>
  );
}
