'use client';

import { useState, useTransition } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Upload, Wand2, ArrowLeft } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { runSummarizeNote, runSummarizeDocument } from '@/lib/actions/ai.actions';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Input } from '../ui/input';
import Link from 'next/link';
import { Cursor } from 'mongoose';

const fileToDataUri = (file: File) => new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
});


export function SummarizerTab() {
  const [summary, setSummary] = useState('');
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();

  const handleTextSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const text = formData.get('text-content') as string;
    
    if (text.trim().length < 50) {
        toast({ title: 'Error', description: 'Please enter at least 50 characters to summarize.', variant: 'destructive' });
        return;
    }

    setSummary('');
    startTransition(async () => {
      try {
        const result = await runSummarizeNote(text);
        setSummary(result);
      } catch (error: any) {
        toast({ title: 'Error', description: error.message || 'Failed to generate summary.', variant: 'destructive' });
      }
    });
  };

  const handleFileSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const file = formData.get('pdf-file') as File;

    if (!file || file.size === 0) {
        toast({ title: 'Error', description: 'Please select a PDF file.', variant: 'destructive' });
        return;
    }
    if (file.type !== 'application/pdf') {
        toast({ title: 'Error', description: 'Please upload a valid PDF file.', variant: 'destructive' });
        return;
    }

    setSummary('');
    startTransition(async () => {
        try {
            const dataUri = await fileToDataUri(file);
            const result = await runSummarizeDocument(dataUri);
            setSummary(result);
        } catch (error: any) {
            toast({ title: 'Error', description: error.message || 'Failed to summarize document.', variant: 'destructive' });
        }
    });
  };

  return (
    <div className="space-y-4">
        <div className="flex items-center gap-4">
            <Button variant="outline" size="icon" asChild>
                <Link href="/study-zone">
                    <ArrowLeft className="h-4 w-4" />
                </Link>
            </Button>
            <h1 className="text-2xl font-bold tracking-tight">AI Summarizer</h1>
        </div>
        <div className="grid md:grid-cols-2 gap-6">
        <Card>
            <CardHeader>
            <CardTitle>Summarize Content</CardTitle>
            <CardDescription>Paste text or upload a PDF to get a quick summary.</CardDescription>
            </CardHeader>
            <CardContent>
                <Tabs defaultValue="text">
                    <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="text">Summarize Text</TabsTrigger>
                        <TabsTrigger value="pdf">Summarize PDF</TabsTrigger>
                    </TabsList>
                    <TabsContent value="text" className="mt-4">
                        <form onSubmit={handleTextSubmit} className="space-y-4">
                            <Textarea name="text-content" placeholder="Paste your notes or text here..." className="min-h-[200px]" required />
                            <Button type="submit" disabled={isPending} className="w-full">
                                <Wand2 className="mr-2 h-4 w-4" />
                                {isPending ? 'Summarizing...' : 'Summarize Text'}
                            </Button>
                        </form>
                    </TabsContent>
                    <TabsContent value="pdf" className="mt-4">
                        <form onSubmit={handleFileSubmit} className="space-y-4">
                            <Input
                                id="pdf-file"
                                name="pdf-file"
                                type="file"
                                accept=".pdf"
                                required
                                className="cursor-pointer"
                            />
                            <Button type="submit" disabled={isPending} className="w-full">
                                <Upload className="mr-2 h-4 w-4" />
                                {isPending ? 'Summarizing...' : 'Summarize PDF'}
                            </Button>
                        </form>
                    </TabsContent>
                </Tabs>
            </CardContent>
        </Card>
        <Card>
            <CardHeader>
            <CardTitle>Summary</CardTitle>
            <CardDescription>Your generated summary will appear below.</CardDescription>
            </CardHeader>
            <CardContent className="min-h-[300px] relative">
                {isPending && (
                    <div className="absolute inset-0 bg-background/50 flex items-center justify-center rounded-lg">
                        <Wand2 className="h-8 w-8 animate-pulse text-primary" />
                    </div>
                )}
                {summary && (
                    <div className="prose dark:prose-invert max-w-none animate-in fade-in-50">
                        {summary.split('\n').map((paragraph, index) => (
                            <p key={index}>{paragraph}</p>
                        ))}
                    </div>
                )}
            </CardContent>
        </Card>
        </div>
    </div>
  );
}
