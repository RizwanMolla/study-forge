import { LoginForm } from '@/components/auth/login-form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';
import { LogIn } from 'lucide-react';

export default function LoginPage() {
  return (
    <Card className="border-border/60 bg-card/80 backdrop-blur-xl shadow-xl">
      <CardHeader className="space-y-1 pb-4">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-primary/10 text-primary">
            <LogIn className="h-4 w-4" />
          </div>
          <CardTitle className="text-2xl font-bold tracking-tight">Welcome Back</CardTitle>
        </div>
        <CardDescription className="text-xs">
          Enter your credentials to access your study tools, flashcards, and daily streaks.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <LoginForm />
        <div className="pt-2 text-center text-xs text-muted-foreground border-t">
          Don&apos;t have an account yet?{' '}
          <Link href="/signup" className="text-primary font-semibold hover:underline">
            Create an account
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
