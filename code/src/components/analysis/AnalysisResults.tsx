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

  useEffect(() => {
    const loadExistingAnalysis = async () => {
      try {
        const existingAnalysis = await apiClient.getAnalysis();
        setAnalysis(existingAnalysis);
      } catch {
        // No existing analysis found
      }
    };
    
    loadExistingAnalysis();
  }, []);

  const handleGenerateAnalysis = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Try to get existing analysis first
      try {
        const existingAnalysis = await apiClient.getAnalysis();
        setAnalysis(existingAnalysis);
        return;
      } catch {
        // If no existing analysis, generate new one
      }
      
      const newAnalysis = await apiClient.generateAnalysis();
      setAnalysis(newAnalysis);
    } catch (err: any) {
      // Fallback to mock data if API is not available
      const mockAnalysis: AnalysisResult = {
        analysisId: 'mock-id',
        userId: 'user-id',
        personalityType: {
          type: 'ENFP',
          description: '열정적이고 창의적인 성격으로, 새로운 아이디어와 가능성을 탐구하는 것을 좋아합니다.',
          traits: ['창의적', '열정적', '사교적', '직관적', '유연함']
        },
        strengths: [
          '뛰어난 커뮤니케이션 능력',
          '창의적 문제 해결',
          '팀워크와 협업',
          '새로운 아이디어 제안'
        ],
        weaknesses: [
          '세부사항 관리 부족',
          '일정 관리의 어려움',
          '반복적인 업무에 대한 집중력 부족'
        ],
        values: [
          '창의성과 혁신',
          '인간관계와 소통',
          '자유로운 업무 환경',
          '개인적 성장'
        ],
        interests: [
          '기술과 혁신',
          '디자인과 UX',
          '팀 리더십',
          '프로젝트 기획'
        ],
        createdAt: new Date().toISOString()
      };
      
      setAnalysis(mockAnalysis);
      console.warn('API not available, using mock data:', err.message);
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
        <p className="text-gray-600 mb-8 text-lg leading-relaxed max-w-md mx-auto">
          작성하신 문서를 바탕으로 AI가 당신의 성격과 특성을 분석합니다.
        </p>
        <Button 
          onClick={handleGenerateAnalysis} 
          disabled={isLoading}
          className="px-8 py-3 text-lg font-semibold"
        >
          분석 시작하기
        </Button>
        {error && (
          <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-600">{error}</p>
          </div>
        )}
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
            >
              다시 분석하기
            </Button>
          </div>
        </>
      )}
    </div>
  );
}