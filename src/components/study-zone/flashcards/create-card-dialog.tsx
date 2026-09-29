'use client';

import { useState, useTransition } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Plus, Loader2 } from 'lucide-react';
import { createCard } from '@/lib/actions/flashcard.actions';
import { useToast } from '@/hooks/use-toast';

interface CreateCardDialogProps {
  deckId: string;
}

export function CreateCardDialog({ deckId }: CreateCardDialogProps) {
  const [open, setOpen] = useState(false);
  const [front, setFront] = useState('');
  const [back, setBack] = useState('');
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!front.trim() || !back.trim()) return;

    startTransition(async () => {
      try {
        await createCard(deckId, {
          front: front.trim(),
          back: back.trim(),
        });
        toast({
          title: 'Card Added!',
          description: 'New flashcard added to this deck.',
        });
        setFront('');
        setBack('');
        setOpen(false);
      } catch (err: any) {
        toast({
          title: 'Error',
          description: err.message || 'Failed to add flashcard.',
          variant: 'destructive',
        });
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          Add Card
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Add New Flashcard</DialogTitle>
            <DialogDescription>
              Write a clear prompt on the front and the answer or concept explanation on the back.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-1.5">
              <Label htmlFor="front">Front (Question or Prompt)</Label>
              <Textarea
                id="front"
                placeholder="e.g. What is the time complexity of QuickSort in the average case?"
                value={front}
                onChange={(e) => setFront(e.target.value)}
                rows={3}
                required
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="back">Back (Answer / Explanation)</Label>
              <Textarea
                id="back"
                placeholder="e.g. O(n log n). The worst-case is O(n^2) when bad pivots are selected."
                value={back}
                onChange={(e) => setBack(e.target.value)}
                rows={4}
                required
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={isPending}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isPending || !front.trim() || !back.trim()}
            >
              {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isPending ? 'Saving...' : 'Add Flashcard'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
