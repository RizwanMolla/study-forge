'use client';

import { useState, useEffect, useCallback, useTransition } from 'react';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import {
  ArrowLeft,
  RotateCw,
  CheckCircle2,
  Brain,
  Sparkles,
  Zap,
  TrendingUp,
  Volume2,
} from 'lucide-react';
import { submitCardReview } from '@/lib/actions/flashcard.actions';
import { useToast } from '@/hooks/use-toast';

interface FlashcardItem {
  _id: string;
  front: string;
  back: string;
  repetitions: number;
  interval: number;
  easeFactor: number;
  nextReviewDate: string | Date;
}

interface StudySessionProps {
  initialCards: FlashcardItem[];
  deckId: string;
  deckTitle: string;
}

export function StudySession({
  initialCards,
  deckId,
  deckTitle,
}: StudySessionProps) {
  const [cards, setCards] = useState<FlashcardItem[]>(initialCards);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [sessionCompleted, setSessionCompleted] = useState(false);
  const [sessionStats, setSessionStats] = useState({
    again: 0,
    hard: 0,
    good: 0,
    easy: 0,
  });
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();

  const currentCard = cards[currentIndex];

  const handleFlip = useCallback(() => {
    setIsFlipped((prev) => !prev);
  }, []);

  const handleScore = useCallback(
    (quality: number, label: 'again' | 'hard' | 'good' | 'easy') => {
      if (!currentCard || isPending) return;

      startTransition(async () => {
        try {
          await submitCardReview(currentCard._id, deckId, quality);

          setSessionStats((prev) => ({
            ...prev,
            [label]: prev[label] + 1,
          }));

          // If failed (again), optionally push to end of current session
          if (quality === 1) {
            setCards((prev) => [...prev, currentCard]);
          }

          if (currentIndex + 1 >= cards.length) {
            setSessionCompleted(true);
          } else {
            setCurrentIndex((prev) => prev + 1);
            setIsFlipped(false);
          }
        } catch (err: any) {
          toast({
            title: 'Error',
            description: 'Could not record card review.',
            variant: 'destructive',
          });
        }
      });
    },
    [currentCard, deckId, currentIndex, cards.length, isPending, toast]
  );

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (sessionCompleted) return;

      if (e.code === 'Space') {
        e.preventDefault();
        handleFlip();
      } else if (isFlipped) {
        if (e.key === '1') handleScore(1, 'again');
        if (e.key === '2') handleScore(3, 'hard');
        if (e.key === '3') handleScore(4, 'good');
        if (e.key === '4') handleScore(5, 'easy');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleFlip, isFlipped, handleScore, sessionCompleted]);

  // Estimate next review intervals for preview
  const getIntervalPreview = (quality: number) => {
    if (!currentCard) return '';
    if (quality === 1) return '< 1d';
    if (currentCard.repetitions === 0) return '1d';
    if (currentCard.repetitions === 1) return '6d';
    const est = Math.round(currentCard.interval * currentCard.easeFactor);
    return `${est}d`;
  };

  if (cards.length === 0) {
    return (
      <div className="max-w-2xl mx-auto text-center py-16 space-y-6">
        <div className="h-16 w-16 mx-auto rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-500">
          <CheckCircle2 className="h-8 w-8" />
        </div>
        <h2 className="text-2xl font-bold">All caught up!</h2>
        <p className="text-muted-foreground">
          There are no cards due for review in this deck today. Great job keeping your memory sharp!
        </p>
        <Button asChild>
          <Link href={`/study-zone/flashcards/${deckId}`}>Back to Deck</Link>
        </Button>
      </div>
    );
  }

  if (sessionCompleted) {
    const totalReviewed =
      sessionStats.again +
      sessionStats.hard +
      sessionStats.good +
      sessionStats.easy;
    const masteryPercentage =
      totalReviewed > 0
        ? Math.round(
            ((sessionStats.good + sessionStats.easy) / totalReviewed) * 100
          )
        : 100;

    return (
      <div className="max-w-xl mx-auto py-12 space-y-8 animate-in fade-in-50 duration-500">
        <div className="text-center space-y-3">
          <div className="inline-flex p-4 rounded-full bg-primary/10 text-primary mb-2">
            <Sparkles className="h-10 w-10 animate-bounce" />
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight">
            Session Completed!
          </h1>
          <p className="text-muted-foreground text-base">
            You reviewed {totalReviewed} active recall cards in "{deckTitle}".
          </p>
        </div>

        <Card className="border-primary/20 bg-card/60 backdrop-blur">
          <CardContent className="p-6 space-y-6">
            <div className="grid grid-cols-2 gap-4 text-center">
              <div className="p-4 rounded-xl bg-muted/40 border">
                <p className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">
                  Retention Rate
                </p>
                <p className="text-3xl font-black text-primary mt-1">
                  {masteryPercentage}%
                </p>
              </div>
              <div className="p-4 rounded-xl bg-muted/40 border">
                <p className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">
                  Total Reviews
                </p>
                <p className="text-3xl font-black text-foreground mt-1">
                  {totalReviewed}
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <p className="text-sm font-semibold text-muted-foreground">
                Recall Breakdown
              </p>
              <div className="grid grid-cols-4 gap-2 text-center text-xs">
                <div className="p-2.5 rounded-lg bg-rose-500/10 border border-rose-500/20">
                  <span className="font-bold text-rose-500 block text-base">
                    {sessionStats.again}
                  </span>
                  <span className="text-muted-foreground">Again</span>
                </div>
                <div className="p-2.5 rounded-lg bg-amber-500/10 border border-amber-500/20">
                  <span className="font-bold text-amber-500 block text-base">
                    {sessionStats.hard}
                  </span>
                  <span className="text-muted-foreground">Hard</span>
                </div>
                <div className="p-2.5 rounded-lg bg-blue-500/10 border border-blue-500/20">
                  <span className="font-bold text-blue-500 block text-base">
                    {sessionStats.good}
                  </span>
                  <span className="text-muted-foreground">Good</span>
                </div>
                <div className="p-2.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                  <span className="font-bold text-emerald-500 block text-base">
                    {sessionStats.easy}
                  </span>
                  <span className="text-muted-foreground">Easy</span>
                </div>
              </div>
            </div>

            <div className="pt-2 flex flex-col sm:flex-row gap-3">
              <Button asChild className="flex-1" size="lg">
                <Link href={`/study-zone/flashcards/${deckId}`}>
                  Back to Deck Overview
                </Link>
              </Button>
              <Button
                variant="outline"
                className="flex-1"
                size="lg"
                onClick={() => {
                  setCurrentIndex(0);
                  setIsFlipped(false);
                  setSessionCompleted(false);
                  setSessionStats({ again: 0, hard: 0, good: 0, easy: 0 });
                }}
              >
                <RotateCw className="mr-2 h-4 w-4" />
                Review Again
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const progressPercent = Math.round(((currentIndex + 1) / cards.length) * 100);

  return (
    <div className="max-w-2xl mx-auto space-y-6 py-4">
      {/* Header & Controls */}
      <div className="flex items-center justify-between">
        <Button variant="ghost" size="sm" asChild className="gap-2">
          <Link href={`/study-zone/flashcards/${deckId}`}>
            <ArrowLeft className="h-4 w-4" />
            Exit Study Mode
          </Link>
        </Button>
        <div className="flex items-center gap-3">
          <Badge variant="outline" className="font-mono text-xs">
            Card {currentIndex + 1} of {cards.length}
          </Badge>
          <span className="text-xs text-muted-foreground hidden sm:inline">
            Press <kbd className="px-1.5 py-0.5 rounded bg-muted border text-[10px]">Space</kbd> to flip
          </span>
        </div>
      </div>

      <Progress value={progressPercent} className="h-2" />

      {/* 3D Flip Card Container */}
      <div
        className="w-full min-h-[360px] md:min-h-[420px] cursor-pointer select-none [perspective:1200px]"
        onClick={handleFlip}
      >
        <div
          className={`relative w-full h-full min-h-[360px] md:min-h-[420px] rounded-2xl transition-transform duration-500 [transform-style:preserve-3d] ${
            isFlipped ? '[transform:rotateY(180deg)]' : ''
          }`}
        >
          {/* Front Face (Prompt / Question) */}
          <div className="absolute inset-0 w-full h-full rounded-2xl border-2 border-border/80 bg-gradient-to-br from-card via-card to-muted/20 p-8 flex flex-col justify-between shadow-xl [backface-visibility:hidden]">
            <div className="flex items-center justify-between">
              <Badge className="bg-primary/10 text-primary border-primary/20">
                PROMPT
              </Badge>
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Brain className="h-4 w-4 text-primary" />
                <span>Active Recall</span>
              </div>
            </div>

            <div className="my-auto py-6 text-center">
              <p className="text-xl md:text-2xl font-bold tracking-tight text-foreground leading-relaxed">
                {currentCard.front}
              </p>
            </div>

            <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
              <RotateCw className="h-3.5 w-3.5 animate-spin-slow" />
              <span>Click or press Space to reveal answer</span>
            </div>
          </div>

          {/* Back Face (Answer / Explanation) */}
          <div className="absolute inset-0 w-full h-full rounded-2xl border-2 border-primary/30 bg-gradient-to-br from-card via-card to-primary/5 p-8 flex flex-col justify-between shadow-2xl [transform:rotateY(180deg)] [backface-visibility:hidden]">
            <div className="flex items-center justify-between">
              <Badge className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20">
                ANSWER
              </Badge>
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Zap className="h-3.5 w-3.5 text-amber-500" />
                <span>Ease Factor: {currentCard.easeFactor.toFixed(2)}</span>
              </div>
            </div>

            <div className="my-auto py-6 text-center">
              <p className="text-lg md:text-xl font-medium text-foreground leading-relaxed whitespace-pre-line">
                {currentCard.back}
              </p>
            </div>

            <div className="text-center text-xs text-muted-foreground">
              Rate your recall difficulty below
            </div>
          </div>
        </div>
      </div>

      {/* SM-2 Rating Controls (Revealed when card is flipped) */}
      <div className="space-y-3">
        {isFlipped ? (
          <div className="space-y-2 animate-in fade-in-50 duration-200">
            <p className="text-xs text-center text-muted-foreground font-medium">
              Rate recall difficulty (or press 1, 2, 3, 4):
            </p>
            <div className="grid grid-cols-4 gap-2">
              <Button
                variant="outline"
                className="flex flex-col h-auto py-3 border-rose-500/30 hover:bg-rose-500/10 hover:text-rose-500 group"
                onClick={(e) => {
                  e.stopPropagation();
                  handleScore(1, 'again');
                }}
                disabled={isPending}
              >
                <span className="font-bold text-sm">Again</span>
                <span className="text-[11px] text-muted-foreground group-hover:text-rose-500 font-mono">
                  {getIntervalPreview(1)}
                </span>
                <span className="text-[10px] text-muted-foreground mt-0.5 opacity-60">
                  Key: 1
                </span>
              </Button>

              <Button
                variant="outline"
                className="flex flex-col h-auto py-3 border-amber-500/30 hover:bg-amber-500/10 hover:text-amber-500 group"
                onClick={(e) => {
                  e.stopPropagation();
                  handleScore(3, 'hard');
                }}
                disabled={isPending}
              >
                <span className="font-bold text-sm">Hard</span>
                <span className="text-[11px] text-muted-foreground group-hover:text-amber-500 font-mono">
                  {getIntervalPreview(3)}
                </span>
                <span className="text-[10px] text-muted-foreground mt-0.5 opacity-60">
                  Key: 2
                </span>
              </Button>

              <Button
                variant="outline"
                className="flex flex-col h-auto py-3 border-blue-500/30 hover:bg-blue-500/10 hover:text-blue-500 group"
                onClick={(e) => {
                  e.stopPropagation();
                  handleScore(4, 'good');
                }}
                disabled={isPending}
              >
                <span className="font-bold text-sm">Good</span>
                <span className="text-[11px] text-muted-foreground group-hover:text-blue-500 font-mono">
                  {getIntervalPreview(4)}
                </span>
                <span className="text-[10px] text-muted-foreground mt-0.5 opacity-60">
                  Key: 3
                </span>
              </Button>

              <Button
                variant="outline"
                className="flex flex-col h-auto py-3 border-emerald-500/30 hover:bg-emerald-500/10 hover:text-emerald-500 group"
                onClick={(e) => {
                  e.stopPropagation();
                  handleScore(5, 'easy');
                }}
                disabled={isPending}
              >
                <span className="font-bold text-sm">Easy</span>
                <span className="text-[11px] text-muted-foreground group-hover:text-emerald-500 font-mono">
                  {getIntervalPreview(5)}
                </span>
                <span className="text-[10px] text-muted-foreground mt-0.5 opacity-60">
                  Key: 4
                </span>
              </Button>
            </div>
          </div>
        ) : (
          <Button
            size="lg"
            className="w-full py-6 text-base font-semibold shadow-md gap-2"
            onClick={handleFlip}
          >
            <RotateCw className="h-5 w-5" />
            Show Answer (Space)
          </Button>
        )}
      </div>
    </div>
  );
}
