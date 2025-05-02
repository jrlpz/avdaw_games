'use client';


import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {signup} from '@/app/loginNew/actions'
import { useFormStatus } from 'react-dom';
import { useActionState } from 'react'

import { Label } from '@radix-ui/react-label';

export default function SignupForm() {
  const [state, action] = useActionState(signup, undefined);

  return (
    <form action={action}>
      <div className="flex flex-col gap-2">
        <div>
          <Label htmlFor="name">Name</Label>
          <Input id="name" name="name" placeholder="John Doe" />
        </div>
        {state?.errors?.username && (
          <p className="text-sm text-red-500">{state.errors.username}</p>
        )}
        <div>
          <Label htmlFor="email">Email</Label>
          <Input id="email" name="email" placeholder="john@example.com" />
        </div>
        {state?.errors?.email && (
          <p className="text-sm text-red-500">{state.errors.email}</p>
        )}
        <div>
          <Label htmlFor="password">Password</Label>
          <Input id="password" name="password" type="password" />
        </div>
        {state?.errors?.password && (
          <div className="text-sm text-red-500">
            <p>Password must:</p>
            <ul>
              {state.errors.password.map((error) => (
                <li key={error}>- {error}</li>
              ))}
            </ul>
          </div>
        )}
        <SignupButton />
      </div>
    </form>
  );
}

export function SignupButton() {
  const { pending } = useFormStatus();

  return (
    <Button aria-disabled={pending} type="submit" className="mt-2 w-full">
      {pending ? 'Submitting...' : 'Login'}
    </Button>
  );
}