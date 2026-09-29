import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getDeckById, getCardsForDeck } from '@/lib/actions/flashcard.actions';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CreateCardDialog } from '@/components/study-zone/flashcards/create-card-dialog';
import { GenerateFromNoteDialog } from '@/components/study-zone/flashcards/generate-from-note-dialog';
import {
  DeleteDeckButton,
  DeleteCardButton,
} from '@/components/study-zone/flashcards/deck-actions';
import {
  ArrowLeft,
  Play,
  Clock,
  Layers,
  Sparkles,
  BookOpen,
  Calendar,
  Zap,
} from 'lucide-react';

type Params = Promise<{ deckId: string }>;

export default async function DeckDetailPage({ params }: { params: Params }) {
  const { deckId } = await params;
  const deck = await getDeckById(deckId);

  if (!deck) {
    notFound();
  }

  const cards = await getCardsForDeck(deckId);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Button variant="outline" size="icon" asChild>
            <Link href="/study-zone/flashcards">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">
                {deck.title}
              </h1>
              <Badge variant="outline" className="text-xs">
                {deck.subject}
              </Badge>
              {deck.dueCount > 0 ? (
                <Badge className="bg-amber-500/10 text-amber-500 border-amber-500/20 text-xs">
                  {deck.dueCount} Due for Review
                </Badge>
              ) : (
                <Badge variant="outline" className="text-xs text-muted-foreground">
                  Up to date
                </Badge>
              )}
            </div>
            {deck.description && (
              <p className="text-sm text-muted-foreground mt-1">
                {deck.description}
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center flex-wrap gap-2">
          <DeleteDeckButton deckId={deck._id} deckTitle={deck.title} />
          <GenerateFromNoteDialog deckId={deck._id} deckTitle={deck.title} />
          <CreateCardDialog deckId={deck._id} />
          <Button asChild className="gap-2 shadow-sm">
            <Link href={`/study-zone/flashcards/${deck._id}/study`}>
              <Play className="h-4 w-4 fill-current" />
              {deck.dueCount > 0 ? `Study Due (${deck.dueCount})` : 'Practice All'}
            </Link>
          </Button>
        </div>
      </div>

      {/* Cards Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold tracking-tight flex items-center gap-2">
            <Layers className="h-5 w-5 text-primary" />
            Flashcards ({cards.length})
          </h2>
          <span className="text-xs text-muted-foreground">
            Algorithm: SuperMemo SM-2
          </span>
        </div>

        {cards.length === 0 ? (
          <Card className="text-center py-16 border-dashed">
            <CardContent className="space-y-4 max-w-md mx-auto">
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto text-primary">
                <BookOpen className="h-6 w-6" />
              </div>
              <div className="space-y-1">
                <h3 className="text-lg font-bold">This deck is empty</h3>
                <p className="text-sm text-muted-foreground">
                  Add flashcards manually or generate them instantly from your study notes using Gemini AI.
                </p>
              </div>
              <div className="flex items-center justify-center gap-3 pt-2">
                <CreateCardDialog deckId={deck._id} />
                <GenerateFromNoteDialog
                  deckId={deck._id}
                  deckTitle={deck.title}
                />
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {cards.map((card: any, idx: number) => {
              const reviewDate = new Date(card.nextReviewDate);
              const isDue = reviewDate <= new Date();

              return (
                <Card
                  key={card._id}
                  className="flex flex-col justify-between border hover:border-primary/40 transition-all bg-card/60 backdrop-blur"
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between gap-2">
                      <Badge variant="outline" className="text-[10px] font-mono">
                        Card #{idx + 1}
                      </Badge>
                      <div className="flex items-center gap-1.5">
                        {isDue ? (
                          <Badge className="bg-amber-500/10 text-amber-500 border-amber-500/20 text-[10px]">
                            Due
                          </Badge>
                        ) : (
                          <span className="text-[11px] text-muted-foreground flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            Next: {reviewDate.toLocaleDateString()}
                          </span>
                        )}
                        <DeleteCardButton cardId={card._id} deckId={deck._id} />
                      </div>
                    </div>
                    <CardTitle className="text-base font-semibold leading-snug pt-2">
                      {card.front}
                    </CardTitle>
                  </CardHeader>

                  <CardContent className="pt-0 pb-4 flex-1">
                    <div className="p-3 rounded-lg bg-muted/40 border text-sm text-muted-foreground leading-relaxed whitespace-pre-line">
                      {card.back}
                    </div>
                  </CardContent>

                  <div className="px-6 py-2.5 border-t bg-muted/20 rounded-b-xl flex items-center justify-between text-[11px] text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Zap className="h-3 w-3 text-amber-500" />
                      Ease: {card.easeFactor?.toFixed(2) || '2.50'}
                    </span>
                    <span>Interval: {card.interval || 0}d</span>
                    <span>Reviews: {card.repetitions || 0}</span>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
