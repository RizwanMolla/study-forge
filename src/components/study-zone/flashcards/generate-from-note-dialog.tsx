'use client';

import { useState, useEffect, useTransition } from 'react';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Sparkles, Loader2, BookOpen } from 'lucide-react';
import { generateFlashcardsFromNote } from '@/lib/actions/flashcard.actions';
import { getNotes } from '@/lib/actions/note.actions';
import { useToast } from '@/hooks/use-toast';

interface GenerateFromNoteDialogProps {
  deckId: string;
  deckTitle: string;
}

export function GenerateFromNoteDialog({
  deckId,
  deckTitle,
}: GenerateFromNoteDialogProps) {
  const [open, setOpen] = useState(false);
  const [notes, setNotes] = useState<any[]>([]);
  const [selectedNoteId, setSelectedNoteId] = useState<string>('');
  const [isLoadingNotes, setIsLoadingNotes] = useState(false);
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();

  useEffect(() => {
    if (open) {
      setIsLoadingNotes(true);
      getNotes()
        .then((data) => {
          setNotes(data || []);
          if (data && data.length > 0) {
            setSelectedNoteId(data[0]._id);
          }
        })
        .catch(() => {
          toast({
            title: 'Error',
            description: 'Could not fetch your notes.',
            variant: 'destructive',
          });
        })
        .finally(() => setIsLoadingNotes(false));
    }
  }, [open, toast]);

  const handleGenerate = () => {
    if (!selectedNoteId) return;

    startTransition(async () => {
      try {
        const result = await generateFlashcardsFromNote(selectedNoteId, deckId);
        toast({
          title: 'Flashcards Generated!',
          description: `Successfully added ${result.count} active recall cards to "${deckTitle}".`,
        });
        setOpen(false);
      } catch (err: any) {
        toast({
          title: 'Generation Failed',
          description: err.message || 'Could not generate flashcards.',
          variant: 'destructive',
        });
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2 border-purple-500/30 hover:bg-purple-500/10">
          <Sparkles className="h-4 w-4 text-purple-500" />
          AI Generate from Note
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-purple-500" />
            AI Flashcard Generator
          </DialogTitle>
          <DialogDescription>
            Select a study note. Gemini AI will analyze the key concepts, formulas, and definitions to generate high-yield active recall flashcards.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-3">
          <div className="space-y-2">
            <Label htmlFor="note-select">Select Source Note</Label>
            {isLoadingNotes ? (
              <div className="flex items-center justify-center p-4 border rounded-md">
                <Loader2 className="h-5 w-5 animate-spin text-muted-foreground mr-2" />
                <span className="text-sm text-muted-foreground">Loading notes...</span>
              </div>
            ) : notes.length === 0 ? (
              <div className="text-sm text-muted-foreground p-3 border rounded-md bg-muted/40">
                You do not have any notes yet. Create a note in "My Notes" first!
              </div>
            ) : (
              <Select value={selectedNoteId} onValueChange={setSelectedNoteId}>
                <SelectTrigger id="note-select">
                  <SelectValue placeholder="Choose a note" />
                </SelectTrigger>
                <SelectContent>
                  {notes.map((note) => (
                    <SelectItem key={note._id} value={note._id}>
                      <div className="flex items-center gap-2">
                        <BookOpen className="h-4 w-4 text-muted-foreground" />
                        <span className="truncate max-w-[320px]">{note.title}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>

          <div className="rounded-lg bg-purple-500/10 border border-purple-500/20 p-3 text-xs text-muted-foreground space-y-1">
            <p className="font-semibold text-foreground flex items-center gap-1.5">
              <Sparkles className="h-3.5 w-3.5 text-purple-500" />
              How this works:
            </p>
            <p>
              Extracts 3–6 concise active recall Q&A pairs. Cards start with default SM-2 interval settings and are scheduled for review immediately.
            </p>
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
            onClick={handleGenerate}
            disabled={isPending || !selectedNoteId || notes.length === 0}
            className="gap-2"
          >
            {isPending ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Synthesizing Cards...
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4" />
                Generate Flashcards
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
