'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function Custom404() {
  const router = useRouter();

  useEffect(() => {
    // S3 정적 웹사이트에서 클라이언트 사이드 라우팅을 위해
    // 404 페이지에서 현재 경로로 리다이렉트
    const currentPath = window.location.pathname;
    if (currentPath !== '/404') {
      router.replace(currentPath);
    }
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">페이지를 찾을 수 없습니다</h1>
        <p className="text-muted-foreground mb-4">요청하신 페이지가 존재하지 않습니다.</p>
        <button 
          onClick={() => router.push('/')}
          className="px-4 py-2 bg-primary text-primary-foreground rounded-md"
        >
          홈으로 돌아가기
        </button>
      </div>
    </div>
  );
}