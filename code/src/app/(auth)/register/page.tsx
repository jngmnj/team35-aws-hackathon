import Link from 'next/link';
import { RegisterForm } from '@/components/auth/RegisterForm';
import { ThemeToggle } from '@/components/theme-toggle';

export default function RegisterPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background relative">
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>
      <div className="space-y-4">
        <RegisterForm />
        <p className="text-center text-sm text-muted-foreground">
          이미 계정이 있으신가요?{' '}
          <Link href="/login" className="text-primary hover:underline cursor-pointer">
            로그인
          </Link>
        </p>
      </div>
    </div>
  );
}