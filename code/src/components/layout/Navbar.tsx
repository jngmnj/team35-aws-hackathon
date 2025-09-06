'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/theme-toggle';
import { FileText, Sparkles, FileUser, Home, LogOut, ClipboardCheck, Calendar, Menu, X } from 'lucide-react';

export function Navbar() {
  const { user, logout } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  if (!user) return null;

  const navItems = [
    { href: '/dashboard', icon: Home, label: '대시보드' },
    { href: '/documents', icon: FileText, label: '문서' },
    { href: '/daily', icon: Calendar, label: '일상' },
    { href: '/tests', icon: ClipboardCheck, label: '테스트' },
    { href: '/analysis', icon: Sparkles, label: '분석' },
    { href: '/resume', icon: FileUser, label: '이력서' },
  ];

  return (
    <nav className="bg-background shadow-sm border-b">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/dashboard" className="text-xl font-bold text-primary cursor-pointer">
            Growlog
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6">
            {navItems.map(({ href, icon: Icon, label }) => (
              <Link key={href} href={href} className="flex items-center space-x-2 text-muted-foreground hover:text-primary cursor-pointer">
                <Icon className="h-4 w-4" />
                <span className="hidden lg:inline">{label}</span>
              </Link>
            ))}
          </div>

          {/* Desktop User Menu */}
          <div className="hidden md:flex items-center space-x-3">
            <span className="text-sm text-muted-foreground hidden lg:inline">{user.name}님</span>
            <ThemeToggle />
            <Button variant="ghost" size="sm" onClick={logout} className="cursor-pointer">
              <LogOut className="h-4 w-4" />
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <Button
            variant="ghost"
            size="sm"
            className="md:hidden"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden border-t border-border py-4">
            <div className="space-y-3">
              {navItems.map(({ href, icon: Icon, label }) => (
                <Link
                  key={href}
                  href={href}
                  className="flex items-center space-x-3 px-2 py-2 text-muted-foreground hover:text-primary cursor-pointer"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <Icon className="h-5 w-5" />
                  <span>{label}</span>
                </Link>
              ))}
              <div className="flex items-center justify-between px-2 py-2 border-t border-border pt-4">
                <span className="text-sm text-muted-foreground">{user.name}님</span>
                <div className="flex items-center space-x-2">
                  <ThemeToggle />
                  <Button variant="ghost" size="sm" onClick={logout} className="cursor-pointer">
                    <LogOut className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}

export default Navbar;