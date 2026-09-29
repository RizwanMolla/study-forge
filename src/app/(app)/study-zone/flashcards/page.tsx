import Link from 'next/link';
import { getDecks } from '@/lib/actions/flashcard.actions';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CreateDeckDialog } from '@/components/study-zone/flashcards/create-deck-dialog';
import {
  ArrowLeft,
  Brain,
  Layers,
  Clock,
  Sparkles,
  ChevronRight,
  BookOpen,
} from 'lucide-react';

const COLOR_MAP: Record<string, { border: string; bg: string; text: string }> = {
  indigo: {
    border: 'border-indigo-500/30',
    bg: 'bg-indigo-500/10',
    text: 'text-indigo-500',
  },
  emerald: {
    border: 'border-emerald-500/30',
    bg: 'bg-emerald-500/10',
    text: 'text-emerald-500',
  },
  rose: {
    border: 'border-rose-500/30',
    bg: 'bg-rose-500/10',
    text: 'text-rose-500',
  },
  amber: {
    border: 'border-amber-500/30',
    bg: 'bg-amber-500/10',
    text: 'text-amber-500',
  },
  cyan: {
    border: 'border-cyan-500/30',
    bg: 'bg-cyan-500/10',
    text: 'text-cyan-500',
  },
  violet: {
    border: 'border-violet-500/30',
    bg: 'bg-violet-500/10',
    text: 'text-violet-500',
  },
};

export default async function FlashcardsDashboardPage() {
  const decks = await getDecks();

  const totalCardsAllDecks = decks.reduce(
    (sum: number, d: any) => sum + (d.totalCards || 0),
    0
  );
  const totalDueAllDecks = decks.reduce(
    (sum: number, d: any) => sum + (d.dueCount || 0),
    0
  );

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Button variant="outline" size="icon" asChild>
            <Link href="/study-zone">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">
                Spaced Repetition Flashcards
              </h1>
              <Badge variant="outline" className="text-xs bg-primary/5 text-primary border-primary/20">
                SM-2 Engine
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground mt-0.5">
              Retain what you study permanently with active recall and adaptive intervals.
            </p>
          </div>
        </div>

        <CreateDeckDialog />
      </div>

      {/* Quick Stats Banner */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="bg-card/50 backdrop-blur">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Decks
            </CardTitle>
            <Layers className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{decks.length}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Active learning topics
            </p>
          </CardContent>
        </Card>

        <Card className="bg-card/50 backdrop-blur">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Flashcards
            </CardTitle>
            <BookOpen className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalCardsAllDecks}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Concepts across all decks
            </p>
          </CardContent>
        </Card>

        <Card className="bg-card/50 backdrop-blur">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Due For Review Today
            </CardTitle>
            <Clock className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-500">
              {totalDueAllDecks}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Scheduled by SM-2 algorithm
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Decks Grid */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold tracking-tight">Your Decks</h2>

        {decks.length === 0 ? (
          <Card className="text-center py-16 border-dashed">
            <CardContent className="space-y-4 max-w-md mx-auto">
              <div className="h-14 w-14 rounded-full bg-primary/10 flex items-center justify-center mx-auto text-primary">
                <Brain className="h-7 w-7" />
              </div>
              <div className="space-y-1">
                <h3 className="text-lg font-bold">No flashcard decks yet</h3>
                <p className="text-sm text-muted-foreground">
                  Create a deck manually or turn your study notes into flashcards with one click using Gemini AI.
                </p>
              </div>
              <div className="pt-2">
                <CreateDeckDialog />
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {decks.map((deck: any) => {
              const theme = COLOR_MAP[deck.color] || COLOR_MAP.indigo;

              return (
                <Card
                  key={deck._id}
                  className={`flex flex-col border ${theme.border} hover:shadow-lg transition-all group`}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between gap-2">
                      <Badge
                        variant="secondary"
                        className={`text-xs font-medium ${theme.bg} ${theme.text} border-0`}
                      >
                        {deck.subject || 'General'}
                      </Badge>
                      {deck.dueCount > 0 ? (
                        <Badge className="bg-amber-500/10 text-amber-500 border-amber-500/30 text-xs">
                          {deck.dueCount} Due Today
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="text-xs text-muted-foreground">
                          Up to date
                        </Badge>
                      )}
                    </div>
                    <CardTitle className="text-xl font-bold mt-2 group-hover:text-primary transition-colors">
                      <Link href={`/study-zone/flashcards/${deck._id}`}>
                        {deck.title}
                      </Link>
                    </CardTitle>
                    {deck.description && (
                      <CardDescription className="line-clamp-2">
                        {deck.description}
                      </CardDescription>
                    )}
                  </CardHeader>

                  <CardContent className="flex-1 py-2">
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <div className="flex items-center gap-1.5">
                        <Layers className="h-3.5 w-3.5" />
                        <span>{deck.totalCards || 0} cards</span>
                      </div>
                    </div>
                  </CardContent>

                  <CardFooter className="pt-4 border-t flex items-center justify-between gap-2">
                    <Button variant="ghost" size="sm" asChild>
                      <Link href={`/study-zone/flashcards/${deck._id}`}>
                        Manage Cards
                      </Link>
                    </Button>

                    <Button
                      size="sm"
                      className="gap-1.5"
                      asChild
                      variant={deck.dueCount > 0 ? 'default' : 'outline'}
                    >
                      <Link href={`/study-zone/flashcards/${deck._id}/study`}>
                        <span>{deck.dueCount > 0 ? 'Study Now' : 'Practice'}</span>
                        <ChevronRight className="h-3.5 w-3.5" />
                      </Link>
                    </Button>
                  </CardFooter>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
