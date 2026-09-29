import { notFound } from 'next/navigation';
import {
  getDeckById,
  getDueCardsForDeck,
  getCardsForDeck,
} from '@/lib/actions/flashcard.actions';
import { StudySession } from '@/components/study-zone/flashcards/study-session';

type Params = Promise<{ deckId: string }>;

export default async function StudyPage({ params }: { params: Params }) {
  const { deckId } = await params;
  const deck = await getDeckById(deckId);

  if (!deck) {
    notFound();
  }

  // First fetch cards due today
  let cardsToStudy = await getDueCardsForDeck(deckId);

  // If no cards are due today, allow user to practice all cards in the deck
  if (cardsToStudy.length === 0) {
    cardsToStudy = await getCardsForDeck(deckId);
  }

  return (
    <div className="container max-w-4xl py-4">
      <StudySession
        initialCards={cardsToStudy}
        deckId={deck._id}
        deckTitle={deck.title}
      />
    </div>
  );
}
