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
        <Card className="max-w-md w-full p-4 sm:p-6 text-center">
          <h1 className="text-xl sm:text-2xl font-bold mb-4 text-foreground">{user.name}님, 다시 오신 것을 환영합니다!</h1>
          <Link href="/dashboard" className="cursor-pointer">
            <Button className="w-full cursor-pointer">대시보드로 이동</Button>
          </Link>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="max-w-4xl mx-auto text-center px-4">
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4 sm:mb-6 text-foreground">Growlog</h1>
        <p className="text-base sm:text-lg lg:text-xl text-muted-foreground mb-6 sm:mb-8 leading-relaxed">
          성격을 발견하고, 강점을 분석하며, 다양한 직무에 맞춤화된 이력서를 생성하세요.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center max-w-sm sm:max-w-none mx-auto">
          <Link href="/login" className="cursor-pointer">
            <Button className="w-full sm:w-auto cursor-pointer px-6 py-2">로그인</Button>
          </Link>
          <Link href="/register" className="cursor-pointer">
            <Button variant="outline" className="w-full sm:w-auto cursor-pointer px-6 py-2">회원가입</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
