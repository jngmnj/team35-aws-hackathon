'use client';

import { useState, useEffect } from 'react';
import { AnalysisResult } from '@/types';
import { PersonalityCard } from './PersonalityCard';
import { InsightsDisplay } from './InsightsDisplay';
import { EnhancedInsightsDisplay } from './EnhancedInsightsDisplay';
import { PersonalityVisualization } from './PersonalityVisualization';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useToast } from '@/components/ui/toast';
import { apiClient } from '@/lib/api';
import { Sparkles, Loader2, Trash2 } from 'lucide-react';

interface AnalysisResultsProps {
  selectedAnalysis?: AnalysisResult | null;
  onAnalysisDeleted?: () => void;
}

export function AnalysisResults({ selectedAnalysis, onAnalysisDeleted }: AnalysisResultsProps) {
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const [documentCount, setDocumentCount] = useState(0);
  const [documentTypes, setDocumentTypes] = useState<string[]>([]);

  useEffect(() => {
    if (selectedAnalysis) {
      setAnalysis(selectedAnalysis);
      return;
    }

    const loadDocumentCount = async () => {
      try {
        const documents = await apiClient.getDocuments().catch(() => []);
        setDocumentCount(documents.length);
        const types = [...new Set(documents.map(doc => doc.type))];
        setDocumentTypes(types);
      } catch {
        // Handle errors silently
      }
    };
    
    loadDocumentCount();
  }, [selectedAnalysis]);

  const { showToast } = useToast();

  const handleDelete = async () => {
    if (!analysis || !confirm('정말로 이 분석 결과를 삭제하시겠습니까?')) return;
    
    try {
      await apiClient.deleteAnalysis(analysis.analysisId);
      setAnalysis(null);
      showToast('분석 결과가 삭제되었습니다.', 'success');
      onAnalysisDeleted?.();
    } catch {
      showToast('삭제에 실패했습니다.', 'error');
    }
  };

  const handleGenerateAnalysis = async () => {
    setIsLoading(true);

    
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
      <Card className="p-6 sm:p-8 lg:p-12 text-center bg-accent border-accent">
        <div className="w-16 h-16 sm:w-20 sm:h-20 bg-primary rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6">
          <Sparkles className="w-8 h-8 sm:w-10 sm:h-10 text-primary-foreground" />
        </div>
        <h2 className="text-xl sm:text-2xl font-bold mb-4 text-foreground">성격 분석 시작하기</h2>
        <p className="text-muted-foreground mb-4 text-base sm:text-lg leading-relaxed max-w-md mx-auto">
          작성하신 문서를 바탕으로 AI가 당신의 성격과 특성을 분석합니다.
        </p>
        <div className="mb-8 p-4 bg-background rounded-lg border border-border">
          <p className="text-sm text-muted-foreground mb-2">
            작성된 문서: <span className="font-semibold text-primary">{documentCount}개</span>
          </p>
          {documentTypes.length > 0 && (
            <div className="flex flex-wrap justify-center gap-1 mb-2">
              {documentTypes.map(type => (
                <span key={type} className="text-xs bg-primary/10 text-primary px-2 py-1 rounded">
                  {type === 'daily_record' && '일상기록'}
                  {type === 'mood_tracker' && '기분추적'}
                  {type === 'reflection' && '성찰'}
                  {type === 'test_result' && '테스트결과'}
                  {type === 'experience' && '경험'}
                  {type === 'skills' && '기술'}
                  {type === 'values' && '가치관'}
                  {type === 'achievements' && '성과'}
                </span>
              ))}
            </div>
          )}
          {documentCount === 0 && (
            <p className="text-sm text-destructive mt-2">
              분석을 위해 먼저 문서를 작성해주세요.
            </p>
          )}
          {documentTypes.some(type => ['daily_record', 'mood_tracker', 'reflection', 'test_result'].includes(type)) && (
            <p className="text-sm text-green-600 mt-2">
              ✨ 통합 분석 데이터가 포함되어 더 정확한 분석이 가능합니다!
            </p>
          )}
        </div>
        <Button 
          onClick={handleGenerateAnalysis} 
          disabled={isLoading || documentCount === 0}
          className="w-full sm:w-auto px-6 sm:px-8 py-2 sm:py-3 text-base sm:text-lg font-semibold"
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
          <h3 className="text-xl font-semibold mb-2 text-foreground">분석 진행 중</h3>
          <p className="text-muted-foreground text-lg">AI가 당신의 성격을 분석하고 있습니다...</p>
          <div className="mt-6 flex justify-center">
            <Loader2 className="w-6 h-6 text-primary animate-spin" />
          </div>
        </Card>
      ) : analysis?.result && (
        <>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-foreground">성격 분석 결과</h2>
            {selectedAnalysis && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleDelete}
                className="text-destructive hover:text-destructive"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                삭제
              </Button>
            )}
          </div>
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 lg:gap-8 mb-8">
            <PersonalityCard 
              personalityType={analysis.result?.personalityType}
              strengths={analysis.result?.strengths}
              weaknesses={analysis.result?.weaknesses}
            />
            <PersonalityVisualization 
              personalityType={analysis.result?.personalityType}
              strengths={analysis.result?.strengths}
              weaknesses={analysis.result?.weaknesses}
            />
          </div>
          {analysis && (
            <EnhancedInsightsDisplay 
              analysis={analysis} 
              documentTypes={documentTypes}
            />
          )}
          {!selectedAnalysis && (
            <div className="text-center pt-4">
              <div className="flex justify-center gap-4">
                <Button 
                  onClick={handleGenerateAnalysis} 
                  variant="outline"
                  className="px-6 py-2 font-semibold"
                  aria-label="성격 분석 다시 실행하기"
                >
                  다시 분석하기
                </Button>
                {analysis && (
                  <Button
                    variant="ghost"
                    onClick={handleDelete}
                    className="px-6 py-2 font-semibold text-destructive hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    삭제
                  </Button>
                )}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}