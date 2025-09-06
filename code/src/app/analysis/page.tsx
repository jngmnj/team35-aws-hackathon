'use client';

import { useState } from 'react';
import { AnalysisResults } from '@/components/analysis/AnalysisResults';
import { AnalysisHistory } from '@/components/analysis/AnalysisHistory';
import { GrowthTracker } from '@/components/analysis/GrowthTracker';
import { ProtectedRoute } from '@/components/layout/ProtectedRoute';

import { AnalysisResult } from '@/types';

export default function AnalysisPage() {
  const [activeTab, setActiveTab] = useState<'current' | 'history' | 'growth'>('current');
  const [selectedAnalysis, setSelectedAnalysis] = useState<AnalysisResult | null>(null);
  const [refreshHistory, setRefreshHistory] = useState(0);

  const handleSelectAnalysis = (analysis: AnalysisResult) => {
    setSelectedAnalysis(analysis);
    setActiveTab('current');
  };

  const handleAnalysisDeleted = () => {
    setSelectedAnalysis(null);
    setActiveTab('history');
    setRefreshHistory(prev => prev + 1);
  };

  return (
    <ProtectedRoute>
      <div className="container mx-auto p-6 max-w-4xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2 text-foreground">성격 분석</h1>
          <p className="text-muted-foreground">AI가 분석한 당신의 성격과 특성을 확인해보세요</p>
        </div>
        
        <div className="mb-6">
          <div className="flex justify-center space-x-1 bg-muted p-1 rounded-lg">
            <button
              onClick={() => setActiveTab('current')}
              className={`px-2 sm:px-4 py-2 rounded-md font-medium transition-colors text-xs sm:text-sm ${
                activeTab === 'current'
                  ? 'bg-background text-primary shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              현재 분석
            </button>
            <button
              onClick={() => setActiveTab('history')}
              className={`px-2 sm:px-4 py-2 rounded-md font-medium transition-colors text-xs sm:text-sm ${
                activeTab === 'history'
                  ? 'bg-background text-primary shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              분석 기록
            </button>
            <button
              onClick={() => setActiveTab('growth')}
              className={`px-2 sm:px-4 py-2 rounded-md font-medium transition-colors text-xs sm:text-sm ${
                activeTab === 'growth'
                  ? 'bg-background text-primary shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              성장 추적
            </button>
          </div>
        </div>

        {activeTab === 'current' && (
          <AnalysisResults 
            selectedAnalysis={selectedAnalysis} 
            onAnalysisDeleted={handleAnalysisDeleted}
          />
        )}
        {activeTab === 'history' && (
          <AnalysisHistory 
            onSelectAnalysis={handleSelectAnalysis}
            key={refreshHistory}
          />
        )}
        {activeTab === 'growth' && (
          <GrowthTracker currentAnalysis={selectedAnalysis} />
        )}
      </div>
    </ProtectedRoute>
  );
}