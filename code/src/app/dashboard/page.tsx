'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useAuth } from '@/lib/auth-context';
import { useDocuments } from '@/hooks/useDocuments';
import { ProtectedRoute } from '@/components/layout/ProtectedRoute';
import { FileText, Brain, FileUser, Plus } from 'lucide-react';

export default function Dashboard() {
  const { user, logout } = useAuth();
  const { documents, isLoading } = useDocuments();

  const documentCounts = {
    experience: documents.filter(d => d.type === 'experience').length,
    skills: documents.filter(d => d.type === 'skills').length,
    values: documents.filter(d => d.type === 'values').length,
    achievements: documents.filter(d => d.type === 'achievements').length,
  };

  const totalDocuments = Object.values(documentCounts).reduce((sum, count) => sum + count, 0);
  const canAnalyze = totalDocuments >= 2; // Need at least 2 documents for analysis

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        <header className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <h1 className="text-xl font-semibold">AI Resume Generator</h1>
              <div className="flex items-center gap-4">
                <span className="text-sm text-gray-600">Welcome, {user?.name || 'User'}</span>
                <Button variant="outline" onClick={logout}>Logout</Button>
              </div>
            </div>
          </div>
        </header>

        <div className="max-w-6xl mx-auto p-6">
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">Welcome back, {user?.name}!</h1>
            <p className="text-gray-600">Track your progress and generate insights from your documents.</p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Documents</p>
                  <p className="text-2xl font-bold">{totalDocuments}</p>
                </div>
                <FileText className="h-8 w-8 text-blue-500" />
              </div>
            </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Experience</p>
                <p className="text-2xl font-bold">{documentCounts.experience}</p>
              </div>
              <div className="h-8 w-8 bg-green-100 rounded-full flex items-center justify-center">
                <span className="text-green-600 font-bold">E</span>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Skills</p>
                <p className="text-2xl font-bold">{documentCounts.skills}</p>
              </div>
              <div className="h-8 w-8 bg-purple-100 rounded-full flex items-center justify-center">
                <span className="text-purple-600 font-bold">S</span>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Achievements</p>
                <p className="text-2xl font-bold">{documentCounts.achievements}</p>
              </div>
              <div className="h-8 w-8 bg-orange-100 rounded-full flex items-center justify-center">
                <span className="text-orange-600 font-bold">A</span>
              </div>
            </div>
          </Card>
        </div>

        {/* Action Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="p-6">
            <div className="text-center">
              <FileText className="h-12 w-12 text-blue-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Manage Documents</h3>
              <p className="text-gray-600 mb-4">Create and edit your experience, skills, values, and achievements.</p>
              <Link href="/documents">
                <Button className="w-full">
                  <Plus className="h-4 w-4 mr-2" />
                  Go to Documents
                </Button>
              </Link>
            </div>
          </Card>

          <Card className="p-6">
            <div className="text-center">
              <Brain className="h-12 w-12 text-green-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">AI Analysis</h3>
              <p className="text-gray-600 mb-4">Get insights about your personality and strengths.</p>
              <Link href="/analysis">
                <Button 
                  className="w-full" 
                  disabled={!canAnalyze}
                  variant={canAnalyze ? "default" : "secondary"}
                >
                  {canAnalyze ? 'Generate Analysis' : 'Need More Documents'}
                </Button>
              </Link>
              {!canAnalyze && (
                <p className="text-xs text-gray-500 mt-2">Add at least 2 documents to enable analysis</p>
              )}
            </div>
          </Card>

          <Card className="p-6">
            <div className="text-center">
              <FileUser className="h-12 w-12 text-purple-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Generate Resume</h3>
              <p className="text-gray-600 mb-4">Create tailored resumes for different job categories.</p>
              <Link href="/resume">
                <Button 
                  className="w-full"
                  disabled={!canAnalyze}
                  variant={canAnalyze ? "default" : "secondary"}
                >
                  {canAnalyze ? 'Create Resume' : 'Need Analysis First'}
                </Button>
              </Link>
              {!canAnalyze && (
                <p className="text-xs text-gray-500 mt-2">Complete analysis to generate resumes</p>
              )}
            </div>
          </Card>
        </div>

        {/* Quick Start Guide */}
        {totalDocuments === 0 && (
          <Card className="p-6 mt-8 bg-blue-50 border-blue-200">
            <h3 className="text-lg font-semibold mb-4 text-blue-800">Getting Started</h3>
            <div className="space-y-2 text-blue-700">
              <p>1. Create documents about your experience, skills, values, and achievements</p>
              <p>2. Generate AI analysis to understand your personality and strengths</p>
              <p>3. Create tailored resumes for different job categories</p>
            </div>
            <Link href="/documents">
              <Button className="mt-4">Start with Your First Document</Button>
            </Link>
          </Card>
        )}
        </div>
      </div>
    </ProtectedRoute>
  );
}