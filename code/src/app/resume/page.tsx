'use client';

import { useState, useEffect } from 'react';
import { ResumeGenerator } from '@/components/resume/ResumeGenerator';
import { ProtectedRoute } from '@/components/layout/ProtectedRoute';

interface Document {
  id: number;
  title: string;
  type: string;
}

export default function ResumePage() {
  const [documents, setDocuments] = useState<Document[]>([]);

  useEffect(() => {
    loadDocuments();
  }, []);

  const loadDocuments = async () => {
    // Mock 데이터
    setDocuments([
      { id: 1, title: '팀 프로젝트 경험', type: 'experience' },
      { id: 2, title: '기술 스택', type: 'skills' },
      { id: 3, title: '가치관', type: 'values' }
    ]);
  };

  return (
    <ProtectedRoute>
      <div className="container mx-auto p-6 max-w-4xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">이력서 생성</h1>
          <p className="text-gray-600">AI가 당신의 문서를 분석하여 맞춤형 이력서를 생성합니다</p>
        </div>
        
        <ResumeGenerator documentsCount={documents.length} />
      </div>
    </ProtectedRoute>
  );
}