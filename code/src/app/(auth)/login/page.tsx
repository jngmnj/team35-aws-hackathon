import Link from 'next/link';
import { LoginForm } from '@/components/auth/LoginForm';
import { ThemeToggle } from '@/components/theme-toggle';

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background relative">
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>
      <div className="space-y-4">
        <LoginForm />
        <p className="text-center text-sm text-muted-foreground">
          계정이 없으신가요?{' '}
          <Link href="/register" className="text-primary hover:underline cursor-pointer">
            회원가입
          </Link>
        </p>
      </div>
    </div>
  );
}