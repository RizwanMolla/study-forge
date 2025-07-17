'use client';

import { useActionState, useEffect } from 'react';
import { useFormStatus } from 'react-dom';
import { signup } from '@/lib/actions/auth.actions';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" className="w-full" disabled={pending}>
      {pending ? 'Creating Account...' : 'Create an account'}
    </Button>
  );
}

export function SignupForm() {
  const [state, formAction] = useActionState(signup, null);
  const { toast } = useToast();

  useEffect(() => {
    if (state?.message) {
      toast({
        title: 'Error',
        description: state.message,
        variant: 'destructive',
      });
    }
  }, [state, toast]);

  return (
    <form action={formAction} className="grid gap-4">
      <div className="grid gap-2">
        <Label htmlFor="name">Name</Label>
        <Input id="name" name="name" placeholder="Enter you name" required />
        {state?.errors?.name && <p className="text-sm font-medium text-destructive">{state.errors.name}</p>}
      </div>
      <div className="grid gap-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          name="email"
          type="email"
          placeholder="Enter your email"
          required
        />
        {state?.errors?.email && <p className="text-sm font-medium text-destructive">{state.errors.email}</p>}
      </div>
      <div className="grid gap-2">
        <Label htmlFor="password">Password</Label>
        <Input id="password" name="password" type="password" placeholder='Enter your Password' required />
        {state?.errors?.password && <p className="text-sm font-medium text-destructive">{state.errors.password}</p>}
      </div>
      <SubmitButton />
    </form>
  );
}
