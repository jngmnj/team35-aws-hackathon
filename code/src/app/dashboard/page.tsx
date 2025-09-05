'use client';

import { useAuth } from '@/lib/auth-context';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function DashboardPage() {
  const { user, logout } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!user) {
      router.push('/login');
    }
  }, [user, router]);

  if (!user) {
    return <div>Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <h1 className="text-xl font-semibold">AI Resume Generator</h1>
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600">Welcome, {user.name}</span>
              <Button variant="outline" onClick={logout}>Logout</Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card className="p-6">
            <h2 className="text-lg font-semibold mb-4">Documents</h2>
            <p className="text-gray-600 mb-4">Create and manage your experience, skills, values, and achievements.</p>
            <Link href="/documents">
              <Button className="w-full">Manage Documents</Button>
            </Link>
          </Card>

          <Card className="p-6">
            <h2 className="text-lg font-semibold mb-4">Analysis</h2>
            <p className="text-gray-600 mb-4">Get AI-powered insights about your personality and strengths.</p>
            <Link href="/analysis">
              <Button className="w-full">View Analysis</Button>
            </Link>
          </Card>

          <Card className="p-6">
            <h2 className="text-lg font-semibold mb-4">Resume</h2>
            <p className="text-gray-600 mb-4">Generate tailored resumes for different job categories.</p>
            <Link href="/resume">
              <Button className="w-full">Create Resume</Button>
            </Link>
          </Card>
        </div>
      </main>
    </div>
  );
}