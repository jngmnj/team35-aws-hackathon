'use client';

import { AnalysisResults } from '@/components/analysis/AnalysisResults';
import { ProtectedRoute } from '@/components/layout/ProtectedRoute';

export default function AnalysisPage() {
  return (
    <ProtectedRoute>
      <div className="container mx-auto p-6 max-w-4xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">성격 분석</h1>
          <p className="text-gray-600">AI가 분석한 당신의 성격과 특성을 확인해보세요</p>
        </div>
        
        <AnalysisResults />
      </div>
    </ProtectedRoute>
  );
}

  return (
    <ProtectedRoute>
      <div className="container mx-auto p-6 max-w-4xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">성격 분석</h1>
          <p className="text-gray-600">AI가 분석한 당신의 성격과 특성을 확인해보세요</p>
        </div>
        
        <AnalysisResults />
      </div>
    </ProtectedRoute>
  );
}