'use server';

import { revalidatePath } from 'next/cache';
import dbConnect from '../db';
import { FlashcardDeck, Flashcard, IFlashcardDeck, IFlashcard } from '../models/flashcard.model';
import Note from '../models/note.model';
import { verifySession } from '../session';
import { calculateSM2 } from '../algorithms/sm2';
import { generateFlashcards } from '@/ai/flows/generate-flashcards';
import { recordCardReviewActivity } from './analytics.actions';
import { z } from 'zod';

const deckSchema = z.object({
  title: z.string().min(1, 'Title is required').max(100).trim(),
  description: z.string().max(300).optional(),
  subject: z.string().max(50).optional(),
  color: z.string().optional(),
});

const cardSchema = z.object({
  front: z.string().min(1, 'Question/Prompt is required').trim(),
  back: z.string().min(1, 'Answer is required').trim(),
});

export async function getDecks() {
  const { userId } = await verifySession();
  await dbConnect();

  const decks = await FlashcardDeck.find({ userId }).sort({ updatedAt: -1 }).lean();
  const endOfDay = new Date();
  endOfDay.setHours(23, 59, 59, 999);

  // Compute due cards count for each deck
  const decksWithDueCounts = await Promise.all(
    decks.map(async (deck: any) => {
      const dueCount = await Flashcard.countDocuments({
        deckId: deck._id,
        userId,
        nextReviewDate: { $lte: endOfDay },
      });
      return {
        ...deck,
        _id: deck._id.toString(),
        userId: deck.userId.toString(),
        dueCount,
      };
    })
  );

  return JSON.parse(JSON.stringify(decksWithDueCounts));
}

export async function getDeckById(deckId: string) {
  const { userId } = await verifySession();
  await dbConnect();

  const deck = await FlashcardDeck.findOne({ _id: deckId, userId }).lean();
  if (!deck) return null;

  const endOfDay = new Date();
  endOfDay.setHours(23, 59, 59, 999);

  const dueCount = await Flashcard.countDocuments({
    deckId,
    userId,
    nextReviewDate: { $lte: endOfDay },
  });

  return JSON.parse(
    JSON.stringify({
      ...deck,
      _id: (deck as any)._id.toString(),
      userId: (deck as any).userId.toString(),
      dueCount,
    })
  );
}

export async function createDeck(data: {
  title: string;
  description?: string;
  subject?: string;
  color?: string;
}) {
  const { userId } = await verifySession();
  const validated = deckSchema.parse(data);

  await dbConnect();
  const newDeck = await FlashcardDeck.create({
    title: validated.title,
    description: validated.description || '',
    subject: validated.subject || 'General',
    color: validated.color || 'indigo',
    userId,
    totalCards: 0,
  });

  revalidatePath('/study-zone/flashcards');
  return JSON.parse(JSON.stringify(newDeck));
}

export async function deleteDeck(deckId: string) {
  const { userId } = await verifySession();
  await dbConnect();

  await FlashcardDeck.findOneAndDelete({ _id: deckId, userId });
  await Flashcard.deleteMany({ deckId, userId });

  revalidatePath('/study-zone/flashcards');
  return { success: true };
}

export async function getCardsForDeck(deckId: string) {
  const { userId } = await verifySession();
  await dbConnect();

  const cards = await Flashcard.find({ deckId, userId }).sort({ createdAt: -1 }).lean();
  return JSON.parse(JSON.stringify(cards));
}

export async function getDueCardsForDeck(deckId: string) {
  const { userId } = await verifySession();
  await dbConnect();

  const endOfDay = new Date();
  endOfDay.setHours(23, 59, 59, 999);

  const dueCards = await Flashcard.find({
    deckId,
    userId,
    nextReviewDate: { $lte: endOfDay },
  })
    .sort({ nextReviewDate: 1 })
    .lean();

  return JSON.parse(JSON.stringify(dueCards));
}

