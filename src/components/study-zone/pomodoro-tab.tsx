'use client';

import { useState, useEffect, useCallback, useTransition } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Play, Pause, RotateCcw } from 'lucide-react';
import { incrementPomodoro } from '@/lib/actions/analytics.actions';
import { useToast } from '@/hooks/use-toast';

const STUDY_TIME = 25 * 60; // 25 minutes
const BREAK_TIME = 5 * 60; // 5 minutes

export function PomodoroTab() {
  const [mode, setMode] = useState<'study' | 'break'>('study');
  const [time, setTime] = useState(STUDY_TIME);
  const [isActive, setIsActive] = useState(false);
  const [completedSessions, setCompletedSessions] = useState(0);
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isActive && time > 0) {
      interval = setInterval(() => {
        setTime((prevTime) => prevTime - 1);
      }, 1000);
    } else if (isActive && time === 0) {
      if (mode === 'study') {
        setMode('break');
        setTime(BREAK_TIME);
        setCompletedSessions(s => s + 1);
        startTransition(async () => {
            try {
                await incrementPomodoro();
                toast({ title: 'Session Complete!', description: "Time for a short break." });
                new Audio('/sounds/notification.mp3').play().catch(() => {});
            } catch (error) {
                toast({ title: 'Error', description: 'Failed to save session progress.', variant: 'destructive' });
            }
        })
      } else {
        setMode('study');
        setTime(STUDY_TIME);
        toast({ title: 'Break Over!', description: 'Time to get back to studying.' });
        new Audio('/sounds/notification.mp3').play().catch(() => {});
      }
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isActive, time, mode, toast]);

  const toggleTimer = () => setIsActive(!isActive);

  const resetTimer = useCallback(() => {
    setIsActive(false);
    setMode('study');
    setTime(STUDY_TIME);
  }, []);

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  return (
    <Card>
        <CardHeader>
            <CardTitle>Pomodoro Timer</CardTitle>
            <CardDescription>Focus on your work with timed sessions.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center space-y-8">
            <div className="text-center">
                <div 
                    className={`text-6xl md:text-8xl font-bold font-mono p-4 rounded-lg ${mode === 'study' ? 'text-primary' : 'text-accent'}`}
                >
                    {formatTime(time)}
                </div>
                <p className="text-muted-foreground uppercase tracking-wider mt-2">
                    {mode === 'study' ? 'Focus Session' : 'Short Break'}
                </p>
            </div>
            <div className="flex items-center space-x-4">
            <Button onClick={toggleTimer} size="lg" className="w-32">
                {isActive ? <Pause className="mr-2 h-5 w-5" /> : <Play className="mr-2 h-5 w-5" />}
                {isActive ? 'Pause' : 'Start'}
            </Button>
            <Button onClick={resetTimer} variant="outline" size="lg">
                <RotateCcw className="h-5 w-5" />
                <span className="sr-only">Reset</span>
            </Button>
            </div>
            <p className="text-muted-foreground">Completed sessions today: <span className="font-bold text-foreground">{completedSessions}</span></p>
        </CardContent>
    </Card>
  );
}
