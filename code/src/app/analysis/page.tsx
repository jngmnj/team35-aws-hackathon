'use client';

import { useState } from 'react';
import { AnalysisResults } from '@/components/analysis/AnalysisResults';
import { AnalysisHistory } from '@/components/analysis/AnalysisHistory';
import { ProtectedRoute } from '@/components/layout/ProtectedRoute';
import { Tabs } from '@/components/ui/tabs';
import { AnalysisResult } from '@/types';

export default function AnalysisPage() {
  const [activeTab, setActiveTab] = useState<'current' | 'history'>('current');
  const [selectedAnalysis, setSelectedAnalysis] = useState<AnalysisResult | null>(null);

  const handleSelectAnalysis = (analysis: AnalysisResult) => {
    setSelectedAnalysis(analysis);
    setActiveTab('current');
  };

  return (
    <ProtectedRoute>
      <div className="container mx-auto p-6 max-w-4xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">성격 분석</h1>
          <p className="text-gray-600">AI가 분석한 당신의 성격과 특성을 확인해보세요</p>
        </div>
        
        <div className="mb-6">
          <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
            <button
              onClick={() => setActiveTab('current')}
              className={`px-4 py-2 rounded-md font-medium transition-colors ${
                activeTab === 'current'
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              현재 분석
            </button>
            <button
              onClick={() => setActiveTab('history')}
              className={`px-4 py-2 rounded-md font-medium transition-colors ${
                activeTab === 'history'
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              분석 기록
            </button>
          </div>
        </div>

        {activeTab === 'current' ? (
          <AnalysisResults selectedAnalysis={selectedAnalysis} />
        ) : (
          <AnalysisHistory onSelectAnalysis={handleSelectAnalysis} />
        )}
      </div>
    </ProtectedRoute>
  );
}