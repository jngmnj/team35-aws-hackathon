'use client';

import { useState, useEffect } from 'react';
import { AnalysisResult } from '@/types';
import { PersonalityCard } from './PersonalityCard';
import { InsightsDisplay } from './InsightsDisplay';
import { PersonalityVisualization } from './PersonalityVisualization';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useToast } from '@/components/ui/toast';
import { apiClient } from '@/lib/api';
import { Sparkles, Loader2 } from 'lucide-react';

interface AnalysisResultsProps {
  selectedAnalysis?: AnalysisResult | null;
}

export function AnalysisResults({ selectedAnalysis }: AnalysisResultsProps) {
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [documentCount, setDocumentCount] = useState(0);

  useEffect(() => {
    if (selectedAnalysis) {
      setAnalysis(selectedAnalysis);
      return;
    }

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
  }, [selectedAnalysis]);

  const { showToast } = useToast();

  const handleGenerateAnalysis = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const newAnalysis = await apiClient.generateAnalysis();
      setAnalysis(newAnalysis);
      showToast('성격 분석이 완료되었습니다!', 'success');
    } catch {
      showToast('분석 중 오류가 발생했습니다. 다시 시도해주세요.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  if (!analysis && !isLoading) {
    return (
      <Card className="p-12 text-center bg-accent border-accent">
        <div className="w-20 h-20 bg-primary rounded-full flex items-center justify-center mx-auto mb-6">
          <Sparkles className="w-10 h-10 text-primary-foreground" />
        </div>
        <h2 className="text-2xl font-bold mb-4 text-foreground">성격 분석 시작하기</h2>
        <p className="text-muted-foreground mb-4 text-lg leading-relaxed max-w-md mx-auto">
          작성하신 문서를 바탕으로 AI가 당신의 성격과 특성을 분석합니다.
        </p>
        <div className="mb-8 p-4 bg-background rounded-lg border border-border">
          <p className="text-sm text-muted-foreground">
            작성된 문서: <span className="font-semibold text-primary">{documentCount}개</span>
          </p>
          {documentCount === 0 && (
            <p className="text-sm text-destructive mt-2">
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
        <Card className="p-12 text-center bg-accent border-accent">
          <div className="relative">
            <div className="w-20 h-20 border-4 border-muted border-t-primary rounded-full animate-spin mx-auto mb-6"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-12 h-12 bg-muted rounded-full flex items-center justify-center">
                <Sparkles className="w-6 h-6 text-primary" />
              </div>
            </div>
          </div>
          <h3 className="text-xl font-semibold mb-2 text-foreground">분석 진행 중</h3>
          <p className="text-muted-foreground text-lg">AI가 당신의 성격을 분석하고 있습니다...</p>
          <div className="mt-6 flex justify-center">
            <Loader2 className="w-6 h-6 text-primary animate-spin" />
          </div>
        </Card>
      ) : analysis && (
        <>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            <PersonalityCard 
              personalityType={analysis.result.personalityType}
              strengths={analysis.result.strengths}
              weaknesses={analysis.result.weaknesses}
            />
            <PersonalityVisualization 
              personalityType={analysis.result.personalityType}
              strengths={analysis.result.strengths}
              weaknesses={analysis.result.weaknesses}
            />
          </div>
          <InsightsDisplay analysis={analysis} />
          {!selectedAnalysis && (
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
          )}
        </>
      )}
    </div>
  );
}