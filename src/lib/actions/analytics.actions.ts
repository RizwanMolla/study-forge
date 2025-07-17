'use server';

import { revalidatePath } from 'next/cache';
import dbConnect from '../db';
import User from '../models/user.model';
import { verifySession } from '../session';

export async function incrementPomodoro() {
  const { userId } = await verifySession();
  await dbConnect();
  
  await User.findByIdAndUpdate(userId, { $inc: { pomodoroSessions: 1 } });
  
  revalidatePath('/study-zone/analytics');
}

export async function incrementTodosCompleted() {
  const { userId } = await verifySession();
  await dbConnect();

  await User.findByIdAndUpdate(userId, { $inc: { todosCompleted: 1 } });

  revalidatePath('/study-zone/analytics');
}

export async function getAnalytics() {
    const { userId } = await verifySession();
    await dbConnect();

    const user = await User.findById(userId).select('pomodoroSessions notesCreated todosCompleted');
    if (!user) {
        throw new Error('User not found');
    }

    return {
        pomodoroSessions: user.pomodoroSessions,
        notesCreated: user.notesCreated,
        todosCompleted: user.todosCompleted,
    };
}
