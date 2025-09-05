'use client';

import { useState, useEffect } from 'react';
import { AnalysisResult } from '@/types';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { apiClient } from '@/lib/api';
import { FileText } from 'lucide-react';

interface AnalysisHistoryProps {
  onSelectAnalysis: (analysis: AnalysisResult) => void;
}

export function AnalysisHistory({ onSelectAnalysis }: AnalysisHistoryProps) {
  const [history, setHistory] = useState<AnalysisResult[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadHistory = async () => {
      try {
        setIsLoading(true);
        const currentAnalysis = await apiClient.getAnalysis().catch(() => null);
        if (currentAnalysis) {
          setHistory([currentAnalysis]);
        } else {
          setHistory([]);
        }
      } catch (err: any) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    loadHistory();
  }, []);

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="p-6">
            <div className="animate-pulse">
              <div className="h-4 bg-muted rounded w-1/4 mb-2"></div>
              <div className="h-3 bg-muted rounded w-1/2 mb-4"></div>
              <div className="h-3 bg-muted rounded w-3/4"></div>
            </div>
          </Card>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <Card className="p-6 text-center">
        <p className="text-destructive mb-4">{error}</p>
        <Button onClick={() => window.location.reload()} variant="outline">
          다시 시도
        </Button>
      </Card>
    );
  }

  if (history.length === 0) {
    return (
      <Card className="p-12 text-center bg-accent">
        <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
          <FileText className="w-8 h-8 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-semibold mb-2 text-foreground">분석 기록이 없습니다</h3>
        <p className="text-muted-foreground">첫 번째 성격 분석을 시작해보세요.</p>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {history.map((analysis) => (
        <Card key={analysis.analysisId} className="p-6 hover:shadow-lg transition-all cursor-pointer border-l-4 border-l-primary hover:border-l-primary/80" onClick={() => onSelectAnalysis(analysis)}>
          <div className="flex justify-between items-start mb-4">
            <div>
              <h3 className="font-bold text-xl text-foreground">{analysis.personalityType.type}</h3>
              <p className="text-muted-foreground text-sm">{new Date(analysis.createdAt).toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
            </div>
            <div className="flex space-x-2">
              <span className="px-3 py-1 bg-secondary text-secondary-foreground rounded-full text-xs font-medium">
                강점 {analysis.strengths.length}개
              </span>
              <span className="px-3 py-1 bg-destructive/10 text-destructive rounded-full text-xs font-medium">
                개선점 {analysis.weaknesses.length}개
              </span>
            </div>
          </div>
          <p className="text-muted-foreground text-sm mb-4 leading-relaxed">{analysis.personalityType.description}</p>
          <div className="flex flex-wrap gap-2">
            {analysis.personalityType.traits.slice(0, 3).map((trait, index) => (
              <span key={index} className="px-3 py-1 bg-accent text-accent-foreground rounded-full text-xs font-medium">
                {trait}
              </span>
            ))}
            {analysis.personalityType.traits.length > 3 && (
              <span className="px-3 py-1 bg-muted text-muted-foreground rounded-full text-xs font-medium">
                +{analysis.personalityType.traits.length - 3}개 더
              </span>
            )}
          </div>
        </Card>
      ))}
    </div>
  );
}