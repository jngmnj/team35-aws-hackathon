'use client';

import { useState, useEffect } from 'react';
import { AnalysisResult } from '@/types';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface AnalysisHistoryProps {
  onSelectAnalysis: (analysis: AnalysisResult) => void;
}

export function AnalysisHistory({ onSelectAnalysis }: AnalysisHistoryProps) {
  const [history, setHistory] = useState<AnalysisResult[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Mock data for now - replace with actual API call
    const mockHistory: AnalysisResult[] = [
      {
        analysisId: '1',
        userId: 'user1',
        personalityType: {
          type: 'ENFP',
          description: '열정적이고 창의적인 성격',
          traits: ['외향적', '직관적', '감정적', '인식적']
        },
        strengths: ['창의성', '소통능력', '적응력'],
        weaknesses: ['집중력 부족', '계획성 부족'],
        values: ['자유', '창의성', '성장'],
        interests: ['기술', '예술', '사람'],
        createdAt: '2024-12-19T10:00:00Z'
      }
    ];
    
    setTimeout(() => {
      setHistory(mockHistory);
      setIsLoading(false);
    }, 500);
  }, []);

  if (isLoading) {
    return (
      <Card className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-gray-200 rounded w-1/4"></div>
          <div className="space-y-2">
            <div className="h-3 bg-gray-200 rounded"></div>
            <div className="h-3 bg-gray-200 rounded w-5/6"></div>
          </div>
        </div>
      </Card>
    );
  }

  if (history.length === 0) {
    return (
      <Card className="p-6 text-center">
        <p className="text-gray-500">아직 분석 기록이 없습니다.</p>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">분석 기록</h3>
      {history.map((analysis) => (
        <Card key={analysis.analysisId} className="p-4 hover:shadow-md transition-shadow">
          <div className="flex justify-between items-start">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-sm font-medium">
                  {analysis.personalityType.type}
                </span>
                <span className="text-sm text-gray-500">
                  {new Date(analysis.createdAt).toLocaleDateString('ko-KR')}
                </span>
              </div>
              <p className="text-sm text-gray-600 mb-2">
                {analysis.personalityType.description}
              </p>
              <div className="flex flex-wrap gap-1">
                {analysis.strengths.slice(0, 3).map((strength, index) => (
                  <span key={index} className="px-2 py-1 bg-green-50 text-green-700 rounded text-xs">
                    {strength}
                  </span>
                ))}
              </div>
            </div>
            <Button
              onClick={() => onSelectAnalysis(analysis)}
              variant="outline"
              size="sm"
            >
              보기
            </Button>
          </div>
        </Card>
      ))}
    </div>
  );
}