'use server';

import { revalidatePath } from 'next/cache';
import dbConnect from '../db';
import Note from '../models/note.model';
import User from '../models/user.model';
import { verifySession } from '../session';
import { z } from 'zod';
import { redirect } from 'next/navigation';

const noteSchema = z.object({
  title: z.string().min(1, 'Title is required').trim(),
  content: z.string().optional(),
});

export async function createNote() {
  const { userId } = await verifySession();
  
  await dbConnect();
  
  const newNote = await Note.create({ 
    title: 'Untitled Note', 
    content: '', 
    userId 
  });

  await User.findByIdAndUpdate(userId, { $inc: { notesCreated: 1 } });
  
  revalidatePath('/study-zone/notes');
  revalidatePath('/study-zone/analytics');

  redirect(`/study-zone/notes/editor/${newNote._id}`);
}

export async function getNotes() {
  const { userId } = await verifySession();
  await dbConnect();
  const notes = await Note.find({ userId }).sort({ updatedAt: -1 });
  return JSON.parse(JSON.stringify(notes));
}

export async function getNoteById(id: string) {
    const { userId } = await verifySession();
    await dbConnect();
    const note = await Note.findOne({ _id: id, userId });
    if (!note) {
        return null;
    }
    return JSON.parse(JSON.stringify(note));
}


export async function updateNote(id: string, data: { title: string; content?: string }) {
  const { userId } = await verifySession();
  const validation = noteSchema.safeParse(data);

  if (!validation.success) {
    throw new Error(validation.error.errors.map(e => e.message).join(', '));
  }
  
  await dbConnect();
  const updatedNote = await Note.findOneAndUpdate({ _id: id, userId }, data, { new: true });
  
  if (!updatedNote) {
    throw new Error('Note not found or you do not have permission to edit it.');
  }

  revalidatePath(`/study-zone/notes/editor/${id}`);
  revalidatePath('/study-zone/notes');
  return JSON.parse(JSON.stringify(updatedNote));
}

export async function deleteNote(id: string) {
  const { userId } = await verifySession();
  await dbConnect();
  const deletedNote = await Note.findOneAndDelete({ _id: id, userId });

  if (!deletedNote) {
    throw new Error('Note not found or you do not have permission to delete it.');
  }

  await User.findByIdAndUpdate(userId, { $inc: { notesCreated: -1 } });

  revalidatePath('/study-zone/notes');
  revalidatePath('/study-zone/analytics');
  return { success: true };
}
