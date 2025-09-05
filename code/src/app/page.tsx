'use client';

import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

export default function Home() {
  const { user } = useAuth();

  if (user) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="max-w-md w-full p-6 text-center">
          <h1 className="text-2xl font-bold mb-4 text-foreground">Welcome back, {user.name}!</h1>
          <Link href="/dashboard" className="cursor-pointer">
            <Button className="w-full cursor-pointer">Go to Dashboard</Button>
          </Link>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="max-w-4xl mx-auto text-center">
        <h1 className="text-4xl font-bold mb-6 text-foreground">Growlog</h1>
        <p className="text-xl text-muted-foreground mb-8">
          Discover your personality, analyze your strengths, and generate tailored resumes for different job categories.
        </p>
        <div className="flex gap-4 justify-center">
          <Link href="/login" className="cursor-pointer">
            <Button className="cursor-pointer">Login</Button>
          </Link>
          <Link href="/register" className="cursor-pointer">
            <Button variant="outline" className="cursor-pointer">Sign Up</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
