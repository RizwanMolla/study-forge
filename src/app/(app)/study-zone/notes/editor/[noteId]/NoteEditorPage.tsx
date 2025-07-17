'use client';

import { useState, useEffect, useCallback, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { getNoteById, updateNote } from '@/lib/actions/note.actions';
import type { INote } from '@/lib/models/note.model';
import { useToast } from '@/hooks/use-toast';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Save, Loader2 } from 'lucide-react';
import dynamic from 'next/dynamic';
import 'react-quill-new/dist/quill.snow.css';
import { Skeleton } from '@/components/ui/skeleton';

const ReactQuill = dynamic(() => import('react-quill-new'), { 
    ssr: false,
    loading: () => <Skeleton className="h-[250px] w-full rounded-b-lg" />
});

interface NoteEditorPageProps {
  params: { noteId: string };
}

export default function NoteEditorPage({ params }: NoteEditorPageProps) {
    const router = useRouter();
    const { toast } = useToast();
    const [note, setNote] = useState<INote | null>(null);
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [isSaving, startSaving] = useTransition();
  
    const noteId = params.noteId;
  
    useEffect(() => {
      async function fetchNote() {
        if (!noteId) return;
        try {
          const fetchedNote = await getNoteById(noteId);
          if (!fetchedNote) {
              toast({ title: 'Error', description: 'Note not found.', variant: 'destructive' });
              router.push('/study-zone/notes');
              return;
          }
          setNote(fetchedNote);
          setTitle(fetchedNote.title);
          setContent(fetchedNote.content);
        } catch (error) {
          toast({ title: 'Error', description: 'Could not fetch the note.', variant: 'destructive' });
          router.push('/study-zone/notes');
        }
      }
      fetchNote();
    }, [noteId, router, toast]);
  
    const handleSave = useCallback(() => {
      if (!note) return;
      startSaving(async () => {
        try {
          await updateNote(note._id.toString(), { title, content });
          toast({ title: 'Saved!', description: 'Your note has been saved.' });
        } catch (error) {
          toast({ title: 'Error', description: 'Failed to save the note.', variant: 'destructive' });
        }
      });
    }, [note, title, content, toast]);
    
    if (!note) {
      return (
          <div className="space-y-4">
              <Skeleton className="h-10 w-40" />
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-64 w-full" />
              <Skeleton className="h-10 w-24" />
          </div>
      );
    }
  
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Button variant="outline" onClick={() => router.push('/study-zone/notes')}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Notes
          </Button>
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Save className="mr-2 h-4 w-4" />
            )}
            {isSaving ? 'Saving...' : 'Save'}
          </Button>
        </div>
        <Input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Note Title"
          className="text-2xl font-bold h-12"
        />
        <ReactQuill
          theme="snow"
          value={content}
          onChange={setContent}
          placeholder="Start writing your note here..."
        />
      </div>
    );
  }