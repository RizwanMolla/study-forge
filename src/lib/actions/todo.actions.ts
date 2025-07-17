'use server';

import { revalidatePath } from 'next/cache';
import dbConnect from '../db';
import Todo from '../models/todo.model';
import User from '../models/user.model';
import { verifySession } from '../session';
import { z } from 'zod';
import { incrementTodosCompleted } from './analytics.actions';

const todoSchema = z.object({
  title: z.string().min(1, 'Title is required').trim(),
  type: z.enum(['todo', 'weekly']),
  dayOfWeek: z.string().optional(),
});

export async function createTodo(title: string) {
  const { userId } = await verifySession();
  const validation = todoSchema.safeParse({ title, type: 'todo' });

  if (!validation.success) {
    throw new Error(validation.error.errors[0].message);
  }

  await dbConnect();
  const newTodo = await Todo.create({
    title,
    userId,
    type: 'todo',
  });

  revalidatePath('/study-zone/todo');
  return JSON.parse(JSON.stringify(newTodo));
}

export async function createWeeklyTodo(title: string, dayOfWeek: string) {
  const { userId } = await verifySession();
  const validation = todoSchema.safeParse({ title, type: 'weekly', dayOfWeek });

  if (!validation.success) {
    throw new Error(validation.error.errors[0].message);
  }

  await dbConnect();
  const newTodo = await Todo.create({
    title,
    userId,
    type: 'weekly',
    dayOfWeek,
  });
  
  revalidatePath('/study-zone/todo');
  return JSON.parse(JSON.stringify(newTodo));
}

export async function getTodos() {
  const { userId } = await verifySession();
  await dbConnect();
  const todos = await Todo.find({ userId, type: 'todo' }).sort({ createdAt: 1 });
  return JSON.parse(JSON.stringify(todos));
}

export async function getWeeklyTodos() {
  const { userId } = await verifySession();
  await dbConnect();
  const todos = await Todo.find({ userId, type: 'weekly' }).sort({ dayOfWeek: 1 }); // Ideally sort by day index
  return JSON.parse(JSON.stringify(todos));
}


export async function toggleTodo(id: string, currentStatus: boolean) {
  const { userId } = await verifySession();
  await dbConnect();

  const updatedTodo = await Todo.findOneAndUpdate(
    { _id: id, userId },
    { completed: !currentStatus },
    { new: true }
  );

  if (!updatedTodo) {
    throw new Error('Todo not found');
  }

  if (updatedTodo.completed) {
    await incrementTodosCompleted();
  } else {
    // If unchecking, decrement the count
    await User.findByIdAndUpdate(userId, { $inc: { todosCompleted: -1 } });
  }

  revalidatePath('/study-zone/todo');
  revalidatePath('/study-zone/analytics');
  return JSON.parse(JSON.stringify(updatedTodo));
}


export async function deleteTodo(id: string) {
  const { userId } = await verifySession();
  await dbConnect();

  const todo = await Todo.findOne({ _id: id, userId });

  if (!todo) {
    throw new Error('Todo not found or you do not have permission to delete it.');
  }

  // If deleting a completed task, decrement the analytics count
  if (todo.completed && todo.type === 'todo') {
      await User.findByIdAndUpdate(userId, { $inc: { todosCompleted: -1 } });
  }
  
  await Todo.findByIdAndDelete(id);

  revalidatePath('/study-zone/todo');
  revalidatePath('/study-zone/analytics');
  return { success: true };
}
