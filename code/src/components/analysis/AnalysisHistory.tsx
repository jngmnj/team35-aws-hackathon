'use client';

import { useState, useEffect } from 'react';
import { AnalysisResult } from '@/types';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/toast';
import { apiClient } from '@/lib/api';
import { FileText, Trash2, Calendar } from 'lucide-react';

interface AnalysisHistoryProps {
  onSelectAnalysis: (analysis: AnalysisResult) => void;
}

export function AnalysisHistory({ onSelectAnalysis }: AnalysisHistoryProps) {
  const [history, setHistory] = useState<AnalysisResult[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedAnalysis, setSelectedAnalysis] = useState<AnalysisResult | null>(null);
  const { showToast } = useToast();

  useEffect(() => {
    const loadHistory = async () => {
      try {
        setIsLoading(true);
        const analyses = await apiClient.getAnalysis().catch(() => []);
        setHistory(analyses);
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setIsLoading(false);
      }
    };

    loadHistory();
  }, []);

  const handleDelete = async (analysis: AnalysisResult) => {
    if (!confirm('정말로 이 분석 결과를 삭제하시겠습니까?')) return;
    
    try {
      await apiClient.deleteAnalysis(analysis.analysisId);
      setHistory(prev => prev.filter(item => item.analysisId !== analysis.analysisId));
      showToast('분석 결과가 삭제되었습니다.', 'success');
    } catch {
      showToast('삭제에 실패했습니다.', 'error');
    }
  };

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
    <>
      <div className="space-y-4">
        {history.map((analysis) => (
          <Card key={analysis.analysisId} className="p-6 hover:shadow-lg transition-all border-l-4 border-l-primary hover:border-l-primary/80">
            <div className="flex justify-between items-start mb-4">
              <div className="cursor-pointer flex-1" onClick={() => setSelectedAnalysis(analysis)}>
                <h3 className="font-bold text-xl text-foreground">{analysis.result?.personalityType?.type || 'Unknown'}</h3>
                <p className="text-muted-foreground text-sm">{new Date(analysis.createdAt).toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
              </div>
              <div className="flex items-center space-x-2">
                <span className="px-3 py-1 bg-secondary text-secondary-foreground rounded-full text-xs font-medium">
                  강점 {analysis.result?.strengths?.length || 0}개
                </span>
                <span className="px-3 py-1 bg-destructive/10 text-destructive rounded-full text-xs font-medium">
                  개선점 {analysis.result?.weaknesses?.length || 0}개
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDelete(analysis);
                  }}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <div className="cursor-pointer" onClick={() => setSelectedAnalysis(analysis)}>
              <p className="text-muted-foreground text-sm mb-4 leading-relaxed">{analysis.result?.personalityType?.description || 'No description'}</p>
              <div className="flex flex-wrap gap-2">
                {(analysis.result?.personalityType?.traits || []).slice(0, 3).map((trait, index) => (
                  <span key={index} className="px-3 py-1 bg-accent text-accent-foreground rounded-full text-xs font-medium">
                    {trait}
                  </span>
                ))}
                {(analysis.result?.personalityType?.traits?.length || 0) > 3 && (
                  <span className="px-3 py-1 bg-muted text-muted-foreground rounded-full text-xs font-medium">
                    +{(analysis.result?.personalityType?.traits?.length || 0) - 3}개 더
                  </span>
                )}
              </div>
            </div>
          </Card>
        ))}
      </div>

      <Dialog open={!!selectedAnalysis} onOpenChange={() => setSelectedAnalysis(null)}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <div className="flex justify-between items-center">
              <DialogTitle>분석 결과 상세</DialogTitle>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    if (selectedAnalysis) {
                      onSelectAnalysis(selectedAnalysis);
                      setSelectedAnalysis(null);
                    }
                  }}
                >
                  현재 분석으로 보기
                </Button>
                {selectedAnalysis && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      handleDelete(selectedAnalysis);
                      setSelectedAnalysis(null);
                    }}
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    삭제
                  </Button>
                )}
              </div>
            </div>
          </DialogHeader>
          {selectedAnalysis && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-2xl font-bold">{selectedAnalysis.result?.personalityType?.type || 'Unknown'}</h3>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  {new Date(selectedAnalysis.createdAt).toLocaleDateString('ko-KR', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </div>
              </div>

              <p className="text-muted-foreground leading-relaxed">
                {selectedAnalysis.result?.personalityType?.description || 'No description'}
              </p>

              {selectedAnalysis.result?.personalityType?.traits && (
                <div>
                  <h4 className="font-semibold mb-3">성격 특성</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedAnalysis.result.personalityType.traits.map((trait, index) => (
                      <Badge key={index} variant="outline">{trait}</Badge>
                    ))}
                  </div>
                </div>
              )}

              {selectedAnalysis.result?.strengths && selectedAnalysis.result.strengths.length > 0 && (
                <div>
                  <h4 className="font-semibold mb-3">강점 ({selectedAnalysis.result.strengths.length}개)</h4>
                  <div className="grid gap-2">
                    {selectedAnalysis.result.strengths.map((strength, index) => (
                      <div key={index} className="p-3 bg-green-50 dark:bg-green-950 rounded-lg">
                        <div className="font-medium text-green-800 dark:text-green-200">{strength.title}</div>
                        <div className="text-sm text-green-600 dark:text-green-300 mt-1">{strength.description}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {selectedAnalysis.result?.weaknesses && selectedAnalysis.result.weaknesses.length > 0 && (
                <div>
                  <h4 className="font-semibold mb-3">개선점 ({selectedAnalysis.result.weaknesses.length}개)</h4>
                  <div className="grid gap-2">
                    {selectedAnalysis.result.weaknesses.map((weakness, index) => (
                      <div key={index} className="p-3 bg-orange-50 dark:bg-orange-950 rounded-lg">
                        <div className="font-medium text-orange-800 dark:text-orange-200">{weakness.title}</div>
                        <div className="text-sm text-orange-600 dark:text-orange-300 mt-1">{weakness.description}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}