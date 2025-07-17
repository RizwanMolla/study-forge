'use server';

import { summarizeNote as summarizeNoteFlow } from '@/ai/flows/summarize-note';
import { summarizeDocument as summarizeDocumentFlow } from '@/ai/flows/summarize-document';
import { verifySession } from '../session';
import { z } from 'zod';

const summarizeNoteSchema = z.object({
  noteContent: z.string().min(10, 'Note content must be at least 10 characters.'),
});

export async function runSummarizeNote(noteContent: string) {
  await verifySession();
  const validation = summarizeNoteSchema.safeParse({ noteContent });
  if (!validation.success) {
    throw new Error(validation.error.errors[0].message);
  }

  const result = await summarizeNoteFlow({ noteContent });
  return result.summary;
}

const summarizeDocSchema = z.object({
    pdfDataUri: z.string().startsWith('data:application/pdf;base64,', 'Invalid PDF data URI format.'),
});

export async function runSummarizeDocument(pdfDataUri: string) {
  await verifySession();
  const validation = summarizeDocSchema.safeParse({ pdfDataUri });
  if (!validation.success) {
      throw new Error(validation.error.errors[0].message);
  }

  const result = await summarizeDocumentFlow({ pdfDataUri });
  return result.summary;
}
