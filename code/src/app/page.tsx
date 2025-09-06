'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { useAuth } from '@/lib/auth-context';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ThemeToggle } from '@/components/theme-toggle';
import { ArrowRight, Sparkles, Target, FileText } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, Suspense } from 'react';

function HomeContent() {
  const { user } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    // S3에서 리다이렉트된 경우 처리
    const redirect = searchParams.get('redirect');
    if (redirect && user) {
      router.replace(redirect);
    }
  }, [searchParams, user, router]);

  if (user) {
    return (
      <motion.div 
        className="min-h-screen flex items-center justify-center p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Card className="max-w-md w-full p-4 sm:p-6 text-center">
            <h1 className="text-xl sm:text-2xl font-bold mb-4 text-foreground">{user.name}님, 다시 오신 것을 환영합니다!</h1>
            <Link href="/dashboard" className="cursor-pointer">
              <Button className="w-full cursor-pointer">대시보드로 이동</Button>
            </Link>
          </Card>
        </motion.div>
      </motion.div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="absolute top-4 right-4 z-10">
        <ThemeToggle />
      </div>
      
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16">
          <div className="text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <motion.h1 
                className="text-4xl sm:text-6xl lg:text-7xl font-bold text-foreground mb-6"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
              >
                <span className="text-primary">
                  Growlog
                </span>
              </motion.h1>
              
              <motion.p 
                className="text-xl sm:text-2xl text-muted-foreground mb-8 max-w-3xl mx-auto leading-relaxed break-keep"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.4 }}
              >
                성격을 발견하고, 강점을 분석하며, 다양한 직무에 맞춤화된 이력서를 생성하세요.
              </motion.p>
              
              <motion.div 
                className="flex flex-col sm:flex-row gap-4 justify-center items-center"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.6 }}
              >
                <Link href="/register">
                  <Button size="lg" className="group px-8 py-3 text-lg">
                    시작하기
                    <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
                <Link href="/login">
                  <Button variant="outline" size="lg" className="px-8 py-3 text-lg">
                    로그인
                  </Button>
                </Link>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-20 bg-accent/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4 break-keep">
              당신의 성장을 위한 완벽한 도구
            </h2>
            <p className="text-xl text-muted-foreground break-keep">
              AI 기반 분석으로 더 나은 자신을 발견하세요
            </p>
          </motion.div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: Sparkles,
                title: "성격 분석",
                description: "AI가 분석하는 당신만의 성격 유형과 특성을 발견하세요"
              },
              {
                icon: Target,
                title: "강점 발견",
                description: "숨겨진 강점을 찾아내고 성장 방향을 제시받으세요"
              },
              {
                icon: FileText,
                title: "맞춤 이력서",
                description: "직무별로 최적화된 이력서를 자동으로 생성하세요"
              }
            ].map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: index * 0.2 }}
                viewport={{ once: true }}
                whileHover={{ y: -5 }}
                className="bg-card p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border"
              >
                <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center mb-6">
                  <feature.icon className="h-6 w-6 text-primary-foreground" />
                </div>
                <h3 className="text-xl font-semibold text-card-foreground mb-4 break-keep">
                  {feature.title}
                </h3>
                <p className="text-muted-foreground leading-relaxed break-keep">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="py-20">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-6 break-keep">
              지금 시작해보세요
            </h2>
            <p className="text-xl text-muted-foreground mb-8 break-keep">
              몇 분만 투자하면 당신의 새로운 가능성을 발견할 수 있습니다
            </p>
            <Link href="/register">
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button size="lg" className="px-12 py-4 text-lg">
                  무료로 시작하기
                </Button>
              </motion.div>
            </Link>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

export default function Home() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    }>
      <HomeContent />
    </Suspense>
  );
}
