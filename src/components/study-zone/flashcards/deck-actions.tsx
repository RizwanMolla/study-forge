'use client';

import { useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Trash2, Loader2 } from 'lucide-react';
import { deleteDeck, deleteCard } from '@/lib/actions/flashcard.actions';
import { useToast } from '@/hooks/use-toast';

export function DeleteDeckButton({
  deckId,
  deckTitle,
}: {
  deckId: string;
  deckTitle: string;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();

  const handleDelete = () => {
    startTransition(async () => {
      try {
        await deleteDeck(deckId);
        toast({
          title: 'Deck Deleted',
          description: `"${deckTitle}" and all its flashcards were removed.`,
        });
        router.push('/study-zone/flashcards');
      } catch (err: any) {
        toast({
          title: 'Error',
          description: err.message || 'Failed to delete deck.',
          variant: 'destructive',
        });
      }
    });
  };

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="outline" size="sm" className="text-destructive hover:bg-destructive/10">
          <Trash2 className="h-4 w-4 mr-1.5" />
          Delete Deck
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete this flashcard deck?</AlertDialogTitle>
          <AlertDialogDescription>
            This will permanently delete the deck "{deckTitle}" and all associated flashcards and memory retention progress. This action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isPending}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={isPending}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {isPending ? 'Deleting...' : 'Delete Deck'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

export function DeleteCardButton({
  cardId,
  deckId,
}: {
  cardId: string;
  deckId: string;
}) {
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();

  const handleDelete = () => {
    startTransition(async () => {
      try {
        await deleteCard(cardId, deckId);
        toast({
          title: 'Card Deleted',
          description: 'The flashcard has been removed.',
        });
      } catch (err: any) {
        toast({
          title: 'Error',
          description: err.message || 'Failed to delete card.',
          variant: 'destructive',
        });
      }
    });
  };

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={handleDelete}
      disabled={isPending}
      className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
      title="Delete card"
    >
      {isPending ? (
        <Loader2 className="h-3.5 w-3.5 animate-spin" />
      ) : (
        <Trash2 className="h-3.5 w-3.5" />
      )}
    </Button>
  );
}
