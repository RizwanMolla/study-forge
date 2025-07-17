import { getNotes, createNote } from '@/lib/actions/note.actions';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { MoreVertical, PlusCircle, Edit, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { DeleteNoteButton } from '@/components/study-zone/delete-note-button';

// Define the Note type
interface Note {
  _id: string;
  title: string;
  content: string;
  updatedAt: string | Date;
}

export default async function NotesListPage() {
  const notes: Note[] = await getNotes();

  const stripHtml = (html: string) => {
    return html.replace(/<[^>]*>?/gm, '');
  }

  return (
    <div className="space-y-6">
       <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
                <Button variant="outline" size="icon" asChild>
                    <Link href="/study-zone">
                        <ArrowLeft className="h-4 w-4" />
                    </Link>
                </Button>
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">My Notes</h1>
                    <p className="text-muted-foreground">Here you can find all your study notes.</p>
                </div>
            </div>
            <form action={createNote}>
                <Button>
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Create Note
                </Button>
            </form>
        </div>

      {notes.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {notes.map((note: Note) => (
            <Card key={note._id} className="flex flex-col">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <Link href={`/study-zone/notes/editor/${note._id}`} className="hover:underline truncate">
                    {note.title}
                  </Link>
                   <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0">
                                <MoreVertical className="h-4 w-4"/>
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuItem asChild>
                                <Link href={`/study-zone/notes/editor/${note._id}`}>
                                    <Edit className="mr-2 h-4 w-4" />
                                    Edit
                                </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem asChild>
                                <DeleteNoteButton noteId={note._id} />
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </CardTitle>
              </CardHeader>
              <CardContent className="flex-grow">
                 <p className="text-muted-foreground line-clamp-3 text-sm">
                    {stripHtml(note.content).substring(0, 100) + '...'}
                 </p>
              </CardContent>
              <CardFooter>
                <p className="text-xs text-muted-foreground">
                  Last updated: {new Date(note.updatedAt).toLocaleDateString()}
                </p>
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : (
         <Card className="text-center py-12">
            <CardContent>
                <h3 className="text-xl font-semibold">No Notes Yet</h3>
                <p className="text-muted-foreground mt-2 mb-4">You haven't created any notes. Start now!</p>
                <form action={createNote}>
                    <Button>
                        <PlusCircle className="mr-2 h-4 w-4" />
                        Create your first note
                    </Button>
                </form>
            </CardContent>
        </Card>
      )}
    </div>
  );
}