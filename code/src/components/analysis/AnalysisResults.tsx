'use client';

import { useState, useEffect } from 'react';
import { AnalysisResult } from '@/types';
import { PersonalityCard } from './PersonalityCard';
import { InsightsDisplay } from './InsightsDisplay';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { apiClient } from '@/lib/api';

export function AnalysisResults() {
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [documentCount, setDocumentCount] = useState(0);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [existingAnalysis, documents] = await Promise.all([
          apiClient.getAnalysis().catch(() => null),
          apiClient.getDocuments().catch(() => [])
        ]);
        
        if (existingAnalysis) {
          setAnalysis(existingAnalysis);
        }
        setDocumentCount(documents.length);
      } catch {
        // Handle errors silently
      }
    };
    
    loadData();
  }, []);

  const handleGenerateAnalysis = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const newAnalysis = await apiClient.generateAnalysis();
      setAnalysis(newAnalysis);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  if (!analysis && !isLoading) {
    return (
      <Card className="p-12 text-center bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
        <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
          </svg>
        </div>
        <h2 className="text-2xl font-bold mb-4 text-gray-800">성격 분석 시작하기</h2>
        <p className="text-gray-600 mb-4 text-lg leading-relaxed max-w-md mx-auto">
          작성하신 문서를 바탕으로 AI가 당신의 성격과 특성을 분석합니다.
        </p>
        <div className="mb-8 p-4 bg-white rounded-lg border border-blue-100">
          <p className="text-sm text-gray-600">
            작성된 문서: <span className="font-semibold text-blue-600">{documentCount}개</span>
          </p>
          {documentCount === 0 && (
            <p className="text-sm text-orange-600 mt-2">
              분석을 위해 먼저 문서를 작성해주세요.
            </p>
          )}
        </div>
        <Button 
          onClick={handleGenerateAnalysis} 
          disabled={isLoading || documentCount === 0}
          className="px-8 py-3 text-lg font-semibold"
          aria-label="AI 성격 분석 시작하기"
        >
          분석 시작하기
        </Button>

      </Card>
    );
  }

  return (
    <div className="space-y-8">
      {isLoading ? (
        <Card className="p-12 text-center bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
          <div className="relative">
            <div className="w-20 h-20 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-6"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </div>
            </div>
          </div>
          <h3 className="text-xl font-semibold mb-2 text-gray-800">분석 진행 중</h3>
          <p className="text-gray-600 text-lg">AI가 당신의 성격을 분석하고 있습니다...</p>
          <div className="mt-6 flex justify-center space-x-1">
            <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"></div>
            <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
            <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
          </div>
        </Card>
      ) : analysis && (
        <>
          <PersonalityCard 
            personalityType={analysis.personalityType}
            strengths={analysis.strengths}
            weaknesses={analysis.weaknesses}
          />
          <InsightsDisplay analysis={analysis} />
          <div className="text-center pt-4">
            <Button 
              onClick={handleGenerateAnalysis} 
              variant="outline"
              className="px-6 py-2 font-semibold"
              aria-label="성격 분석 다시 실행하기"
            >
              다시 분석하기
            </Button>
          </div>
        </>
      )}
    </div>
  );
}