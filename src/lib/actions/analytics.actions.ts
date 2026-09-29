'use server';

import { revalidatePath } from 'next/cache';
import dbConnect from '../db';
import User from '../models/user.model';
import StudyActivity from '../models/study-activity.model';
import { verifySession } from '../session';

function getTodayString(): string {
  return new Date().toISOString().split('T')[0];
}

export async function logDailyActivity(
  userId: string,
  update: {
    focusMinutes?: number;
    pomodoroCount?: number;
    cardsReviewed?: number;
    tasksCompleted?: number;
    notesCreated?: number;
  }
) {
  const date = getTodayString();
  const focus = update.focusMinutes || 0;
  const pomodoros = update.pomodoroCount || 0;
  const cards = update.cardsReviewed || 0;
  const tasks = update.tasksCompleted || 0;
  const notes = update.notesCreated || 0;

  // Weighted activity score for heatmap intensity
  const score = Math.round(focus / 5) + cards * 2 + tasks * 3 + notes * 5;

  await StudyActivity.findOneAndUpdate(
    { userId, date },
    {
      $inc: {
        focusMinutes: focus,
        pomodoroCount: pomodoros,
        cardsReviewed: cards,
        tasksCompleted: tasks,
        notesCreated: notes,
        totalScore: score,
      },
    },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );
}

export async function incrementPomodoro(minutes = 25) {
  const { userId } = await verifySession();
  await dbConnect();

  await User.findByIdAndUpdate(userId, { $inc: { pomodoroSessions: 1 } });
  await logDailyActivity(userId, { pomodoroCount: 1, focusMinutes: minutes });

  revalidatePath('/study-zone/analytics');
  revalidatePath('/study-zone/pomodoro');
}

export async function incrementTodosCompleted() {
  const { userId } = await verifySession();
  await dbConnect();

  await User.findByIdAndUpdate(userId, { $inc: { todosCompleted: 1 } });
  await logDailyActivity(userId, { tasksCompleted: 1 });

  revalidatePath('/study-zone/analytics');
  revalidatePath('/study-zone/todo');
}

export async function recordCardReviewActivity(cardCount = 1) {
  const { userId } = await verifySession();
  await dbConnect();

  await logDailyActivity(userId, { cardsReviewed: cardCount });

  revalidatePath('/study-zone/analytics');
  revalidatePath('/study-zone/flashcards');
}

export async function recordNoteCreatedActivity() {
  const { userId } = await verifySession();
  await dbConnect();

  await logDailyActivity(userId, { notesCreated: 1 });

  revalidatePath('/study-zone/analytics');
  revalidatePath('/study-zone/notes');
}

export async function getAnalytics() {
  const { userId } = await verifySession();
  await dbConnect();

  const user = await User.findById(userId).select(
    'pomodoroSessions notesCreated todosCompleted'
  );
  if (!user) {
    throw new Error('User not found');
  }

  return {
    pomodoroSessions: user.pomodoroSessions || 0,
    notesCreated: user.notesCreated || 0,
    todosCompleted: user.todosCompleted || 0,
  };
}

export interface HeatmapDayData {
  date: string;
  totalScore: number;
  level: 0 | 1 | 2 | 3 | 4;
  focusMinutes: number;
  pomodoroCount: number;
  cardsReviewed: number;
  tasksCompleted: number;
  notesCreated: number;
}

export interface ComprehensiveAnalyticsData {
  userTotals: {
    pomodoroSessions: number;
    notesCreated: number;
    todosCompleted: number;
    totalFocusMinutes: number;
    totalCardsReviewed: number;
  };
  streaks: {
    currentStreak: number;
    longestStreak: number;
    totalActiveDays: number;
  };
  heatmapDays: Record<string, HeatmapDayData>;
  weeklyTrend: { day: string; date: string; focusMinutes: number; tasks: number }[];
}

