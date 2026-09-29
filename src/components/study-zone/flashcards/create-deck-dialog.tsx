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
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { PlusCircle, Loader2 } from 'lucide-react';
import { createDeck } from '@/lib/actions/flashcard.actions';
import { useToast } from '@/hooks/use-toast';

const SUBJECTS = [
  'General',
  'Computer Science',
  'Mathematics',
  'Physics',
  'Chemistry',
  'Biology',
  'Medicine',
  'Engineering',
  'History',
  'Languages',
  'Business',
];

const COLORS = [
  { label: 'Indigo', value: 'indigo', bg: 'bg-indigo-500' },
  { label: 'Emerald', value: 'emerald', bg: 'bg-emerald-500' },
  { label: 'Rose', value: 'rose', bg: 'bg-rose-500' },
  { label: 'Amber', value: 'amber', bg: 'bg-amber-500' },
  { label: 'Cyan', value: 'cyan', bg: 'bg-cyan-500' },
  { label: 'Violet', value: 'violet', bg: 'bg-violet-500' },
];

export function CreateDeckDialog() {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [subject, setSubject] = useState('General');
  const [color, setColor] = useState('indigo');
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    startTransition(async () => {
      try {
        await createDeck({
          title: title.trim(),
          description: description.trim(),
          subject,
          color,
        });
        toast({
          title: 'Deck Created!',
          description: `"${title.trim()}" is ready for flashcards.`,
        });
        setTitle('');
        setDescription('');
        setSubject('General');
        setColor('indigo');
        setOpen(false);
      } catch (err: any) {
        toast({
          title: 'Error',
          description: err.message || 'Failed to create deck.',
          variant: 'destructive',
        });
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <PlusCircle className="h-4 w-4" />
          Create Deck
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[480px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Create Flashcard Deck</DialogTitle>
            <DialogDescription>
              Organize your study cards by subject or course topic.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="space-y-1.5">
              <Label htmlFor="title">Deck Title</Label>
              <Input
                id="title"
                placeholder="e.g. Data Structures & Algorithms"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="description">Description (Optional)</Label>
              <Textarea
                id="description"
                placeholder="Brief summary of what this deck covers..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={2}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="subject">Subject</Label>
                <Select value={subject} onValueChange={setSubject}>
                  <SelectTrigger id="subject">
                    <SelectValue placeholder="Select subject" />
                  </SelectTrigger>
                  <SelectContent>
                    {SUBJECTS.map((sub) => (
                      <SelectItem key={sub} value={sub}>
                        {sub}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label>Accent Color</Label>
                <div className="flex items-center gap-2 pt-1.5">
                  {COLORS.map((c) => (
                    <button
                      key={c.value}
                      type="button"
                      onClick={() => setColor(c.value)}
                      className={`h-6 w-6 rounded-full ${c.bg} transition-all ${
                        color === c.value
                          ? 'ring-2 ring-primary ring-offset-2 scale-110'
                          : 'opacity-70 hover:opacity-100'
                      }`}
                      title={c.label}
                    />
                  ))}
                </div>
              </div>
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
            <Button type="submit" disabled={isPending || !title.trim()}>
              {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isPending ? 'Creating...' : 'Create Deck'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
