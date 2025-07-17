import NoteEditorPage from './NoteEditorPage';

type Params = Promise<{ noteId: string }>;

export default async function Page({ params }: { params: Params }) {
  const { noteId } = await params;

  return <NoteEditorPage params={{ noteId }} />;
}