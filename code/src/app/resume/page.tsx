'use client';

import { ResumeGenerator } from '@/components/resume/ResumeGenerator';
import { ProtectedRoute } from '@/components/layout/ProtectedRoute';

export default function ResumePage() {

  return (
    <ProtectedRoute>
      <div className="container mx-auto p-6 max-w-4xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">이력서 생성</h1>
          <p className="text-gray-600">AI가 당신의 문서를 분석하여 맞춤형 이력서를 생성합니다</p>
        </div>
        
        <ResumeGenerator />
      </div>
    </ProtectedRoute>
  );
}