export async function getComprehensiveAnalytics(): Promise<ComprehensiveAnalyticsData> {
  const { userId } = await verifySession();
  await dbConnect();

  const user = await User.findById(userId).select(
    'pomodoroSessions notesCreated todosCompleted'
  );

  // Past 365 days range
  const now = new Date();
  const past365Days = new Date();
  past365Days.setDate(now.getDate() - 365);
  const startDateStr = past365Days.toISOString().split('T')[0];

  const activities = await StudyActivity.find({
    userId,
    date: { $gte: startDateStr },
  })
    .sort({ date: 1 })
    .lean();

  const heatmapDays: Record<string, HeatmapDayData> = {};
  let totalFocusMinutes = 0;
  let totalCardsReviewed = 0;

  // Process activities into a date map and calculate max score for dynamic levels
  const activeDatesSet = new Set<string>();

  activities.forEach((act: any) => {
    activeDatesSet.add(act.date);
    totalFocusMinutes += act.focusMinutes || 0;
    totalCardsReviewed += act.cardsReviewed || 0;

    const score = act.totalScore || 0;
    // Map score to levels 1-4
    let level: 0 | 1 | 2 | 3 | 4 = 0;
    if (score > 0 && score <= 3) level = 1;
    else if (score > 3 && score <= 7) level = 2;
    else if (score > 7 && score <= 12) level = 3;
    else if (score > 12) level = 4;

    heatmapDays[act.date] = {
      date: act.date,
      totalScore: score,
      level,
      focusMinutes: act.focusMinutes || 0,
      pomodoroCount: act.pomodoroCount || 0,
      cardsReviewed: act.cardsReviewed || 0,
      tasksCompleted: act.tasksCompleted || 0,
      notesCreated: act.notesCreated || 0,
    };
  });

  // Calculate Streak Algorithm
  // 1. Current Streak: counting backwards from today or yesterday
  const todayStr = getTodayString();
  const yesterday = new Date();
  yesterday.setDate(now.getDate() - 1);
  const yesterdayStr = yesterday.toISOString().split('T')[0];

  let currentStreak = 0;
  let checkDate = new Date();

  // If user hasn't studied today yet, check if they studied yesterday
  if (!activeDatesSet.has(todayStr)) {
    if (activeDatesSet.has(yesterdayStr)) {
      checkDate = yesterday;
    } else {
      currentStreak = 0;
    }
  }

  if (activeDatesSet.has(checkDate.toISOString().split('T')[0])) {
    while (true) {
      const dStr = checkDate.toISOString().split('T')[0];
      if (activeDatesSet.has(dStr)) {
        currentStreak++;
        checkDate.setDate(checkDate.getDate() - 1);
      } else {
        break;
      }
    }
  }

  // 2. Longest Streak calculation
  let longestStreak = 0;
  let tempStreak = 0;
  const sortedDates = Array.from(activeDatesSet).sort();

  for (let i = 0; i < sortedDates.length; i++) {
    if (i === 0) {
      tempStreak = 1;
    } else {
      const prevDate = new Date(sortedDates[i - 1]);
      const currDate = new Date(sortedDates[i]);
      const diffDays = Math.round(
        (currDate.getTime() - prevDate.getTime()) / (1000 * 3600 * 24)
      );

      if (diffDays === 1) {
        tempStreak++;
      } else {
        tempStreak = 1;
      }
    }
    if (tempStreak > longestStreak) {
      longestStreak = tempStreak;
    }
  }

  // 3. Last 7 days trend for quick chart
  const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const weeklyTrend = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(now.getDate() - i);
    const dStr = d.toISOString().split('T')[0];
    const act = heatmapDays[dStr];

    weeklyTrend.push({
      day: DAYS[d.getDay()],
      date: dStr,
      focusMinutes: act?.focusMinutes || 0,
      tasks: (act?.tasksCompleted || 0) + (act?.cardsReviewed || 0),
    });
  }

  return JSON.parse(
    JSON.stringify({
      userTotals: {
        pomodoroSessions: user?.pomodoroSessions || 0,
        notesCreated: user?.notesCreated || 0,
        todosCompleted: user?.todosCompleted || 0,
        totalFocusMinutes,
        totalCardsReviewed,
      },
      streaks: {
        currentStreak,
        longestStreak: Math.max(longestStreak, currentStreak),
        totalActiveDays: activeDatesSet.size,
      },
      heatmapDays,
      weeklyTrend,
    })
  );
}