export async function createCard(
  deckId: string,
  data: { front: string; back: string }
) {
  const { userId } = await verifySession();
  const validated = cardSchema.parse(data);

  await dbConnect();
  const card = await Flashcard.create({
    deckId,
    userId,
    front: validated.front,
    back: validated.back,
    repetitions: 0,
    interval: 0,
    easeFactor: 2.5,
    nextReviewDate: new Date(),
  });

  await FlashcardDeck.findByIdAndUpdate(deckId, { $inc: { totalCards: 1 } });

  revalidatePath(`/study-zone/flashcards/${deckId}`);
  revalidatePath('/study-zone/flashcards');
  return JSON.parse(JSON.stringify(card));
}

export async function updateCard(
  cardId: string,
  deckId: string,
  data: { front: string; back: string }
) {
  const { userId } = await verifySession();
  const validated = cardSchema.parse(data);

  await dbConnect();
  const updated = await Flashcard.findOneAndUpdate(
    { _id: cardId, userId },
    { front: validated.front, back: validated.back },
    { new: true }
  );

  revalidatePath(`/study-zone/flashcards/${deckId}`);
  return JSON.parse(JSON.stringify(updated));
}

export async function deleteCard(cardId: string, deckId: string) {
  const { userId } = await verifySession();
  await dbConnect();

  await Flashcard.findOneAndDelete({ _id: cardId, userId });
  await FlashcardDeck.findByIdAndUpdate(deckId, { $inc: { totalCards: -1 } });

  revalidatePath(`/study-zone/flashcards/${deckId}`);
  revalidatePath('/study-zone/flashcards');
  return { success: true };
}

/**
 * SuperMemo SM-2 Card Review Action
 * Quality score:
 * 1 = Again (failed recall)
 * 3 = Hard
 * 4 = Good
 * 5 = Easy
 */
export async function submitCardReview(
  cardId: string,
  deckId: string,
  quality: number
) {
  const { userId } = await verifySession();
  await dbConnect();

  const card = await Flashcard.findOne({ _id: cardId, userId });
  if (!card) throw new Error('Flashcard not found');

  const { repetitions, interval, easeFactor, nextReviewDate } = calculateSM2({
    quality,
    repetitions: card.repetitions,
    interval: card.interval,
    easeFactor: card.easeFactor,
  });

  card.repetitions = repetitions;
  card.interval = interval;
  card.easeFactor = easeFactor;
  card.nextReviewDate = nextReviewDate;
  card.lastReviewedAt = new Date();
  await card.save();
  await recordCardReviewActivity(1);

  revalidatePath(`/study-zone/flashcards/${deckId}`);
  revalidatePath(`/study-zone/flashcards/${deckId}/study`);
  revalidatePath('/study-zone/flashcards');

  return {
    success: true,
    interval,
    nextReviewDate,
  };
}

/**
 * AI-Powered 1-Click Flashcard Generator from Note
 * High-yield, cost-free on Gemini free tier
 */
export async function generateFlashcardsFromNote(
  noteId: string,
  deckId: string
) {
  const { userId } = await verifySession();
  await dbConnect();

  const note = await Note.findOne({ _id: noteId, userId });
  if (!note) throw new Error('Note not found');

  const cleanText = note.content.replace(/<[^>]*>?/gm, '').trim();
  if (cleanText.length < 30) {
    throw new Error('Note content is too short to extract flashcards (minimum 30 characters).');
  }

  const { cards } = await generateFlashcards({ noteContent: cleanText });
  if (!cards || cards.length === 0) {
    throw new Error('No flashcards could be generated from this note.');
  }

  const flashcardsToInsert = cards.map((c) => ({
    deckId,
    userId,
    front: c.front,
    back: c.back,
    repetitions: 0,
    interval: 0,
    easeFactor: 2.5,
    nextReviewDate: new Date(),
  }));

  await Flashcard.insertMany(flashcardsToInsert);
  await FlashcardDeck.findByIdAndUpdate(deckId, {
    $inc: { totalCards: flashcardsToInsert.length },
  });

  revalidatePath(`/study-zone/flashcards/${deckId}`);
  revalidatePath('/study-zone/flashcards');

  return {
    success: true,
    count: flashcardsToInsert.length,
  };
}
