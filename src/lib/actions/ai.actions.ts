'use server';

import { summarizeNote as summarizeNoteFlow } from '@/ai/flows/summarize-note';
import { summarizeDocument as summarizeDocumentFlow } from '@/ai/flows/summarize-document';
import { verifySession } from '../session';
import { z } from 'zod';

const summarizeNoteSchema = z.object({
  noteContent: z.string().min(10, 'Note content must be at least 10 characters.'),
});

async function withRetry<T>(fn: () => Promise<T>, retries = 3, delay = 1500): Promise<T> {
  let attempt = 0;
  while (attempt < retries) {
    try {
      return await fn();
    } catch (error: any) {
      attempt++;
      const is503 = error?.message?.includes('503') || error?.message?.includes('high demand') || error?.status === 503;
      if (is503 && attempt < retries) {
        // Wait with jittered exponential backoff
        await new Promise((resolve) => setTimeout(resolve, delay * attempt));
        continue;
      }
      if (is503) {
        throw new Error('AI service is temporarily experiencing high traffic. Please wait a few seconds and try again.');
      }
      throw error;
    }
  }
  throw new Error('AI request failed after multiple retries.');
}

export async function runSummarizeNote(noteContent: string) {
  await verifySession();
  const validation = summarizeNoteSchema.safeParse({ noteContent });
  if (!validation.success) {
    throw new Error(validation.error.errors[0].message);
  }

  const result = await withRetry(() => summarizeNoteFlow({ noteContent }));
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

  const result = await withRetry(() => summarizeDocumentFlow({ pdfDataUri }));
  return result.summary;
}
