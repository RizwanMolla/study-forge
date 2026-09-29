import { SignupForm } from '@/components/auth/signup-form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';
import { UserPlus } from 'lucide-react';

export default function SignupPage() {
  return (
    <Card className="border-border/60 bg-card/80 backdrop-blur-xl shadow-xl">
      <CardHeader className="space-y-1 pb-4">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-primary/10 text-primary">
            <UserPlus className="h-4 w-4" />
          </div>
          <CardTitle className="text-2xl font-bold tracking-tight">Create an Account</CardTitle>
        </div>
        <CardDescription className="text-xs">
          Start your structured learning journey with active recall and ambient focus tools.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <SignupForm />
        <div className="pt-2 text-center text-xs text-muted-foreground border-t">
          Already have an account?{' '}
          <Link href="/login" className="text-primary font-semibold hover:underline">
            Log in
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
