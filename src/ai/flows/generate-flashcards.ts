'use server';

/**
 * @fileOverview AI flow to generate active recall flashcards from note content.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const FlashcardItemSchema = z.object({
  front: z.string().describe('Clear, active-recall question or prompt.'),
  back: z.string().describe('Concise, accurate answer or explanation.'),
});

const GenerateFlashcardsInputSchema = z.object({
  noteContent: z.string().describe('The content of the note to generate flashcards from.'),
});

const GenerateFlashcardsOutputSchema = z.object({
  cards: z
    .array(FlashcardItemSchema)
    .min(1)
    .max(8)
    .describe('List of generated flashcards.'),
});

export type GenerateFlashcardsInput = z.infer<typeof GenerateFlashcardsInputSchema>;
export type GenerateFlashcardsOutput = z.infer<typeof GenerateFlashcardsOutputSchema>;

const generateFlashcardsPrompt = ai.definePrompt({
  name: 'generateFlashcardsPrompt',
  input: { schema: GenerateFlashcardsInputSchema },
  output: { schema: GenerateFlashcardsOutputSchema },
  prompt: `You are an expert academic tutor specializing in spaced repetition and active recall learning.

Analyze the study note below and generate between 3 to 6 high-yield flashcards.
Requirements:
1. "front" must be a direct, thought-provoking question, formula prompt, or term definition prompt.
2. "back" must be a concise, easy-to-understand explanation or answer.
3. Prioritize key definitions, core concepts, formulas, or cause-and-effect relationships.

Note Content:
"""
{{{noteContent}}}
"""`,
});

export const generateFlashcardsFlow = ai.defineFlow(
  {
    name: 'generateFlashcardsFlow',
    inputSchema: GenerateFlashcardsInputSchema,
    outputSchema: GenerateFlashcardsOutputSchema,
  },
  async (input) => {
    const { output } = await generateFlashcardsPrompt(input);
    return output!;
  }
);

export async function generateFlashcards(
  input: GenerateFlashcardsInput
): Promise<GenerateFlashcardsOutput> {
  return generateFlashcardsFlow(input);
}
