'use client';

import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/theme-toggle';
import { FileText, Sparkles, FileUser, Home, LogOut } from 'lucide-react';

export function Navbar() {
  const { user, logout } = useAuth();

  if (!user) return null;

  return (
    <nav className="bg-background shadow-sm border-b">
      <div className="max-w-6xl mx-auto px-6 py-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-8">
            <Link href="/dashboard" className="text-xl font-bold text-primary cursor-pointer">
              Growlog
            </Link>
            <div className="flex space-x-4">
              <Link href="/dashboard" className="flex items-center space-x-2 text-muted-foreground hover:text-primary cursor-pointer">
                <Home className="h-4 w-4" />
                <span>대시보드</span>
              </Link>
              <Link href="/documents" className="flex items-center space-x-2 text-muted-foreground hover:text-primary cursor-pointer">
                <FileText className="h-4 w-4" />
                <span>문서 관리</span>
              </Link>
              <Link href="/analysis" className="flex items-center space-x-2 text-muted-foreground hover:text-primary cursor-pointer">
                <Sparkles className="h-4 w-4" />
                <span>성격 분석</span>
              </Link>
              <Link href="/resume" className="flex items-center space-x-2 text-muted-foreground hover:text-primary cursor-pointer">
                <FileUser className="h-4 w-4" />
                <span>이력서 생성</span>
              </Link>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <span className="text-sm text-muted-foreground">{user.name}님 환영합니다</span>
            <ThemeToggle />
            <Button variant="ghost" onClick={logout} className="cursor-pointer">
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;