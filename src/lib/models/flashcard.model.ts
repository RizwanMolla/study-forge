import mongoose, { Schema } from 'mongoose';

export interface IFlashcardDeck {
  _id: string;
  title: string;
  description?: string;
  subject: string;
  color: string;
  userId: mongoose.Types.ObjectId | string;
  totalCards: number;
  createdAt?: Date | string;
  updatedAt?: Date | string;
}

export interface IFlashcard {
  _id: string;
  deckId: mongoose.Types.ObjectId | string;
  userId: mongoose.Types.ObjectId | string;
  front: string;
  back: string;
  repetitions: number;
  interval: number;
  easeFactor: number;
  nextReviewDate: Date;
  lastReviewedAt?: Date | null;
  createdAt?: Date | string;
  updatedAt?: Date | string;
}

const FlashcardDeckSchema = new Schema<IFlashcardDeck>(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, default: '', trim: true },
    subject: { type: String, default: 'General', trim: true },
    color: { type: String, default: 'indigo' },
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    totalCards: { type: Number, default: 0 },
  },
  { timestamps: true }
);

const FlashcardSchema = new Schema<IFlashcard>(
  {
    deckId: { type: Schema.Types.ObjectId, ref: 'FlashcardDeck', required: true, index: true },
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    front: { type: String, required: true, trim: true },
    back: { type: String, required: true, trim: true },
    repetitions: { type: Number, default: 0 },
    interval: { type: Number, default: 0 },
    easeFactor: { type: Number, default: 2.5 },
    nextReviewDate: { type: Date, default: () => new Date(), index: true },
    lastReviewedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

export const FlashcardDeck =
  mongoose.models.FlashcardDeck ||
  mongoose.model<IFlashcardDeck>('FlashcardDeck', FlashcardDeckSchema);

export const Flashcard =
  mongoose.models.Flashcard ||
  mongoose.model<IFlashcard>('Flashcard', FlashcardSchema);
