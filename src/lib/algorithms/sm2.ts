/**
 * SuperMemo SM-2 Spaced Repetition Algorithm Implementation
 * 
 * The SM-2 algorithm calculates the optimal interval before a flashcard
 * should be reviewed again based on active recall difficulty.
 *
 * Quality ratings (q):
 * 5 - Perfect recall with no hesitation
 * 4 - Correct recall after a hesitation
 * 3 - Correct recall with serious difficulty
 * 2 - Incorrect recall, but remembered upon seeing answer
 * 1 - Incorrect recall, familiar concept
 * 0 - Complete blackout
 *
 * Simplified user ratings:
 * - Again = 1 (Failed, resets repetition count)
 * - Hard  = 3 (Difficult recall, slight interval increase)
 * - Good  = 4 (Standard successful recall)
 * - Easy  = 5 (Effortless recall, larger interval bonus)
 */

export interface SM2Input {
  quality: number; // 0 to 5
  repetitions: number;
  interval: number; // in days
  easeFactor: number;
}

export interface SM2Output {
  repetitions: number;
  interval: number; // in days
  easeFactor: number;
  nextReviewDate: Date;
}

export function calculateSM2({
  quality,
  repetitions,
  interval,
  easeFactor,
}: SM2Input): SM2Output {
  let nextRepetitions = repetitions;
  let nextInterval = interval;
  let nextEaseFactor = easeFactor;

  // Rating of 3 or higher counts as a successful recall
  if (quality >= 3) {
    if (repetitions === 0) {
      nextInterval = 1;
    } else if (repetitions === 1) {
      nextInterval = 6;
    } else {
      nextInterval = Math.round(interval * easeFactor);
    }
    nextRepetitions += 1;
  } else {
    // Failed recall: reset repetitions and restart with a 1-day interval
    nextRepetitions = 0;
    nextInterval = 1;
  }

  // Calculate new Ease Factor:
  // EF' = EF + (0.1 - (5 - q) * (0.08 + (5 - q) * 0.02))
  nextEaseFactor =
    easeFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));

  // The ease factor should not fall below the minimum threshold of 1.3
  if (nextEaseFactor < 1.3) {
    nextEaseFactor = 1.3;
  }

  // Round ease factor to 2 decimal places
  nextEaseFactor = Math.round(nextEaseFactor * 100) / 100;

  // Calculate next review date
  const nextReviewDate = new Date();
  nextReviewDate.setDate(nextReviewDate.getDate() + nextInterval);
  // Reset time to start of day for clean daily comparisons
  nextReviewDate.setHours(0, 0, 0, 0);

  return {
    repetitions: nextRepetitions,
    interval: nextInterval,
    easeFactor: nextEaseFactor,
    nextReviewDate,
  };
}
