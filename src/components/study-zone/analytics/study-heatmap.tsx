'use client';

import { useMemo } from 'react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { HeatmapDayData } from '@/lib/actions/analytics.actions';
import { Flame, Trophy, Calendar, Sparkles, Timer, Brain, CheckCircle2, Notebook } from 'lucide-react';

interface StudyHeatmapProps {
  heatmapDays: Record<string, HeatmapDayData>;
  currentStreak: number;
  longestStreak: number;
  totalActiveDays: number;
}

const MONTH_NAMES = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
];

export function StudyHeatmap({
  heatmapDays,
  currentStreak,
  longestStreak,
  totalActiveDays,
}: StudyHeatmapProps) {
  // Generate the 53 weeks grid ending on today
  const { weeks, monthHeaders } = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const dayOfWeek = today.getDay(); // 0 = Sun, 6 = Sat
    const totalDays = 52 * 7 + (dayOfWeek + 1);

    const startDate = new Date(today);
    startDate.setDate(today.getDate() - (totalDays - 1));

    const weeksArray: {
      date: Date;
      dateStr: string;
      data?: HeatmapDayData;
    }[][] = [];

    let currentWeek: {
      date: Date;
      dateStr: string;
      data?: HeatmapDayData;
    }[] = [];

    const months: { label: string; weekIndex: number }[] = [];
    let lastMonth = -1;

    for (let i = 0; i < totalDays; i++) {
      const d = new Date(startDate);
      d.setDate(startDate.getDate() + i);

      const dStr = d.toISOString().split('T')[0];
      const dayData = heatmapDays[dStr];

      currentWeek.push({
        date: d,
        dateStr: dStr,
        data: dayData,
      });

      if (currentWeek.length === 7 || i === totalDays - 1) {
        const weekIndex = weeksArray.length;
        // Check month label
        const monthOfFirstDayInWeek = currentWeek[0].date.getMonth();
        if (monthOfFirstDayInWeek !== lastMonth) {
          months.push({
            label: MONTH_NAMES[monthOfFirstDayInWeek],
            weekIndex,
          });
          lastMonth = monthOfFirstDayInWeek;
        }

        weeksArray.push(currentWeek);
        currentWeek = [];
      }
    }

    return { weeks: weeksArray, monthHeaders: months };
  }, [heatmapDays]);

  const getCellColorClass = (level: number = 0) => {
    switch (level) {
      case 1:
        return 'bg-emerald-500/30 border-emerald-500/40 hover:bg-emerald-500/50';
      case 2:
        return 'bg-emerald-500/55 border-emerald-500/70 hover:bg-emerald-500/75';
      case 3:
        return 'bg-emerald-500/80 border-emerald-400 hover:bg-emerald-500';
      case 4:
        return 'bg-emerald-400 border-emerald-300 shadow-sm shadow-emerald-500/50 hover:bg-emerald-300';
      default:
        return 'bg-muted/40 border-border/40 hover:border-foreground/30';
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Streak & Velocity Banner */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="flex items-center gap-4 p-4 rounded-xl border bg-card/60 backdrop-blur shadow-sm">
          <div className="p-3 rounded-xl bg-amber-500/10 text-amber-500">
            <Flame className="h-6 w-6 animate-pulse" />
          </div>
          <div>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Current Streak
            </p>
            <div className="flex items-baseline gap-1.5 mt-0.5">
              <span className="text-2xl font-black text-foreground">
                {currentStreak}
              </span>
              <span className="text-xs text-muted-foreground font-medium">
                {currentStreak === 1 ? 'day' : 'consecutive days'}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4 p-4 rounded-xl border bg-card/60 backdrop-blur shadow-sm">
          <div className="p-3 rounded-xl bg-purple-500/10 text-purple-500">
            <Trophy className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Longest Streak
            </p>
            <div className="flex items-baseline gap-1.5 mt-0.5">
              <span className="text-2xl font-black text-foreground">
                {longestStreak}
              </span>
              <span className="text-xs text-muted-foreground font-medium">
                days all-time
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4 p-4 rounded-xl border bg-card/60 backdrop-blur shadow-sm">
          <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-500">
            <Calendar className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Active Study Days
            </p>
            <div className="flex items-baseline gap-1.5 mt-0.5">
              <span className="text-2xl font-black text-foreground">
                {totalActiveDays}
              </span>
              <span className="text-xs text-muted-foreground font-medium">
                days in past year
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Heatmap Grid Container */}
      <div className="p-6 rounded-2xl border bg-card/60 backdrop-blur shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold tracking-tight">
              365-Day Study Activity Heatmap
            </h3>
            <p className="text-xs text-muted-foreground">
              Daily productivity logged across focus sessions, flashcard reviews, tasks, and notes.
            </p>
          </div>

          <div className="hidden sm:flex items-center gap-1.5 text-xs text-muted-foreground">
            <span>Less</span>
            <div className="h-2.5 w-2.5 rounded-sm bg-muted/40 border border-border/40" />
            <div className="h-2.5 w-2.5 rounded-sm bg-emerald-500/30 border border-emerald-500/40" />
            <div className="h-2.5 w-2.5 rounded-sm bg-emerald-500/55 border border-emerald-500/70" />
            <div className="h-2.5 w-2.5 rounded-sm bg-emerald-500/80 border border-emerald-400" />
            <div className="h-2.5 w-2.5 rounded-sm bg-emerald-400 border border-emerald-300 shadow-sm" />
            <span>More</span>
          </div>
        </div>

        {/* Scrollable Heatmap Body */}
        <div className="overflow-x-auto pb-2">
          <div className="inline-block min-w-[760px]">
            {/* Month labels */}
            <div className="flex mb-1.5 pl-8 text-[11px] font-medium text-muted-foreground select-none">
              {weeks.map((week, wIdx) => {
                const header = monthHeaders.find((m) => m.weekIndex === wIdx);
                return (
                  <div
                    key={`month-${wIdx}`}
                    className="w-[14px] mr-[3px] text-left shrink-0"
                  >
                    {header ? header.label : ''}
                  </div>
                );
              })}
            </div>

            {/* Grid rows with day labels */}
            <TooltipProvider delayDuration={100}>
              <div className="flex items-start">
                {/* Day of Week Labels (Mon, Wed, Fri) */}
                <div className="grid grid-rows-7 gap-[3px] pr-2 text-[10px] text-muted-foreground select-none shrink-0 h-[116px]">
                  <span className="h-[14px] leading-[14px]"></span>
                  <span className="h-[14px] leading-[14px]">Mon</span>
                  <span className="h-[14px] leading-[14px]"></span>
                  <span className="h-[14px] leading-[14px]">Wed</span>
                  <span className="h-[14px] leading-[14px]"></span>
                  <span className="h-[14px] leading-[14px]">Fri</span>
                  <span className="h-[14px] leading-[14px]"></span>
                </div>

                {/* Heatmap Columns (Weeks) */}
                <div className="flex gap-[3px]">
                  {weeks.map((week, wIdx) => (
                    <div key={`w-${wIdx}`} className="grid grid-rows-7 gap-[3px]">
                      {week.map((day) => {
                        const hasActivity = !!day.data && day.data.totalScore > 0;
                        const level = day.data?.level || 0;
                        const formattedDate = day.date.toLocaleDateString('en-US', {
                          weekday: 'short',
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        });

                        return (
                          <Tooltip key={day.dateStr}>
                            <TooltipTrigger asChild>
                              <div
                                className={`h-[14px] w-[14px] rounded-[3px] border transition-all cursor-pointer ${getCellColorClass(
                                  level
                                )}`}
                              />
                            </TooltipTrigger>
                            <TooltipContent side="top" className="text-xs p-3 space-y-1.5 max-w-[220px]">
                              <p className="font-bold text-foreground">
                                {formattedDate}
                              </p>

                              {!hasActivity ? (
                                <p className="text-muted-foreground text-[11px]">
                                  No study activities logged.
                                </p>
                              ) : (
                                <div className="space-y-1 pt-1 text-[11px]">
                                  {day.data!.focusMinutes > 0 && (
                                    <div className="flex items-center justify-between text-muted-foreground">
                                      <span className="flex items-center gap-1">
                                        <Timer className="h-3 w-3 text-primary" /> Focus time:
                                      </span>
                                      <span className="font-semibold text-foreground">
                                        {day.data!.focusMinutes}m ({day.data!.pomodoroCount} sessions)
                                      </span>
                                    </div>
                                  )}
                                  {day.data!.cardsReviewed > 0 && (
                                    <div className="flex items-center justify-between text-muted-foreground">
                                      <span className="flex items-center gap-1">
                                        <Brain className="h-3 w-3 text-indigo-500" /> Flashcards:
                                      </span>
                                      <span className="font-semibold text-foreground">
                                        {day.data!.cardsReviewed} reviewed
                                      </span>
                                    </div>
                                  )}
                                  {day.data!.tasksCompleted > 0 && (
                                    <div className="flex items-center justify-between text-muted-foreground">
                                      <span className="flex items-center gap-1">
                                        <CheckCircle2 className="h-3 w-3 text-emerald-500" /> Tasks done:
                                      </span>
                                      <span className="font-semibold text-foreground">
                                        {day.data!.tasksCompleted}
                                      </span>
                                    </div>
                                  )}
                                  {day.data!.notesCreated > 0 && (
                                    <div className="flex items-center justify-between text-muted-foreground">
                                      <span className="flex items-center gap-1">
                                        <Notebook className="h-3 w-3 text-blue-500" /> Notes written:
                                      </span>
                                      <span className="font-semibold text-foreground">
                                        {day.data!.notesCreated}
                                      </span>
                                    </div>
                                  )}
                                  <div className="pt-1 border-t flex items-center justify-between text-emerald-500 font-bold">
                                    <span>Score:</span>
                                    <span>+{day.data!.totalScore} pts</span>
                                  </div>
                                </div>
                              )}
                            </TooltipContent>
                          </Tooltip>
                        );
                      })}
                    </div>
                  ))}
                </div>
              </div>
            </TooltipProvider>
          </div>
        </div>

        {/* Legend for mobile */}
        <div className="flex sm:hidden items-center justify-end gap-1.5 text-xs text-muted-foreground pt-2">
          <span>Less</span>
          <div className="h-2.5 w-2.5 rounded-sm bg-muted/40 border border-border/40" />
          <div className="h-2.5 w-2.5 rounded-sm bg-emerald-500/30 border border-emerald-500/40" />
          <div className="h-2.5 w-2.5 rounded-sm bg-emerald-500/55 border border-emerald-500/70" />
          <div className="h-2.5 w-2.5 rounded-sm bg-emerald-500/80 border border-emerald-400" />
          <div className="h-2.5 w-2.5 rounded-sm bg-emerald-400 border border-emerald-300 shadow-sm" />
          <span>More</span>
        </div>
      </div>
    </div>
  );
}
