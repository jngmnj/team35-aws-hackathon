'use client';

import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import { Button } from '@/components/ui/button';
import { FileText, Brain, FileUser, Home, LogOut } from 'lucide-react';

export function Navbar() {
  const { user, logout } = useAuth();

  if (!user) return null;

  return (
    <nav className="bg-white shadow-sm border-b">
      <div className="max-w-6xl mx-auto px-6 py-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-8">
            <Link href="/dashboard" className="text-xl font-bold text-blue-600">
              AI Resume
            </Link>
            <div className="flex space-x-4">
              <Link href="/dashboard" className="flex items-center space-x-2 text-gray-600 hover:text-blue-600">
                <Home className="h-4 w-4" />
                <span>Dashboard</span>
              </Link>
              <Link href="/documents" className="flex items-center space-x-2 text-gray-600 hover:text-blue-600">
                <FileText className="h-4 w-4" />
                <span>Documents</span>
              </Link>
              <Link href="/analysis" className="flex items-center space-x-2 text-gray-600 hover:text-blue-600">
                <Brain className="h-4 w-4" />
                <span>Analysis</span>
              </Link>
              <Link href="/resume" className="flex items-center space-x-2 text-gray-600 hover:text-blue-600">
                <FileUser className="h-4 w-4" />
                <span>Resume</span>
              </Link>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-600">Welcome, {user.name}</span>
            <Button variant="ghost" onClick={logout}>
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;