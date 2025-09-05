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
          <h1 className="text-2xl font-bold mb-4 text-foreground">{user.name}님, 다시 오신 것을 환영합니다!</h1>
          <Link href="/dashboard" className="cursor-pointer">
            <Button className="w-full cursor-pointer">대시보드로 이동</Button>
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
          성격을 발견하고, 강점을 분석하며, 다양한 직무에 맞춤화된 이력서를 생성하세요.
        </p>
        <div className="flex gap-4 justify-center">
          <Link href="/login" className="cursor-pointer">
            <Button className="cursor-pointer">로그인</Button>
          </Link>
          <Link href="/register" className="cursor-pointer">
            <Button variant="outline" className="cursor-pointer">회원가입</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
