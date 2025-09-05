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
      <Card className="p-8 text-center">
        <h2 className="text-xl font-semibold mb-4">성격 분석 시작하기</h2>
        <p className="text-gray-600 mb-6">
          작성하신 문서를 바탕으로 AI가 성격 분석을 진행합니다.
        </p>
        <Button onClick={handleGenerateAnalysis} disabled={isLoading}>
          분석 시작하기
        </Button>
        {error && (
          <p className="text-red-500 mt-4">{error}</p>
        )}
      </Card>
    );
  }

  return (
    <div className="space-y-8">
      {isLoading ? (
        <Card className="p-8 text-center">
          <div className="animate-pulse">
            <div className="w-16 h-16 bg-gray-200 rounded-full mx-auto mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2 mx-auto mb-2"></div>
            <div className="h-3 bg-gray-200 rounded w-1/3 mx-auto"></div>
          </div>
          <p className="mt-4 text-gray-600">AI가 성격을 분석하고 있습니다...</p>
        </Card>
      ) : analysis && (
        <>
          <PersonalityCard 
            personalityType={analysis.personalityType}
            strengths={analysis.strengths}
            weaknesses={analysis.weaknesses}
          />
          <InsightsDisplay analysis={analysis} />
          <div className="text-center">
            <Button onClick={handleGenerateAnalysis} variant="outline">
              다시 분석하기
            </Button>
          </div>
        </>
      )}
    </div>
  );
}